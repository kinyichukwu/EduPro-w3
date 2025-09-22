# SOL to EduPro Token Swap API Documentation

## Overview

This document describes the fixed-price swap endpoints for exchanging SOL and EduPro tokens. The system uses a fixed exchange rate of **1 SOL = 1000 EduPro tokens**.

## Base URL
```
http://localhost:8080/api/solana/swap
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Token Addresses
- **SOL**: `So11111111111111111111111111111111111111112`
- **EduPro Token**: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`

## Endpoints

### 1. Get Swap Quote

**Endpoint:** `POST /api/solana/swap/quote`

**Description:** Get a quote for swapping SOL to EduPro tokens or vice versa.

#### Request Body

```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
  "amount": 1000000000,
  "slippageBps": 100,
  "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
}
```

#### Parameters
- `inputMint` (string, required): The mint address of the input token
- `outputMint` (string, required): The mint address of the output token
- `amount` (number, required): Amount in smallest unit (lamports for SOL, token units for EduPro)
- `slippageBps` (number, required): Slippage tolerance in basis points (100 = 1%)
- `userWallet` (string, required): User's wallet address

#### Response

```json
{
  "success": true,
  "data": {
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "inAmount": "1000000000",
    "outAmount": "1000000000000",
    "fixedRate": 1000,
    "swapType": "fixed_price",
    "isSOLToEduPro": true,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME",
    "orgWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME",
    "message": "This is a fixed-price swap. SOL will be sent to organization wallet and EduPro tokens will be sent to your wallet.",
    "expiresAt": 1758534880
  }
}
```

### 2. Execute Swap

**Endpoint:** `POST /api/solana/swap/execute`

**Description:** Execute the swap transaction.

#### Request Body

```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
  "amount": 1000000000,
  "slippageBps": 100,
  "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "swapId": "swap_1758534002",
    "status": "pending",
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "inAmount": "1000000000",
    "outAmount": "1000000000000",
    "fixedRate": 1000,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME",
    "orgWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME",
    "solTransaction": "placeholder_sol_transaction_base64",
    "edupoTransaction": "placeholder_edupo_transaction_base64",
    "message": "Sign and submit both transactions to complete the swap. SOL will be sent to organization wallet and EduPro tokens will be sent to your wallet.",
    "expiresAt": 1758534902
  }
}
```

## Usage Examples

### Example 1: Swap 1 SOL to EduPro Tokens

#### Step 1: Get Quote
```bash
curl -X POST http://localhost:8080/api/solana/swap/quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "amount": 1000000000,
    "slippageBps": 100,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
  }'
```

#### Step 2: Execute Swap
```bash
curl -X POST http://localhost:8080/api/solana/swap/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "amount": 1000000000,
    "slippageBps": 100,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
  }'
```

### Example 2: Swap 1000 EduPro Tokens to SOL

#### Step 1: Get Quote
```bash
curl -X POST http://localhost:8080/api/solana/swap/quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "inputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "outputMint": "So11111111111111111111111111111111111111112",
    "amount": 1000000000000,
    "slippageBps": 100,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
  }'
```

#### Step 2: Execute Swap
```bash
curl -X POST http://localhost:8080/api/solana/swap/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "inputMint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "outputMint": "So11111111111111111111111111111111111111112",
    "amount": 1000000000000,
    "slippageBps": 100,
    "userWallet": "5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME"
  }'
```

## Amount Conversion Guide

### SOL Amounts
- **1 SOL** = `1000000000` lamports
- **0.1 SOL** = `100000000` lamports
- **0.01 SOL** = `10000000` lamports

### EduPro Token Amounts
- **1000 EduPro tokens** = `1000000000000` token units (9 decimals)
- **100 EduPro tokens** = `100000000000` token units
- **10 EduPro tokens** = `10000000000` token units

## Fixed Exchange Rate

The system uses a fixed exchange rate:
- **1 SOL = 1000 EduPro tokens**
- **1000 EduPro tokens = 1 SOL**

## Error Responses

### Invalid Token Pair
```json
{
  "success": false,
  "error": "Only SOL to EduPro token swaps are supported"
}
```

### Invalid Request
```json
{
  "success": false,
  "error": "Invalid request body"
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Invalid token format"
}
```

## Frontend Integration Notes

1. **Always get a quote first** before executing a swap to show users the expected output amount
2. **Handle expiration times** - quotes expire after 15 minutes
3. **Display the fixed rate** prominently in your UI
4. **Show both transactions** - users need to sign both SOL transfer and EduPro token transfer
5. **Use the `isSOLToEduPro` flag** to determine swap direction for UI display
6. **Convert amounts properly** - remember that amounts are in smallest units (lamports/token units)

## Transaction Flow

1. User requests a quote
2. System calculates fixed-rate exchange
3. User confirms the swap
4. System generates two transactions:
   - SOL transfer from user to organization wallet
   - EduPro token transfer from organization to user wallet
5. User signs and submits both transactions
6. Swap is completed

## Testing

Use the test token generation endpoint to get a valid JWT token:
```bash
curl -X POST http://localhost:8080/api/test/generate-token \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
