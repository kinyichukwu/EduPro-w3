package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db *database.Client
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(db *database.Client) *UserHandler {
	return &UserHandler{
		db: db,
	}
}

// GetOnboarding handles GET /api/user/onboarding
func (h *UserHandler) GetOnboarding(c *gin.Context) {
	logger := utils.GetLogger()
	
	// Get user ID from JWT token
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found in context",
		})
		return
	}

	// Parse user ID to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		logger.Error("Invalid user ID format", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Get onboarding data
	onboarding, err := h.db.GetOnboardingByUserID(userUUID)
	if err != nil {
		logger.Info("No onboarding data found for user", zap.String("user_id", userID))
		// Return empty onboarding response
		c.JSON(http.StatusOK, &models.OnboardingResponse{
			OnboardingData: nil,
			IsCompleted:    false,
			Message:        "No onboarding data found",
		})
		return
	}

	// Check if onboarding is completed
	isCompleted := onboarding.CompletedAt != nil

	response := &models.OnboardingResponse{
		OnboardingData: onboarding,
		IsCompleted:    isCompleted,
		Message:        "Onboarding data retrieved successfully",
	}

	logger.Info("Onboarding data retrieved successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, response)
}

// UpdateOnboarding handles PUT /api/user/onboarding
func (h *UserHandler) UpdateOnboarding(c *gin.Context) {
	logger := utils.GetLogger()
	
	// Get user ID from JWT token
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found in context",
		})
		return
	}

	// Parse user ID to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		logger.Error("Invalid user ID format", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Parse request body
	var req models.OnboardingUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Validate the request
	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Validate custom learning goal for custom role
	if req.Role == "custom" && (req.CustomLearningGoal == nil || *req.CustomLearningGoal == "") {
		logger.Error("Custom learning goal is required for custom role")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Custom learning goal is required for custom role",
		})
		return
	}

	// Update onboarding data
	onboarding, err := h.db.UpdateOnboarding(userUUID, &req)
	if err != nil {
		logger.Error("Failed to update onboarding", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update onboarding",
		})
		return
	}

	// Check if onboarding is completed
	isCompleted := onboarding.CompletedAt != nil

	response := &models.OnboardingResponse{
		OnboardingData: onboarding,
		IsCompleted:    isCompleted,
		Message:        "Onboarding updated successfully",
	}

	logger.Info("Onboarding updated successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, response)
}

// UpdateProfile handles PUT /api/user/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	logger := utils.GetLogger()
	
	// Get user ID from JWT token
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found in context",
		})
		return
	}

	// Parse user ID to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		logger.Error("Invalid user ID format", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Parse request body
	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Validate the request
	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Update user profile
	user, err := h.db.UpdateUser(userUUID, &req)
	if err != nil {
		logger.Error("Failed to update user profile", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update user profile",
		})
		return
	}

	logger.Info("User profile updated successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, user)
}