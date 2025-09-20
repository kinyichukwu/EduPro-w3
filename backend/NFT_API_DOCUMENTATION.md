# EduPro NFT API Documentation

## Overview
This document outlines the NFT and tokenomics API endpoints for the EduPro platform. The system supports:
- **Membership NFTs**: Automatically minted for new users
- **Course NFT Collections**: Created by course creators
- **Course NFTs**: Purchased by students using EduPro coins
- **EduPro Coin**: Native platform token for all NFT transactions

## Authentication
All NFT endpoints require JWT authentication. Include the token in the header:
```
Authorization: Bearer <jwt_token>
```

---

## 🪙 EduPro Coin Endpoints

### 1. Get Supported Tokens
**Endpoint**: `GET /api/payment/tokens`

**Description**: Get list of supported tokens including EduPro coin.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "mint": "So11111111111111111111111111111111111111112",
      "decimals": 9
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "decimals": 6
    },
    {
      "symbol": "PYUSD",
      "name": "PayPal USD",
      "mint": "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
      "decimals": 6
    },
    {
      "symbol": "EDUPRO",
      "name": "EduPro Token",
      "mint": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
      "decimals": 9
    }
  ]
}
```

### 2. Buy EduPro Tokens
**Endpoint**: `POST /api/edupo-tokens/buy`

**Description**: Generate a transaction to buy EduPro tokens using SOL, USDC, or PYUSD.

**Request Body**:
```json
{
  "amount": 100,
  "user_wallet": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "payment_token": "SOL"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "amount": 100,
    "payment_token": "SOL",
    "payment_amount": 10000,
    "user_wallet": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "transaction": "base64_encoded_transaction",
    "expires_at": 1704067200,
    "instructions": "Sign and submit this transaction to purchase EduPro tokens. The tokens will be sent to your wallet address."
  }
}
```

### 3. Get EduPro Token Information
**Endpoint**: `GET /api/edupo-tokens/info`

**Description**: Get information about the EduPro token including current price and supply.

**Response**:
```json
{
  "success": true,
  "data": {
    "symbol": "EDUPRO",
    "name": "EduPro Token",
    "mint_address": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    "decimals": 9,
    "current_price_usd": 0.01,
    "total_supply": "1000000000",
    "circulating_supply": "100000000",
    "market_cap_usd": "1000000",
    "description": "EduPro platform's native utility token for course purchases and NFT transactions"
  }
}
```

---

## 🎫 Membership NFT Endpoints

### 4. Automatic Membership NFT (Wallet Verification)
**Endpoint**: `POST /api/wallet/verify`

**Description**: When a user verifies their wallet, they automatically get a membership NFT minted.

**Request Body**:
```json
{
  "wallet_id": "uuid",
  "message": "signature_message",
  "signature": "base64_signature"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "uuid",
      "user_id": "uuid",
      "wallet_address": "SolanaWalletAddress",
      "is_verified": true,
      "verified_at": "2024-01-01T12:00:00Z"
    },
    "membership_nft": {
      "nft_id": "uuid",
      "user_email": "user@example.com",
      "wallet_address": "SolanaWalletAddress",
      "nft_mint_address": "GeneratedMintAddress",
      "nft_metadata_uri": "https://ipfs.io/ipfs/...",
      "transaction": "base64_encoded_transaction",
      "status": "pending"
    },
    "message": "Wallet verified successfully"
  }
}
```

### 5. Manual Membership NFT Creation
**Endpoint**: `POST /api/nft/membership`

**Description**: Manually create a membership NFT for a user.

**Request Body**:
```json
{
  "user_email": "user@example.com",
  "wallet_address": "SolanaWalletAddress"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "user_email": "user@example.com",
    "wallet_address": "SolanaWalletAddress",
    "nft_mint_address": "GeneratedMintAddress",
    "nft_metadata_uri": "https://ipfs.io/ipfs/...",
    "transaction": "base64_encoded_transaction",
    "status": "pending"
  }
}
```

---

## 📚 Course NFT Collection Endpoints

### 6. Create Course NFT Collection
**Endpoint**: `POST /api/nft/course-collection`

**Description**: Creator creates an NFT collection for their course (requires EduPro coins).

**Request Body**:
```json
{
  "course_id": "uuid",
  "course_name": "Advanced Solana Development",
  "course_description": "Learn advanced Solana concepts",
  "creator_email": "creator@example.com",
  "creator_wallet_address": "CreatorWalletAddress",
  "price_edupo_tokens": 100,
  "max_supply": 1000,
  "course_image_url": "https://example.com/course-image.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "collection_id": "uuid",
    "course_id": "uuid",
    "course_name": "Advanced Solana Development",
    "collection_mint_address": "GeneratedCollectionMint",
    "collection_metadata_uri": "https://ipfs.io/ipfs/...",
    "creator_email": "creator@example.com",
    "price_edupo_tokens": 100,
    "max_supply": 1000,
    "current_supply": 0,
    "transaction": "base64_encoded_transaction",
    "status": "pending"
  }
}
```

### 7. Get Course NFT Collection Details
**Endpoint**: `GET /api/nft/course-collection/{collection_id}`

**Description**: Get details of a specific course NFT collection.

**Response**:
```json
{
  "success": true,
  "data": {
    "collection_id": "uuid",
    "course_id": "uuid",
    "course_name": "Advanced Solana Development",
    "collection_mint_address": "CollectionMintAddress",
    "creator_email": "creator@example.com",
    "price_edupo_tokens": 100,
    "max_supply": 1000,
    "current_supply": 45,
    "status": "active"
  }
}
```

### 8. Get Course NFT Collection by Course ID
**Endpoint**: `POST /api/nft/course-collection/details`

**Description**: Get course NFT collection details by course ID.

**Request Body**:
```json
{
  "course_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "collection_id": "uuid",
    "course_id": "uuid",
    "course_name": "Advanced Solana Development",
    "collection_mint_address": "CollectionMintAddress",
    "creator_email": "creator@example.com",
    "price_edupo_tokens": 100,
    "max_supply": 1000,
    "current_supply": 45,
    "status": "active"
  }
}
```

---

## 🎓 Course NFT Purchase Endpoints

### 9. Purchase Course NFT
**Endpoint**: `POST /api/nft/course/purchase`

**Description**: User buys a course NFT using EduPro coins.

**Request Body**:
```json
{
  "collection_id": "uuid",
  "buyer_email": "buyer@example.com",
  "buyer_wallet_address": "BuyerWalletAddress",
  "payment_transaction_signature": "TransactionSignature"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "collection_id": "uuid",
    "course_name": "Advanced Solana Development",
    "nft_mint_address": "GeneratedNFTMint",
    "nft_metadata_uri": "https://ipfs.io/ipfs/...",
    "buyer_email": "buyer@example.com",
    "buyer_wallet_address": "BuyerWalletAddress",
    "price_paid_edupo_tokens": 100,
    "transaction": "base64_encoded_transaction",
    "status": "pending"
  }
}
```

---

## 👤 User NFT Management Endpoints

### 10. Get User's NFTs by Email
**Endpoint**: `GET /api/nft/user/{email}`

**Description**: Get all NFTs owned by a user (membership + course NFTs).

**Response**:
```json
{
  "success": true,
  "data": {
    "user_email": "user@example.com",
    "membership_nft": {
      "nft_id": "uuid",
      "nft_mint_address": "MembershipMintAddress",
      "nft_metadata_uri": "https://ipfs.io/ipfs/...",
      "status": "minted",
      "created_at": "2024-01-01T12:00:00Z"
    },
    "course_nfts": [
      {
        "nft_id": "uuid",
        "collection_id": "uuid",
        "course_name": "Advanced Solana Development",
        "nft_mint_address": "CourseNFTMintAddress",
        "nft_metadata_uri": "https://ipfs.io/ipfs/...",
        "status": "minted",
        "purchased_at": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### 11. Get User's NFTs (POST)
**Endpoint**: `POST /api/nft/user`

**Description**: Get user's NFTs using POST method.

**Request Body**:
```json
{
  "user_email": "user@example.com"
}
```

**Response**: Same as GET endpoint above.

### 12. Transfer NFT
**Endpoint**: `POST /api/nft/transfer`

**Description**: Transfer an NFT to another user.

**Request Body**:
```json
{
  "nft_mint_address": "NFTMintAddress",
  "from_email": "sender@example.com",
  "to_email": "receiver@example.com",
  "to_wallet_address": "ReceiverWalletAddress"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transfer_id": "uuid",
    "nft_mint_address": "NFTMintAddress",
    "from_email": "sender@example.com",
    "to_email": "receiver@example.com",
    "to_wallet_address": "ReceiverWalletAddress",
    "transaction": "base64_encoded_transaction",
    "status": "pending"
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: New User Signup Flow
1. **Connect Wallet**: `POST /api/wallet/connect`
2. **Verify Wallet**: `POST /api/wallet/verify` → **Automatically gets Membership NFT**
3. **Check NFTs**: `GET /api/nft/user/{email}`

### Scenario 2: Creator Creates Course
1. **Buy EduPro Tokens**: `POST /api/edupo-tokens/buy`
2. **Create Course Collection**: `POST /api/nft/course-collection`
3. **Check Collection**: `GET /api/nft/course-collection/{collection_id}`

### Scenario 3: Student Buys Course
1. **Buy EduPro Tokens**: `POST /api/edupo-tokens/buy`
2. **Purchase Course NFT**: `POST /api/nft/course/purchase`
3. **Check User NFTs**: `GET /api/nft/user/{email}`

### Scenario 4: Check All User Assets
1. **Get User NFTs**: `GET /api/nft/user/{email}`
2. **Get Supported Tokens**: `GET /api/payment/tokens`

---

## 📝 Important Notes

### EduPro Coin Details
- **Token Address**: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`
- **Mint Authority**: `5dKpAVwujVwfyXX9EW2mXh5eQ62mWrNhupdLcpjzwGME`
- **Decimals**: 9
- **Network**: Solana Devnet (for testing)

### NFT Features
- **Membership NFTs**: Automatically minted when wallet is verified
- **Course NFTs**: Must be purchased with EduPro coins
- **All transactions**: Return base64-encoded Solana transactions that need to be signed and submitted
- **Metadata**: Stored on IPFS for decentralization
- **On-chain**: All NFTs are real Solana NFTs using Metaplex standard

### Transaction Flow
1. **Generate Transaction**: API returns base64-encoded transaction
2. **Sign Transaction**: Frontend signs with user's wallet
3. **Submit Transaction**: Send signed transaction to Solana network
4. **Verify**: Check transaction status on Solana explorer

### Error Responses
All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

---

## 🔗 Useful Links
- **Solana Explorer**: https://explorer.solana.com/
- **Metaplex Documentation**: https://docs.metaplex.com/
- **IPFS Gateway**: https://ipfs.io/ipfs/

---

## 🚀 Getting Started
1. Start the backend server: `make dev`
2. Test with the endpoints above
3. Use Solana devnet for testing
4. Check transactions on Solana Explorer

For questions or issues, contact the development team.
