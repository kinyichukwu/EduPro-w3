package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/kinyichukwu/edu-pro-backend/pkg/constants"
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
		logger.Error("Invalid user ID format", zap.String("user_id", userID), zap.String("error", err.Error()))
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
	
	// Get request ID for tracking
	requestID := c.GetString("request_id")
	logger.Info("Starting onboarding update", zap.String("request_id", requestID))
	
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
		logger.Error("Invalid user ID format", zap.String("user_id", userID), zap.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Parse request body
	var req models.OnboardingUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Log the exact request data received
	logger.Info("Onboarding update request received", 
		zap.String("user_id", userID),
		zap.String("role", req.Role),
		zap.Any("custom_learning_goal", req.CustomLearningGoal),
		zap.Any("academic_details", req.AcademicDetails))

	// Validate the request - but be more lenient for empty fields during skip
	if req.Role == "" {
		// If no role provided, set a default for skipping
		req.Role = constants.DefaultUserRole
		defaultGoal := constants.DefaultLearningGoal
		req.CustomLearningGoal = &defaultGoal
		logger.Info("Set default role and goal for skip", 
			zap.String("user_id", userID),
			zap.String("default_role", constants.DefaultUserRole),
			zap.String("default_goal", constants.DefaultLearningGoal))
	}
	
	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", 
			zap.String("request_id", requestID),
			zap.String("user_id", userID),
			zap.String("error", err.Error()),
			zap.String("received_role", req.Role))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Validate custom learning goal for custom role (but allow empty for skip)
	if req.Role == constants.RoleCustom && req.CustomLearningGoal != nil && *req.CustomLearningGoal == "" {
		// Set a default learning goal if empty for custom role
		defaultGoal := constants.DefaultLearningGoal
		req.CustomLearningGoal = &defaultGoal
		logger.Info("Set default learning goal for custom role", 
			zap.String("user_id", userID),
			zap.String("default_goal", constants.DefaultLearningGoal))
	}

	// Ensure user exists in our database (auto-create if needed)
	err = h.ensureUserExists(c, userUUID)
	if err != nil {
		logger.Error("Failed to ensure user exists", zap.String("user_id", userID), zap.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process user data",
		})
		return
	}

	// Update onboarding data
	onboarding, err := h.db.UpdateOnboarding(userUUID, &req)
	if err != nil {
		logger.Error("Failed to update onboarding", zap.String("user_id", userID), zap.String("error", err.Error()))
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

	logger.Info("Onboarding updated successfully", 
		zap.String("request_id", requestID),
		zap.String("user_id", userID),
		zap.Bool("is_completed", isCompleted))
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

	// Get user by Supabase ID first
	user, err := h.db.GetUserBySupabaseID(userID)
	if err != nil {
		logger.Error("User not found by Supabase ID", zap.String("supabase_id", userID), zap.String("error", err.Error()))
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}
	
	userUUID := user.ID

	// Parse request body
	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Validate the request
	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", zap.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation failed",
			"details": err.Error(),
		})
		return
	}

	// Update user profile
	updatedUser, err := h.db.UpdateUser(userUUID, &req)
	if err != nil {
		logger.Error("Failed to update user profile", zap.String("user_id", userID), zap.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update user profile",
		})
		return
	}

	logger.Info("User profile updated successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, updatedUser)
}

// ensureUserExists checks if user exists in our database and creates them if needed
func (h *UserHandler) ensureUserExists(c *gin.Context, userUUID uuid.UUID) error {
	logger := utils.GetLogger()
	requestID := c.GetString("request_id")
	
	logger.Debug("Checking if user exists", 
		zap.String("request_id", requestID),
		zap.String("user_uuid", userUUID.String()))
	
	// First, try to get the user by UUID (our internal UUID)
	_, err := h.db.GetUserByID(userUUID)
	if err == nil {
		// User exists, nothing to do
		logger.Debug("User found by internal UUID", zap.String("request_id", requestID))
		return nil
	}
	
	// User doesn't exist by internal UUID, try by Supabase ID
	supabaseID := userUUID.String() // The UUID from JWT is actually the Supabase ID
	logger.Debug("User not found by internal UUID, trying Supabase ID", 
		zap.String("request_id", requestID),
		zap.String("supabase_id", supabaseID))
	
	_, err = h.db.GetUserBySupabaseID(supabaseID)
	if err == nil {
		// User exists by Supabase ID, nothing to do
		logger.Debug("User found by Supabase ID", zap.String("request_id", requestID))
		return nil
	}
	
	// User doesn't exist, create them from JWT data
	email, emailExists := middleware.GetUserEmailFromContext(c)
	if !emailExists {
		return fmt.Errorf("email not found in JWT token")
	}
	
	// Extract username from email as fallback (user can update later)
	username := utils.ExtractUsernameFromEmail(email)
	
	logger.Info("Auto-creating user from JWT data", 
		zap.String("request_id", requestID),
		zap.String("supabase_id", supabaseID),
		zap.String("email", email),
		zap.String("username", username),
	)
	
	// Create user in our database
	createReq := &models.CreateUserRequest{
		Email:      email,
		Username:   username,
		SupabaseID: supabaseID,
	}
	
	_, err = h.db.CreateUser(createReq)
	if err != nil {
		logger.Error("Failed to auto-create user", 
			zap.String("request_id", requestID),
			zap.String("error", err.Error()),
			zap.String("supabase_id", supabaseID))
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	logger.Info("User auto-created successfully", 
		zap.String("request_id", requestID),
		zap.String("supabase_id", supabaseID))
	return nil
}
