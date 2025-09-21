package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID                   uuid.UUID `json:"id" db:"id"`
	Email                string    `json:"email" db:"email"`
	Username             string    `json:"username" db:"username"`
	FullName             *string   `json:"full_name,omitempty" db:"full_name"`
	Avatar               *string   `json:"avatar,omitempty" db:"avatar"`
	MembershipNFTAddress *string   `json:"membership_nft_address,omitempty" db:"membership_nft_address"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
	// Supabase user ID for linking
	SupabaseID string `json:"supabase_id" db:"supabase_id"`
}

// UserProfile represents the user profile response
type UserProfile struct {
	ID                   uuid.UUID       `json:"id"`
	Email                string          `json:"email"`
	Username             string          `json:"username"`
	FullName             *string         `json:"full_name,omitempty"`
	Avatar               *string         `json:"avatar,omitempty"`
	MembershipNFTAddress *string         `json:"membership_nft_address,omitempty"`
	OnboardingData       *OnboardingData `json:"onboarding_data,omitempty"`
	CreatedAt            time.Time       `json:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at"`
}

// CreateUserRequest represents the request to create a new user
type CreateUserRequest struct {
	Email      string  `json:"email" validate:"required,email"`
	Username   string  `json:"username" validate:"required,min=3,max=50"`
	FullName   *string `json:"full_name,omitempty"`
	SupabaseID string  `json:"supabase_id" validate:"required"`
}

// UpdateUserRequest represents the request to update user profile
type UpdateUserRequest struct {
	Username *string `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	FullName *string `json:"full_name,omitempty"`
	Avatar   *string `json:"avatar,omitempty"`
}

// UserWallet represents a user's Solana wallet (unified structure)
type UserWallet struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	UserID        uuid.UUID  `json:"user_id" db:"user_id"`
	WalletAddress string     `json:"wallet_address" db:"wallet_address"`
	IsPrimary     bool       `json:"is_primary" db:"is_primary"`
	IsVerified    bool       `json:"is_verified" db:"is_verified"`
	VerifiedAt    *time.Time `json:"verified_at,omitempty" db:"verified_at"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

// PaymentTransaction represents a unified Solana payment transaction
type PaymentTransaction struct {
	ID                   uuid.UUID `json:"id" db:"id"`
	UserID               uuid.UUID `json:"user_id" db:"user_id"`
	WalletAddress        string    `json:"wallet_address" db:"wallet_address"`
	TransactionSignature string    `json:"transaction_signature" db:"transaction_signature"`

	// Payment amounts
	AmountLamports *int64  `json:"amount_lamports,omitempty" db:"amount_lamports"`
	AmountTokens   *int64  `json:"amount_tokens,omitempty" db:"amount_tokens"`
	TokenSymbol    string  `json:"token_symbol" db:"token_symbol"`
	TokenMint      *string `json:"token_mint,omitempty" db:"token_mint"`

	// Transaction metadata
	PaymentMethod string `json:"payment_method" db:"payment_method"`
	Status        string `json:"status" db:"status"` // pending, confirmed, failed, refunded
	BlockHeight   *int64 `json:"block_height,omitempty" db:"block_height"`

	// Reference data
	PriceID  *string    `json:"price_id,omitempty" db:"price_id"`
	CourseID *uuid.UUID `json:"course_id,omitempty" db:"course_id"`
	Metadata *string    `json:"metadata,omitempty" db:"metadata"` // JSON string

	// Timestamps
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	ConfirmedAt *time.Time `json:"confirmed_at,omitempty" db:"confirmed_at"`
}

// PurchasableCourse represents a purchasable course (legacy/payment related)
type PurchasableCourse struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	Title         string     `json:"title" db:"title"`
	Description   *string    `json:"description,omitempty" db:"description"`
	PriceLamports int64      `json:"price_lamports" db:"price_lamports"`
	PriceEdutoken *int64     `json:"price_edutoken,omitempty" db:"price_edutoken"`
	PriceUsdCents *int       `json:"price_usd_cents,omitempty" db:"price_usd_cents"`
	InstructorID  *uuid.UUID `json:"instructor_id,omitempty" db:"instructor_id"`
	IsActive      bool       `json:"is_active" db:"is_active"`
	Metadata      *string    `json:"metadata,omitempty" db:"metadata"` // JSON string
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

// UserReward represents rewards earned by users
type UserReward struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	UserID               uuid.UUID  `json:"user_id" db:"user_id"`
	RewardType           string     `json:"reward_type" db:"reward_type"`
	RewardAmountEdutoken int64      `json:"reward_amount_edutoken" db:"reward_amount_edutoken"`
	Description          *string    `json:"description,omitempty" db:"description"`
	TransactionSignature *string    `json:"transaction_signature,omitempty" db:"transaction_signature"`
	Status               string     `json:"status" db:"status"` // pending, distributed, failed
	EarnedAt             time.Time  `json:"earned_at" db:"earned_at"`
	DistributedAt        *time.Time `json:"distributed_at,omitempty" db:"distributed_at"`
	Metadata             *string    `json:"metadata,omitempty" db:"metadata"` // JSON string
}

// StakingPosition represents a user's staking position
type StakingPosition struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	UserID                uuid.UUID  `json:"user_id" db:"user_id"`
	WalletAddress         string     `json:"wallet_address" db:"wallet_address"`
	StakedAmountEdutoken  int64      `json:"staked_amount_edutoken" db:"staked_amount_edutoken"`
	StakeAccountAddress   *string    `json:"stake_account_address,omitempty" db:"stake_account_address"`
	StakingProgramID      string     `json:"staking_program_id" db:"staking_program_id"`
	Status                string     `json:"status" db:"status"` // active, unstaking, withdrawn
	StakedAt              time.Time  `json:"staked_at" db:"staked_at"`
	UnstakedAt            *time.Time `json:"unstaked_at,omitempty" db:"unstaked_at"`
	RewardsEarned         int64      `json:"rewards_earned" db:"rewards_earned"`
	LastRewardCalculation time.Time  `json:"last_reward_calculation" db:"last_reward_calculation"`
}

// SwapTransaction represents a token swap transaction
type SwapTransaction struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	UserID               uuid.UUID  `json:"user_id" db:"user_id"`
	TransactionSignature string     `json:"transaction_signature" db:"transaction_signature"`
	InputMint            string     `json:"input_mint" db:"input_mint"`
	OutputMint           string     `json:"output_mint" db:"output_mint"`
	InputAmount          int64      `json:"input_amount" db:"input_amount"`
	OutputAmount         int64      `json:"output_amount" db:"output_amount"`
	SlippageBps          int        `json:"slippage_bps" db:"slippage_bps"`
	PlatformFeeBps       int        `json:"platform_fee_bps" db:"platform_fee_bps"`
	Status               string     `json:"status" db:"status"` // pending, confirmed, failed
	SwappedAt            time.Time  `json:"swapped_at" db:"swapped_at"`
	ConfirmedAt          *time.Time `json:"confirmed_at,omitempty" db:"confirmed_at"`
}

// TokenInfo represents supported Solana tokens
type TokenInfo struct {
	Symbol   string `json:"symbol"`
	Name     string `json:"name"`
	Mint     string `json:"mint"`
	Decimals int    `json:"decimals"`
}

// ConnectWalletRequest represents wallet connection request
type ConnectWalletRequest struct {
	Address   string `json:"address" validate:"required"`
	IsPrimary *bool  `json:"is_primary,omitempty"`
}

// ConnectWalletResponse represents wallet connection response
type ConnectWalletResponse struct {
	Wallet        *UserWallet `json:"wallet"`
	Message       string      `json:"message"`
	VerifyMessage string      `json:"verify_message"`
}

// VerifyWalletRequest represents wallet verification request
type VerifyWalletRequest struct {
	WalletID  string `json:"wallet_id" validate:"required"`
	Message   string `json:"message" validate:"required"`
	Signature string `json:"signature" validate:"required"`
}

// VerifyWalletResponse represents wallet verification response
type VerifyWalletResponse struct {
	Wallet  *UserWallet `json:"wallet"`
	Message string      `json:"message"`
}

// GeneratePaymentRequest represents payment generation request
type GeneratePaymentRequest struct {
	PriceID    string     `json:"price_id" validate:"required"`
	CourseID   *uuid.UUID `json:"course_id,omitempty"`
	Token      string     `json:"token" validate:"required,oneof=SOL USDC PYUSD EDUTOKEN"`
	UserWallet string     `json:"user_wallet" validate:"required"`
}

// GeneratePaymentResponse represents payment generation response
type GeneratePaymentResponse struct {
	Transaction    string  `json:"transaction"`
	AmountLamports *int64  `json:"amount_lamports,omitempty"`
	AmountTokens   *int64  `json:"amount_tokens,omitempty"`
	TokenSymbol    string  `json:"token_symbol"`
	TokenMint      *string `json:"token_mint,omitempty"`
	ExpiresAt      int64   `json:"expires_at"`
	Instructions   string  `json:"instructions"`
}

// SubmitPaymentRequest represents payment submission request
type SubmitPaymentRequest struct {
	SignedTransaction string     `json:"signed_transaction" validate:"required"`
	PriceID           string     `json:"price_id" validate:"required"`
	CourseID          *uuid.UUID `json:"course_id,omitempty"`
}

// SubmitPaymentResponse represents payment submission response
type SubmitPaymentResponse struct {
	PaymentID            uuid.UUID `json:"payment_id"`
	TransactionSignature string    `json:"transaction_signature"`
	Status               string    `json:"status"`
	AmountLamports       *int64    `json:"amount_lamports,omitempty"`
	AmountTokens         *int64    `json:"amount_tokens,omitempty"`
	TokenSymbol          string    `json:"token_symbol"`
	ProcessedAt          string    `json:"processed_at"`
	Message              string    `json:"message"`
}

// DeductWalletRequest represents wallet deduction request
type DeductWalletRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required"`
	Amount        uint64 `json:"amount" validate:"required,min=1"`
	TokenMint     string `json:"token_mint" validate:"required"`
}

// DeductWalletResponse represents wallet deduction response
type DeductWalletResponse struct {
	DeductionID uuid.UUID `json:"deduction_id"`
	Transaction string    `json:"transaction"`
	Amount      uint64    `json:"amount"`
	TokenMint   string    `json:"token_mint"`
	Status      string    `json:"status"`
	Message     string    `json:"message"`
}

// SendTokensRequest represents token sending request
type SendTokensRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required"`
	Amount        uint64 `json:"amount" validate:"required,min=1"`
}

// SendTokensResponse represents token sending response
type SendTokensResponse struct {
	TransferID  uuid.UUID `json:"transfer_id"`
	Transaction string    `json:"transaction"`
	Amount      uint64    `json:"amount"`
	TokenMint   string    `json:"token_mint"`
	Status      string    `json:"status"`
	Message     string    `json:"message"`
}

// QueryTokensRequest represents on-chain token query request
type QueryTokensRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required"`
}

// OnChainTokenData represents on-chain token data
type OnChainTokenData struct {
	WalletAddress      string             `json:"wallet_address"`
	TokenMint          string             `json:"token_mint"`
	Balance            uint64             `json:"balance"`
	Decimals           int                `json:"decimals"`
	LastUpdated        time.Time          `json:"last_updated"`
	RecentTransactions []TokenTransaction `json:"recent_transactions"`
}

// TokenTransaction represents a token transaction
type TokenTransaction struct {
	Signature string    `json:"signature"`
	Type      string    `json:"type"`
	Amount    uint64    `json:"amount"`
	Timestamp time.Time `json:"timestamp"`
}

// WalletDeduction represents a wallet deduction record
type WalletDeduction struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	WalletAddress string    `json:"wallet_address"`
	Amount        uint64    `json:"amount"`
	TokenMint     string    `json:"token_mint"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// TokenTransfer represents a token transfer record
type TokenTransfer struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	WalletAddress string    `json:"wallet_address"`
	Amount        uint64    `json:"amount"`
	TokenMint     string    `json:"token_mint"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// CoursePaymentRequest represents a course purchase request
type CoursePaymentRequest struct {
	CourseID      uuid.UUID `json:"course_id" validate:"required"`
	PaymentMethod string    `json:"payment_method" validate:"required,oneof=SOL USDC PYUSD EDUTOKEN"`
	UserWallet    string    `json:"user_wallet" validate:"required"`
}

// RewardDistributionRequest represents a reward distribution request
type RewardDistributionRequest struct {
	UserWallet string  `json:"user_wallet" validate:"required"`
	Amount     int64   `json:"amount" validate:"required,min=1"`
	RewardType string  `json:"reward_type" validate:"required"`
	Metadata   *string `json:"metadata,omitempty"`
}

// GenerateWalletResponse represents the response for wallet generation
type GenerateWalletResponse struct {
	Wallet        *UserWallet `json:"wallet"`
	PrivateKey    string      `json:"private_key"`    // Base58 encoded private key
	PublicKey     string      `json:"public_key"`     // Base58 encoded public key
	WalletAddress string      `json:"wallet_address"` // Same as public key
	VerifyMessage string      `json:"verify_message"` // Message to sign for verification
	Message       string      `json:"message"`        // Success message
}

// FundWalletRequest represents the request to fund a wallet
type FundWalletRequest struct {
	WalletAddress string `json:"wallet_address" validate:"required"`
}

// FundWalletResponse represents the response for wallet funding
type FundWalletResponse struct {
	WalletAddress string `json:"wallet_address"`
	Signature     string `json:"signature"` // Transaction signature from faucet
	Message       string `json:"message"`   // Response message from faucet
	Amount        string `json:"amount"`    // Amount funded (e.g., "1 SOL")
	Network       string `json:"network"`   // Network used (e.g., "devnet")
}
