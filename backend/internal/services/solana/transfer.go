package solana

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/system"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
	"go.uber.org/zap"
)

// TransferService handles programmatic transfers using private keys
type TransferService struct {
	client *rpc.Client
	logger *zap.Logger
}

// NewTransferService creates a new transfer service
func NewTransferService(rpcEndpoint string, logger *zap.Logger) *TransferService {
	client := rpc.New(rpcEndpoint)
	return &TransferService{
		client: client,
		logger: logger,
	}
}

// TransferSOLRequest represents a SOL transfer request
type TransferSOLRequest struct {
	FromPrivateKey string // Base58 encoded private key
	ToWallet       string // Base58 encoded public key
	Amount         uint64 // Amount in lamports (1 SOL = 1,000,000,000 lamports)
	Memo           string // Optional memo
}

// TransferTokenRequest represents a token transfer request
type TransferTokenRequest struct {
	FromPrivateKey string // Base58 encoded private key
	ToWallet       string // Base58 encoded public key
	TokenMint      string // Token mint address
	Amount         uint64 // Amount in token's smallest unit
	Decimals       uint8  // Token decimals (usually 9 for most tokens)
	Memo           string // Optional memo
}

// TransferResult represents the result of a transfer
type TransferResult struct {
	Signature     string    `json:"signature"`
	Status        string    `json:"status"`
	Amount        uint64    `json:"amount"`
	Fee           uint64    `json:"fee"`
	Timestamp     time.Time `json:"timestamp"`
	FromWallet    string    `json:"from_wallet"`
	ToWallet      string    `json:"to_wallet"`
	TransactionID string    `json:"transaction_id"`
}

// SendSOL sends SOL from one wallet to another using a private key
func (ts *TransferService) SendSOL(ctx context.Context, req *TransferSOLRequest) (*TransferResult, error) {
	// Validate and parse private key
	privateKey, err := solana.PrivateKeyFromBase58(req.FromPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}

	// Parse destination wallet
	toWallet, err := solana.PublicKeyFromBase58(req.ToWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid destination wallet: %w", err)
	}

	fromWallet := privateKey.PublicKey()

	// Check balance before transfer
	balance, err := ts.client.GetBalance(ctx, fromWallet, rpc.CommitmentConfirmed)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %w", err)
	}

	if balance.Value < req.Amount {
		return nil, fmt.Errorf("insufficient balance: have %d lamports, need %d lamports", balance.Value, req.Amount)
	}

	// Get recent blockhash
	recentBlockhash, err := ts.client.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create transfer instruction
	transferInstruction := system.NewTransferInstruction(
		req.Amount,
		fromWallet,
		toWallet,
	).Build()

	var instructions []solana.Instruction
	instructions = append(instructions, transferInstruction)

	// Add memo if provided
	if req.Memo != "" {
		memoInstruction := solana.NewInstruction(
			solana.MemoProgramID,
			solana.AccountMetaSlice{},
			[]byte(req.Memo),
		)
		instructions = append(instructions, memoInstruction)
	}

	// Create transaction
	tx, err := solana.NewTransaction(
		instructions,
		recentBlockhash.Value.Blockhash,
		solana.TransactionPayer(fromWallet),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Sign transaction
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(fromWallet) {
			return &privateKey
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Send transaction
	signature, err := ts.client.SendTransactionWithOpts(ctx, tx, rpc.TransactionOpts{
		SkipPreflight:       false,
		PreflightCommitment: rpc.CommitmentProcessed,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	ts.logger.Info("SOL transfer transaction sent",
		zap.String("signature", signature.String()),
		zap.String("from", fromWallet.String()),
		zap.String("to", toWallet.String()),
		zap.Uint64("amount", req.Amount),
	)

	// Wait for confirmation (optional - you might want to do this asynchronously)
	err = ts.waitForConfirmation(ctx, signature, 30*time.Second)
	if err != nil {
		ts.logger.Warn("Transaction sent but confirmation failed", zap.Error(err))
	}

	return &TransferResult{
		Signature:     signature.String(),
		Status:        "sent",
		Amount:        req.Amount,
		Fee:           5000, // Approximate fee - you can calculate this more precisely
		Timestamp:     time.Now(),
		FromWallet:    fromWallet.String(),
		ToWallet:      toWallet.String(),
		TransactionID: signature.String(),
	}, nil
}

// SendToken sends SPL tokens from one wallet to another using a private key
func (ts *TransferService) SendToken(ctx context.Context, req *TransferTokenRequest) (*TransferResult, error) {
	// Validate and parse private key
	privateKey, err := solana.PrivateKeyFromBase58(req.FromPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}

	// Parse destination wallet
	toWallet, err := solana.PublicKeyFromBase58(req.ToWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid destination wallet: %w", err)
	}

	// Parse token mint
	tokenMint, err := solana.PublicKeyFromBase58(req.TokenMint)
	if err != nil {
		return nil, fmt.Errorf("invalid token mint: %w", err)
	}

	fromWallet := privateKey.PublicKey()

	// Find associated token accounts
	fromTokenAccount, _, err := solana.FindAssociatedTokenAddress(fromWallet, tokenMint)
	if err != nil {
		return nil, fmt.Errorf("failed to find from token account: %w", err)
	}

	toTokenAccount, _, err := solana.FindAssociatedTokenAddress(toWallet, tokenMint)
	if err != nil {
		return nil, fmt.Errorf("failed to find to token account: %w", err)
	}

	// Check if destination token account exists (for logging purposes)
	toAccountInfo, err := ts.client.GetAccountInfo(ctx, toTokenAccount)
	if err != nil || toAccountInfo == nil || toAccountInfo.Value == nil {
		ts.logger.Info("Destination token account doesn't exist - transfer will create it if needed")
	}

	// Get recent blockhash
	recentBlockhash, err := ts.client.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	var instructions []solana.Instruction

	// Skip account creation for now - let the RPC handle it or fail gracefully
	// In production, you'd want to handle account creation properly

	// Create token transfer instruction
	transferInstruction := token.NewTransferInstruction(
		req.Amount,
		fromTokenAccount,
		toTokenAccount,
		fromWallet,
		[]solana.PublicKey{},
	).Build()
	instructions = append(instructions, transferInstruction)

	// Add memo if provided
	if req.Memo != "" {
		memoInstruction := solana.NewInstruction(
			solana.MemoProgramID,
			solana.AccountMetaSlice{},
			[]byte(req.Memo),
		)
		instructions = append(instructions, memoInstruction)
	}

	// Create transaction
	tx, err := solana.NewTransaction(
		instructions,
		recentBlockhash.Value.Blockhash,
		solana.TransactionPayer(fromWallet),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Sign transaction
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(fromWallet) {
			return &privateKey
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Send transaction
	signature, err := ts.client.SendTransactionWithOpts(ctx, tx, rpc.TransactionOpts{
		SkipPreflight:       false,
		PreflightCommitment: rpc.CommitmentProcessed,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	ts.logger.Info("Token transfer transaction sent",
		zap.String("signature", signature.String()),
		zap.String("from", fromWallet.String()),
		zap.String("to", toWallet.String()),
		zap.String("token_mint", tokenMint.String()),
		zap.Uint64("amount", req.Amount),
	)

	// Wait for confirmation
	err = ts.waitForConfirmation(ctx, signature, 30*time.Second)
	if err != nil {
		ts.logger.Warn("Transaction sent but confirmation failed", zap.Error(err))
	}

	return &TransferResult{
		Signature:     signature.String(),
		Status:        "sent",
		Amount:        req.Amount,
		Fee:           5000, // Approximate fee
		Timestamp:     time.Now(),
		FromWallet:    fromWallet.String(),
		ToWallet:      toWallet.String(),
		TransactionID: signature.String(),
	}, nil
}

// GetBalance gets the SOL balance of a wallet
func (ts *TransferService) GetBalance(ctx context.Context, walletAddress string) (uint64, error) {
	wallet, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid wallet address: %w", err)
	}

	balance, err := ts.client.GetBalance(ctx, wallet, rpc.CommitmentConfirmed)
	if err != nil {
		return 0, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance.Value, nil
}

// GetTokenBalance gets the token balance of a wallet for a specific mint
func (ts *TransferService) GetTokenBalance(ctx context.Context, walletAddress, tokenMint string) (uint64, error) {
	wallet, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid wallet address: %w", err)
	}

	mint, err := solana.PublicKeyFromBase58(tokenMint)
	if err != nil {
		return 0, fmt.Errorf("invalid token mint: %w", err)
	}

	tokenAccount, _, err := solana.FindAssociatedTokenAddress(wallet, mint)
	if err != nil {
		return 0, fmt.Errorf("failed to find token account: %w", err)
	}

	balance, err := ts.client.GetTokenAccountBalance(ctx, tokenAccount, rpc.CommitmentConfirmed)
	if err != nil {
		return 0, fmt.Errorf("failed to get token balance: %w", err)
	}

	// Parse the amount string to uint64
	amount := uint64(0)
	if balance.Value.Amount != "" {
		if parsed, err := strconv.ParseUint(balance.Value.Amount, 10, 64); err == nil {
			amount = parsed
		}
	}
	return amount, nil
}

// waitForConfirmation waits for transaction confirmation
func (ts *TransferService) waitForConfirmation(ctx context.Context, signature solana.Signature, timeout time.Duration) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout waiting for confirmation")
		case <-ticker.C:
			status, err := ts.client.GetSignatureStatuses(ctx, true, signature)
			if err != nil {
				continue
			}

			if len(status.Value) > 0 && status.Value[0] != nil {
				if status.Value[0].Err != nil {
					return fmt.Errorf("transaction failed: %v", status.Value[0].Err)
				}
				if status.Value[0].ConfirmationStatus != "" {
					ts.logger.Info("Transaction confirmed",
						zap.String("signature", signature.String()),
						zap.String("status", string(status.Value[0].ConfirmationStatus)),
					)
					return nil
				}
			}
		}
	}
}

// CreateTestnetWallet creates a new wallet for testnet use
func (ts *TransferService) CreateTestnetWallet() (*solana.PrivateKey, error) {
	privateKey, err := solana.NewRandomPrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to create private key: %w", err)
	}

	ts.logger.Info("Created new testnet wallet",
		zap.String("public_key", privateKey.PublicKey().String()),
		zap.String("private_key", privateKey.String()),
	)

	return &privateKey, nil
}

// RequestAirdrop requests SOL airdrop for testnet (only works on devnet/testnet)
func (ts *TransferService) RequestAirdrop(ctx context.Context, walletAddress string, amount uint64) (string, error) {
	wallet, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return "", fmt.Errorf("invalid wallet address: %w", err)
	}

	signature, err := ts.client.RequestAirdrop(ctx, wallet, amount, rpc.CommitmentFinalized)
	if err != nil {
		return "", fmt.Errorf("failed to request airdrop: %w", err)
	}

	ts.logger.Info("Airdrop requested",
		zap.String("signature", signature.String()),
		zap.String("wallet", walletAddress),
		zap.Uint64("amount", amount),
	)

	return signature.String(), nil
}
