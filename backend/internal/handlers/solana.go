package handlers

import (
	"net/http"
	"strconv"
	"time"

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

// GetSwapQuote gets a swap quote from Jupiter
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

	quote, err := h.jupiterService.GetSwapQuote(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to get swap quote", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to get swap quote",
		})
		return
	}

	utils.SendSuccess(c, quote)
}

// ExecuteSwap executes a token swap
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

	result, err := h.jupiterService.ExecuteSwap(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to execute swap", zap.Error(err))
		utils.SendError(c, &models.APIError{
			Code:    http.StatusInternalServerError,
			Message: "Failed to execute swap",
		})
		return
	}

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
