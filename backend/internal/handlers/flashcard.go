package handlers

import (
	"net/http"
	"strconv"
	"time"

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

// getUserFromContext gets the user from the JWT context and ensures they exist in our database
func (h *FlashcardHandler) getUserFromContext(c *gin.Context) (*models.User, error) {
	logger := utils.GetLogger()

	// Get user ID from context (set by JWT middleware)
	userIDStr, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		return nil, &models.APIError{Code: http.StatusUnauthorized, Message: "User not authenticated"}
	}

	// Get user email from context
	userEmail, emailExists := c.Get("user_email")
	if !emailExists {
		logger.Error("User email not found in context")
		return nil, &models.APIError{Code: http.StatusUnauthorized, Message: "User email not found"}
	}

	supabaseUserID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		logger.Error("Invalid user ID", zap.String("error", err.Error()))
		return nil, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid user ID"}
	}

	// Try to get user from our database
	user, err := h.db.GetUserBySupabaseID(supabaseUserID.String())
	if err != nil {
		// User doesn't exist in our database, create them
		createUserReq := &models.CreateUserRequest{
			Email:      userEmail.(string),
			Username:   "", // Will be filled from email prefix if empty
			SupabaseID: supabaseUserID.String(),
		}

		user, err = h.db.CreateUser(createUserReq)
		if err != nil {
			logger.Error("Failed to create user in database", 
				zap.String("supabase_user_id", supabaseUserID.String()),
				zap.String("error", err.Error()))
			return nil, &models.APIError{
				Code: http.StatusInternalServerError, 
				Message: "Failed to create user record"}
		}

		logger.Info("Auto-created user record", zap.String("user_id", user.ID.String()))
	}

	return user, nil
}

// CreateDeck creates a new flashcard deck
func (h *FlashcardHandler) CreateDeck(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
		return
	}

	var req models.CreateDeckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	deck, err := h.db.CreateDeck(user.ID, &req)
	if err != nil {
		logger.Error("Failed to create deck", 
			zap.String("user_id", user.ID.String()),
			zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to create deck"})
		return
	}

	logger.Info("Deck created successfully", 
		zap.String("deck_id", deck.ID.String()),
		zap.String("user_id", user.ID.String()))
	utils.SendSuccess(c, deck)
}

// GetDecks retrieves all decks for the authenticated user
func (h *FlashcardHandler) GetDecks(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
		return
	}

	decks, err := h.db.GetDecksByUserID(user.ID)
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

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
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

	deck, err := h.db.GetDeckByID(deckID, user.ID)
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

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
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

	deck, err := h.db.UpdateDeck(deckID, user.ID, &req)
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

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
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

	err = h.db.DeleteDeck(deckID, user.ID)
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
	deckIDStr := c.Param("id")
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
	deckIDStr := c.Param("id")
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
	deckIDStr := c.Param("id")
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

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
		return
	}

	stats, err := h.db.GetFlashcardStats(user.ID)
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

	// Get user from context and ensure they exist in our database
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Internal server error"})
		}
		return
	}

	var req models.StartStudySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid request body"})
		return
	}

	// TODO: Verify that the deck belongs to the authenticated user

	session, err := h.db.StartStudySession(user.ID, &req)
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
	deckIDStr := c.Param("id")
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

// RateFlashcard handles rating a flashcard and updating its spaced repetition data
func (h *FlashcardHandler) RateFlashcard(c *gin.Context) {
	logger := utils.GetLogger()

	// Get user from context
	user, err := h.getUserFromContext(c)
	if err != nil {
		if apiErr, ok := err.(*models.APIError); ok {
			utils.SendError(c, apiErr)
		} else {
			utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to get user"})
		}
		return
	}

	// Get deck ID and flashcard ID from URL
	deckIDStr := c.Param("id")
	flashcardIDStr := c.Param("flashcard_id")

	deckID, err := uuid.Parse(deckIDStr)
	if err != nil {
		logger.Error("Invalid deck ID", zap.String("deck_id", deckIDStr), zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid deck ID"})
		return
	}

	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		logger.Error("Invalid flashcard ID", zap.String("flashcard_id", flashcardIDStr), zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid flashcard ID"})
		return
	}

	// Parse request body
	var req struct {
		Rating string `json:"rating" binding:"required,oneof=hard okay easy"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusBadRequest, Message: "Invalid rating. Must be 'hard', 'okay', or 'easy'"})
		return
	}

	// Verify deck belongs to user
	_, err = h.db.GetDeckByID(deckID, user.ID)
	if err != nil {
		logger.Error("Failed to get deck or deck not found", 
			zap.String("deck_id", deckID.String()),
			zap.String("user_id", user.ID.String()),
			zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusNotFound, Message: "Deck not found"})
		return
	}

	// Calculate spaced repetition intervals based on rating
	var intervalDays int
	var masteryLevelChange int

	switch req.Rating {
	case "hard":
		intervalDays = 1
		masteryLevelChange = 0 // No mastery increase for hard rating
	case "okay":
		intervalDays = 3
		masteryLevelChange = 1
	case "easy":
		intervalDays = 7
		masteryLevelChange = 2
	}

	// Calculate next review date
	nextReview := time.Now().AddDate(0, 0, intervalDays)

	// Update flashcard in database
	err = h.db.UpdateFlashcardProgress(flashcardID.String(), masteryLevelChange, nextReview)
	if err != nil {
		logger.Error("Failed to update flashcard progress",
			zap.String("flashcard_id", flashcardID.String()),
			zap.String("error", err.Error()))
		utils.SendError(c, &models.APIError{Code: http.StatusInternalServerError, Message: "Failed to update flashcard progress"})
		return
	}

	logger.Info("Flashcard rated successfully",
		zap.String("flashcard_id", flashcardID.String()),
		zap.String("deck_id", deckID.String()),
		zap.String("user_id", user.ID.String()),
		zap.String("rating", req.Rating),
		zap.Int("interval_days", intervalDays),
		zap.String("next_review", nextReview.Format(time.RFC3339)))

	utils.SendSuccess(c, gin.H{
		"message":       "Flashcard rated successfully",
		"rating":        req.Rating,
		"interval_days": intervalDays,
		"next_review":   nextReview.Format(time.RFC3339),
	})
}
