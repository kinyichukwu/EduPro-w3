package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	db  *database.Client
	cfg *config.Config
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(db *database.Client, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		db:  db,
		cfg: cfg,
	}
}

// Me handles GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
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

	// Get user from database
	user, err := h.db.GetUserByID(userUUID)
	if err != nil {
		logger.Error("Failed to get user", zap.String("user_id", userID), zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Get onboarding data
	onboarding, err := h.db.GetOnboardingByUserID(userUUID)
	if err != nil {
		logger.Info("No onboarding data found for user", zap.String("user_id", userID))
		// It's OK if onboarding doesn't exist yet
	}

	// Create user profile response
	profile := &models.UserProfile{
		ID:             user.ID,
		Email:          user.Email,
		Username:       user.Username,
		FullName:       user.FullName,
		Avatar:         user.Avatar,
		OnboardingData: onboarding,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}

	logger.Info("User profile retrieved successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, profile)
}

// RefreshToken handles POST /api/auth/refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	logger := utils.GetLogger()
	
	// For now, we'll just return the current token info
	// In a full implementation, you would validate the refresh token
	// and issue a new access token
	
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found in context",
		})
		return
	}

	email, _ := middleware.GetUserEmailFromContext(c)
	role, _ := middleware.GetUserRoleFromContext(c)

	// Create a new token (in production, this would be a proper refresh implementation)
	claims := &middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
	if err != nil {
		logger.Error("Failed to generate token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	logger.Info("Token refreshed successfully", zap.String("user_id", userID))
	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"token_type":   "Bearer",
		"expires_in":   24 * 60 * 60, // 24 hours in seconds
	})
}

// CreateUser handles user creation (internal use, for integration with frontend auth)
func (h *AuthHandler) CreateUser(c *gin.Context) {
	logger := utils.GetLogger()
	
	var req models.CreateUserRequest
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

	// Create user in database
	user, err := h.db.CreateUser(&req)
	if err != nil {
		logger.Error("Failed to create user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create user",
		})
		return
	}

	logger.Info("User created successfully", zap.String("user_id", user.ID.String()))
	c.JSON(http.StatusCreated, user)
}