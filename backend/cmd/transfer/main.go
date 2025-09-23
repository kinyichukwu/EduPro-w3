package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/gagliardetto/solana-go"
	"go.uber.org/zap"

	solanaservice "github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
)

const (
	// Solana network endpoints
	MainnetRPC = "https://api.mainnet-beta.solana.com"
	TestnetRPC = "https://api.testnet.solana.com"
	DevnetRPC  = "https://api.devnet.solana.com"
	LocalRPC   = "http://localhost:8899"
)

func main() {
	// Command line flags
	var (
		network    = flag.String("network", "testnet", "Solana network (mainnet, testnet, devnet, local)")
		action     = flag.String("action", "", "Action to perform (send-sol, send-token, balance, create-wallet, airdrop)")
		privateKey = flag.String("private-key", "", "Base58 encoded private key (or set SOLANA_PRIVATE_KEY env var)")
		toWallet   = flag.String("to", "", "Destination wallet address")
		amount     = flag.String("amount", "", "Amount to send (SOL or token units)")
		tokenMint  = flag.String("token-mint", "", "Token mint address (for token transfers)")
		memo       = flag.String("memo", "", "Optional memo for the transaction")
		help       = flag.Bool("help", false, "Show help")
	)
	flag.Parse()

	if *help || *action == "" {
		showHelp()
		return
	}

	// Initialize logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Get RPC endpoint based on network
	rpcEndpoint := getRPCEndpoint(*network)
	fmt.Printf("Using %s network: %s\n", *network, rpcEndpoint)

	// Create transfer service
	transferService := solanaservice.NewTransferService(rpcEndpoint, logger)
	ctx := context.Background()

	// Get private key from flag or environment
	privKey := *privateKey
	if privKey == "" {
		privKey = os.Getenv("SOLANA_PRIVATE_KEY")
	}

	switch *action {
	case "create-wallet":
		createWallet(transferService)
	case "airdrop":
		requestAirdrop(ctx, transferService, privKey, *amount)
	case "balance":
		checkBalance(ctx, transferService, privKey, *tokenMint)
	case "send-sol":
		sendSOL(ctx, transferService, privKey, *toWallet, *amount, *memo)
	case "send-token":
		sendToken(ctx, transferService, privKey, *toWallet, *tokenMint, *amount, *memo)
	default:
		fmt.Printf("Unknown action: %s\n", *action)
		showHelp()
	}
}

func getRPCEndpoint(network string) string {
	switch strings.ToLower(network) {
	case "mainnet", "mainnet-beta":
		return MainnetRPC
	case "testnet":
		return TestnetRPC
	case "devnet":
		return DevnetRPC
	case "local", "localhost":
		return LocalRPC
	default:
		fmt.Printf("Unknown network: %s, using testnet\n", network)
		return TestnetRPC
	}
}

func createWallet(transferService *solanaservice.TransferService) {
	fmt.Println("Creating new wallet...")

	privateKey, err := transferService.CreateTestnetWallet()
	if err != nil {
		log.Fatal("Failed to create wallet:", err)
	}

	fmt.Printf("\n✅ New Wallet Created Successfully!\n")
	fmt.Printf("Public Key:  %s\n", privateKey.PublicKey().String())
	fmt.Printf("Private Key: %s\n", privateKey.String())
	fmt.Printf("\n⚠️  IMPORTANT: Save your private key securely!\n")
	fmt.Printf("⚠️  Never share your private key with anyone!\n")
	fmt.Printf("⚠️  You will need this private key to access your wallet!\n\n")

	fmt.Printf("To use this wallet, set the environment variable:\n")
	fmt.Printf("export SOLANA_PRIVATE_KEY=\"%s\"\n\n", privateKey.String())
}

func requestAirdrop(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, amountStr string) {
	if privateKeyStr == "" {
		log.Fatal("Private key is required for airdrop. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}

	// Parse private key to get public key
	privateKey, err := solana.PrivateKeyFromBase58(privateKeyStr)
	if err != nil {
		log.Fatal("Invalid private key:", err)
	}

	walletAddress := privateKey.PublicKey().String()

	// Parse amount (default to 1 SOL if not specified)
	var amount uint64 = 1_000_000_000 // 1 SOL in lamports
	if amountStr != "" {
		amountFloat, err := strconv.ParseFloat(amountStr, 64)
		if err != nil {
			log.Fatal("Invalid amount:", err)
		}
		amount = uint64(amountFloat * 1_000_000_000) // Convert SOL to lamports
	}

	fmt.Printf("Requesting airdrop of %.9f SOL to %s...\n", float64(amount)/1_000_000_000, walletAddress)

	signature, err := transferService.RequestAirdrop(ctx, walletAddress, amount)
	if err != nil {
		log.Fatal("Failed to request airdrop:", err)
	}

	fmt.Printf("✅ Airdrop requested successfully!\n")
	fmt.Printf("Signature: %s\n", signature)
	fmt.Printf("Wait a few seconds for the airdrop to be processed...\n")
}

func checkBalance(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, tokenMintStr string) {
	if privateKeyStr == "" {
		log.Fatal("Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}

	// Parse private key to get public key
	privateKey, err := solana.PrivateKeyFromBase58(privateKeyStr)
	if err != nil {
		log.Fatal("Invalid private key:", err)
	}

	walletAddress := privateKey.PublicKey().String()
	fmt.Printf("Checking balance for wallet: %s\n", walletAddress)

	// Check SOL balance
	balance, err := transferService.GetBalance(ctx, walletAddress)
	if err != nil {
		log.Printf("Failed to get SOL balance: %v", err)
	} else {
		solBalance := float64(balance) / 1_000_000_000
		fmt.Printf("SOL Balance: %.9f SOL (%d lamports)\n", solBalance, balance)
	}

	// Check token balance if token mint is provided
	if tokenMintStr != "" {
		tokenBalance, err := transferService.GetTokenBalance(ctx, walletAddress, tokenMintStr)
		if err != nil {
			log.Printf("Failed to get token balance: %v", err)
		} else {
			fmt.Printf("Token Balance: %d token units\n", tokenBalance)
		}
	}
}

func sendSOL(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, toWalletStr, amountStr, memoStr string) {
	if privateKeyStr == "" {
		log.Fatal("Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}
	if toWalletStr == "" {
		log.Fatal("Destination wallet is required. Use -to flag")
	}
	if amountStr == "" {
		log.Fatal("Amount is required. Use -amount flag")
	}

	// Parse amount
	amountFloat, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		log.Fatal("Invalid amount:", err)
	}
	amount := uint64(amountFloat * 1_000_000_000) // Convert SOL to lamports

	fmt.Printf("Sending %.9f SOL to %s...\n", amountFloat, toWalletStr)

	req := &solanaservice.TransferSOLRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       toWalletStr,
		Amount:         amount,
		Memo:           memoStr,
	}

	result, err := transferService.SendSOL(ctx, req)
	if err != nil {
		log.Fatal("Failed to send SOL:", err)
	}

	fmt.Printf("✅ SOL Transfer Successful!\n")
	fmt.Printf("Signature: %s\n", result.Signature)
	fmt.Printf("Amount: %.9f SOL\n", float64(result.Amount)/1_000_000_000)
	fmt.Printf("From: %s\n", result.FromWallet)
	fmt.Printf("To: %s\n", result.ToWallet)
	fmt.Printf("Status: %s\n", result.Status)
	fmt.Printf("Timestamp: %s\n", result.Timestamp.Format("2006-01-02 15:04:05"))
}

func sendToken(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, toWalletStr, tokenMintStr, amountStr, memoStr string) {
	if privateKeyStr == "" {
		log.Fatal("Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}
	if toWalletStr == "" {
		log.Fatal("Destination wallet is required. Use -to flag")
	}
	if tokenMintStr == "" {
		log.Fatal("Token mint is required. Use -token-mint flag")
	}
	if amountStr == "" {
		log.Fatal("Amount is required. Use -amount flag")
	}

	// Parse amount
	amount, err := strconv.ParseUint(amountStr, 10, 64)
	if err != nil {
		log.Fatal("Invalid amount:", err)
	}

	fmt.Printf("Sending %d token units to %s...\n", amount, toWalletStr)
	fmt.Printf("Token Mint: %s\n", tokenMintStr)

	req := &solanaservice.TransferTokenRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       toWalletStr,
		TokenMint:      tokenMintStr,
		Amount:         amount,
		Decimals:       9, // Most tokens use 9 decimals
		Memo:           memoStr,
	}

	result, err := transferService.SendToken(ctx, req)
	if err != nil {
		log.Fatal("Failed to send token:", err)
	}

	fmt.Printf("✅ Token Transfer Successful!\n")
	fmt.Printf("Signature: %s\n", result.Signature)
	fmt.Printf("Amount: %d token units\n", result.Amount)
	fmt.Printf("From: %s\n", result.FromWallet)
	fmt.Printf("To: %s\n", result.ToWallet)
	fmt.Printf("Status: %s\n", result.Status)
	fmt.Printf("Timestamp: %s\n", result.Timestamp.Format("2006-01-02 15:04:05"))
}

func showHelp() {
	fmt.Printf(`Solana Transfer CLI Tool

Usage:
  go run cmd/transfer/main.go [flags]

Flags:
  -network string     Solana network (mainnet, testnet, devnet, local) (default "testnet")
  -action string      Action to perform (required)
  -private-key string Base58 encoded private key (or set SOLANA_PRIVATE_KEY env var)
  -to string          Destination wallet address
  -amount string      Amount to send (SOL or token units)
  -token-mint string  Token mint address (for token transfers)
  -memo string        Optional memo for the transaction
  -help               Show this help

Actions:
  create-wallet       Create a new wallet
  airdrop            Request SOL airdrop (testnet/devnet only)
  balance            Check wallet balance
  send-sol           Send SOL to another wallet
  send-token         Send SPL tokens to another wallet

Examples:

1. Create a new wallet:
   go run cmd/transfer/main.go -action create-wallet

2. Request airdrop (1 SOL):
   go run cmd/transfer/main.go -action airdrop -amount 1.0

3. Check balance:
   go run cmd/transfer/main.go -action balance

4. Check token balance:
   go run cmd/transfer/main.go -action balance -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV

5. Send SOL:
   go run cmd/transfer/main.go -action send-sol -to 5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME -amount 0.1

6. Send tokens:
   go run cmd/transfer/main.go -action send-token -to 5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV -amount 1000000000

Environment Variables:
  SOLANA_PRIVATE_KEY  Your wallet's private key (Base58 encoded)

Network Endpoints:
  mainnet: %s
  testnet: %s
  devnet:  %s
  local:   %s

Note: Always use testnet or devnet for testing. Never use mainnet with test funds!
`, MainnetRPC, TestnetRPC, DevnetRPC, LocalRPC)
}
