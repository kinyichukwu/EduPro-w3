# Solana Transfer Guide

This guide shows you how to send SOL and SPL tokens programmatically using a private key on Solana testnet.

## Quick Start

### 1. Create a New Wallet

```bash
cd backend
go run cmd/transfer/main.go -action create-wallet
```

This will output:
```
✅ New Wallet Created Successfully!
Public Key:  5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME
Private Key: 3x7Kj9...your-private-key...9Xm2P

⚠️  IMPORTANT: Save your private key securely!
```

### 2. Set Your Private Key

```bash
export SOLANA_PRIVATE_KEY="your-private-key-here"
```

### 3. Request Testnet Airdrop

```bash
go run cmd/transfer/main.go -action airdrop -amount 2.0
```

### 4. Check Your Balance

```bash
go run cmd/transfer/main.go -action balance
```

### 5. Send SOL to Another Wallet

```bash
go run cmd/transfer/main.go -action send-sol -to DESTINATION_WALLET_ADDRESS -amount 0.1 -memo "Test transfer"
```

### 6. Send SPL Tokens

```bash
go run cmd/transfer/main.go -action send-token -to DESTINATION_WALLET_ADDRESS -token-mint 8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV -amount 1000000000
```

## Programmatic Usage

### Basic SOL Transfer

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "go.uber.org/zap"
    "edupro/internal/services/solana"
)

func main() {
    logger, _ := zap.NewDevelopment()
    transferService := solana.NewTransferService("https://api.testnet.solana.com", logger)
    
    ctx := context.Background()
    
    req := &solana.TransferSOLRequest{
        FromPrivateKey: "your-private-key-base58",
        ToWallet:       "destination-wallet-address",
        Amount:         100_000_000, // 0.1 SOL in lamports
        Memo:           "My transfer",
    }
    
    result, err := transferService.SendSOL(ctx, req)
    if err != nil {
        log.Fatal("Transfer failed:", err)
    }
    
    fmt.Printf("Success! Signature: %s\n", result.Signature)
}
```

### Token Transfer

```go
tokenReq := &solana.TransferTokenRequest{
    FromPrivateKey: "your-private-key-base58",
    ToWallet:       "destination-wallet-address",
    TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV", // EduPro token
    Amount:         1_000_000_000, // 1 token (9 decimals)
    Decimals:       9,
    Memo:           "Token transfer",
}

result, err := transferService.SendToken(ctx, tokenReq)
```

## Important Concepts

### Lamports vs SOL
- 1 SOL = 1,000,000,000 lamports
- Always use lamports for API calls
- Convert: `lamports = sol_amount * 1_000_000_000`

### Token Decimals
- Most SPL tokens use 9 decimals
- EduPro token uses 9 decimals
- To send 1 token: `amount = 1 * 10^decimals`

### Networks

| Network | RPC Endpoint | Use Case |
|---------|-------------|----------|
| Testnet | `https://api.testnet.solana.com` | Testing with realistic conditions |
| Devnet | `https://api.devnet.solana.com` | Fast development and testing |
| Mainnet | `https://api.mainnet-beta.solana.com` | Production (real money!) |

## CLI Commands Reference

### Create Wallet
```bash
go run cmd/transfer/main.go -action create-wallet
```

### Request Airdrop
```bash
go run cmd/transfer/main.go -action airdrop -amount 1.5
```

### Check Balance
```bash
# SOL balance
go run cmd/transfer/main.go -action balance

# Token balance
go run cmd/transfer/main.go -action balance -token-mint TOKEN_MINT_ADDRESS
```

### Send SOL
```bash
go run cmd/transfer/main.go -action send-sol -to WALLET_ADDRESS -amount 0.1 -memo "Optional memo"
```

### Send Tokens
```bash
go run cmd/transfer/main.go -action send-token -to WALLET_ADDRESS -token-mint TOKEN_MINT -amount 1000000000 -memo "Token transfer"
```

### Network Selection
```bash
# Use devnet (faster for testing)
go run cmd/transfer/main.go -network devnet -action balance

# Use testnet (default)
go run cmd/transfer/main.go -network testnet -action balance
```

## Error Handling

Common errors and solutions:

### "Insufficient balance"
- Check your balance: `go run cmd/transfer/main.go -action balance`
- Request airdrop: `go run cmd/transfer/main.go -action airdrop -amount 1.0`

### "Invalid private key"
- Ensure your private key is Base58 encoded
- Check that SOLANA_PRIVATE_KEY environment variable is set correctly

### "Invalid destination wallet"
- Verify the destination wallet address is a valid Solana public key
- Make sure it's Base58 encoded (44 characters)

### "Token account doesn't exist"
- The service automatically creates token accounts if needed
- Ensure you have enough SOL for account creation fees (~0.002 SOL)

## Security Best Practices

1. **Never expose private keys in code**
   - Use environment variables
   - Use secure key management systems in production

2. **Test on testnet/devnet first**
   - Always test transfers before using mainnet
   - Testnet SOL has no value

3. **Validate addresses**
   - Always validate wallet addresses before sending
   - Double-check token mint addresses

4. **Handle errors gracefully**
   - Implement retry logic for network issues
   - Log transaction signatures for tracking

## Integration with Your Backend

### Add to Existing Service

```go
// In your existing Solana service
func (s *Service) TransferSOL(ctx context.Context, fromPrivateKey, toWallet string, amount uint64) (*TransferResult, error) {
    transferService := NewTransferService("https://api.testnet.solana.com", s.logger)
    
    req := &TransferSOLRequest{
        FromPrivateKey: fromPrivateKey,
        ToWallet:       toWallet,
        Amount:         amount,
        Memo:           "EduPro platform transfer",
    }
    
    return transferService.SendSOL(ctx, req)
}
```

### Add HTTP Endpoint

```go
// In your handlers
func (h *SolanaHandler) TransferSOL(w http.ResponseWriter, r *http.Request) {
    var req TransferRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    result, err := h.transferService.SendSOL(r.Context(), &TransferSOLRequest{
        FromPrivateKey: req.PrivateKey,
        ToWallet:       req.ToWallet,
        Amount:         req.Amount,
        Memo:           req.Memo,
    })
    
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(result)
}
```

## Monitoring Transactions

### View on Solana Explorer

- **Testnet**: https://explorer.solana.com/?cluster=testnet
- **Devnet**: https://explorer.solana.com/?cluster=devnet
- **Mainnet**: https://explorer.solana.com/

Search by:
- Transaction signature
- Wallet address
- Token mint address

### Transaction Status

The service waits for confirmation by default. You can also check status manually:

```go
// Check transaction status
status, err := client.GetSignatureStatuses(ctx, true, signature)
```

## Troubleshooting

### Connection Issues
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' https://api.testnet.solana.com
```

### Balance Issues
```bash
# Check if wallet exists and has balance
go run cmd/transfer/main.go -action balance
```

### Transaction Failures
- Check the transaction signature on Solana Explorer
- Look for error messages in the transaction details
- Ensure sufficient balance for fees (~0.000005 SOL per transaction)

## Next Steps

1. **Integrate with your existing backend services**
2. **Add database logging for transactions**
3. **Implement webhook notifications for transaction status**
4. **Add batch transfer capabilities**
5. **Set up monitoring and alerting**

For more advanced features, check out the existing Solana integration in your project:
- `backend/internal/services/solana/`
- `backend/internal/handlers/solana.go`
