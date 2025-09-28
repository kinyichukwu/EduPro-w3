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
	PrivateKey          string `json:"private_key"`
	EduProTokenMint     string `json:"edutoken_mint"`
	EduProTokenDecimals int    `json:"edutoken_decimals"`
	EduProMintAuthority string `json:"edutoken_mint_authority"`
	// Pinata IPFS Configuration
	PinataAPIKey     string `json:"pinata_api_key"`
	PinataAPISecret  string `json:"pinata_api_secret"`
	PinataJWT        string `json:"pinata_jwt"`
	PinataGatewayURL string `json:"pinata_gateway_url"`
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
		// EduPro token mint address from the provided transaction
		edutokenMint = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"
	}

	edutokenDecimals := 9 // Default to 9 decimals for EduPro token

	edutokenMintAuthority := os.Getenv("EDUPRO_MINT_AUTHORITY")
	if edutokenMintAuthority == "" {
		// EduPro mint authority from the provided transaction
		edutokenMintAuthority = "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
	}

	privateKey := os.Getenv("SOLANA_PRIVATE_KEY")
	// Note: Private key should be set in environment variables for security

	// Load Pinata IPFS configuration
	pinataAPIKey := os.Getenv("PINATA_API_KEY")
	pinataAPISecret := os.Getenv("PINATA_API_SECRET")
	pinataJWT := os.Getenv("PINATA_JWT")
	pinataGatewayURL := os.Getenv("PINATA_GATEWAY_URL")
	if pinataGatewayURL == "" {
		pinataGatewayURL = "https://gateway.pinata.cloud"
	}

	return &SolanaConfig{
		RPCEndpoint:         rpcEndpoint,
		Network:             network,
		RecipientWallet:     recipientWallet,
		PrivateKey:          privateKey,
		EduProTokenMint:     edutokenMint,
		EduProTokenDecimals: edutokenDecimals,
		EduProMintAuthority: edutokenMintAuthority,
		PinataAPIKey:        pinataAPIKey,
		PinataAPISecret:     pinataAPISecret,
		PinataJWT:           pinataJWT,
		PinataGatewayURL:    pinataGatewayURL,
	}
}

// Validate validates the Solana configuration
func (c *SolanaConfig) Validate() error {
	if c.RecipientWallet == "" {
		return ErrMissingRecipientWallet
	}
	return nil
}
