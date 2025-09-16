package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// FlashcardHandler handles flashcard-related HTTP requests
type FlashcardHandler struct {
	db *database.Client
}

// NewFlashcardHandler creates a new flashcard handler
func NewFlashcardHandler(db *database.Client) *FlashcardHandler {
	return &FlashcardHandler{db: db}
}

// CreateDeck creates a new flashcard deck
func (h *FlashcardHandler) CreateDeck(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context (set by JWT middleware)
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	var req models.CreateDeckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	deck, err := h.db.CreateDeck(userID, &req)
	if err != nil {
		logger.Error("Failed to create deck", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to create deck"})
		return
	}

	logger.Info("Deck created successfully", zap.String("deck_id", deck.ID.String()))
	utils.SendSuccess(c, deck)
}

// GetDecks retrieves all decks for the authenticated user
func (h *FlashcardHandler) GetDecks(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	decks, err := h.db.GetDecksByUserID(userID)
	if err != nil {
		logger.Error("Failed to get decks", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get decks"})
		return
	}

	utils.SendSuccess(c, decks)
}

// GetDeck retrieves a specific deck by ID
func (h *FlashcardHandler) GetDeck(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	// Get deck ID from URL parameter
	deckIDStr := c.Param("id")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	deck, err := h.db.GetDeckByID(deckID, userID)
	if err != nil {
		if err.Error() == "deck not found" {
			utils.SendError(c, &models.APIError{Code: http.StatusNotFound, Message: "Deck not found"})
			return
		}
		logger.Error("Failed to get deck", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get deck"})
		return
	}

	utils.SendSuccess(c, deck)
}

// UpdateDeck updates a deck
func (h *FlashcardHandler) UpdateDeck(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	// Get deck ID from URL parameter
	deckIDStr := c.Param("id")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	var req models.UpdateDeckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	deck, err := h.db.UpdateDeck(deckID, userID, &req)
	if err != nil {
		if err.Error() == "deck not found" {
			utils.SendError(c, &models.APIError{Code: http.StatusNotFound, Message: "Deck not found"})
			return
		}
		logger.Error("Failed to update deck", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to update deck"})
		return
	}

	utils.SendSuccess(c, deck)
}

// DeleteDeck deletes a deck
func (h *FlashcardHandler) DeleteDeck(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	// Get deck ID from URL parameter
	deckIDStr := c.Param("id")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	err = h.db.DeleteDeck(deckID, userID)
	if err != nil {
		if err.Error() == "deck not found" {
			utils.SendError(c, &models.APIError{Code: http.StatusNotFound, Message: "Deck not found"})
			return
		}
		logger.Error("Failed to delete deck", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to delete deck"})
		return
	}

	utils.SendSuccess(c, nil)
}

// CreateFlashcard creates a new flashcard in a deck
func (h *FlashcardHandler) CreateFlashcard(c *gin.Context) {
	logger := utils.GetLogger()

	// Get deck ID from URL parameter
	deckIDStr := c.Param("deckId")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	var req models.CreateFlashcardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	// TODO: Verify that the deck belongs to the authenticated user

	card, err := h.db.CreateFlashcard(deckID, &req)
	if err != nil {
		logger.Error("Failed to create flashcard", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to create flashcard"})
		return
	}

	logger.Info("Flashcard created successfully", zap.String("card_id", card.ID.String()))
	utils.SendSuccess(c, card)
}

// CreateBulkFlashcards creates multiple flashcards in a deck
func (h *FlashcardHandler) CreateBulkFlashcards(c *gin.Context) {
	logger := utils.GetLogger()

	// Get deck ID from URL parameter
	deckIDStr := c.Param("deckId")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	var req models.CreateBulkFlashcardsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	// TODO: Verify that the deck belongs to the authenticated user

	cards, err := h.db.CreateBulkFlashcards(deckID, &req)
	if err != nil {
		logger.Error("Failed to create bulk flashcards", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to create flashcards"})
		return
	}

	logger.Info("Bulk flashcards created successfully", 
		zap.String("deck_id", deckID.String()), 
		zap.Int("count", len(cards)))
	utils.SendSuccess(c, cards)
}

// GetFlashcards retrieves all flashcards in a deck
func (h *FlashcardHandler) GetFlashcards(c *gin.Context) {
	logger := utils.GetLogger()

	// Get deck ID from URL parameter
	deckIDStr := c.Param("deckId")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	// TODO: Verify that the deck belongs to the authenticated user

	cards, err := h.db.GetFlashcardsByDeckID(deckID)
	if err != nil {
		logger.Error("Failed to get flashcards", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get flashcards"})
		return
	}

	utils.SendSuccess(c, cards)
}

// GetFlashcardStats retrieves flashcard statistics for the user
func (h *FlashcardHandler) GetFlashcardStats(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	stats, err := h.db.GetFlashcardStats(userID)
	if err != nil {
		logger.Error("Failed to get flashcard stats", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get flashcard stats"})
		return
	}

	utils.SendSuccess(c, stats)
}

// StartStudySession starts a new study session
func (h *FlashcardHandler) StartStudySession(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		utils.SendError(c, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"})
		return
	}

	var req models.StartStudySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	// TODO: Verify that the deck belongs to the authenticated user

	session, err := h.db.StartStudySession(userID, &req)
	if err != nil {
		logger.Error("Failed to start study session", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to start study session"})
		return
	}

	logger.Info("Study session started successfully", zap.String("session_id", session.ID.String()))
	utils.SendSuccess(c, session)
}

// EndStudySession ends a study session
func (h *FlashcardHandler) EndStudySession(c *gin.Context) {
	logger := utils.GetLogger()

	// Get session ID from URL parameter
	sessionIDStr := c.Param("sessionId")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		logger.Error("Invalid session ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid session ID"})
		return
	}

	var req models.EndStudySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	// TODO: Verify that the session belongs to the authenticated user

	session, err := h.db.EndStudySession(sessionID, &req)
	if err != nil {
		logger.Error("Failed to end study session", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to end study session"})
		return
	}

	logger.Info("Study session ended successfully", zap.String("session_id", sessionID.String()))
	utils.SendSuccess(c, session)
}

// GetStudyCards retrieves cards for studying based on mode and deck
func (h *FlashcardHandler) GetStudyCards(c *gin.Context) {
	logger := utils.GetLogger()

	// Get deck ID from URL parameter
	deckIDStr := c.Param("deckId")
	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	// Get optional query parameters
	mode := c.DefaultQuery("mode", "sequential")
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 20
	}

	// TODO: Implement logic to get cards based on study mode
	// For now, just get all cards from the deck
	cards, err := h.db.GetFlashcardsByDeckID(deckID)
	if err != nil {
		logger.Error("Failed to get study cards", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get study cards"})
		return
	}

	// Apply limit
	if len(cards) > limit {
		cards = cards[:limit]
	}

	logger.Info("Study cards retrieved successfully", 
		zap.String("deck_id", deckID.String()),
		zap.String("mode", mode),
		zap.Int("count", len(cards)))

	utils.SendSuccess(c, gin.H{
		"cards": cards,
		"mode":  mode,
		"count": len(cards),
	})
}
