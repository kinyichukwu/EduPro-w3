package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/nft"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// WalletHandler handles wallet-related HTTP requests
type WalletHandler struct {
	solanaService *solana.Service
	db            *database.Client
	nftService    *nft.Service
}

// NewWalletHandler creates a new wallet handler
func NewWalletHandler(solanaService *solana.Service, db *database.Client, nftService *nft.Service) *WalletHandler {
	return &WalletHandler{
		solanaService: solanaService,
		db:            db,
		nftService:    nftService,
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

	// Automatically create membership NFT for new users who verify their wallet
	if wallet.IsVerified {
		// Get user details
		user, err := h.db.GetUserByID(wallet.UserID)
		if err == nil && user != nil {
			// Check if user already has a membership NFT
			existingNFT, err := h.db.GetMembershipNFTByEmail(user.Email)
			if err == nil && existingNFT == nil {
				// Create membership NFT
				membershipReq := &models.CreateMembershipNFTRequest{
					UserEmail:     user.Email,
					WalletAddress: wallet.WalletAddress,
				}

				_, nftErr := h.nftService.CreateMembershipNFT(c.Request.Context(), membershipReq)
				if nftErr != nil {
					// Log error but don't fail the wallet verification
					// The NFT can be created later manually
					utils.GetLogger().Error("Failed to create membership NFT",
						zap.String("user_email", user.Email), zap.Error(nftErr))
				}
			}
		}
	}

	response := models.VerifyWalletResponse{
		Wallet:  wallet,
		Message: "Wallet verified successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetWallets returns user's connected wallets
func (h *WalletHandler) GetWallets(c *gin.Context) {
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

	wallets, err := h.solanaService.GetWalletsByUserID(c.Request.Context(), user.ID.String())
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

// GenerateWallet generates a new Solana wallet for the authenticated user
func (h *WalletHandler) GenerateWallet(c *gin.Context) {
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

	// Generate new wallet
	response, err := h.solanaService.GenerateWallet(c.Request.Context(), user.ID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate wallet", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// FundWallet funds a wallet with SOL from the devnet faucet
func (h *WalletHandler) FundWallet(c *gin.Context) {
	var req models.FundWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// // Get user ID from authentication context (this is the Supabase ID)
	// supabaseUserID, exists := middleware.GetUserIDFromContext(c)
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
	// 	return
	// }

	// For testing purposes, allow funding any valid Solana address
	// TODO: Re-enable wallet ownership check in production
	// user, err := h.db.GetUserBySupabaseID(supabaseUserID)
	// if err != nil {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "User not found in database"})
	// 	return
	// }
	// userUUID, err := uuid.Parse(user.ID.String())
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
	// 	return
	// }
	// wallets, err := h.db.GetWalletsByUserID(userUUID)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user wallets"})
	// 	return
	// }
	// walletOwned := false
	// for _, wallet := range wallets {
	// 	if wallet.WalletAddress == req.WalletAddress {
	// 		walletOwned = true
	// 		break
	// 	}
	// }
	// if !walletOwned {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Wallet does not belong to user"})
	// 	return
	// }

	// Fund the wallet
	response, err := h.solanaService.FundWallet(c.Request.Context(), req.WalletAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fund wallet", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
