# EDUPRO Token Setup Guide

## Your Token Details
- **Token Address**: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`
- **Network**: Solana Devnet
- **Name**: EDUPRO
- **Symbol**: EDUPRO
- **Decimals**: 9
- **Supply**: 1,000,000 EDUPRO

## Steps to Add Token Metadata

### 1. Create GitHub Repository for Assets
1. Go to GitHub and create a new repository called `edupro-assets`
2. Make it public
3. Upload the `edupro-logo.png` file to the repository
4. Upload `edupro-token-metadata.json` and rename it to `metadata.json`

### 2. Update Token Metadata URI
After uploading the files to GitHub, run the update script:
```bash
./update-token-metadata.sh
```

This will update your token with:
- Name: EDUPRO
- Symbol: EDUPRO  
- Metadata URI: https://raw.githubusercontent.com/kinyichukwu/edupro-assets/main/metadata.json

### 3. Register Token in Solana Token Registry
To make your token appear in wallets with metadata:

1. Fork the Solana Token List repository: https://github.com/solana-labs/token-list
2. Add your token to `src/tokens/solana.tokenlist.json`:

```json
{
  "chainId": 103,
  "address": "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
  "symbol": "EDUPRO",
  "name": "EDUPRO",
  "decimals": 9,
  "logoURI": "https://raw.githubusercontent.com/kinyichukwu/edupro-assets/main/edupro-logo.png",
  "tags": ["utility-token", "education"]
}
```

3. Create a pull request

### 4. For Mainnet (Later)
When you deploy to mainnet:
1. Create the same token on mainnet
2. Update the chainId to 101 in the token list
3. Update your backend environment variables

## Current Configuration
Your backend is already configured with:
- Token Address: `8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV`
- Network: Devnet
- All Solana integration endpoints ready

## Next Steps for Frontend
1. Install Solana wallet adapters (we'll retry this)
2. Implement wallet connection
3. Add token display with metadata
4. Implement payment flows
