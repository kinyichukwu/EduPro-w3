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
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	"go.uber.org/zap"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	db       *database.Client
	cfg      *config.Config
	supabase *supabase.Client
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(db *database.Client, cfg *config.Config) *AuthHandler {
	supabaseClient, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseKey, &supabase.ClientOptions{})
	if err != nil {
		logger := utils.GetLogger()
		logger.Error("Failed to create Supabase client", zap.Error(err))
		return nil
	}

	return &AuthHandler{
		db:       db,
		cfg:      cfg,
		supabase: supabaseClient,
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

	// Get user from database by Supabase ID (JWT contains Supabase ID)
	user, err := h.db.GetUserBySupabaseID(userID)
	if err != nil {
		logger.Error("Failed to get user by Supabase ID", zap.String("supabase_id", userID), zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Get onboarding data using the internal user ID
	onboarding, err := h.db.GetOnboardingByUserID(userUUID)
	if err != nil {
		logger.Info("No onboarding data found for user", zap.String("supabase_id", userID))
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
			"error":   "Validation failed",
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

// Register handles POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	logger := utils.GetLogger()

	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request body",
			Details: err.Error(),
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Validation failed",
			Details: err.Error(),
		})
		return
	}

	// Create user in Supabase
	user, err := h.supabase.Auth.Signup(types.SignupRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		logger.Error("Failed to create user in Supabase", zap.Error(err))
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to create user account",
			Details: err.Error(),
		})
		return
	}

	// Create user in our database
	createUserReq := &models.CreateUserRequest{
		Email:      req.Email,
		Username:   req.Username,
		FullName:   &req.FullName,
		SupabaseID: user.User.ID.String(),
	}

	dbUser, err := h.db.CreateUser(createUserReq)
	if err != nil {
		logger.Error("Failed to create user in database", zap.Error(err))
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to create user profile",
			Details: err.Error(),
		})
		return
	}

	// Create JWT token
	token, err := h.createJWTToken(user.User.ID.String(), req.Email, "authenticated")
	if err != nil {
		logger.Error("Failed to create JWT token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to create authentication token",
		})
		return
	}

	// Create user profile
	profile := &models.UserProfile{
		ID:        dbUser.ID,
		Email:     dbUser.Email,
		Username:  dbUser.Username,
		FullName:  dbUser.FullName,
		Avatar:    dbUser.Avatar,
		CreatedAt: dbUser.CreatedAt,
		UpdatedAt: dbUser.UpdatedAt,
	}

	response := &models.AuthResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   24 * 60 * 60, // 24 hours
		User:        profile,
	}

	logger.Info("User registered successfully", zap.String("user_id", dbUser.ID.String()))
	c.JSON(http.StatusCreated, response)
}

// Login handles POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	logger := utils.GetLogger()

	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Invalid request body", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request body",
			Details: err.Error(),
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Validation failed",
			Details: err.Error(),
		})
		return
	}

	// For testing, we'll create a simple login that creates a Supabase user if needed
	// In production, you'd want proper password hashing and validation

	// Try to sign in with Supabase first
	user, err := h.supabase.Auth.SignInWithEmailPassword(req.Email, req.Password)
	if err != nil {
		// If login fails, try to create the user in Supabase (for testing)
		logger.Info("User not found in Supabase, creating new user", zap.String("email", req.Email))
		signupResp, err := h.supabase.Auth.Signup(types.SignupRequest{
			Email:    req.Email,
			Password: req.Password,
		})
		if err != nil {
			logger.Error("Failed to create user in Supabase", zap.Error(err))
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error: "Invalid email or password",
			})
			return
		}

		// Try to sign in again after signup
		user, err = h.supabase.Auth.SignInWithEmailPassword(req.Email, req.Password)
		if err != nil {
			logger.Error("Failed to sign in after signup", zap.Error(err))
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error: "User created but login failed",
			})
			return
		}

		// Log the signup response for debugging
		logger.Info("User created successfully", zap.String("user_id", signupResp.User.ID.String()))
	}

	// Get user from our database
	dbUser, err := h.db.GetUserBySupabaseID(user.User.ID.String())
	if err != nil {
		// If user not found in our database, create them
		logger.Info("User not found in database, creating new user", zap.String("supabase_id", user.User.ID.String()))

		// Extract username from email
		username := utils.ExtractUsernameFromEmail(req.Email)

		createUserReq := &models.CreateUserRequest{
			Email:      req.Email,
			Username:   username,
			SupabaseID: user.User.ID.String(),
		}

		dbUser, err = h.db.CreateUser(createUserReq)
		if err != nil {
			logger.Error("Failed to create user in database", zap.Error(err))
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error: "Failed to create user profile",
			})
			return
		}
	}

	// Get onboarding data
	onboarding, err := h.db.GetOnboardingByUserID(user.User.ID)
	if err != nil {
		logger.Info("No onboarding data found for user", zap.String("user_id", user.User.ID.String()))
	}

	// Create JWT token
	token, err := h.createJWTToken(user.User.ID.String(), req.Email, "authenticated")
	if err != nil {
		logger.Error("Failed to create JWT token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to create authentication token",
		})
		return
	}

	// Create user profile
	profile := &models.UserProfile{
		ID:             dbUser.ID,
		Email:          dbUser.Email,
		Username:       dbUser.Username,
		FullName:       dbUser.FullName,
		Avatar:         dbUser.Avatar,
		OnboardingData: onboarding,
		CreatedAt:      dbUser.CreatedAt,
		UpdatedAt:      dbUser.UpdatedAt,
	}

	response := &models.AuthResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   24 * 60 * 60, // 24 hours
		User:        profile,
	}

	logger.Info("User logged in successfully", zap.String("user_id", dbUser.ID.String()))
	c.JSON(http.StatusOK, response)
}

// createJWTToken creates a JWT token for the user
func (h *AuthHandler) createJWTToken(userID, email, role string) (string, error) {
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
	return token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
}
