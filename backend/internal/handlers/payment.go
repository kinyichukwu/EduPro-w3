package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
)

// PaymentHandler handles payment-related HTTP requests
type PaymentHandler struct {
	solanaService *solana.Service
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(solanaService *solana.Service) *PaymentHandler {
	return &PaymentHandler{
		solanaService: solanaService,
	}
}

// GeneratePayment generates a Solana payment transaction
func (h *PaymentHandler) GeneratePayment(c *gin.Context) {
	var req models.GeneratePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	_ = userID // Use userID for logging/tracking

	response, err := h.solanaService.GeneratePayment(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// SubmitPayment submits a signed Solana transaction
func (h *PaymentHandler) SubmitPayment(c *gin.Context) {
	var req models.SubmitPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	_ = userID // Use userID for logging/tracking

	response, err := h.solanaService.SubmitPayment(c.Request.Context(), req.SignedTransaction, req.PriceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetSupportedTokens returns list of supported payment tokens
func (h *PaymentHandler) GetSupportedTokens(c *gin.Context) {
	tokens := h.solanaService.GetSupportedTokens()

	c.JSON(http.StatusOK, gin.H{
		"tokens": tokens,
	})
}

// GetPaymentStatus returns the status of a payment transaction
func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	transactionID := c.Param("transactionId")

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	_ = userID // Use userID to ensure user owns the transaction

	// TODO: Implement payment status lookup
	// This would query the database or blockchain for transaction status

	c.JSON(http.StatusOK, gin.H{
		"transaction_id": transactionID,
		"status":         "confirmed", // Example status
		"message":        "Payment confirmed",
	})
}

// DeductFromWallet deducts tokens from a user's wallet
func (h *PaymentHandler) DeductFromWallet(c *gin.Context) {
	var req models.DeductWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	response, err := h.solanaService.DeductFromWallet(c.Request.Context(), userID, req.WalletAddress, req.Amount, req.TokenMint)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deduct from wallet", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// SendEduProTokens sends EduPro tokens to a user's wallet
func (h *PaymentHandler) SendEduProTokens(c *gin.Context) {
	var req models.SendTokensRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	response, err := h.solanaService.SendEduProTokens(c.Request.Context(), userID, req.WalletAddress, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send EduPro tokens", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// QueryOnChainEduProTokens queries on-chain EduPro token data for a user
func (h *PaymentHandler) QueryOnChainEduProTokens(c *gin.Context) {
	var req models.QueryTokensRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	_ = userID // Use userID to ensure user owns the wallet

	response, err := h.solanaService.QueryOnChainEduProTokens(c.Request.Context(), req.WalletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query on-chain tokens", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
