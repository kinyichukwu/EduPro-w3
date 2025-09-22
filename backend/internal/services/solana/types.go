package solana

import (
	"time"
)

// TransactionInfo contains information about a Solana transaction
type TransactionInfo struct {
	Signature string    `json:"signature"`
	BlockTime time.Time `json:"block_time"`
	Slot      uint64    `json:"slot"`
	Confirmed bool      `json:"confirmed"`
	Fee       uint64    `json:"fee"`
	Error     string    `json:"error,omitempty"`
}

// MintInfo contains information about a token mint
type MintInfo struct {
	Address       string `json:"address"`
	Decimals      uint8  `json:"decimals"`
	Supply        uint64 `json:"supply"`
	IsInitialized bool   `json:"is_initialized"`
}

// WalletInfo contains information about a wallet
type WalletInfo struct {
	Address      string `json:"address"`
	SOLBalance   uint64 `json:"sol_balance"`
	TokenBalance uint64 `json:"token_balance"`
}

// PaymentRequest represents a payment request
type PaymentRequest struct {
	Recipient string `json:"recipient" validate:"required"`
	Amount    uint64 `json:"amount" validate:"required,min=1"`
	TokenMint string `json:"token_mint,omitempty"`
	Reference string `json:"reference,omitempty"`
	Label     string `json:"label,omitempty"`
	Message   string `json:"message,omitempty"`
}

// PaymentResponse represents a payment response
type PaymentResponse struct {
	TransactionSignature string `json:"transaction_signature"`
	Status               string `json:"status"`
	Amount               uint64 `json:"amount"`
	Fee                  uint64 `json:"fee"`
}

// SwapRequest represents a Jupiter swap request
type SwapRequest struct {
	InputMint   string `json:"inputMint" validate:"required"`
	OutputMint  string `json:"outputMint" validate:"required"`
	Amount      uint64 `json:"amount" validate:"required,min=1"`
	SlippageBps int    `json:"slippageBps" validate:"min=0,max=10000"`
	UserWallet  string `json:"userWallet" validate:"required"`
}

// SwapResponse represents a Jupiter swap response
type SwapResponse struct {
	SwapTransaction      string `json:"swapTransaction"`
	LastValidBlockHeight uint64 `json:"lastValidBlockHeight"`
	PriorityFee          uint64 `json:"priorityFee"`
}

// SignSwapTransactionRequest represents a request to sign a swap transaction
type SignSwapTransactionRequest struct {
	SwapID      string `json:"swapId" validate:"required"`
	Transaction string `json:"transaction" validate:"required"`
	UserWallet  string `json:"userWallet" validate:"required"`
	Signature   string `json:"signature" validate:"required"`
}

// SubmitSwapTransactionRequest represents a request to submit a swap transaction
type SubmitSwapTransactionRequest struct {
	SwapID      string `json:"swapId" validate:"required"`
	Transaction string `json:"transaction" validate:"required"`
	Signature   string `json:"signature" validate:"required"`
	UserWallet  string `json:"userWallet" validate:"required"`
}

// SwapStatus represents the status of a swap
type SwapStatus struct {
	SwapID            string     `json:"swapId"`
	Status            string     `json:"status"` // pending, signed, submitted, completed, failed
	UserWallet        string     `json:"userWallet"`
	OrgWallet         string     `json:"orgWallet"`
	InputAmount       uint64     `json:"inputAmount"`
	OutputAmount      uint64     `json:"outputAmount"`
	FixedRate         float64    `json:"fixedRate"`
	SOLTransaction    string     `json:"solTransaction,omitempty"`
	EduProTransaction string     `json:"edupoTransaction,omitempty"`
	SOLSignature      string     `json:"solSignature,omitempty"`
	EduProSignature   string     `json:"edupoSignature,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	ExpiresAt         int64      `json:"expiresAt"`
	CompletedAt       *time.Time `json:"completedAt,omitempty"`
}

// StakingPosition represents a staking position
type StakingPosition struct {
	UserID              string    `json:"user_id"`
	WalletAddress       string    `json:"wallet_address"`
	StakedAmount        uint64    `json:"staked_amount"`
	StakeAccountAddress string    `json:"stake_account_address"`
	Status              string    `json:"status"`
	StakedAt            time.Time `json:"staked_at"`
	RewardsEarned       uint64    `json:"rewards_earned"`
}

// RewardDistribution represents a reward distribution
type RewardDistribution struct {
	UserID               string    `json:"user_id"`
	RewardType           string    `json:"reward_type"`
	Amount               uint64    `json:"amount"`
	TransactionSignature string    `json:"transaction_signature,omitempty"`
	Status               string    `json:"status"`
	EarnedAt             time.Time `json:"earned_at"`
}

// CoursePayment represents a course payment
type CoursePayment struct {
	UserID               string    `json:"user_id"`
	CourseID             string    `json:"course_id"`
	TransactionSignature string    `json:"transaction_signature"`
	AmountPaidLamports   uint64    `json:"amount_paid_lamports"`
	AmountPaidEduToken   uint64    `json:"amount_paid_edutoken"`
	PaymentMethod        string    `json:"payment_method"`
	Status               string    `json:"status"`
	PurchasedAt          time.Time `json:"purchased_at"`
}

// TokenTransferRequest represents a token transfer request
type TokenTransferRequest struct {
	From      string `json:"from" validate:"required"`
	To        string `json:"to" validate:"required"`
	Amount    uint64 `json:"amount" validate:"required,min=1"`
	TokenMint string `json:"token_mint,omitempty"`
}

// TokenTransferResponse represents a token transfer response
type TokenTransferResponse struct {
	TransactionSignature string `json:"transaction_signature"`
	Status               string `json:"status"`
	Amount               uint64 `json:"amount"`
	Fee                  uint64 `json:"fee"`
}

// BlockchainStats represents blockchain statistics
type BlockchainStats struct {
	CurrentSlot       uint64    `json:"current_slot"`
	EpochInfo         EpochInfo `json:"epoch_info"`
	TotalSupply       uint64    `json:"total_supply"`
	CirculatingSupply uint64    `json:"circulating_supply"`
}

// EpochInfo represents epoch information
type EpochInfo struct {
	Epoch            uint64 `json:"epoch"`
	SlotIndex        uint64 `json:"slot_index"`
	SlotsInEpoch     uint64 `json:"slots_in_epoch"`
	AbsoluteSlot     uint64 `json:"absolute_slot"`
	BlockHeight      uint64 `json:"block_height"`
	TransactionCount uint64 `json:"transaction_count"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Error implements the error interface
func (v ValidationError) Error() string {
	return v.Message
}

// SolanaError represents a Solana-specific error
type SolanaError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Error implements the error interface
func (e SolanaError) Error() string {
	return e.Message
}

// Constants for transaction statuses
const (
	TransactionStatusPending   = "pending"
	TransactionStatusConfirmed = "confirmed"
	TransactionStatusFailed    = "failed"
	TransactionStatusRefunded  = "refunded"
)

// Constants for payment methods
const (
	PaymentMethodSOL      = "SOL"
	PaymentMethodEduToken = "EDUTOKEN"
	PaymentMethodMixed    = "MIXED"
)

// Constants for staking statuses
const (
	StakingStatusActive    = "active"
	StakingStatusUnstaking = "unstaking"
	StakingStatusWithdrawn = "withdrawn"
)

// Constants for reward types
const (
	RewardTypeCourseCompletion = "course_completion"
	RewardTypeQuizScore        = "quiz_score"
	RewardTypeDailyLogin       = "daily_login"
	RewardTypeReferral         = "referral"
	RewardTypeStaking          = "staking"
)

// Constants for reward statuses
const (
	RewardStatusPending     = "pending"
	RewardStatusDistributed = "distributed"
	RewardStatusFailed      = "failed"
)
