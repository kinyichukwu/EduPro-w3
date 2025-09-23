#!/bin/bash

# Solana Transfer Test Script
# This script demonstrates how to use the transfer CLI tool

echo "🚀 Solana Transfer Test Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "go.mod" ]; then
    echo -e "${RED}Error: Please run this script from the backend directory${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating a new testnet wallet...${NC}"
go run cmd/transfer/main.go -action create-wallet

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

echo -e "${BLUE}Step 2: Requesting testnet airdrop...${NC}"
go run cmd/transfer/main.go -action airdrop -amount 2.0

echo ""
echo -e "${YELLOW}Waiting 10 seconds for airdrop to process...${NC}"
sleep 10

echo -e "${BLUE}Step 3: Checking wallet balance...${NC}"
go run cmd/transfer/main.go -action balance

echo ""
echo -e "${BLUE}Step 4: Testing SOL transfer...${NC}"
echo -e "${YELLOW}Sending 0.1 SOL to a test address (this will burn the SOL)...${NC}"
go run cmd/transfer/main.go -action send-sol -to 11111111111111111111111111111112 -amount 0.1 -memo "Test transfer from script"

echo ""
echo -e "${BLUE}Step 5: Checking balance after transfer...${NC}"
go run cmd/transfer/main.go -action balance

echo ""
echo -e "${GREEN}✅ Transfer test completed!${NC}"
echo -e "${YELLOW}You can view your transactions on Solana Explorer:${NC}"
echo -e "${YELLOW}https://explorer.solana.com/?cluster=testnet${NC}"
echo ""
echo -e "${BLUE}To test token transfers, you would need to:${NC}"
echo -e "${BLUE}1. Have tokens in your wallet${NC}"
echo -e "${BLUE}2. Use: go run cmd/transfer/main.go -action send-token -to WALLET -token-mint MINT -amount AMOUNT${NC}"
