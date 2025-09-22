package handlers

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"strconv"
	"time"

	solanago "github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/system"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gin-gonic/gin"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// SolanaHandler handles Solana-related HTTP requests
type SolanaHandler struct {
	solanaClient   *solana.Client
	paymentService *solana.PaymentService
	rewardService  *solana.RewardService
	jupiterService *solana.JupiterSwapService
	config         *config.Config
	logger         *zap.Logger
}

// NewSolanaHandler creates a new Solana handler
func NewSolanaHandler(cfg *config.Config, logger *zap.Logger) (*SolanaHandler, error) {
	// Create Solana client
	solanaClient, err := solana.NewClient(cfg, logger)
	if err != nil {
		return nil, err
	}

	// Create services
	paymentService := solana.NewPaymentService(solanaClient, logger)
	rewardService := solana.NewRewardService(solanaClient, logger)
	jupiterService := solana.NewJupiterSwapService(solanaClient, logger, cfg.EduProJupiterAPIBase)

	return &SolanaHandler{
		solanaClient:   solanaClient,
		paymentService: paymentService,
		rewardService:  rewardService,
		jupiterService: jupiterService,
		config:         cfg,
		logger:         logger,
	}, nil
}

// GetWalletBalance gets the SOL balance for a wallet
func (h *SolanaHandler) GetWalletBalance(c *gin.Context) {
	walletAddress := c.Param("address")
	if walletAddress == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Wallet address is required",
		})
		return
	}

	balance, err := h.solanaClient.GetBalance(c.Request.Context(), walletAddress)
	if err != nil {
		h.logger.Error("Failed to get wallet balance", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get wallet balance",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"wallet_address":   walletAddress,
		"balance_lamports": balance,
		"balance_sol":      float64(balance) / 1e9,
	})
}

// GetTokenBalance gets the token balance for a wallet
func (h *SolanaHandler) GetTokenBalance(c *gin.Context) {
	walletAddress := c.Param("address")
	mintAddress := c.Query("mint")

	if walletAddress == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Wallet address is required",
		})
		return
	}

	if mintAddress == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Token mint address is required",
		})
		return
	}

	balance, err := h.solanaClient.GetTokenBalance(c.Request.Context(), walletAddress, mintAddress)
	if err != nil {
		h.logger.Error("Failed to get token balance", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get token balance",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"wallet_address": walletAddress,
		"mint_address":   mintAddress,
		"balance":        balance,
	})
}

// GetEduTokenBalance gets the EduToken balance for a wallet
func (h *SolanaHandler) GetEduTokenBalance(c *gin.Context) {
	walletAddress := c.Param("address")
	if walletAddress == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Wallet address is required",
		})
		return
	}

	balance, err := h.solanaClient.GetEduTokenBalance(c.Request.Context(), walletAddress)
	if err != nil {
		h.logger.Error("Failed to get EduToken balance", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get EduToken balance",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"wallet_address":   walletAddress,
		"edutoken_balance": balance,
	})
}

// VerifyTransaction verifies a Solana transaction
func (h *SolanaHandler) VerifyTransaction(c *gin.Context) {
	signature := c.Param("signature")
	if signature == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Transaction signature is required",
		})
		return
	}

	txInfo, err := h.solanaClient.VerifyTransaction(c.Request.Context(), signature)
	if err != nil {
		h.logger.Error("Failed to verify transaction", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to verify transaction",
		})
		return
	}

	utils.SendSuccess(c, txInfo)
}

// CreatePaymentURL creates a Solana Pay URL
func (h *SolanaHandler) CreatePaymentURL(c *gin.Context) {
	var req solana.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	paymentURL, err := h.paymentService.CreateSolanaPayURL(&req)
	if err != nil {
		h.logger.Error("Failed to create payment URL", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create payment URL",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"payment_url": paymentURL,
	})
}

// ProcessCoursePayment processes a course purchase payment
func (h *SolanaHandler) ProcessCoursePayment(c *gin.Context) {
	var req struct {
		UserID    string `json:"user_id" validate:"required"`
		CourseID  string `json:"course_id" validate:"required"`
		Signature string `json:"signature" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	payment, err := h.paymentService.ProcessCoursePayment(c.Request.Context(), req.UserID, req.CourseID, req.Signature)
	if err != nil {
		h.logger.Error("Failed to process course payment", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to process payment",
		})
		return
	}

	utils.SendSuccess(c, payment)
}

// DistributeReward distributes rewards to a user
func (h *SolanaHandler) DistributeReward(c *gin.Context) {
	var req struct {
		UserWallet string `json:"user_wallet" validate:"required"`
		Amount     uint64 `json:"amount" validate:"required,min=1"`
		RewardType string `json:"reward_type" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	reward, err := h.rewardService.DistributeReward(c.Request.Context(), req.UserWallet, req.Amount, req.RewardType)
	if err != nil {
		h.logger.Error("Failed to distribute reward", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to distribute reward",
		})
		return
	}

	utils.SendSuccess(c, reward)
}

// CalculateReward calculates reward amount based on type and parameters
func (h *SolanaHandler) CalculateReward(c *gin.Context) {
	rewardType := c.Query("type")
	if rewardType == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Reward type is required",
		})
		return
	}

	var amount uint64

	switch rewardType {
	case solana.RewardTypeCourseCompletion:
		courseID := c.Query("course_id")
		userLevelStr := c.Query("user_level")
		userLevel, _ := strconv.Atoi(userLevelStr)
		amount = h.rewardService.CalculateCourseCompletionReward(courseID, userLevel)

	case solana.RewardTypeQuizScore:
		scoreStr := c.Query("score")
		maxScoreStr := c.Query("max_score")
		score, _ := strconv.Atoi(scoreStr)
		maxScore, _ := strconv.Atoi(maxScoreStr)
		amount = h.rewardService.CalculateQuizScoreReward(score, maxScore)

	case solana.RewardTypeDailyLogin:
		consecutiveDaysStr := c.Query("consecutive_days")
		consecutiveDays, _ := strconv.Atoi(consecutiveDaysStr)
		amount = h.rewardService.CalculateDailyLoginReward(consecutiveDays)

	case solana.RewardTypeReferral:
		tierStr := c.Query("tier")
		tier, _ := strconv.Atoi(tierStr)
		amount = h.rewardService.CalculateReferralReward(tier)

	case solana.RewardTypeStaking:
		stakedAmountStr := c.Query("staked_amount")
		durationStr := c.Query("duration_days")
		stakedAmount, _ := strconv.ParseUint(stakedAmountStr, 10, 64)
		duration, _ := strconv.Atoi(durationStr)
		amount = h.rewardService.CalculateStakingReward(stakedAmount, duration)

	default:
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid reward type",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"reward_type": rewardType,
		"amount":      amount,
	})
}

// GetSwapQuote gets a fixed-price swap quote for SOL to EduPro tokens
func (h *SolanaHandler) GetSwapQuote(c *gin.Context) {
	var req solana.SwapRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Check if this is a SOL to EduPro token swap
	solMint := "So11111111111111111111111111111111111111112"
	edupoMint := "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"

	// Fixed rate: 1 SOL = 1000 EduPro tokens
	fixedRate := 1000.0

	var inputAmount, outputAmount uint64
	var isSOLToEduPro bool

	if req.InputMint == solMint && req.OutputMint == edupoMint {
		// SOL to EduPro swap
		isSOLToEduPro = true
		inputAmount = req.Amount
		// Convert SOL amount (in lamports) to EduPro tokens
		solAmount := float64(req.Amount) / 1e9 // Convert lamports to SOL
		edupoAmount := solAmount * fixedRate
		outputAmount = uint64(edupoAmount * 1e9) // Convert to EduPro token units (9 decimals)
	} else if req.InputMint == edupoMint && req.OutputMint == solMint {
		// EduPro to SOL swap
		isSOLToEduPro = false
		inputAmount = req.Amount
		// Convert EduPro tokens to SOL amount
		edupoAmount := float64(req.Amount) / 1e9 // Convert EduPro token units to tokens
		solAmount := edupoAmount / fixedRate
		outputAmount = uint64(solAmount * 1e9) // Convert to lamports
	} else {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Only SOL to EduPro token swaps are supported",
		})
		return
	}

	// Add additional quote information
	quoteData := map[string]interface{}{
		"inputMint":     req.InputMint,
		"outputMint":    req.OutputMint,
		"inAmount":      fmt.Sprintf("%d", inputAmount),
		"outAmount":     fmt.Sprintf("%d", outputAmount),
		"fixedRate":     fixedRate,
		"swapType":      "fixed_price",
		"isSOLToEduPro": isSOLToEduPro,
		"userWallet":    req.UserWallet,
		"orgWallet":     h.config.SolanaConfig.RecipientWallet,
		"message":       "This is a fixed-price swap. SOL will be sent to organization wallet and EduPro tokens will be sent to your wallet.",
		"expiresAt":     time.Now().Add(15 * time.Minute).Unix(),
	}

	utils.SendSuccess(c, quoteData)
}

// ExecuteSwap executes a fixed-price token swap
func (h *SolanaHandler) ExecuteSwap(c *gin.Context) {
	var req solana.SwapRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Check if this is a SOL to EduPro token swap
	solMint := "So11111111111111111111111111111111111111112"
	edupoMint := "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"

	if req.InputMint != solMint || req.OutputMint != edupoMint {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Only SOL to EduPro token swaps are supported",
		})
		return
	}

	// Fixed rate: 1 SOL = 1000 EduPro tokens
	fixedRate := 1000.0

	// Calculate amounts
	solAmount := float64(req.Amount) / 1e9 // Convert lamports to SOL
	edupoAmount := solAmount * fixedRate
	edupoAmountLamports := uint64(edupoAmount * 1e9) // Convert to EduPro token units

	// Create swap execution response
	swapID := fmt.Sprintf("swap_%d", time.Now().Unix())

	// Create actual serialized transactions
	solTransaction, err := h.createSOLTransferTransaction(req.UserWallet, h.config.SolanaConfig.RecipientWallet, req.Amount)
	if err != nil {
		h.logger.Error("Failed to create SOL transaction", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create SOL transaction",
		})
		return
	}

	edupoTransaction, err := h.createEduProTokenTransferTransaction(h.config.SolanaConfig.RecipientWallet, req.UserWallet, edupoAmountLamports)
	if err != nil {
		h.logger.Error("Failed to create EduPro transaction", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create EduPro transaction",
		})
		return
	}

	result := map[string]interface{}{
		"swapId":           swapID,
		"status":           "pending",
		"inputMint":        req.InputMint,
		"outputMint":       req.OutputMint,
		"inAmount":         fmt.Sprintf("%d", req.Amount),
		"outAmount":        fmt.Sprintf("%d", edupoAmountLamports),
		"fixedRate":        fixedRate,
		"userWallet":       req.UserWallet,
		"orgWallet":        h.config.SolanaConfig.RecipientWallet,
		"solTransaction":   solTransaction,
		"edupoTransaction": edupoTransaction,
		"message":          "Sign and submit both transactions to complete the swap. SOL will be sent to organization wallet and EduPro tokens will be sent to your wallet.",
		"expiresAt":        time.Now().Add(15 * time.Minute).Unix(),
	}

	h.logger.Info("Fixed-price swap executed",
		zap.String("swap_id", swapID),
		zap.String("user_wallet", req.UserWallet),
		zap.Float64("sol_amount", solAmount),
		zap.Float64("edupo_amount", edupoAmount),
		zap.Float64("fixed_rate", fixedRate),
	)

	utils.SendSuccess(c, result)
}

// GetBlockchainStats gets general blockchain statistics
func (h *SolanaHandler) GetBlockchainStats(c *gin.Context) {
	ctx := c.Request.Context()

	// Get current slot
	slot, err := h.solanaClient.RpcClient.GetSlot(ctx, "finalized")
	if err != nil {
		h.logger.Error("Failed to get current slot", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get blockchain stats",
		})
		return
	}

	// Get epoch info
	epochInfo, err := h.solanaClient.RpcClient.GetEpochInfo(ctx, "finalized")
	if err != nil {
		h.logger.Error("Failed to get epoch info", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get blockchain stats",
		})
		return
	}

	var transactionCount uint64
	if epochInfo.TransactionCount != nil {
		transactionCount = *epochInfo.TransactionCount
	}

	stats := solana.BlockchainStats{
		CurrentSlot: slot,
		EpochInfo: solana.EpochInfo{
			Epoch:            epochInfo.Epoch,
			SlotIndex:        epochInfo.SlotIndex,
			SlotsInEpoch:     epochInfo.SlotsInEpoch,
			AbsoluteSlot:     epochInfo.AbsoluteSlot,
			BlockHeight:      epochInfo.BlockHeight,
			TransactionCount: transactionCount,
		},
	}

	utils.SendSuccess(c, stats)
}

// WaitForConfirmation waits for a transaction to be confirmed
func (h *SolanaHandler) WaitForConfirmation(c *gin.Context) {
	signature := c.Param("signature")
	if signature == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Transaction signature is required",
		})
		return
	}

	timeoutStr := c.Query("timeout")
	timeout := 30 * time.Second // Default timeout
	if timeoutStr != "" {
		if parsedTimeout, err := time.ParseDuration(timeoutStr); err == nil {
			timeout = parsedTimeout
		}
	}

	err := h.solanaClient.WaitForConfirmation(c.Request.Context(), signature, timeout)
	if err != nil {
		h.logger.Error("Failed to wait for confirmation", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to confirm transaction",
		})
		return
	}

	utils.SendSuccess(c, gin.H{
		"signature": signature,
		"confirmed": true,
	})
}

// createSOLTransferTransaction creates a real SOL transfer transaction
func (h *SolanaHandler) createSOLTransferTransaction(fromWallet, toWallet string, amount uint64) (string, error) {
	ctx := context.Background()

	// Parse wallet addresses
	fromPubkey, err := solanago.PublicKeyFromBase58(fromWallet)
	if err != nil {
		return "", fmt.Errorf("invalid from wallet address: %w", err)
	}

	toPubkey, err := solanago.PublicKeyFromBase58(toWallet)
	if err != nil {
		return "", fmt.Errorf("invalid to wallet address: %w", err)
	}

	// Get recent blockhash
	recentBlockhash, err := h.solanaClient.GetRecentBlockhash(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create transaction
	tx, err := solanago.NewTransaction(
		[]solanago.Instruction{
			system.NewTransferInstruction(
				amount,
				fromPubkey,
				toPubkey,
			).Build(),
		},
		recentBlockhash,
		solanago.TransactionPayer(fromPubkey),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %w", err)
	}

	// Serialize transaction
	txBytes, err := tx.MarshalBinary()
	if err != nil {
		return "", fmt.Errorf("failed to serialize transaction: %w", err)
	}

	// Return base64 encoded transaction
	return base64.StdEncoding.EncodeToString(txBytes), nil
}

// createEduProTokenTransferTransaction creates a real EduPro token transfer transaction
func (h *SolanaHandler) createEduProTokenTransferTransaction(fromWallet, toWallet string, amount uint64) (string, error) {
	ctx := context.Background()

	// Parse wallet addresses
	fromPubkey, err := solanago.PublicKeyFromBase58(fromWallet)
	if err != nil {
		return "", fmt.Errorf("invalid from wallet address: %w", err)
	}

	toPubkey, err := solanago.PublicKeyFromBase58(toWallet)
	if err != nil {
		return "", fmt.Errorf("invalid to wallet address: %w", err)
	}

	// Parse token mint
	tokenMint, err := solanago.PublicKeyFromBase58(h.config.SolanaConfig.EduProTokenMint)
	if err != nil {
		return "", fmt.Errorf("invalid token mint address: %w", err)
	}

	// Get recent blockhash
	recentBlockhash, err := h.solanaClient.GetRecentBlockhash(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Find associated token accounts
	fromTokenAccount, _, err := solanago.FindAssociatedTokenAddress(fromPubkey, tokenMint)
	if err != nil {
		return "", fmt.Errorf("failed to find from token account: %w", err)
	}

	toTokenAccount, _, err := solanago.FindAssociatedTokenAddress(toPubkey, tokenMint)
	if err != nil {
		return "", fmt.Errorf("failed to find to token account: %w", err)
	}

	// Create token transfer instruction
	transferInstruction := token.NewTransferInstruction(
		amount,
		fromTokenAccount,
		toTokenAccount,
		fromPubkey,
		[]solanago.PublicKey{},
	).Build()

	// Create transaction
	tx, err := solanago.NewTransaction(
		[]solanago.Instruction{transferInstruction},
		recentBlockhash,
		solanago.TransactionPayer(fromPubkey),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %w", err)
	}

	// Serialize transaction
	txBytes, err := tx.MarshalBinary()
	if err != nil {
		return "", fmt.Errorf("failed to serialize transaction: %w", err)
	}

	// Return base64 encoded transaction
	return base64.StdEncoding.EncodeToString(txBytes), nil
}

// SignSwapTransaction handles signing a swap transaction
func (h *SolanaHandler) SignSwapTransaction(c *gin.Context) {
	var req solana.SignSwapTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// In a real implementation, this would:
	// 1. Verify the transaction is valid
	// 2. Store the signature
	// 3. Update swap status

	h.logger.Info("Swap transaction signed",
		zap.String("swap_id", req.SwapID),
		zap.String("user_wallet", req.UserWallet),
	)

	utils.SendSuccess(c, gin.H{
		"swapId":    req.SwapID,
		"status":    "signed",
		"message":   "Transaction signed successfully",
		"signature": req.Signature,
	})
}

// SubmitSwapTransaction handles submitting a signed swap transaction
func (h *SolanaHandler) SubmitSwapTransaction(c *gin.Context) {
	var req solana.SubmitSwapTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid request body",
		})
		return
	}

	if err := utils.ValidateStruct(&req); err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	ctx := context.Background()

	// Decode the signed transaction
	txBytes, err := base64.StdEncoding.DecodeString(req.Transaction)
	if err != nil {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Invalid transaction data",
		})
		return
	}

	// Submit transaction to Solana network
	signature, err := h.solanaClient.SubmitTransaction(ctx, txBytes)
	if err != nil {
		h.logger.Error("Failed to submit transaction",
			zap.String("swap_id", req.SwapID),
			zap.Error(err),
		)
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to submit transaction to Solana network",
		})
		return
	}

	h.logger.Info("Swap transaction submitted to Solana",
		zap.String("swap_id", req.SwapID),
		zap.String("signature", signature.String()),
		zap.String("user_wallet", req.UserWallet),
	)

	utils.SendSuccess(c, gin.H{
		"swapId":    req.SwapID,
		"status":    "submitted",
		"signature": signature.String(),
		"confirmed": false,
	})
}

// GetSwapStatus gets the status of a swap
func (h *SolanaHandler) GetSwapStatus(c *gin.Context) {
	swapID := c.Param("swapId")
	if swapID == "" {
		utils.SendError(c, &models.APIError{
			Code:    http.StatusBadRequest,
			Message: "Swap ID is required",
		})
		return
	}

	// In a real implementation, this would:
	// 1. Look up swap in database
	// 2. Check blockchain status
	// 3. Return current status

	// Mock response for now
	status := solana.SwapStatus{
		SwapID:       swapID,
		Status:       "pending",
		UserWallet:   "test_wallet_address",
		OrgWallet:    h.config.SolanaConfig.RecipientWallet,
		InputAmount:  1000000,
		OutputAmount: 1000000000,
		FixedRate:    1000.0,
		CreatedAt:    time.Now(),
		ExpiresAt:    time.Now().Add(15 * time.Minute).Unix(),
	}

	utils.SendSuccess(c, status)
}
