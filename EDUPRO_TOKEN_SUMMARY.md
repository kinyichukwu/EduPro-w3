# EduPro Token Transfer - Complete Guide

## 🎯 Quick Answer

**To send EduPro tokens programmatically:**

```bash
# 1. Set your private key
export SOLANA_PRIVATE_KEY="your-private-key-here"

# 2. Send EduPro tokens using the dedicated CLI
go run cmd/edupro/main.go -action send -to WALLET_ADDRESS -amount 10.5 -memo "Payment"

# Or using the general transfer tool
go run cmd/transfer/main.go -network devnet -action send-token \
  -to WALLET_ADDRESS \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV \
  -amount 10500000000 \
  -memo "Payment"
```

## 🪙 EduPro Token Details

| Property | Value |
|----------|-------|
| **Name** | EduPro Token (EDUPRO) |
| **Mint Address** | `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV` |
| **Network** | Solana Devnet |
| **Decimals** | 9 |
| **Total Supply** | 1,000,000 EDUPRO |

## 🚀 Available Tools

### 1. **EduPro-Specific CLI** (Recommended)
```bash
# Easy-to-use, EduPro-focused tool
go run cmd/edupro/main.go -action send -to WALLET -amount 10.5
```

### 2. **General Transfer CLI**
```bash
# More flexible, supports any token
go run cmd/transfer/main.go -network devnet -action send-token -token-mint MINT -amount UNITS
```

### 3. **Backend API Endpoints**
```bash
# Your existing REST API
POST /api/payment/send-tokens
POST /api/payment/query-tokens
GET /api/edupo-tokens/info
```

### 4. **Programmatic Go Code**
```go
// Direct integration in your Go services
transferService.SendToken(ctx, &TransferTokenRequest{...})
```

## 💡 Common Use Cases

### 1. **Course Completion Rewards**
```bash
# Award 10 EDUPRO for completing a course
go run cmd/edupro/main.go -action send -to USER_WALLET -amount 10 -memo "Course completion reward"
```

### 2. **Referral Bonuses**
```bash
# Send 5 EDUPRO for successful referral
go run cmd/edupro/main.go -action send -to REFERRER_WALLET -amount 5 -memo "Referral bonus"
```

### 3. **Bulk Distribution**
```bash
# Use the test script for batch operations
./scripts/test_edupro_transfer.sh
```

## 📋 Step-by-Step Instructions

### Option 1: Using EduPro CLI (Easiest)

1. **Create/Set Wallet:**
```bash
cd backend
go run cmd/edupro/main.go -action create-wallet
export SOLANA_PRIVATE_KEY="your-private-key"
```

2. **Get SOL for Fees:**
```bash
go run cmd/edupro/main.go -action airdrop -amount 1.0
```

3. **Check Balance:**
```bash
go run cmd/edupro/main.go -action balance
```

4. **Send EduPro Tokens:**
```bash
go run cmd/edupro/main.go -action send -to DESTINATION_WALLET -amount 25.5 -memo "Payment"
```

### Option 2: Using General CLI

1. **Set Environment:**
```bash
export SOLANA_PRIVATE_KEY="your-private-key"
```

2. **Send Tokens:**
```bash
go run cmd/transfer/main.go -network devnet -action send-token \
  -to DESTINATION_WALLET \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV \
  -amount 25500000000 \
  -memo "Payment"
```

### Option 3: Using Your Backend API

```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:8080/api/test/generate-token \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' | jq -r '.token')

# Send tokens
curl -X POST http://localhost:8080/api/payment/send-tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "wallet_address": "DESTINATION_WALLET",
    "amount": 25500000000
  }'
```

## 🔢 Amount Conversion

| EDUPRO Tokens | Token Units | CLI Amount |
|---------------|-------------|------------|
| 1 EDUPRO      | 1,000,000,000 | `1` (EduPro CLI) or `1000000000` (General CLI) |
| 10 EDUPRO     | 10,000,000,000 | `10` or `10000000000` |
| 25.5 EDUPRO   | 25,500,000,000 | `25.5` or `25500000000` |
| 100 EDUPRO    | 100,000,000,000 | `100` or `100000000000` |

## 🛠️ Integration Examples

### Go Code Integration

```go
package main

import (
    "context"
    "log"
    "os"
    
    "go.uber.org/zap"
    "github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
)

func sendEduProReward(userWallet string, amount float64) error {
    logger, _ := zap.NewDevelopment()
    transferService := solana.NewTransferService("https://api.devnet.solana.com", logger)
    
    req := &solana.TransferTokenRequest{
        FromPrivateKey: os.Getenv("SOLANA_PRIVATE_KEY"),
        ToWallet:       userWallet,
        TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
        Amount:         uint64(amount * 1e9), // Convert to token units
        Decimals:       9,
        Memo:           "EduPro reward",
    }
    
    result, err := transferService.SendToken(context.Background(), req)
    if err != nil {
        return err
    }
    
    log.Printf("EduPro tokens sent! Signature: %s", result.Signature)
    return nil
}
```

### Shell Script Integration

```bash
#!/bin/bash

# Function to send EduPro tokens
send_edupro() {
    local wallet=$1
    local amount=$2
    local memo=$3
    
    go run cmd/edupro/main.go -action send \
        -to "$wallet" \
        -amount "$amount" \
        -memo "$memo"
}

# Usage examples
send_edupro "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME" "10" "Course reward"
send_edupro "AnotherWalletAddress" "5.5" "Referral bonus"
```

## 🔍 Monitoring & Verification

### Check Transaction on Explorer
- **Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- Search by transaction signature or wallet address

### Verify Balance
```bash
# Check your EduPro balance
go run cmd/edupro/main.go -action balance

# Check specific wallet balance
go run cmd/transfer/main.go -network devnet -action balance \
  -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV \
  -private-key "target-wallet-private-key"
```

## 🔒 Security Best Practices

1. **Private Key Management**
   - Use environment variables: `export SOLANA_PRIVATE_KEY="key"`
   - Never commit private keys to code
   - Use different keys for different environments

2. **Amount Validation**
   - Always validate amounts before sending
   - Set reasonable limits for automated transfers
   - Log all transactions for audit trails

3. **Network Safety**
   - Test on devnet first
   - Use testnet for staging
   - Only use mainnet for production

## 🧪 Testing

### Run Automated Tests
```bash
# Test EduPro token transfers
cd backend
./scripts/test_edupro_transfer.sh

# Test general transfers
./scripts/test_transfer.sh
```

### Manual Testing Steps
1. Create test wallet
2. Get SOL for fees
3. Check balances
4. Send small test amount
5. Verify transaction on explorer
6. Check updated balances

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `EDUPRO_TOKEN_TRANSFER_GUIDE.md` | Comprehensive EduPro guide |
| `SOLANA_TRANSFER_GUIDE.md` | General Solana transfer guide |
| `backend/cmd/edupro/main.go` | EduPro-specific CLI tool |
| `backend/cmd/transfer/main.go` | General transfer CLI tool |
| `backend/scripts/test_edupro_transfer.sh` | EduPro test script |

## 🚨 Troubleshooting

### Common Issues

1. **"Token account doesn't exist"**
   - Solution: The service creates accounts automatically
   - Ensure you have enough SOL for account creation (~0.002 SOL)

2. **"Insufficient balance"**
   - Check your EduPro token balance
   - Verify you have SOL for transaction fees

3. **"Invalid private key"**
   - Ensure private key is Base58 encoded
   - Check SOLANA_PRIVATE_KEY environment variable

4. **"Network connection failed"**
   - Check internet connection
   - Try different RPC endpoint
   - Verify network parameter (devnet/testnet)

### Getting Help

1. Check transaction on Solana Explorer
2. Review log output for error details
3. Verify all parameters are correct
4. Test with smaller amounts first

## ✅ You're Ready!

Your EduPro token transfer system is fully set up with:

- ✅ Transfer utilities (`cmd/edupro/` and `cmd/transfer/`)
- ✅ Backend API endpoints
- ✅ Comprehensive documentation
- ✅ Test scripts
- ✅ Security best practices
- ✅ Error handling and validation

**Start with the EduPro CLI for the easiest experience:**

```bash
cd backend
go run cmd/edupro/main.go -action info
go run cmd/edupro/main.go -action create-wallet
export SOLANA_PRIVATE_KEY="your-private-key"
go run cmd/edupro/main.go -action send -to WALLET -amount 10 -memo "Test"
```

Happy transferring! 🎓✨
