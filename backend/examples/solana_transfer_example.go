package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gagliardetto/solana-go"
	"go.uber.org/zap"

	"edupro/internal/services/solana"
)

// Example usage of the Solana transfer service
func main() {
	// Initialize logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Testnet RPC endpoint
	testnetRPC := "https://api.testnet.solana.com"

	// You can also use devnet for faster testing
	// devnetRPC := "https://api.devnet.solana.com"

	// Create transfer service
	transferService := solana.NewTransferService(testnetRPC, logger)

	ctx := context.Background()

	// Example 1: Create a new testnet wallet
	fmt.Println("=== Creating New Testnet Wallet ===")
	privateKey, err := transferService.CreateTestnetWallet()
	if err != nil {
		log.Fatal("Failed to create wallet:", err)
	}

	walletAddress := privateKey.PublicKey().String()
	privateKeyStr := privateKey.String()

	fmt.Printf("New Wallet Created:\n")
	fmt.Printf("Public Key:  %s\n", walletAddress)
	fmt.Printf("Private Key: %s\n", privateKeyStr)
	fmt.Printf("⚠️  SAVE YOUR PRIVATE KEY SECURELY! ⚠️\n\n")

	// Example 2: Request airdrop (testnet/devnet only)
	fmt.Println("=== Requesting Airdrop ===")
	airdropAmount := uint64(1_000_000_000) // 1 SOL in lamports
	airdropSig, err := transferService.RequestAirdrop(ctx, walletAddress, airdropAmount)
	if err != nil {
		log.Printf("Failed to request airdrop: %v", err)
	} else {
		fmt.Printf("Airdrop requested! Signature: %s\n", airdropSig)
		fmt.Printf("Wait a few seconds for the airdrop to be processed...\n\n")
	}

	// Example 3: Check balance
	fmt.Println("=== Checking Balance ===")
	balance, err := transferService.GetBalance(ctx, walletAddress)
	if err != nil {
		log.Printf("Failed to get balance: %v", err)
	} else {
		solBalance := float64(balance) / 1_000_000_000 // Convert lamports to SOL
		fmt.Printf("Wallet Balance: %.9f SOL (%d lamports)\n\n", solBalance, balance)
	}

	// Example 4: Send SOL to another wallet
	fmt.Println("=== Sending SOL ===")

	// Replace with your destination wallet address
	destinationWallet := "11111111111111111111111111111112" // System program (burn address for demo)
	// For real transfers, use a valid wallet address like:
	// destinationWallet := "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"

	solTransferReq := &solana.TransferSOLRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       destinationWallet,
		Amount:         100_000_000, // 0.1 SOL in lamports
		Memo:           "Test transfer from Go",
	}

	result, err := transferService.SendSOL(ctx, solTransferReq)
	if err != nil {
		log.Printf("Failed to send SOL: %v", err)
	} else {
		fmt.Printf("SOL Transfer Successful!\n")
		fmt.Printf("Signature: %s\n", result.Signature)
		fmt.Printf("Amount: %.9f SOL\n", float64(result.Amount)/1_000_000_000)
		fmt.Printf("From: %s\n", result.FromWallet)
		fmt.Printf("To: %s\n", result.ToWallet)
		fmt.Printf("Status: %s\n\n", result.Status)
	}

	// Example 5: Send SPL Token (EduPro token example)
	fmt.Println("=== Sending SPL Token ===")

	// EduPro token mint address from your project
	eduProTokenMint := "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"

	tokenTransferReq := &solana.TransferTokenRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       destinationWallet,
		TokenMint:      eduProTokenMint,
		Amount:         1_000_000_000, // 1 token (assuming 9 decimals)
		Decimals:       9,
		Memo:           "EduPro token transfer",
	}

	tokenResult, err := transferService.SendToken(ctx, tokenTransferReq)
	if err != nil {
		log.Printf("Failed to send token: %v", err)
	} else {
		fmt.Printf("Token Transfer Successful!\n")
		fmt.Printf("Signature: %s\n", tokenResult.Signature)
		fmt.Printf("Amount: %d token units\n", tokenResult.Amount)
		fmt.Printf("From: %s\n", tokenResult.FromWallet)
		fmt.Printf("To: %s\n", tokenResult.ToWallet)
		fmt.Printf("Status: %s\n\n", tokenResult.Status)
	}

	// Example 6: Check token balance
	fmt.Println("=== Checking Token Balance ===")
	tokenBalance, err := transferService.GetTokenBalance(ctx, walletAddress, eduProTokenMint)
	if err != nil {
		log.Printf("Failed to get token balance: %v", err)
	} else {
		fmt.Printf("EduPro Token Balance: %d token units\n", tokenBalance)
	}

	fmt.Println("\n=== Examples Complete ===")
	fmt.Println("Check the Solana Explorer to view your transactions:")
	fmt.Printf("Testnet Explorer: https://explorer.solana.com/?cluster=testnet\n")
	fmt.Printf("Search for your wallet: %s\n", walletAddress)
}

// ExampleWithExistingPrivateKey shows how to use an existing private key
func ExampleWithExistingPrivateKey() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Use your existing private key (Base58 encoded)
	existingPrivateKey := os.Getenv("SOLANA_PRIVATE_KEY")
	if existingPrivateKey == "" {
		log.Fatal("Please set SOLANA_PRIVATE_KEY environment variable")
	}

	// Validate the private key
	privateKey, err := solana.PrivateKeyFromBase58(existingPrivateKey)
	if err != nil {
		log.Fatal("Invalid private key:", err)
	}

	fmt.Printf("Using existing wallet: %s\n", privateKey.PublicKey().String())

	// Create transfer service
	transferService := solana.NewTransferService("https://api.testnet.solana.com", logger)
	ctx := context.Background()

	// Check balance
	balance, err := transferService.GetBalance(ctx, privateKey.PublicKey().String())
	if err != nil {
		log.Fatal("Failed to get balance:", err)
	}

	fmt.Printf("Current balance: %.9f SOL\n", float64(balance)/1_000_000_000)

	// Send SOL
	destinationWallet := "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME" // Replace with actual destination

	transferReq := &solana.TransferSOLRequest{
		FromPrivateKey: existingPrivateKey,
		ToWallet:       destinationWallet,
		Amount:         50_000_000, // 0.05 SOL
		Memo:           "Transfer from existing wallet",
	}

	result, err := transferService.SendSOL(ctx, transferReq)
	if err != nil {
		log.Fatal("Transfer failed:", err)
	}

	fmt.Printf("Transfer successful! Signature: %s\n", result.Signature)
}

// QuickTransferFunction shows a simple function for quick transfers
func QuickSOLTransfer(privateKeyStr, toWallet string, amountSOL float64) error {
	logger, _ := zap.NewDevelopment()
	transferService := solana.NewTransferService("https://api.testnet.solana.com", logger)

	ctx := context.Background()

	// Convert SOL to lamports
	amountLamports := uint64(amountSOL * 1_000_000_000)

	req := &solana.TransferSOLRequest{
		FromPrivateKey: privateKeyStr,
		ToWallet:       toWallet,
		Amount:         amountLamports,
		Memo:           "Quick transfer",
	}

	result, err := transferService.SendSOL(ctx, req)
	if err != nil {
		return fmt.Errorf("transfer failed: %w", err)
	}

	fmt.Printf("Transfer successful! Signature: %s\n", result.Signature)
	return nil
}
