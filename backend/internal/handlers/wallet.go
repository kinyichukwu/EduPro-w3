package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
)

// WalletHandler handles wallet-related HTTP requests
type WalletHandler struct {
	solanaService *solana.Service
	db            *database.Client
}

// NewWalletHandler creates a new wallet handler
func NewWalletHandler(solanaService *solana.Service, db *database.Client) *WalletHandler {
	return &WalletHandler{
		solanaService: solanaService,
		db:            db,
	}
}

// ConnectWallet handles wallet connection
func (h *WalletHandler) ConnectWallet(c *gin.Context) {
	var req models.ConnectWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user ID from authentication context (this is the Supabase ID)
	supabaseUserID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get the internal user ID from the database using the Supabase ID
	user, err := h.db.GetUserBySupabaseID(supabaseUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found in database"})
		return
	}

	wallet, err := h.solanaService.ConnectWallet(c.Request.Context(), user.ID.String(), req.Address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect wallet", "details": err.Error()})
		return
	}

	verifyMessage := h.solanaService.GenerateVerificationMessage()

	response := models.ConnectWalletResponse{
		Wallet:        wallet,
		Message:       "Wallet connected successfully",
		VerifyMessage: verifyMessage,
	}

	c.JSON(http.StatusOK, response)
}

// VerifyWallet handles wallet verification
func (h *WalletHandler) VerifyWallet(c *gin.Context) {
	var req models.VerifyWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	walletID, err := uuid.Parse(req.WalletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	wallet, err := h.solanaService.VerifyWallet(c.Request.Context(), walletID, req.Message, req.Signature)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify wallet", "details": err.Error()})
		return
	}

	response := models.VerifyWalletResponse{
		Wallet:  wallet,
		Message: "Wallet verified successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetWallets returns user's connected wallets
func (h *WalletHandler) GetWallets(c *gin.Context) {
	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	wallets, err := h.solanaService.GetWalletsByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get wallets", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"wallets": wallets,
		"count":   len(wallets),
	})
}

// DisconnectWallet removes a wallet connection
func (h *WalletHandler) DisconnectWallet(c *gin.Context) {
	walletID := c.Param("id")

	if _, err := uuid.Parse(walletID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	// Get user ID from authentication context
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	walletUUID, err := uuid.Parse(walletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	err = h.solanaService.DisconnectWallet(c.Request.Context(), walletUUID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disconnect wallet", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Wallet disconnected successfully"})
}
