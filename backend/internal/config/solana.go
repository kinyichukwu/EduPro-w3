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
	RPCEndpoint     string `json:"rpc_endpoint"`
	Network         string `json:"network"`
	RecipientWallet string `json:"recipient_wallet"`
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
		// You should set this in your environment variables
		recipientWallet = ""
	}

	return &SolanaConfig{
		RPCEndpoint:     rpcEndpoint,
		Network:         network,
		RecipientWallet: recipientWallet,
	}
}

// Validate validates the Solana configuration
func (c *SolanaConfig) Validate() error {
	if c.RecipientWallet == "" {
		return ErrMissingRecipientWallet
	}
	return nil
}
