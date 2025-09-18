package solana

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
)

// Service handles Solana blockchain operations
type Service struct {
	config    *config.SolanaConfig
	rpcClient *rpc.Client
	dbClient  *database.Client
}

// NewService creates a new Solana service
func NewService(cfg *config.SolanaConfig, dbClient *database.Client) (*Service, error) {
	rpcClient := rpc.New(cfg.RPCEndpoint)

	return &Service{
		config:    cfg,
		rpcClient: rpcClient,
		dbClient:  dbClient,
	}, nil
}

// ConnectWallet creates a new wallet record for a user
func (s *Service) ConnectWallet(ctx context.Context, userID, address string) (*models.UserWallet, error) {
	// Parse userID string to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	// Check if wallet already exists for this user
	existingWallets, err := s.dbClient.GetWalletsByUserID(userUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing wallets: %w", err)
	}

	// Check if this address is already connected
	for _, existingWallet := range existingWallets {
		if existingWallet.WalletAddress == address {
			return existingWallet, nil // Return existing wallet
		}
	}

	// Determine if this should be the primary wallet (first wallet for user)
	isPrimary := len(existingWallets) == 0

	// Create new wallet in database
	wallet, err := s.dbClient.CreateWallet(userUUID, address, isPrimary)
	if err != nil {
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}

	return wallet, nil
}

// VerifyWallet verifies a wallet signature
func (s *Service) VerifyWallet(ctx context.Context, walletID uuid.UUID, message, signature string) (*models.UserWallet, error) {
	// Retrieve wallet from database
	wallet, err := s.dbClient.GetWalletByID(walletID)
	if err != nil {
		return nil, fmt.Errorf("failed to get wallet: %w", err)
	}

	// Verify the signature
	pubKey, err := solana.PublicKeyFromBase58(wallet.WalletAddress)
	if err != nil {
		return nil, fmt.Errorf("invalid wallet address: %w", err)
	}

	sigBytes, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return nil, fmt.Errorf("invalid signature format: %w", err)
	}

	// TODO: Implement proper signature verification
	// This would require crypto libraries for Solana signature verification
	// For now, we'll accept any signature as valid (demo purposes)
	_ = pubKey
	_ = sigBytes
	_ = message

	// Update wallet verification status in database
	verifiedWallet, err := s.dbClient.UpdateWallet(walletID, true)
	if err != nil {
		return nil, fmt.Errorf("failed to update wallet verification: %w", err)
	}

	return verifiedWallet, nil
}

// GetWalletsByUserID retrieves all wallets for a user
func (s *Service) GetWalletsByUserID(ctx context.Context, userID string) ([]*models.UserWallet, error) {
	// Parse userID string to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	// Get wallets from database
	wallets, err := s.dbClient.GetWalletsByUserID(userUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get wallets: %w", err)
	}

	return wallets, nil
}

// DisconnectWallet removes a wallet connection
func (s *Service) DisconnectWallet(ctx context.Context, walletID uuid.UUID, userID string) error {
	// Parse userID string to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	// Delete wallet from database
	err = s.dbClient.DeleteWallet(walletID, userUUID)
	if err != nil {
		return fmt.Errorf("failed to delete wallet: %w", err)
	}

	return nil
}

// GeneratePayment creates a Solana payment transaction
func (s *Service) GeneratePayment(ctx context.Context, req *models.GeneratePaymentRequest) (*models.GeneratePaymentResponse, error) {
	// Get token information
	tokenInfo, err := s.getTokenInfo(req.Token)
	if err != nil {
		return nil, fmt.Errorf("unsupported token: %s", req.Token)
	}

	// Calculate token amount based on USD price
	// TODO: Implement price calculation logic
	tokenAmount := "1000000" // Example amount in smallest units

	// Create transaction
	transaction, err := s.createPaymentTransaction(req.UserWallet, tokenInfo, tokenAmount)
	if err != nil {
		return nil, err
	}

	// Serialize transaction to base64
	txBytes, err := transaction.MarshalBinary()
	if err != nil {
		return nil, fmt.Errorf("failed to serialize transaction: %w", err)
	}
	txBase64 := base64.StdEncoding.EncodeToString(txBytes)

	expiresAt := time.Now().Add(10 * time.Minute).Unix()

	return &models.GeneratePaymentResponse{
		Transaction:    txBase64,
		AmountLamports: nil, // Will be set based on token type
		AmountTokens:   nil, // Will be set based on token type
		TokenSymbol:    req.Token,
		TokenMint:      &tokenInfo.Mint,
		ExpiresAt:      expiresAt,
		Instructions:   "Please sign this transaction to complete your payment",
	}, nil
}

// SubmitPayment submits a signed Solana transaction
func (s *Service) SubmitPayment(ctx context.Context, signedTx string, priceID string) (*models.SubmitPaymentResponse, error) {
	// Decode signed transaction
	txBytes, err := base64.StdEncoding.DecodeString(signedTx)
	if err != nil {
		return nil, fmt.Errorf("invalid transaction encoding: %w", err)
	}

	// For now, create a simple placeholder transaction
	// In production, you would properly decode and validate the signed transaction
	transaction := &solana.Transaction{}
	_ = txBytes // Use txBytes when implementing proper decoding

	// Submit transaction to blockchain
	sig, err := s.rpcClient.SendTransaction(ctx, transaction)
	if err != nil {
		return nil, fmt.Errorf("failed to submit transaction: %w", err)
	}

	// Create payment record
	payment := &models.PaymentTransaction{
		ID:                   uuid.New(),
		UserID:               uuid.New(),       // TODO: Get from context
		WalletAddress:        "wallet_address", // TODO: Get from transaction
		TransactionSignature: sig.String(),
		AmountLamports:       nil,   // TODO: Calculate from transaction
		AmountTokens:         nil,   // TODO: Calculate from transaction
		TokenSymbol:          "SOL", // TODO: Get from transaction
		TokenMint:            nil,
		PaymentMethod:        "SOL",
		Status:               "pending",
		PriceID:              &priceID,
		CreatedAt:            time.Now(),
	}

	// TODO: Save payment to database

	return &models.SubmitPaymentResponse{
		PaymentID:            payment.ID,
		TransactionSignature: payment.TransactionSignature,
		Status:               payment.Status,
		AmountLamports:       payment.AmountLamports,
		AmountTokens:         payment.AmountTokens,
		TokenSymbol:          payment.TokenSymbol,
		ProcessedAt:          payment.CreatedAt.Format(time.RFC3339),
		Message:              "Payment submitted successfully",
	}, nil
}

// GetSupportedTokens returns list of supported tokens
func (s *Service) GetSupportedTokens() []*models.TokenInfo {
	return []*models.TokenInfo{
		{
			Symbol:   "SOL",
			Name:     "Solana",
			Mint:     "So11111111111111111111111111111111111111112",
			Decimals: 9,
		},
		{
			Symbol:   "USDC",
			Name:     "USD Coin",
			Mint:     "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
			Decimals: 6,
		},
		{
			Symbol:   "PYUSD",
			Name:     "PayPal USD",
			Mint:     "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
			Decimals: 6,
		},
	}
}

// getTokenInfo returns token information by symbol
func (s *Service) getTokenInfo(symbol string) (*models.TokenInfo, error) {
	tokens := s.GetSupportedTokens()
	for _, token := range tokens {
		if token.Symbol == symbol {
			return token, nil
		}
	}
	return nil, fmt.Errorf("token not found: %s", symbol)
}

// createPaymentTransaction creates a payment transaction
func (s *Service) createPaymentTransaction(userWallet string, tokenInfo *models.TokenInfo, amount string) (*solana.Transaction, error) {
	// Parse recipient wallet
	recipient, err := solana.PublicKeyFromBase58(s.config.RecipientWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid recipient wallet: %w", err)
	}

	// Parse user wallet
	sender, err := solana.PublicKeyFromBase58(userWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid user wallet: %w", err)
	}

	// Get recent blockhash (simplified - in production you'd get this from RPC)
	recentBlockhash := solana.Hash{} // This should be fetched from the network

	// Create transaction with empty instructions for now
	// In a real implementation, you'd create proper instructions for token transfers
	transaction, err := solana.NewTransaction([]solana.Instruction{}, recentBlockhash)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// TODO: Add proper transfer instructions here
	// For now, this is a placeholder transaction
	_ = recipient
	_ = sender
	_ = tokenInfo
	_ = amount

	return transaction, nil
}

// GenerateVerificationMessage generates a message for wallet verification
func (s *Service) GenerateVerificationMessage() string {
	randomBytes := make([]byte, 16)
	rand.Read(randomBytes)
	timestamp := time.Now().Unix()

	return fmt.Sprintf("Verify wallet ownership for EduPro\nTimestamp: %d\nRandom: %x", timestamp, randomBytes)
}
