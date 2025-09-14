package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	Email     string     `json:"email" db:"email"`
	Username  string     `json:"username" db:"username"`
	FullName  *string    `json:"full_name,omitempty" db:"full_name"`
	Avatar    *string    `json:"avatar,omitempty" db:"avatar"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
	// Supabase user ID for linking
	SupabaseID string `json:"supabase_id" db:"supabase_id"`
}

// UserProfile represents the user profile response
type UserProfile struct {
	ID             uuid.UUID       `json:"id"`
	Email          string          `json:"email"`
	Username       string          `json:"username"`
	FullName       *string         `json:"full_name,omitempty"`
	Avatar         *string         `json:"avatar,omitempty"`
	OnboardingData *OnboardingData `json:"onboarding_data,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
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

// Wallet represents a user's Solana wallet
type Wallet struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	UserID     string     `json:"user_id" db:"user_id"`
	Address    string     `json:"address" db:"address"`
	IsVerified bool       `json:"is_verified" db:"is_verified"`
	VerifiedAt *time.Time `json:"verified_at,omitempty" db:"verified_at"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

// PaymentTransaction represents a Solana payment transaction
type PaymentTransaction struct {
	ID             uuid.UUID `json:"id" db:"id"`
	UserID         string    `json:"user_id" db:"user_id"`
	WalletAddress  string    `json:"wallet_address" db:"wallet_address"`
	Amount         float64   `json:"amount" db:"amount"`
	TokenSymbol    string    `json:"token_symbol" db:"token_symbol"`
	TransactionID  string    `json:"transaction_id" db:"transaction_id"`
	Status         string    `json:"status" db:"status"` // pending, confirmed, failed
	BlockHeight    *int64    `json:"block_height,omitempty" db:"block_height"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	ConfirmedAt    *time.Time `json:"confirmed_at,omitempty" db:"confirmed_at"`
}

// TokenInfo represents supported Solana tokens
type TokenInfo struct {
	Symbol     string `json:"symbol"`
	Name       string `json:"name"`
	Mint       string `json:"mint"`
	Decimals   int    `json:"decimals"`
}

// ConnectWalletRequest represents wallet connection request
type ConnectWalletRequest struct {
	Address string `json:"address" validate:"required"`
}

// ConnectWalletResponse represents wallet connection response
type ConnectWalletResponse struct {
	Wallet      *Wallet `json:"wallet"`
	Message     string  `json:"message"`
	VerifyMessage string `json:"verify_message"`
}

// VerifyWalletRequest represents wallet verification request
type VerifyWalletRequest struct {
	WalletID  string `json:"wallet_id" validate:"required"`
	Message   string `json:"message" validate:"required"`
	Signature string `json:"signature" validate:"required"`
}

// VerifyWalletResponse represents wallet verification response
type VerifyWalletResponse struct {
	Wallet  *Wallet `json:"wallet"`
	Message string  `json:"message"`
}

// GeneratePaymentRequest represents payment generation request
type GeneratePaymentRequest struct {
	PriceID   string `json:"price_id" validate:"required"`
	Token     string `json:"token" validate:"required,oneof=SOL USDC PYUSD"`
	UserWallet string `json:"user_wallet" validate:"required"`
}

// GeneratePaymentResponse represents payment generation response
type GeneratePaymentResponse struct {
	Transaction string `json:"transaction"`
	Amount      float64 `json:"amount"`
	TokenAmount string  `json:"token_amount"`
	TokenSymbol string  `json:"token_symbol"`
	ExpiresAt   int64   `json:"expires_at"`
	Instructions string `json:"instructions"`
}

// SubmitPaymentRequest represents payment submission request
type SubmitPaymentRequest struct {
	SignedTransaction string `json:"signed_transaction" validate:"required"`
	PriceID          string `json:"price_id" validate:"required"`
}

// SubmitPaymentResponse represents payment submission response
type SubmitPaymentResponse struct {
	PurchaseID    string `json:"purchase_id"`
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	Amount        float64 `json:"amount"`
	Currency      string `json:"currency"`
	ProcessedAt   string `json:"processed_at"`
	Message       string `json:"message"`
}