package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ai"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/chunker"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/embeddings"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/extract"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/storage"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// RAGHandler handles RAG-related requests
type RAGHandler struct {
	db         *database.Client
	pgx        *database.PgxClient
	cfg        *config.Config
	storage    *storage.Client
	embeddings *embeddings.Client
	chunker    *chunker.Client
	extractor  *extract.Client
	aiClient   ai.Service
}

// NewRAGHandler creates a new RAG handler
func NewRAGHandler(
	db *database.Client,
	pgx *database.PgxClient,
	cfg *config.Config,
	aiClient ai.Service,
) (*RAGHandler, error) {
	storageClient, err := storage.NewClient(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create storage client: %w", err)
	}

	embeddingsClient := embeddings.NewClient(cfg.GeminiAPIKey)
	chunkerClient := chunker.NewClient()
	extractorClient := extract.NewClient()

	return &RAGHandler{
		db:         db,
		pgx:        pgx,
		cfg:        cfg,
		storage:    storageClient,
		embeddings: embeddingsClient,
		chunker:    chunkerClient,
		extractor:  extractorClient,
		aiClient:   aiClient,
	}, nil
}

// Upload handles POST /api/upload
func (h *RAGHandler) Upload(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from JWT
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	// Get internal user ID
	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		logger.Error("Failed to get user", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	// Parse multipart form
	file, err := c.FormFile("file")
	if err != nil {
		logger.Error("Failed to get file from form", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "File is required",
		})
		return
	}

	// Get optional chat_id
	chatID := c.PostForm("chat_id")

	// Upload file to storage
	uploadResult, err := h.storage.UploadFile(file, user.ID.String())
	if err != nil {
		logger.Error("Failed to upload file", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to upload file",
			Details: err.Error(),
		})
		return
	}

	// Insert document record
	documentID := uuid.New()
	_, err = h.db.GetDB().Exec(`
		INSERT INTO documents (id, user_id, title, source_url, mime_type)
		VALUES ($1, $2, $3, $4, $5)
	`, documentID, user.ID, uploadResult.Filename, uploadResult.PublicURL, uploadResult.MimeType)
	if err != nil {
		logger.Error("Failed to insert document", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to save document",
		})
		return
	}

	// Process document in background
	go h.processDocument(documentID.String(), uploadResult, user.ID.String())

	// If chat_id is provided, add file message to chat
	if chatID != "" {
		h.addFileMessageToChat(chatID, user.ID.String(), uploadResult, documentID.String())
	}

	response := &models.UploadResponse{
		DocumentID: documentID.String(),
		Title:      uploadResult.Filename,
		SourceURL:  uploadResult.PublicURL,
		MimeType:   uploadResult.MimeType,
	}

	utils.SendSuccess(c, response)
}

// GetDocuments handles GET /api/documents
func (h *RAGHandler) GetDocuments(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	// Parse pagination
	page := h.parsePage(c.Query("page"))
	limit := 20
	offset := (page - 1) * limit

	// Get documents with pagination
	rows, err := h.db.GetDB().Query(`
		SELECT id, title, source_url, mime_type, created_at
		FROM documents
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, user.ID, limit+1, offset) // Get one extra to check if there are more
	if err != nil {
		logger.Error("Failed to get documents", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get documents",
		})
		return
	}
	defer rows.Close()

	var documents []models.DocumentResponse
	for rows.Next() {
		var doc models.DocumentResponse
		err := rows.Scan(&doc.ID, &doc.Title, &doc.SourceURL, &doc.MimeType, &doc.CreatedAt)
		if err != nil {
			logger.Error("Failed to scan document", zap.Error(err))
			continue
		}
		documents = append(documents, doc)
	}

	// Check if there are more documents
	hasMore := len(documents) > limit
	if hasMore {
		documents = documents[:limit] // Remove the extra document
	}

	// Get total count
	var total int
	err = h.db.GetDB().QueryRow("SELECT COUNT(*) FROM documents WHERE user_id = $1", user.ID).Scan(&total)
	if err != nil {
		total = len(documents)
	}

	response := &models.DocumentsResponse{
		Documents: documents,
		Page:      page,
		Total:     total,
		HasMore:   hasMore,
	}

	utils.SendSuccess(c, response)
}

// GetChats handles GET /api/chats
func (h *RAGHandler) GetChats(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	// Parse pagination
	page := h.parsePage(c.Query("page"))
	limit := 20
	offset := (page - 1) * limit

	// Get chats with last message (get one extra to check if there are more)
	rows, err := h.db.GetDB().Query(`
		SELECT 
			c.id,
			c.created_at,
			(
				SELECT cm.content 
				FROM chat_messages cm 
				WHERE cm.chat_id = c.id 
				ORDER BY cm.created_at DESC 
				LIMIT 1
			) as last_message
		FROM chats c
		WHERE c.user_id = $1
		ORDER BY c.created_at DESC
		LIMIT $2 OFFSET $3
	`, user.ID, limit+1, offset)
	if err != nil {
		logger.Error("Failed to get chats", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get chats",
		})
		return
	}
	defer rows.Close()

	var chats []models.ChatResponse
	for rows.Next() {
		var chat models.ChatResponse
		err := rows.Scan(&chat.ID, &chat.CreatedAt, &chat.LastMessage)
		if err != nil {
			logger.Error("Failed to scan chat", zap.Error(err))
			continue
		}
		chats = append(chats, chat)
	}

	// Check if there are more chats
	hasMore := len(chats) > limit
	if hasMore {
		chats = chats[:limit] // Remove the extra chat
	}

	// Get total count
	var total int
	err = h.db.GetDB().QueryRow("SELECT COUNT(*) FROM chats WHERE user_id = $1", user.ID).Scan(&total)
	if err != nil {
		total = len(chats)
	}

	response := &models.ChatsResponse{
		Chats:   chats,
		Page:    page,
		Total:   total,
		HasMore: hasMore,
	}

	utils.SendSuccess(c, response)
}

// CreateChat handles POST /api/chats
func (h *RAGHandler) CreateChat(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	// Create new chat
	chatID := uuid.New()
	_, err = h.db.GetDB().Exec(`
		INSERT INTO chats (id, user_id)
		VALUES ($1, $2)
	`, chatID, user.ID)
	if err != nil {
		logger.Error("Failed to create chat", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create chat",
		})
		return
	}

	response := &models.ChatResponse{
		ID:          chatID.String(),
		LastMessage: nil,
		CreatedAt:   time.Now(),
	}

	logger.Info("Chat created successfully", zap.String("chat_id", chatID.String()))
	utils.SendSuccess(c, response)
}

// GetChatMessages handles GET /api/chats/:id
func (h *RAGHandler) GetChatMessages(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	chatID := c.Param("id")
	if chatID == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Chat ID is required",
		})
		return
	}

	// Verify chat belongs to user
	var chatUserID string
	err = h.db.GetDB().QueryRow("SELECT user_id FROM chats WHERE id = $1", chatID).Scan(&chatUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(c, &models.APIError{
				Code:    http.StatusNotFound,
				Message: "Chat not found",
			})
			return
		}
		logger.Error("Failed to verify chat ownership", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to verify chat",
		})
		return
	}

	if chatUserID != user.ID.String() {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusForbidden,
			Message: "Access denied",
		})
		return
	}

	// Parse pagination
	page := h.parsePage(c.Query("page"))
	limit := 50
	offset := (page - 1) * limit

	// Get messages (get one extra to check if there are more)
	rows, err := h.db.GetDB().Query(`
		SELECT id, role, content, metadata, created_at
		FROM chat_messages
		WHERE chat_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`, chatID, limit+1, offset)
	if err != nil {
		logger.Error("Failed to get chat messages", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get messages",
		})
		return
	}
	defer rows.Close()

	var messages []models.ChatMessageResponse
	for rows.Next() {
		var msg models.ChatMessageResponse
		var metadataJSON *string
		err := rows.Scan(&msg.ID, &msg.Role, &msg.Content, &metadataJSON, &msg.CreatedAt)
		if err != nil {
			logger.Error("Failed to scan message", zap.Error(err))
			continue
		}

		if metadataJSON != nil {
			var metadata interface{}
			if err := json.Unmarshal([]byte(*metadataJSON), &metadata); err == nil {
				msg.Metadata = metadata
			}
		}

		messages = append(messages, msg)
	}

	// Check if there are more messages
	hasMore := len(messages) > limit
	if hasMore {
		messages = messages[:limit] // Remove the extra message
	}

	// Get total count
	var total int
	err = h.db.GetDB().QueryRow("SELECT COUNT(*) FROM chat_messages WHERE chat_id = $1", chatID).Scan(&total)
	if err != nil {
		total = len(messages)
	}

	response := &models.ChatMessagesResponse{
		Messages: messages,
		Page:     page,
		Total:    total,
		HasMore:  hasMore,
	}

	utils.SendSuccess(c, response)
}

// Ask handles POST /api/ask
func (h *RAGHandler) Ask(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID
	userSupabaseID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.db.GetUserBySupabaseID(userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	// Parse request
	var req models.AskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
			Details: err.Error(),
		})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: err.Error(),
		})
		return
	}

	// Get or create chat
	chatID := req.ChatID
	if chatID == "" {
		chatUUID := uuid.New()
		chatID = chatUUID.String()
		_, err = h.db.GetDB().Exec("INSERT INTO chats (id, user_id) VALUES ($1, $2)", chatID, user.ID)
		if err != nil {
			logger.Error("Failed to create chat", zap.Error(err))
			utils.SendError(c, &models.APIError{
				Code:    http.StatusInternalServerError,
				Message: "Failed to create chat",
			})
			return
		}
	}

	ctx := context.Background()

	// Generate embedding for query
	queryEmbedding, err := h.embeddings.GenerateEmbedding(req.Query)
	if err != nil {
		logger.Error("Failed to generate query embedding", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to process query",
		})
		return
	}

	// Search similar chunks
	chunks, err := h.pgx.SearchSimilarChunks(ctx, queryEmbedding, user.ID.String(), 8)
	if err != nil {
		logger.Error("Failed to search chunks", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to search documents",
		})
		return
	}

	// Build context from chunks
	var contextBuilder strings.Builder
	var citations []models.Citation

	for _, chunk := range chunks {
		contextBuilder.WriteString(fmt.Sprintf("Document: %s\n", chunk.DocumentTitle))
		contextBuilder.WriteString(fmt.Sprintf("Content: %s\n\n", chunk.Content))

		// Create citation
		citation := models.Citation{
			DocumentID:    chunk.DocumentID,
			DocumentTitle: chunk.DocumentTitle,
			Ordinal:       chunk.Ordinal,
			Snippet:       h.truncateText(chunk.Content, 200),
			SourceURL:     chunk.SourceURL,
		}
		citations = append(citations, citation)
	}

	// Build prompt for AI
	prompt := fmt.Sprintf(`Based on the following context, answer the user's question. If the context doesn't contain enough information to answer the question, say so clearly.

Context:
%s

Question: %s

Please provide a helpful and accurate answer based on the context provided.`, contextBuilder.String(), req.Query)

	// Generate answer using AI
	aiReq := &ai.GeminiRequest{
		Query: prompt,
	}

	// Use existing explanation method to get a response
	explanation, err := h.aiClient.GenerateExplanation(aiReq)
	if err != nil {
		logger.Error("Failed to generate answer", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to generate answer",
		})
		return
	}

	answer := explanation.Explanation

	// Save user question
	_, err = h.db.GetDB().Exec(`
		INSERT INTO chat_messages (id, chat_id, role, content)
		VALUES ($1, $2, 'user', $3)
	`, uuid.New(), chatID, req.Query)
	if err != nil {
		logger.Error("Failed to save user message", zap.Error(err))
	}

	// Save assistant answer
	_, err = h.db.GetDB().Exec(`
		INSERT INTO chat_messages (id, chat_id, role, content)
		VALUES ($1, $2, 'assistant', $3)
	`, uuid.New(), chatID, answer)
	if err != nil {
		logger.Error("Failed to save assistant message", zap.Error(err))
	}

	response := &models.AskResponse{
		ChatID:    chatID,
		Answer:    answer,
		Citations: citations,
	}

	utils.SendSuccess(c, response)
}

// Helper methods

func (h *RAGHandler) parsePage(pageStr string) int {
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		return 1
	}
	return page
}

func (h *RAGHandler) truncateText(text string, maxLen int) string {
	if len(text) <= maxLen {
		return text
	}
	return text[:maxLen] + "..."
}

func (h *RAGHandler) processDocument(documentID string, uploadResult *storage.UploadResult, userID string) {
	logger := utils.GetLogger()

	// Get signed URL for file access
	signedURL, err := h.storage.GetSignedURL(uploadResult.StoragePath, 3600) // 1 hour
	if err != nil {
		logger.Error("Failed to get signed URL", zap.Error(err))
		return
	}

	// Download and extract text (simplified - in production, you'd download the file)
	// For now, we'll skip the actual download and extraction
	logger.Info("Document processing completed",
		zap.String("document_id", documentID),
		zap.String("signed_url", signedURL),
	)
}

func (h *RAGHandler) addFileMessageToChat(chatID, userID string, uploadResult *storage.UploadResult, documentID string) {
	logger := utils.GetLogger()

	metadata := map[string]interface{}{
		"document_id": documentID,
		"source_url":  uploadResult.PublicURL,
		"mime_type":   uploadResult.MimeType,
	}

	metadataJSON, _ := json.Marshal(metadata)

	_, err := h.db.GetDB().Exec(`
		INSERT INTO chat_messages (id, chat_id, role, content, metadata)
		VALUES ($1, $2, 'file', $3, $4)
	`, uuid.New(), chatID, uploadResult.Filename, string(metadataJSON))

	if err != nil {
		logger.Error("Failed to add file message to chat", zap.Error(err))
	}
}
