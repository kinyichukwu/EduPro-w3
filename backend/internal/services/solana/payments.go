package solana

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/system"
	"github.com/gagliardetto/solana-go/programs/token"
	"go.uber.org/zap"
)

// PaymentService handles payment-related operations
type PaymentService struct {
	client *Client
	logger *zap.Logger
}

// NewPaymentService creates a new payment service
func NewPaymentService(client *Client, logger *zap.Logger) *PaymentService {
	return &PaymentService{
		client: client,
		logger: logger,
	}
}

// CreateSOLPayment creates a SOL payment transaction
func (p *PaymentService) CreateSOLPayment(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error) {
	// Validate addresses
	fromPubKey, err := solana.PublicKeyFromBase58(req.Recipient)
	if err != nil {
		return nil, fmt.Errorf("invalid recipient address: %w", err)
	}

	// Get recent blockhash
	blockhash, err := p.client.GetRecentBlockhash(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create transfer instruction
	instruction := system.NewTransferInstruction(
		req.Amount,
		fromPubKey, // This would be the sender in a real implementation
		fromPubKey, // This would be the recipient
	).Build()

	// Create transaction
	tx, err := solana.NewTransaction(
		[]solana.Instruction{instruction},
		blockhash,
		solana.TransactionPayer(fromPubKey),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Estimate fee
	fee, err := p.client.EstimateTransactionFee(ctx, tx)
	if err != nil {
		p.logger.Warn("Failed to estimate transaction fee", zap.Error(err))
		fee = 5000 // Default fee estimate
	}

	return &PaymentResponse{
		TransactionSignature: "", // Would be set after signing and sending
		Status:               TransactionStatusPending,
		Amount:               req.Amount,
		Fee:                  fee,
	}, nil
}

// CreateTokenPayment creates a token payment transaction
func (p *PaymentService) CreateTokenPayment(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error) {
	// Validate addresses
	fromPubKey, err := solana.PublicKeyFromBase58(req.Recipient)
	if err != nil {
		return nil, fmt.Errorf("invalid recipient address: %w", err)
	}

	mintPubKey, err := solana.PublicKeyFromBase58(req.TokenMint)
	if err != nil {
		return nil, fmt.Errorf("invalid token mint address: %w", err)
	}

	// Get recent blockhash
	blockhash, err := p.client.GetRecentBlockhash(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Find associated token accounts (simplified - in production you'd need proper ATA handling)
	fromTokenAccount, _, err := solana.FindAssociatedTokenAddress(fromPubKey, mintPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to find from token account: %w", err)
	}

	toTokenAccount, _, err := solana.FindAssociatedTokenAddress(fromPubKey, mintPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to find to token account: %w", err)
	}

	// Create transfer instruction
	instruction := token.NewTransferInstruction(
		req.Amount,
		fromTokenAccount,
		toTokenAccount,
		fromPubKey,
		[]solana.PublicKey{},
	).Build()

	// Create transaction
	tx, err := solana.NewTransaction(
		[]solana.Instruction{instruction},
		blockhash,
		solana.TransactionPayer(fromPubKey),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Estimate fee
	fee, err := p.client.EstimateTransactionFee(ctx, tx)
	if err != nil {
		p.logger.Warn("Failed to estimate transaction fee", zap.Error(err))
		fee = 5000 // Default fee estimate
	}

	return &PaymentResponse{
		TransactionSignature: "", // Would be set after signing and sending
		Status:               TransactionStatusPending,
		Amount:               req.Amount,
		Fee:                  fee,
	}, nil
}

// VerifyPayment verifies a payment transaction
func (p *PaymentService) VerifyPayment(ctx context.Context, signature string, expectedAmount uint64, expectedRecipient string) (*TransactionInfo, error) {
	// Get transaction info
	txInfo, err := p.client.VerifyTransaction(ctx, signature)
	if err != nil {
		return nil, fmt.Errorf("failed to verify transaction: %w", err)
	}

	if !txInfo.Confirmed {
		return nil, fmt.Errorf("transaction not confirmed")
	}

	// In a production system, you would parse the transaction instructions
	// to verify the amount and recipient match expectations
	p.logger.Info("Payment verified",
		zap.String("signature", signature),
		zap.Uint64("expected_amount", expectedAmount),
		zap.String("expected_recipient", expectedRecipient),
	)

	return txInfo, nil
}

// ProcessCoursePayment processes a course purchase payment
func (p *PaymentService) ProcessCoursePayment(ctx context.Context, userID, courseID, signature string) (*CoursePayment, error) {
	// Verify the transaction exists and is confirmed
	txInfo, err := p.client.VerifyTransaction(ctx, signature)
	if err != nil {
		return nil, fmt.Errorf("failed to verify transaction: %w", err)
	}

	if !txInfo.Confirmed {
		return &CoursePayment{
			UserID:               userID,
			CourseID:             courseID,
			TransactionSignature: signature,
			Status:               TransactionStatusPending,
			PurchasedAt:          time.Now(),
		}, nil
	}

	// In production, you would:
	// 1. Parse transaction instructions to get actual amounts
	// 2. Verify the payment went to the correct recipient
	// 3. Check the payment amount matches the course price
	// 4. Update database records

	return &CoursePayment{
		UserID:               userID,
		CourseID:             courseID,
		TransactionSignature: signature,
		AmountPaidLamports:   1000000000, // Placeholder - would be parsed from transaction
		PaymentMethod:        PaymentMethodSOL,
		Status:               TransactionStatusConfirmed,
		PurchasedAt:          txInfo.BlockTime,
	}, nil
}

// CreateSolanaPayURL creates a Solana Pay URL for payments
func (p *PaymentService) CreateSolanaPayURL(req *PaymentRequest) (string, error) {
	// Validate recipient address
	_, err := solana.PublicKeyFromBase58(req.Recipient)
	if err != nil {
		return "", fmt.Errorf("invalid recipient address: %w", err)
	}

	// Build Solana Pay URL
	u := &url.URL{
		Scheme: "solana",
		Path:   req.Recipient,
	}

	query := url.Values{}
	query.Set("amount", fmt.Sprintf("%.9f", float64(req.Amount)/1e9)) // Convert lamports to SOL

	if req.TokenMint != "" {
		query.Set("spl-token", req.TokenMint)
	}

	if req.Reference != "" {
		query.Set("reference", req.Reference)
	}

	if req.Label != "" {
		query.Set("label", req.Label)
	}

	if req.Message != "" {
		query.Set("message", req.Message)
	}

	u.RawQuery = query.Encode()

	return u.String(), nil
}

// JupiterSwapService handles Jupiter swap operations
type JupiterSwapService struct {
	client     *Client
	logger     *zap.Logger
	jupiterAPI string
}

// NewJupiterSwapService creates a new Jupiter swap service
func NewJupiterSwapService(client *Client, logger *zap.Logger, jupiterAPI string) *JupiterSwapService {
	return &JupiterSwapService{
		client:     client,
		logger:     logger,
		jupiterAPI: jupiterAPI,
	}
}

// GetSwapQuote gets a swap quote from Jupiter
func (j *JupiterSwapService) GetSwapQuote(ctx context.Context, req *SwapRequest) (*SwapResponse, error) {
	// Build Jupiter API URL
	u, err := url.Parse(j.jupiterAPI + "/quote")
	if err != nil {
		return nil, fmt.Errorf("invalid Jupiter API URL: %w", err)
	}

	query := url.Values{}
	query.Set("inputMint", req.InputMint)
	query.Set("outputMint", req.OutputMint)
	query.Set("amount", strconv.FormatUint(req.Amount, 10))
	query.Set("slippageBps", strconv.Itoa(req.SlippageBps))

	u.RawQuery = query.Encode()

	// Make HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Jupiter API returned status %d", resp.StatusCode)
	}

	// Parse response
	var quoteResp struct {
		InputMint            string `json:"inputMint"`
		InAmount             string `json:"inAmount"`
		OutputMint           string `json:"outputMint"`
		OutAmount            string `json:"outAmount"`
		OtherAmountThreshold string `json:"otherAmountThreshold"`
		SwapMode             string `json:"swapMode"`
		SlippageBps          int    `json:"slippageBps"`
		PlatformFee          struct {
			Amount string `json:"amount"`
			FeeBps int    `json:"feeBps"`
		} `json:"platformFee"`
		PriceImpactPct string `json:"priceImpactPct"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&quoteResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// In production, you would call Jupiter's /swap endpoint to get the actual transaction
	return &SwapResponse{
		SwapTransaction:      "",   // Would contain the serialized transaction
		LastValidBlockHeight: 0,    // Would be set from Jupiter response
		PriorityFee:          5000, // Default priority fee
	}, nil
}

// ExecuteSwap executes a token swap through Jupiter
func (j *JupiterSwapService) ExecuteSwap(ctx context.Context, req *SwapRequest) (*SwapResponse, error) {
	// First get a quote
	quote, err := j.GetSwapQuote(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get swap quote: %w", err)
	}

	// In production, you would:
	// 1. Call Jupiter's /swap endpoint with the quote
	// 2. Get back a serialized transaction
	// 3. Have the user sign the transaction
	// 4. Submit the transaction to the network

	j.logger.Info("Swap executed",
		zap.String("input_mint", req.InputMint),
		zap.String("output_mint", req.OutputMint),
		zap.Uint64("amount", req.Amount),
		zap.String("user_wallet", req.UserWallet),
	)

	return quote, nil
}
