package config

import (
	"errors"
	"os"
)

var (
	ErrMissingRecipientWallet = errors.New("recipient wallet address is required")
)

// SolanaConfig holds Solana blockchain configuration
type SolanaConfig struct {
	RPCEndpoint         string `json:"rpc_endpoint"`
	Network             string `json:"network"`
	RecipientWallet     string `json:"recipient_wallet"`
	EduProTokenMint     string `json:"edutoken_mint"`
	EduProTokenDecimals int    `json:"edutoken_decimals"`
}

// NewSolanaConfig creates Solana configuration from environment variables
func NewSolanaConfig() *SolanaConfig {
	rpcEndpoint := os.Getenv("SOLANA_RPC_ENDPOINT")
	if rpcEndpoint == "" {
		rpcEndpoint = "https://api.devnet.solana.com" // Default to devnet for development
	}

	network := os.Getenv("SOLANA_NETWORK")
	if network == "" {
		network = "devnet"
	}

	recipientWallet := os.Getenv("SOLANA_RECIPIENT_WALLET")
	if recipientWallet == "" {
		// Default to the provided organization wallet address
		recipientWallet = "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
	}

	edutokenMint := os.Getenv("EDUPRO_TOKEN_MINT")
	if edutokenMint == "" {
		// For testing purposes, use USDC token mint on devnet
		// TODO: Replace with actual EduPro token mint address
		edutokenMint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" // USDC on devnet
	}

	edutokenDecimals := 9 // Default to 9 decimals for EduPro token

	return &SolanaConfig{
		RPCEndpoint:         rpcEndpoint,
		Network:             network,
		RecipientWallet:     recipientWallet,
		EduProTokenMint:     edutokenMint,
		EduProTokenDecimals: edutokenDecimals,
	}
}

// Validate validates the Solana configuration
func (c *SolanaConfig) Validate() error {
	if c.RecipientWallet == "" {
		return ErrMissingRecipientWallet
	}
	return nil
}
