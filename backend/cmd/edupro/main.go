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
	// EduPro Token Configuration
	EduProTokenMint = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"
	EduProDecimals  = 9
	DevnetRPC       = "https://api.devnet.solana.com"
	TestnetRPC      = "https://api.testnet.solana.com"
)

func main() {
	// Command line flags
	var (
		network    = flag.String("network", "devnet", "Solana network (devnet, testnet)")
		action     = flag.String("action", "", "Action to perform (balance, send, info, create-wallet, airdrop)")
		privateKey = flag.String("private-key", "", "Base58 encoded private key (or set SOLANA_PRIVATE_KEY env var)")
		toWallet   = flag.String("to", "", "Destination wallet address")
		amount     = flag.String("amount", "", "Amount to send (in EDUPRO tokens, e.g., 10.5)")
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
	fmt.Printf("🚀 EduPro Token CLI - Using %s network\n", *network)
	fmt.Printf("🔗 RPC: %s\n", rpcEndpoint)
	fmt.Printf("🪙 Token: %s\n\n", EduProTokenMint)

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
		checkEduProBalance(ctx, transferService, privKey)
	case "send":
		sendEduProTokens(ctx, transferService, privKey, *toWallet, *amount, *memo)
	case "info":
		showTokenInfo()
	default:
		fmt.Printf("Unknown action: %s\n", *action)
		showHelp()
	}
}

func getRPCEndpoint(network string) string {
	switch strings.ToLower(network) {
	case "devnet":
		return DevnetRPC
	case "testnet":
		return TestnetRPC
	default:
		fmt.Printf("Unknown network: %s, using devnet\n", network)
		return DevnetRPC
	}
}

func createWallet(transferService *solanaservice.TransferService) {
	fmt.Println("🔑 Creating new EduPro wallet...")

	privateKey, err := transferService.CreateTestnetWallet()
	if err != nil {
		log.Fatal("Failed to create wallet:", err)
	}

	fmt.Printf("\n✅ New EduPro Wallet Created!\n")
	fmt.Printf("📍 Public Key:  %s\n", privateKey.PublicKey().String())
	fmt.Printf("🔐 Private Key: %s\n", privateKey.String())
	fmt.Printf("\n⚠️  SECURITY WARNING:\n")
	fmt.Printf("• Save your private key securely!\n")
	fmt.Printf("• Never share your private key with anyone!\n")
	fmt.Printf("• You need this key to access your EduPro tokens!\n\n")

	fmt.Printf("🔧 To use this wallet, set the environment variable:\n")
	fmt.Printf("export SOLANA_PRIVATE_KEY=\"%s\"\n\n", privateKey.String())
}

func requestAirdrop(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, amountStr string) {
	if privateKeyStr == "" {
		log.Fatal("❌ Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}

	// Parse private key to get public key
	privateKey, err := solana.PrivateKeyFromBase58(privateKeyStr)
	if err != nil {
		log.Fatal("❌ Invalid private key:", err)
	}

	walletAddress := privateKey.PublicKey().String()

	// Parse amount (default to 1 SOL if not specified)
	var amount uint64 = 1_000_000_000 // 1 SOL in lamports
	if amountStr != "" {
		amountFloat, err := strconv.ParseFloat(amountStr, 64)
		if err != nil {
			log.Fatal("❌ Invalid amount:", err)
		}
		amount = uint64(amountFloat * 1_000_000_000) // Convert SOL to lamports
	}

	fmt.Printf("💰 Requesting airdrop of %.9f SOL to %s...\n", float64(amount)/1_000_000_000, walletAddress)

	signature, err := transferService.RequestAirdrop(ctx, walletAddress, amount)
	if err != nil {
		log.Fatal("❌ Failed to request airdrop:", err)
	}

	fmt.Printf("✅ Airdrop requested successfully!\n")
	fmt.Printf("📋 Signature: %s\n", signature)
	fmt.Printf("⏳ Wait a few seconds for the airdrop to be processed...\n")
}

func checkEduProBalance(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr string) {
	if privateKeyStr == "" {
		log.Fatal("❌ Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}

	// Parse private key to get public key
	privateKey, err := solana.PrivateKeyFromBase58(privateKeyStr)
	if err != nil {
		log.Fatal("❌ Invalid private key:", err)
	}

	walletAddress := privateKey.PublicKey().String()
	fmt.Printf("💳 Checking balances for wallet: %s\n\n", walletAddress)

	// Check SOL balance
	solBalance, err := transferService.GetBalance(ctx, walletAddress)
	if err != nil {
		log.Printf("❌ Failed to get SOL balance: %v", err)
	} else {
		solBalanceFloat := float64(solBalance) / 1_000_000_000
		fmt.Printf("💎 SOL Balance: %.9f SOL (%d lamports)\n", solBalanceFloat, solBalance)
	}

	// Check EduPro token balance
	tokenBalance, err := transferService.GetTokenBalance(ctx, walletAddress, EduProTokenMint)
	if err != nil {
		log.Printf("❌ Failed to get EduPro token balance: %v", err)
	} else {
		tokenBalanceFloat := float64(tokenBalance) / float64(1e9)
		fmt.Printf("🎓 EduPro Balance: %.9f EDUPRO (%d token units)\n", tokenBalanceFloat, tokenBalance)
	}
}

func sendEduProTokens(ctx context.Context, transferService *solanaservice.TransferService, privateKeyStr, toWalletStr, amountStr, memoStr string) {
	if privateKeyStr == "" {
		log.Fatal("❌ Private key is required. Use -private-key flag or set SOLANA_PRIVATE_KEY env var")
	}
	if toWalletStr == "" {
		log.Fatal("❌ Destination wallet is required. Use -to flag")
	}
	if amountStr == "" {
		log.Fatal("❌ Amount is required. Use -amount flag (e.g., -amount 10.5)")
	}

	// Parse amount (in EDUPRO tokens)
	amountFloat, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		log.Fatal("❌ Invalid amount:", err)
	}

	// Convert EDUPRO tokens to token units (multiply by 10^9)
	amount := uint64(amountFloat * 1e9)

	fmt.Printf("🚀 Sending %.9f EDUPRO tokens to %s...\n", amountFloat, toWalletStr)
	fmt.Printf("📊 Token units: %d\n", amount)

	req := &solanaservice.TransferTokenRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       toWalletStr,
		TokenMint:      EduProTokenMint,
		Amount:         amount,
		Decimals:       EduProDecimals,
		Memo:           memoStr,
	}

	result, err := transferService.SendToken(ctx, req)
	if err != nil {
		log.Fatal("❌ Failed to send EduPro tokens:", err)
	}

	fmt.Printf("\n✅ EduPro Token Transfer Successful!\n")
	fmt.Printf("📋 Signature: %s\n", result.Signature)
	fmt.Printf("💰 Amount: %.9f EDUPRO (%d token units)\n", amountFloat, result.Amount)
	fmt.Printf("📤 From: %s\n", result.FromWallet)
	fmt.Printf("📥 To: %s\n", result.ToWallet)
	fmt.Printf("📅 Timestamp: %s\n", result.Timestamp.Format("2006-01-02 15:04:05"))

	if memoStr != "" {
		fmt.Printf("📝 Memo: %s\n", memoStr)
	}

	fmt.Printf("\n🔍 View transaction on Solana Explorer:\n")
	fmt.Printf("https://explorer.solana.com/tx/%s?cluster=devnet\n", result.Signature)
}

func showTokenInfo() {
	fmt.Printf("🎓 EduPro Token Information\n")
	fmt.Printf("========================\n\n")
	fmt.Printf("📛 Name: EduPro Token\n")
	fmt.Printf("🏷️  Symbol: EDUPRO\n")
	fmt.Printf("🪙 Mint Address: %s\n", EduProTokenMint)
	fmt.Printf("🌐 Network: Solana Devnet\n")
	fmt.Printf("🔢 Decimals: %d\n", EduProDecimals)
	fmt.Printf("📊 Total Supply: 1,000,000 EDUPRO\n\n")

	fmt.Printf("💱 Amount Conversion:\n")
	fmt.Printf("• 1 EDUPRO = 1,000,000,000 token units\n")
	fmt.Printf("• 10 EDUPRO = 10,000,000,000 token units\n")
	fmt.Printf("• 100 EDUPRO = 100,000,000,000 token units\n\n")

	fmt.Printf("🔗 Useful Links:\n")
	fmt.Printf("• Devnet Explorer: https://explorer.solana.com/?cluster=devnet\n")
	fmt.Printf("• Token Page: https://explorer.solana.com/address/%s?cluster=devnet\n", EduProTokenMint)
}

func showHelp() {
	fmt.Printf(`🎓 EduPro Token CLI Tool

Usage:
  go run cmd/edupro/main.go [flags]

Flags:
  -network string     Solana network (devnet, testnet) (default "devnet")
  -action string      Action to perform (required)
  -private-key string Base58 encoded private key (or set SOLANA_PRIVATE_KEY env var)
  -to string          Destination wallet address
  -amount string      Amount in EDUPRO tokens (e.g., 10.5)
  -memo string        Optional memo for the transaction
  -help               Show this help

Actions:
  create-wallet       Create a new wallet for EduPro tokens
  airdrop            Request SOL airdrop for transaction fees
  balance            Check SOL and EduPro token balance
  send               Send EduPro tokens to another wallet
  info               Show EduPro token information

Examples:

1. Create a new wallet:
   go run cmd/edupro/main.go -action create-wallet

2. Request SOL airdrop for fees:
   go run cmd/edupro/main.go -action airdrop -amount 1.0

3. Check balances:
   go run cmd/edupro/main.go -action balance

4. Send 10.5 EduPro tokens:
   go run cmd/edupro/main.go -action send -to 5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME -amount 10.5 -memo "Course payment"

5. Show token info:
   go run cmd/edupro/main.go -action info

Environment Variables:
  SOLANA_PRIVATE_KEY  Your wallet's private key (Base58 encoded)

EduPro Token Details:
  • Mint: %s
  • Network: Solana Devnet
  • Decimals: %d
  • Symbol: EDUPRO

🔒 Security: Always use devnet for testing. Never share your private key!
`, EduProTokenMint, EduProDecimals)
}
