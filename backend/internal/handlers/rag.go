package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
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
		INSERT INTO documents (id, user_id, title, source_url, mime_type, processing_status)
		VALUES ($1, $2, $3, $4, $5, 'queued')
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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
		SELECT id, title, source_url, mime_type, processing_status, error, size, checksum, created_at
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
		var sourceURL sql.NullString
		var errorMsg sql.NullString
		var size sql.NullInt64
		var checksum sql.NullString
		
		err := rows.Scan(&doc.ID, &doc.Title, &sourceURL, &doc.MimeType, &doc.ProcessingStatus, &errorMsg, &size, &checksum, &doc.CreatedAt)
		if err != nil {
			logger.Error("Failed to scan document", zap.Error(err))
			continue
		}
		
		// Handle nullable fields
		if sourceURL.Valid {
			doc.SourceURL = &sourceURL.String
		}
		if errorMsg.Valid {
			doc.Error = &errorMsg.String
		}
		if size.Valid {
			doc.Size = &size.Int64
		}
		if checksum.Valid {
			doc.Checksum = &checksum.String
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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
			c.title,
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
		var title sql.NullString
		var lastMessage sql.NullString
		
		err := rows.Scan(&chat.ID, &title, &chat.CreatedAt, &lastMessage)
		if err != nil {
			logger.Error("Failed to scan chat", zap.Error(err))
			continue
		}
		
		// Handle nullable fields
		if title.Valid {
			chat.Title = &title.String
		}
		if lastMessage.Valid {
			chat.LastMessage = &lastMessage.String
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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

	// Search similar chunks (with optional document filtering)
	var chunks []database.ChunkResult
	if len(req.DocumentIDs) > 0 {
		// Filter by specific documents
		chunks, err = h.pgx.SearchSimilarChunksInDocuments(ctx, queryEmbedding, user.ID.String(), req.DocumentIDs, 8)
	} else {
		// Search all user documents
		chunks, err = h.pgx.SearchSimilarChunks(ctx, queryEmbedding, user.ID.String(), 8)
	}
	if err != nil {
		logger.Error("Failed to search chunks", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to search documents",
		})
		return
	}

	// Convert chunks to AI prompt format
	var aiChunks []ai.DocumentChunk
	var citations []models.Citation

	for _, chunk := range chunks {
		sourceURL := ""
		if chunk.SourceURL != nil {
			sourceURL = *chunk.SourceURL
		}
		
		aiChunks = append(aiChunks, ai.DocumentChunk{
			DocumentID:    chunk.DocumentID,
			DocumentTitle: chunk.DocumentTitle,
			SourceURL:     sourceURL,
			Ordinal:       chunk.Ordinal,
			Content:       chunk.Content,
		})

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

	// Build context and prompt using AI service
	context := ai.BuildRAGContext(aiChunks)
	prompt := ai.RAGPrompt(req.Query, context)

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
	ctx := context.Background()

	// Update status to processing
	_, err := h.db.GetDB().Exec(`
		UPDATE documents 
		SET processing_status = 'processing', error = NULL 
		WHERE id = $1
	`, documentID)
	if err != nil {
		logger.Error("Failed to update document status to processing", zap.Error(err))
		return
	}

	startTime := time.Now()
	logger.Info("Starting document processing",
		zap.String("document_id", documentID),
		zap.String("filename", uploadResult.Filename),
		zap.String("mime_type", uploadResult.MimeType),
	)

	// Get signed URL for file access
	signedURL, err := h.storage.GetSignedURL(uploadResult.StoragePath, 3600) // 1 hour
	if err != nil {
		logger.Error("Failed to get signed URL", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to get file access: %v", err))
		return
	}

	// Download file via HTTP GET
	resp, err := http.Get(signedURL)
	if err != nil {
		logger.Error("Failed to download file", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to download file: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Error("Failed to download file - bad status", zap.Int("status", resp.StatusCode))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to download file: HTTP %d", resp.StatusCode))
		return
	}

	// Extract text from file
	extraction, err := h.extractor.ExtractText(resp.Body, uploadResult.Filename)
	if err != nil {
		logger.Error("Failed to extract text", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to extract text: %v", err))
		return
	}

	logger.Info("Text extracted successfully",
		zap.String("document_id", documentID),
		zap.Int("text_length", len(extraction.Text)),
	)

	// Chunk the text
	chunks, err := h.chunker.ChunkText(extraction.Text, extraction.Metadata)
	if err != nil {
		logger.Error("Failed to chunk text", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to chunk text: %v", err))
		return
	}

	logger.Info("Text chunked successfully",
		zap.String("document_id", documentID),
		zap.Int("chunks_count", len(chunks)),
	)

	// Extract text content for batch embedding generation
	var chunkTexts []string
	for _, chunk := range chunks {
		chunkTexts = append(chunkTexts, chunk.Content)
	}

	// Generate embeddings in batch
	embeddings, err := h.embeddings.GenerateEmbeddings(chunkTexts)
	if err != nil {
		logger.Error("Failed to generate embeddings", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to generate embeddings: %v", err))
		return
	}

	logger.Info("Embeddings generated successfully",
		zap.String("document_id", documentID),
		zap.Int("embeddings_count", len(embeddings)),
	)

	// Prepare chunks for database insertion
	var chunkInserts []database.ChunkInsert
	for i, chunk := range chunks {
		if i >= len(embeddings) || embeddings[i] == nil {
			logger.Warn("Missing embedding for chunk", zap.Int("chunk_index", i))
			continue
		}

		chunkInserts = append(chunkInserts, database.ChunkInsert{
			DocumentID: documentID,
			Ordinal:    chunk.Ordinal,
			Content:    chunk.Content,
			Embedding:  embeddings[i],
			Metadata:   chunk.Metadata,
		})
	}

	// Insert chunks into database
	err = h.pgx.InsertChunks(ctx, chunkInserts)
	if err != nil {
		logger.Error("Failed to insert chunks", zap.Error(err))
		h.updateDocumentError(documentID, fmt.Sprintf("Failed to save chunks: %v", err))
		return
	}

	// Update document status to completed
	processingDuration := time.Since(startTime)
	_, err = h.db.GetDB().Exec(`
		UPDATE documents 
		SET processing_status = 'completed', error = NULL 
		WHERE id = $1
	`, documentID)
	if err != nil {
		logger.Error("Failed to update document status to completed", zap.Error(err))
		return
	}

	logger.Info("Document processing completed successfully",
		zap.String("document_id", documentID),
		zap.Int("chunks_inserted", len(chunkInserts)),
		zap.Duration("processing_time", processingDuration),
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

// getOrCreateUser gets a user by Supabase ID or creates them if they don't exist
func (h *RAGHandler) getOrCreateUser(c *gin.Context, supabaseID string) (*models.User, error) {
	logger := utils.GetLogger()

	// Try to get existing user
	user, err := h.db.GetUserBySupabaseID(supabaseID)
	if err == nil {
		return user, nil
	}

	// User doesn't exist, create them from JWT data
	email, emailExists := middleware.GetUserEmailFromContext(c)
	if !emailExists {
		logger.Error("Email not found in JWT token for user creation", zap.String("supabase_id", supabaseID))
		return nil, fmt.Errorf("email not found in JWT token")
	}

	// Extract username from email as fallback
	username := utils.ExtractUsernameFromEmail(email)

	logger.Info("Auto-creating user from JWT data for RAG operation",
		zap.String("supabase_id", supabaseID),
		zap.String("email", email),
		zap.String("username", username),
	)

	// Create user in database
	createUserReq := &models.CreateUserRequest{
		Email:      email,
		Username:   username,
		FullName:   &username, // Use username as fallback for full name
		SupabaseID: supabaseID,
	}

	createdUser, err := h.db.CreateUser(createUserReq)
	if err != nil {
		logger.Error("Failed to auto-create user",
			zap.String("supabase_id", supabaseID),
			zap.String("email", email),
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	logger.Info("Successfully auto-created user for RAG operation",
		zap.String("supabase_id", supabaseID),
		zap.String("user_id", createdUser.ID.String()),
	)

	return createdUser, nil
}

// updateDocumentError updates document status to failed with error message
func (h *RAGHandler) updateDocumentError(documentID, errorMsg string) {
	logger := utils.GetLogger()
	
	_, err := h.db.GetDB().Exec(`
		UPDATE documents 
		SET processing_status = 'failed', error = $2 
		WHERE id = $1
	`, documentID, errorMsg)
	if err != nil {
		logger.Error("Failed to update document error status", 
			zap.Error(err),
			zap.String("document_id", documentID),
		)
	}
}

// DeleteDocument handles DELETE /api/documents/:id
func (h *RAGHandler) DeleteDocument(c *gin.Context) {
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	documentID := c.Param("id")
	if documentID == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Document ID is required",
		})
		return
	}

	// Get document details and verify ownership
	var doc struct {
		UserID    string
		SourceURL *string
	}
	err = h.db.GetDB().QueryRow(`
		SELECT user_id, source_url 
		FROM documents 
		WHERE id = $1
	`, documentID).Scan(&doc.UserID, &doc.SourceURL)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(c, &models.APIError{
				Code:    http.StatusNotFound,
				Message: "Document not found",
			})
			return
		}
		logger.Error("Failed to get document", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get document",
		})
		return
	}

	if doc.UserID != user.ID.String() {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusForbidden,
			Message: "Access denied",
		})
		return
	}

	// Delete document from database (cascades to chunks)
	_, err = h.db.GetDB().Exec("DELETE FROM documents WHERE id = $1", documentID)
	if err != nil {
		logger.Error("Failed to delete document", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to delete document",
		})
		return
	}

	// Delete file from storage if it exists
	if doc.SourceURL != nil {
		// Extract storage path from URL (this depends on your storage implementation)
		// For now, we'll skip this step - in production, implement proper file deletion
		logger.Info("Document file should be deleted from storage", 
			zap.String("document_id", documentID),
			zap.String("source_url", *doc.SourceURL),
		)
	}

	logger.Info("Document deleted successfully", zap.String("document_id", documentID))
	utils.SendSuccess(c, map[string]string{"message": "Document deleted successfully"})
}

// ReprocessDocument handles POST /api/documents/:id/reprocess
func (h *RAGHandler) ReprocessDocument(c *gin.Context) {
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	documentID := c.Param("id")
	if documentID == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Document ID is required",
		})
		return
	}

	// Get document details and verify ownership
	var doc struct {
		UserID    string
		Title     string
		SourceURL *string
		MimeType  string
	}
	err = h.db.GetDB().QueryRow(`
		SELECT user_id, title, source_url, mime_type 
		FROM documents 
		WHERE id = $1
	`, documentID).Scan(&doc.UserID, &doc.Title, &doc.SourceURL, &doc.MimeType)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(c, &models.APIError{
				Code:    http.StatusNotFound,
				Message: "Document not found",
			})
			return
		}
		logger.Error("Failed to get document", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get document",
		})
		return
	}

	if doc.UserID != user.ID.String() {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusForbidden,
			Message: "Access denied",
		})
		return
	}

	// Delete existing chunks
	_, err = h.db.GetDB().Exec("DELETE FROM chunks WHERE document_id = $1", documentID)
	if err != nil {
		logger.Error("Failed to delete existing chunks", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to prepare for reprocessing",
		})
		return
	}

	// Reset document status
	_, err = h.db.GetDB().Exec(`
		UPDATE documents 
		SET processing_status = 'queued', error = NULL 
		WHERE id = $1
	`, documentID)
	if err != nil {
		logger.Error("Failed to reset document status", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to reset document status",
		})
		return
	}

	// Create upload result for reprocessing
	uploadResult := &storage.UploadResult{
		Filename:  doc.Title,
		MimeType:  doc.MimeType,
		PublicURL: *doc.SourceURL,
		// Note: StoragePath would need to be reconstructed from URL
		// This is a simplified implementation
	}

	// Start reprocessing in background
	go h.processDocument(documentID, uploadResult, user.ID.String())

	logger.Info("Document reprocessing started", zap.String("document_id", documentID))
	utils.SendSuccess(c, map[string]string{"message": "Document reprocessing started"})
}

// GetDocumentChunks handles GET /api/documents/:id/chunks
func (h *RAGHandler) GetDocumentChunks(c *gin.Context) {
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	documentID := c.Param("id")
	if documentID == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Document ID is required",
		})
		return
	}

	// Verify document ownership
	var docUserID string
	err = h.db.GetDB().QueryRow("SELECT user_id FROM documents WHERE id = $1", documentID).Scan(&docUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(c, &models.APIError{
				Code:    http.StatusNotFound,
				Message: "Document not found",
			})
			return
		}
		logger.Error("Failed to verify document ownership", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to verify document",
		})
		return
	}

	if docUserID != user.ID.String() {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusForbidden,
			Message: "Access denied",
		})
		return
	}

	// Parse pagination
	page := h.parsePage(c.Query("page"))
	limit := 20
	offset := (page - 1) * limit

	// Get chunks with pagination
	rows, err := h.db.GetDB().Query(`
		SELECT id, ordinal, content, metadata, created_at
		FROM chunks
		WHERE document_id = $1
		ORDER BY ordinal ASC
		LIMIT $2 OFFSET $3
	`, documentID, limit+1, offset)
	if err != nil {
		logger.Error("Failed to get document chunks", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get chunks",
		})
		return
	}
	defer rows.Close()

	var chunks []models.ChunkResponse
	for rows.Next() {
		var chunk models.ChunkResponse
		var metadataJSON *string
		err := rows.Scan(&chunk.ID, &chunk.Ordinal, &chunk.Content, &metadataJSON, &chunk.CreatedAt)
		if err != nil {
			logger.Error("Failed to scan chunk", zap.Error(err))
			continue
		}

		if metadataJSON != nil {
			var metadata interface{}
			if err := json.Unmarshal([]byte(*metadataJSON), &metadata); err == nil {
				chunk.Metadata = metadata
			}
		}

		chunks = append(chunks, chunk)
	}

	// Check if there are more chunks
	hasMore := len(chunks) > limit
	if hasMore {
		chunks = chunks[:limit]
	}

	// Get total count
	var total int
	err = h.db.GetDB().QueryRow("SELECT COUNT(*) FROM chunks WHERE document_id = $1", documentID).Scan(&total)
	if err != nil {
		total = len(chunks)
	}

	response := &models.DocumentChunksResponse{
		Chunks:  chunks,
		Page:    page,
		Total:   total,
		HasMore: hasMore,
	}

	utils.SendSuccess(c, response)
}

// DeleteChat handles DELETE /api/chats/:id
func (h *RAGHandler) DeleteChat(c *gin.Context) {
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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

	// Verify chat ownership and delete
	result, err := h.db.GetDB().Exec("DELETE FROM chats WHERE id = $1 AND user_id = $2", chatID, user.ID)
	if err != nil {
		logger.Error("Failed to delete chat", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to delete chat",
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "Chat not found",
		})
		return
	}

	logger.Info("Chat deleted successfully", zap.String("chat_id", chatID))
	utils.SendSuccess(c, map[string]string{"message": "Chat deleted successfully"})
}

// UpdateChat handles PUT /api/chats/:id
func (h *RAGHandler) UpdateChat(c *gin.Context) {
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

	user, err := h.getOrCreateUser(c, userSupabaseID)
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

	// Parse request
	var req models.UpdateChatRequest
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

	// Update chat
	result, err := h.db.GetDB().Exec(`
		UPDATE chats 
		SET title = $3 
		WHERE id = $1 AND user_id = $2
	`, chatID, user.ID, req.Title)
	if err != nil {
		logger.Error("Failed to update chat", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to update chat",
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusNotFound,
			Message: "Chat not found",
		})
		return
	}

	// Get updated chat
	var chat models.ChatResponse
	err = h.db.GetDB().QueryRow(`
		SELECT 
			c.id,
			c.title,
			c.created_at,
			(
				SELECT cm.content 
				FROM chat_messages cm 
				WHERE cm.chat_id = c.id 
				ORDER BY cm.created_at DESC 
				LIMIT 1
			) as last_message
		FROM chats c
		WHERE c.id = $1
	`, chatID).Scan(&chat.ID, &chat.Title, &chat.CreatedAt, &chat.LastMessage)
	if err != nil {
		logger.Error("Failed to get updated chat", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get updated chat",
		})
		return
	}

	logger.Info("Chat updated successfully", zap.String("chat_id", chatID))
	utils.SendSuccess(c, chat)
}

// RAGHealth handles GET /api/rag/health
func (h *RAGHandler) RAGHealth(c *gin.Context) {
	logger := utils.GetLogger()

	// Check embeddings health
	embeddingsHealth := h.embeddings.IsHealthy()

	// Check database health
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	databaseHealth := true
	if err := h.pgx.GetPool().Ping(ctx); err != nil {
		databaseHealth = false
		logger.Warn("Database health check failed", zap.Error(err))
	}

	// Check storage health (simplified)
	storageHealth := true // In production, implement proper storage health check

	// Determine overall status
	status := "healthy"
	if !embeddingsHealth || !databaseHealth || !storageHealth {
		status = "degraded"
	}

	response := &models.RAGHealthResponse{
		Status:           status,
		EmbeddingsHealth: embeddingsHealth,
		DatabaseHealth:   databaseHealth,
		StorageHealth:    storageHealth,
		Timestamp:        time.Now(),
	}

	logger.Info("RAG health check completed",
		zap.String("status", status),
		zap.Bool("embeddings_health", embeddingsHealth),
		zap.Bool("database_health", databaseHealth),
		zap.Bool("storage_health", storageHealth),
	)

	utils.SendSuccess(c, response)
}
