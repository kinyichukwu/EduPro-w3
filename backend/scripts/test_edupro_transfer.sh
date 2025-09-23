#!/bin/bash

# EduPro Token Transfer Test Script
# This script demonstrates how to transfer EduPro tokens programmatically

echo "🚀 EduPro Token Transfer Test Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# EduPro token configuration
EDUPRO_MINT="8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"
NETWORK="devnet"

# Check if we're in the backend directory
if [ ! -f "go.mod" ]; then
    echo -e "${RED}Error: Please run this script from the backend directory${NC}"
    exit 1
fi

echo -e "${PURPLE}EduPro Token Details:${NC}"
echo -e "${BLUE}Token Name: EduPro Token (EDUPRO)${NC}"
echo -e "${BLUE}Mint Address: $EDUPRO_MINT${NC}"
echo -e "${BLUE}Network: $NETWORK${NC}"
echo -e "${BLUE}Decimals: 9${NC}"
echo ""

echo -e "${BLUE}Step 1: Creating a new devnet wallet...${NC}"
go run cmd/transfer/main.go -network $NETWORK -action create-wallet

echo ""
echo -e "${YELLOW}Please copy the private key from above and set it as an environment variable:${NC}"
echo -e "${YELLOW}export SOLANA_PRIVATE_KEY=\"your-private-key-here\"${NC}"
echo ""
read -p "Press Enter after setting the SOLANA_PRIVATE_KEY environment variable..."

# Check if private key is set
if [ -z "$SOLANA_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: SOLANA_PRIVATE_KEY environment variable is not set${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Requesting devnet SOL airdrop for transaction fees...${NC}"
go run cmd/transfer/main.go -network $NETWORK -action airdrop -amount 2.0

echo ""
echo -e "${YELLOW}Waiting 10 seconds for airdrop to process...${NC}"
sleep 10

echo -e "${BLUE}Step 3: Checking SOL balance...${NC}"
go run cmd/transfer/main.go -network $NETWORK -action balance

echo ""
echo -e "${BLUE}Step 4: Checking EduPro token balance...${NC}"
go run cmd/transfer/main.go -network $NETWORK -action balance -token-mint $EDUPRO_MINT

echo ""
echo -e "${YELLOW}Note: If you don't have EduPro tokens, you'll need to get some first.${NC}"
echo -e "${YELLOW}You can request them from the platform or mint some for testing.${NC}"

read -p "Do you want to proceed with a test transfer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Skipping transfer test.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 5: Testing EduPro token transfer...${NC}"
echo -e "${YELLOW}Enter destination wallet address (or press Enter for test burn address):${NC}"
read -r DEST_WALLET

if [ -z "$DEST_WALLET" ]; then
    DEST_WALLET="11111111111111111111111111111112"  # System program (burn address)
    echo -e "${YELLOW}Using burn address for testing: $DEST_WALLET${NC}"
fi

echo -e "${YELLOW}Enter amount of EduPro tokens to send (e.g., 10 for 10 EDUPRO):${NC}"
read -r TOKEN_AMOUNT

if [ -z "$TOKEN_AMOUNT" ]; then
    TOKEN_AMOUNT="1"
    echo -e "${YELLOW}Using default amount: 1 EDUPRO${NC}"
fi

# Convert human-readable amount to token units (multiply by 10^9)
TOKEN_UNITS=$(echo "$TOKEN_AMOUNT * 1000000000" | bc)

echo ""
echo -e "${BLUE}Sending $TOKEN_AMOUNT EDUPRO tokens ($TOKEN_UNITS token units) to $DEST_WALLET...${NC}"

go run cmd/transfer/main.go -network $NETWORK -action send-token \
  -to $DEST_WALLET \
  -token-mint $EDUPRO_MINT \
  -amount $TOKEN_UNITS \
  -memo "EduPro token test transfer"

echo ""
echo -e "${BLUE}Step 6: Checking balances after transfer...${NC}"

echo -e "${BLUE}SOL balance:${NC}"
go run cmd/transfer/main.go -network $NETWORK -action balance

echo ""
echo -e "${BLUE}EduPro token balance:${NC}"
go run cmd/transfer/main.go -network $NETWORK -action balance -token-mint $EDUPRO_MINT

echo ""
echo -e "${GREEN}✅ EduPro token transfer test completed!${NC}"
echo ""
echo -e "${PURPLE}📊 Transaction Details:${NC}"
echo -e "${BLUE}• Network: Solana $NETWORK${NC}"
echo -e "${BLUE}• Token: EduPro (EDUPRO)${NC}"
echo -e "${BLUE}• Amount: $TOKEN_AMOUNT EDUPRO ($TOKEN_UNITS token units)${NC}"
echo -e "${BLUE}• Destination: $DEST_WALLET${NC}"
echo ""
echo -e "${YELLOW}🔍 View your transactions on Solana Explorer:${NC}"
echo -e "${YELLOW}https://explorer.solana.com/?cluster=devnet${NC}"
echo ""
echo -e "${BLUE}🔧 Programmatic Usage Example:${NC}"
cat << 'EOF'

// Go code example:
req := &solana.TransferTokenRequest{
    FromPrivateKey: "your-private-key",
    ToWallet:       "destination-wallet",
    TokenMint:      "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV",
    Amount:         1000000000, // 1 EDUPRO token
    Decimals:       9,
    Memo:           "EduPro transfer",
}

result, err := transferService.SendToken(ctx, req)

EOF

echo ""
echo -e "${GREEN}🎓 EduPro Token Integration Complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Integrate with your reward system${NC}"
echo -e "${BLUE}2. Set up automated token distribution${NC}"
echo -e "${BLUE}3. Add token balance checking to your frontend${NC}"
echo -e "${BLUE}4. Implement course purchase with EduPro tokens${NC}"
