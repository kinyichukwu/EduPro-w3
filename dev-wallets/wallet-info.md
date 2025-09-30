# Development Wallet Information

## Available Wallets

### EduPro Admin Wallet
- **Public Key**: `2L19sMkMXSH1vWYwi9BesdC2gAeCvLdJeSop7oMbMWLU`
- **Keypair File**: `dev-wallets/EduPro-Admin-Wallet.json`
- **Network**: Devnet
- **Initial Balance**: 2 SOL

#### Seed Phrase (for recovery)
```
pear smoke drive acoustic pave resist thrive man imitate text armed tree
```

### EduPro Test Wallet (NEW)
- **Public Key**: `5UdMvha3y4pevngjaxgktWkCVUizTwheHu2Ch7LgVYUx`
- **Keypair File**: `dev-wallets/EduPro-Test-Wallet.json`
- **Network**: Devnet
- **Current Balance**: 5 SOL

#### Seed Phrase (for recovery)
```
outside half pair family unaware gift marble sadness click faith muscle army
```

## Usage
These wallets are available for Solana CLI operations on devnet. You can switch between them and use them for:
- Testing Solana programs
- SPL token operations
- Development and testing of the EduPro Solana integration
- Testing swap functionality
- Multi-wallet testing scenarios

## Commands

### Switch between wallets
- Use Admin wallet: `solana config set --keypair dev-wallets/EduPro-Admin-Wallet.json`
- Use Test wallet: `solana config set --keypair dev-wallets/EduPro-Test-Wallet.json`
- Use User1 wallet: `solana config set --keypair dev-wallets/EduPro-User1-Wallet.json`

### General commands
- Check balance: `solana balance`
- Get wallet address: `solana address`
- Request more SOL: `solana airdrop 2`
- Check current config: `solana config get`

## Security Note
This is a development wallet only. Never use this wallet or seed phrase on mainnet or with real funds.


You can add the private keys to your chome extension of your solana wallet to test stuff out.