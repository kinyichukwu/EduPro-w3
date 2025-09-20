package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// TestAuthHandler handles test authentication for development
type TestAuthHandler struct {
	cfg *config.Config
}

// NewTestAuthHandler creates a new test auth handler
func NewTestAuthHandler(cfg *config.Config) *TestAuthHandler {
	return &TestAuthHandler{
		cfg: cfg,
	}
}

// GenerateTestTokenRequest represents a request to generate a test token
type GenerateTestTokenRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// GenerateTestTokenResponse represents the response for generating a test token
type GenerateTestTokenResponse struct {
	Success      bool   `json:"success"`
	AccessToken  string `json:"access_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
	Email        string `json:"email"`
	Instructions string `json:"instructions"`
}

// GenerateTestToken generates a test JWT token for development/testing
// @Summary Generate test JWT token
// @Description Generates a valid JWT token for testing API endpoints (DEVELOPMENT ONLY)
// @Tags Test Auth
// @Accept json
// @Produce json
// @Param request body GenerateTestTokenRequest true "Test token generation request"
// @Success 200 {object} GenerateTestTokenResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /api/test/generate-token [post]
func (h *TestAuthHandler) GenerateTestToken(c *gin.Context) {
	logger := utils.GetLogger()

	var req GenerateTestTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Failed to decode request", zap.Error(err))
		utils.SendError(c, models.NewAPIError(http.StatusBadRequest, "Invalid request body", err.Error()))
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		logger.Error("Validation failed", zap.Error(err))
		utils.SendError(c, models.NewAPIError(http.StatusBadRequest, "Validation failed", err.Error()))
		return
	}

	// Create JWT claims
	claims := &middleware.JWTClaims{
		UserID: "test-user-id-" + req.Email,
		Email:  req.Email,
		Role:   "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "edupro-test",
			Subject:   "test-user-id-" + req.Email,
		},
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with secret
	tokenString, err := token.SignedString([]byte(h.cfg.SupabaseJWTSecret))
	if err != nil {
		logger.Error("Failed to sign token", zap.Error(err))
		utils.SendError(c, models.NewAPIError(http.StatusInternalServerError, "Failed to generate token", err.Error()))
		return
	}

	logger.Info("Generated test token", zap.String("email", req.Email))

	response := &GenerateTestTokenResponse{
		Success:      true,
		AccessToken:  tokenString,
		ExpiresIn:    86400, // 24 hours in seconds
		TokenType:    "Bearer",
		Email:        req.Email,
		Instructions: "Use this token in the Authorization header: 'Bearer " + tokenString + "'",
	}

	utils.SendSuccess(c, response)
}
