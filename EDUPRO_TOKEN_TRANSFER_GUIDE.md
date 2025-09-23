# EduPro Token Transfer Guide

This guide shows you how to send EduPro tokens programmatically using your private key on Solana devnet.

## EduPro Token Details

- **Token Name**: EduPro Token (EDUPRO)
- **Mint Address**: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`
- **Network**: Solana Devnet
- **Decimals**: 9
- **Total Supply**: 1,000,000 EDUPRO

## Quick Start

### 1. Create or Use Existing Wallet

```bash
cd backend

# Create new wallet
go run cmd/transfer/main.go -network devnet -action create-wallet

# Or set your existing private key
export SOLANA_PRIVATE_KEY="your-private-key-here"
```

### 2. Get Some SOL for Transaction Fees

```bash
# Request SOL airdrop for transaction fees
go run cmd/transfer/main.go -network devnet -action airdrop -amount 1.0
```

### 3. Check Your EduPro Token Balance

```bash
go run cmd/transfer/main.go -network devnet -action balance -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV
```

### 4. Send EduPro Tokens

```bash
# Send 100 EduPro tokens (100 * 10^9 = 100000000000 token units)
go run cmd/transfer/main.go -network devnet -action send-token \
  -to DESTINATION_WALLET_ADDRESS \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV \
  -amount 100000000000 \
  -memo "EduPro token transfer"
```

## EduPro Token Amount Conversion

EduPro tokens use 9 decimals, so:

| Human-Readable | Token Units (for CLI)|  Calculation|
|----------------|----------------------|-------------|
| 1 EDUPRO       | 1000000000           | 1 × 10^9    |
| 10 EDUPRO      | 10000000000          | 10 × 10^9   |
| 100 EDUPRO     | 100000000000         | 100 × 10^9  |
| 1000 EDUPRO    | 1000000000000        | 1000 × 10^9 |

## Programmatic Usage

### Simple EduPro Token Transfer

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "go.uber.org/zap"
    "github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
)

func sendEduProTokens() {
    logger, _ := zap.NewDevelopment()
    
    // Use devnet for EduPro tokens
    transferService := solana.NewTransferService("https://api.devnet.solana.com", logger)
    
    ctx := context.Background()
    
    // EduPro token transfer request
    req := &solana.TransferTokenRequest{
        FromPrivateKey: "your-private-key-base58",
        ToWallet:       "destination-wallet-address",
        TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV", // EduPro token
        Amount:         100000000000, // 100 EDUPRO tokens
        Decimals:       9,
        Memo:           "EduPro token payment",
    }
    
    result, err := transferService.SendToken(ctx, req)
    if err != nil {
        log.Fatal("Transfer failed:", err)
    }
    
    fmt.Printf("EduPro tokens sent successfully!\n")
    fmt.Printf("Signature: %s\n", result.Signature)
    fmt.Printf("Amount: %d token units (%.9f EDUPRO)\n", 
        result.Amount, float64(result.Amount)/1e9)
}
```

### Check EduPro Token Balance

```go
func checkEduProBalance(walletAddress string) {
    logger, _ := zap.NewDevelopment()
    transferService := solana.NewTransferService("https://api.devnet.solana.com", logger)
    
    ctx := context.Background()
    
    balance, err := transferService.GetTokenBalance(ctx, walletAddress, 
        "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV")
    if err != nil {
        log.Printf("Failed to get balance: %v", err)
        return
    }
    
    eduproBalance := float64(balance) / 1e9
    fmt.Printf("EduPro Balance: %.9f EDUPRO (%d token units)\n", eduproBalance, balance)
}
```

## CLI Commands for EduPro Tokens

### Basic Commands

```bash
# Check EduPro token balance
go run cmd/transfer/main.go -network devnet -action balance \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV

# Send 50 EduPro tokens
go run cmd/transfer/main.go -network devnet -action send-token \
  -to 5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV \
  -amount 50000000000 \
  -memo "Payment for course"
```

### Batch Operations

You can create a script for multiple transfers:

```bash
#!/bin/bash

# EduPro token mint
EDUPRO_MINT="8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"

# Recipients and amounts
RECIPIENTS=(
  "wallet1_address:10000000000"  # 10 EDUPRO
  "wallet2_address:25000000000"  # 25 EDUPRO  
  "wallet3_address:50000000000"  # 50 EDUPRO
)

for recipient_amount in "${RECIPIENTS[@]}"; do
  wallet=$(echo $recipient_amount | cut -d':' -f1)
  amount=$(echo $recipient_amount | cut -d':' -f2)
  
  echo "Sending $amount token units to $wallet..."
  go run cmd/transfer/main.go -network devnet -action send-token \
    -to $wallet \
    -token-mint $EDUPRO_MINT \
    -amount $amount \
    -memo "Batch EduPro transfer"
  
  echo "Waiting 2 seconds..."
  sleep 2
done
```

## Integration with Your Backend

### Using Existing Service

Your backend already has a `SendEduProTokens` method. Here's how to use it:

```go
// In your service
func (s *YourService) SendEduProReward(userID, walletAddress string, amount uint64) error {
    response, err := s.solanaService.SendEduProTokens(
        context.Background(), 
        userID, 
        walletAddress, 
        amount,
    )
    if err != nil {
        return fmt.Errorf("failed to send EduPro tokens: %w", err)
    }
    
    log.Printf("EduPro tokens sent: %s", response.TransactionSignature)
    return nil
}
```

### API Endpoints

Your backend already exposes these endpoints:

```bash
# Send EduPro tokens (requires authentication)
POST /api/payment/send-tokens
{
  "wallet_address": "recipient_wallet_address",
  "amount": 100000000000
}

# Query EduPro token balance
POST /api/payment/query-tokens  
{
  "wallet_address": "wallet_address_to_check"
}

# Get EduPro token info
GET /api/edupo-tokens/info
```

## Common Use Cases

### 1. Course Purchase Rewards

```go
// Award 10 EduPro tokens for completing a course
func awardCourseCompletion(userWallet string) error {
    amount := uint64(10 * 1e9) // 10 EDUPRO tokens
    
    req := &solana.TransferTokenRequest{
        FromPrivateKey: os.Getenv("PLATFORM_PRIVATE_KEY"),
        ToWallet:       userWallet,
        TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
        Amount:         amount,
        Decimals:       9,
        Memo:           "Course completion reward",
    }
    
    _, err := transferService.SendToken(context.Background(), req)
    return err
}
```

### 2. Referral Bonuses

```go
// Send referral bonus
func sendReferralBonus(referrerWallet string, bonusAmount float64) error {
    amount := uint64(bonusAmount * 1e9) // Convert to token units
    
    req := &solana.TransferTokenRequest{
        FromPrivateKey: os.Getenv("PLATFORM_PRIVATE_KEY"),
        ToWallet:       referrerWallet,
        TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
        Amount:         amount,
        Decimals:       9,
        Memo:           "Referral bonus",
    }
    
    _, err := transferService.SendToken(context.Background(), req)
    return err
}
```

### 3. Staking Rewards

```go
// Distribute staking rewards
func distributeStakingRewards(stakeholders map[string]float64) error {
    for wallet, rewardAmount := range stakeholders {
        amount := uint64(rewardAmount * 1e9)
        
        req := &solana.TransferTokenRequest{
            FromPrivateKey: os.Getenv("PLATFORM_PRIVATE_KEY"),
            ToWallet:       wallet,
            TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
            Amount:         amount,
            Decimals:       9,
            Memo:           "Staking reward",
        }
        
        _, err := transferService.SendToken(context.Background(), req)
        if err != nil {
            log.Printf("Failed to send reward to %s: %v", wallet, err)
            continue
        }
        
        log.Printf("Sent %.2f EDUPRO to %s", rewardAmount, wallet)
        time.Sleep(1 * time.Second) // Rate limiting
    }
    return nil
}
```

## Monitoring and Verification

### View Transactions on Solana Explorer

- **Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- Search by:
  - Transaction signature
  - Wallet address  
  - Token mint address: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`

### Verify Token Account

```bash
# Check if wallet has EduPro token account
solana account WALLET_ADDRESS --url devnet

# Check token balance
spl-token balance 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV --owner WALLET_ADDRESS --url devnet
```

## Environment Variables

Make sure these are set in your environment:

```bash
# Your platform's private key (for sending tokens)
export SOLANA_PRIVATE_KEY="your-platform-private-key"

# EduPro token configuration (already in your config)
export EDUPRO_TOKEN_MINT="8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"
export SOLANA_RPC_ENDPOINT="https://api.devnet.solana.com"
export SOLANA_NETWORK="devnet"
```

## Security Best Practices

1. **Private Key Security**
   - Never expose private keys in code
   - Use environment variables or secure vaults
   - Rotate keys regularly

2. **Amount Validation**
   - Always validate transfer amounts
   - Set maximum transfer limits
   - Log all transactions

3. **Rate Limiting**
   - Implement delays between transfers
   - Monitor for unusual activity
   - Set daily/hourly limits

4. **Transaction Monitoring**
   - Log all transaction signatures
   - Monitor for failed transactions
   - Set up alerts for large transfers

## Troubleshooting

### Common Issues

1. **"Token account doesn't exist"**
   - The service automatically creates token accounts
   - Ensure you have enough SOL for account creation (~0.002 SOL)

2. **"Insufficient balance"**
   - Check your EduPro token balance
   - Verify you're using the correct token mint address

3. **"Invalid private key"**
   - Ensure private key is Base58 encoded
   - Check SOLANA_PRIVATE_KEY environment variable

### Testing

```bash
# Test script for EduPro token transfers
cd backend
chmod +x scripts/test_edupro_transfer.sh
./scripts/test_edupro_transfer.sh
```

This will test:
- Wallet creation
- SOL airdrop
- EduPro token balance checking
- EduPro token transfers

## Next Steps

1. **Integrate with your existing reward system**
2. **Set up automated token distribution**
3. **Implement token vesting schedules**
4. **Add governance token features**
5. **Create token staking mechanisms**

Your EduPro token is ready for programmatic transfers on Solana devnet!
