package solana

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"go.uber.org/zap"
)

// Client wraps Solana RPC client with EduPro-specific functionality
type Client struct {
	RpcClient         *rpc.Client
	config            *config.Config
	logger            *zap.Logger
	eduProMintAddress solana.PublicKey
	mintAuthorityKey  solana.PrivateKey
	stakingProgramID  solana.PublicKey
	stakingTreasury   solana.PublicKey
}

// NewClient creates a new Solana client with EduPro configuration
func NewClient(cfg *config.Config, logger *zap.Logger) (*Client, error) {
	rpcClient := rpc.New(cfg.SolanaRPCURL)

	// Parse EduPro mint address
	eduProMintAddress, err := solana.PublicKeyFromBase58(cfg.EduProMintAddress)
	if err != nil {
		return nil, fmt.Errorf("invalid EduPro mint address: %w", err)
	}

	// Parse mint authority private key
	var mintAuthorityKey solana.PrivateKey
	if cfg.EduProMintAuthoritySecret != "" {
		mintAuthorityKey, err = solana.PrivateKeyFromBase58(cfg.EduProMintAuthoritySecret)
		if err != nil {
			return nil, fmt.Errorf("invalid mint authority secret: %w", err)
		}
	}

	// Parse staking program ID (optional)
	var stakingProgramID solana.PublicKey
	if cfg.EduProStakingProgramID != "" {
		stakingProgramID, err = solana.PublicKeyFromBase58(cfg.EduProStakingProgramID)
		if err != nil {
			return nil, fmt.Errorf("invalid staking program ID: %w", err)
		}
	}

	// Parse staking treasury (optional)
	var stakingTreasury solana.PublicKey
	if cfg.EduProStakingTreasury != "" {
		stakingTreasury, err = solana.PublicKeyFromBase58(cfg.EduProStakingTreasury)
		if err != nil {
			return nil, fmt.Errorf("invalid staking treasury: %w", err)
		}
	}

	return &Client{
		RpcClient:         rpcClient,
		config:            cfg,
		logger:            logger,
		eduProMintAddress: eduProMintAddress,
		mintAuthorityKey:  mintAuthorityKey,
		stakingProgramID:  stakingProgramID,
		stakingTreasury:   stakingTreasury,
	}, nil
}

// GetBalance returns the SOL balance for a given wallet address
func (c *Client) GetBalance(ctx context.Context, walletAddress string) (uint64, error) {
	pubKey, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid wallet address: %w", err)
	}

	balance, err := c.RpcClient.GetBalance(ctx, pubKey, rpc.CommitmentFinalized)
	if err != nil {
		return 0, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance.Value, nil
}

// GetTokenBalance returns the token balance for a given wallet and mint address
func (c *Client) GetTokenBalance(ctx context.Context, walletAddress, mintAddress string) (uint64, error) {
	walletPubKey, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid wallet address: %w", err)
	}

	mintPubKey, err := solana.PublicKeyFromBase58(mintAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid mint address: %w", err)
	}

	// Get token accounts for the wallet
	tokenAccounts, err := c.RpcClient.GetTokenAccountsByOwner(
		ctx,
		walletPubKey,
		&rpc.GetTokenAccountsConfig{
			Mint: &mintPubKey,
		},
		&rpc.GetTokenAccountsOpts{
			Commitment: rpc.CommitmentFinalized,
		},
	)
	if err != nil {
		return 0, fmt.Errorf("failed to get token accounts: %w", err)
	}

	if len(tokenAccounts.Value) == 0 {
		return 0, nil // No token account found, balance is 0
	}

	// Get balance from the first token account
	tokenAccount := tokenAccounts.Value[0]
	balance, err := c.RpcClient.GetTokenAccountBalance(ctx, tokenAccount.Pubkey, rpc.CommitmentFinalized)
	if err != nil {
		return 0, fmt.Errorf("failed to get token balance: %w", err)
	}

	// Parse the amount string to uint64
	amount, err := strconv.ParseUint(balance.Value.Amount, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse token balance: %w", err)
	}
	return amount, nil
}

// GetEduTokenBalance returns the EduToken balance for a given wallet
func (c *Client) GetEduTokenBalance(ctx context.Context, walletAddress string) (uint64, error) {
	return c.GetTokenBalance(ctx, walletAddress, c.eduProMintAddress.String())
}

// VerifyTransaction verifies that a transaction exists and is confirmed
func (c *Client) VerifyTransaction(ctx context.Context, signature string) (*TransactionInfo, error) {
	sig, err := solana.SignatureFromBase58(signature)
	if err != nil {
		return nil, fmt.Errorf("invalid transaction signature: %w", err)
	}

	// Get transaction with max commitment
	tx, err := c.RpcClient.GetTransaction(ctx, sig, &rpc.GetTransactionOpts{
		Commitment: rpc.CommitmentFinalized,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}

	if tx == nil {
		return nil, fmt.Errorf("transaction not found")
	}

	// Parse transaction info
	info := &TransactionInfo{
		Signature: signature,
		Slot:      tx.Slot,
		Confirmed: tx.Meta.Err == nil,
		Fee:       tx.Meta.Fee,
	}

	// Handle block time (might be nil)
	if tx.BlockTime != nil {
		info.BlockTime = time.Unix(int64(*tx.BlockTime), 0)
	}

	// Handle error (might be nil)
	if tx.Meta.Err != nil {
		info.Error = fmt.Sprintf("%v", tx.Meta.Err)
	}

	return info, nil
}

// GetRecentBlockhash gets a recent blockhash for transaction building
func (c *Client) GetRecentBlockhash(ctx context.Context) (solana.Hash, error) {
	// Use the new getLatestBlockhash method instead of deprecated getRecentBlockhash
	latest, err := c.RpcClient.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return solana.Hash{}, fmt.Errorf("failed to get latest blockhash: %w", err)
	}

	return latest.Value.Blockhash, nil
}

// EstimateTransactionFee estimates the fee for a transaction
func (c *Client) EstimateTransactionFee(ctx context.Context, tx *solana.Transaction) (uint64, error) {
	// For now, return a default fee estimate since the API might have changed
	// In production, you would implement proper fee estimation
	return 5000, nil // 0.000005 SOL default fee
}

// SendTransaction sends a transaction to the network
func (c *Client) SendTransaction(ctx context.Context, tx *solana.Transaction) (string, error) {
	sig, err := c.RpcClient.SendTransaction(ctx, tx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return sig.String(), nil
}

// SubmitTransaction submits a raw transaction to the network
func (c *Client) SubmitTransaction(ctx context.Context, txBytes []byte) (solana.Signature, error) {
	sig, err := c.RpcClient.SendRawTransaction(ctx, txBytes)
	if err != nil {
		return solana.Signature{}, fmt.Errorf("failed to submit transaction: %w", err)
	}

	return sig, nil
}

// WaitForConfirmation waits for a transaction to be confirmed
func (c *Client) WaitForConfirmation(ctx context.Context, signature string, timeout time.Duration) error {
	sig, err := solana.SignatureFromBase58(signature)
	if err != nil {
		return fmt.Errorf("invalid signature: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout waiting for confirmation")
		case <-ticker.C:
			status, err := c.RpcClient.GetSignatureStatuses(ctx, true, sig)
			if err != nil {
				c.logger.Warn("Failed to get signature status", zap.Error(err))
				continue
			}

			if len(status.Value) > 0 && status.Value[0] != nil {
				if status.Value[0].Err != nil {
					return fmt.Errorf("transaction failed: %v", status.Value[0].Err)
				}
				if status.Value[0].ConfirmationStatus == rpc.ConfirmationStatusFinalized {
					return nil
				}
			}
		}
	}
}

// GetMintInfo returns information about a token mint
func (c *Client) GetMintInfo(ctx context.Context, mintAddress string) (*MintInfo, error) {
	mintPubKey, err := solana.PublicKeyFromBase58(mintAddress)
	if err != nil {
		return nil, fmt.Errorf("invalid mint address: %w", err)
	}

	accountInfo, err := c.RpcClient.GetAccountInfo(ctx, mintPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get mint account info: %w", err)
	}

	if accountInfo.Value == nil {
		return nil, fmt.Errorf("mint account not found")
	}

	// Parse mint data (simplified - in production you'd use proper SPL token parsing)
	return &MintInfo{
		Address:       mintAddress,
		Decimals:      9, // Default for most tokens, should be parsed from account data
		Supply:        0, // Should be parsed from account data
		IsInitialized: true,
	}, nil
}

// Close closes the RPC client connection
func (c *Client) Close() error {
	// The solana-go RPC client doesn't have an explicit close method
	// but we can clean up any resources here if needed
	return nil
}
