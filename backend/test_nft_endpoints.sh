#!/bin/bash

# EduPro NFT API Testing Script
# This script demonstrates how to test the NFT and EduPro token endpoints

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api"

echo "🚀 EduPro NFT API Testing Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    
    echo -e "${BLUE}📡 $method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        if [ -n "$auth_header" ]; then
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_header" \
                -d "$data" | jq .
        else
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" | jq .
        fi
    else
        if [ -n "$auth_header" ]; then
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Authorization: Bearer $auth_header" | jq .
        else
            curl -s -X $method "$API_BASE$endpoint" | jq .
        fi
    fi
    echo ""
}

# Check if server is running
echo -e "${YELLOW}🔍 Checking if server is running...${NC}"
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start the server first:${NC}"
    echo "   cd backend && make dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Get EduPro Token Information (Public)
echo -e "${YELLOW}📋 Test 1: Get EduPro Token Information${NC}"
make_request "GET" "/edupo-tokens/info"
echo ""

# Test 2: Get Supported Tokens (Requires Auth)
echo -e "${YELLOW}📋 Test 2: Get Supported Tokens (Requires Authentication)${NC}"
make_request "GET" "/payment/tokens" "" "test-token"
echo ""

# Test 3: Buy EduPro Tokens (Requires Auth)
echo -e "${YELLOW}📋 Test 3: Buy EduPro Tokens (Requires Authentication)${NC}"
buy_tokens_data='{
  "amount": 100,
  "user_wallet": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "payment_token": "SOL"
}'
make_request "POST" "/edupo-tokens/buy" "$buy_tokens_data" "test-token"
echo ""

# Test 4: Create Membership NFT (Requires Auth)
echo -e "${YELLOW}📋 Test 4: Create Membership NFT (Requires Authentication)${NC}"
membership_nft_data='{
  "user_email": "test@example.com",
  "wallet_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
}'
make_request "POST" "/nft/membership" "$membership_nft_data" "test-token"
echo ""

# Test 5: Create Course NFT Collection (Requires Auth)
echo -e "${YELLOW}📋 Test 5: Create Course NFT Collection (Requires Authentication)${NC}"
course_collection_data='{
  "course_id": "123e4567-e89b-12d3-a456-426614174000",
  "course_name": "Advanced Solana Development",
  "course_description": "Learn advanced Solana concepts and NFT development",
  "creator_email": "creator@example.com",
  "creator_wallet_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "price_edupo_tokens": 100,
  "max_supply": 1000,
  "course_image_url": "https://example.com/course-image.jpg"
}'
make_request "POST" "/nft/course-collection" "$course_collection_data" "test-token"
echo ""

# Test 6: Purchase Course NFT (Requires Auth)
echo -e "${YELLOW}📋 Test 6: Purchase Course NFT (Requires Authentication)${NC}"
purchase_nft_data='{
  "collection_id": "123e4567-e89b-12d3-a456-426614174001",
  "buyer_email": "buyer@example.com",
  "buyer_wallet_address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "payment_transaction_signature": "test_signature_123"
}'
make_request "POST" "/nft/course/purchase" "$purchase_nft_data" "test-token"
echo ""

# Test 7: Get User NFTs (Requires Auth)
echo -e "${YELLOW}📋 Test 7: Get User NFTs (Requires Authentication)${NC}"
make_request "GET" "/nft/user/test@example.com" "" "test-token"
echo ""

# Test 8: Get Course NFT Collection Details (Requires Auth)
echo -e "${YELLOW}📋 Test 8: Get Course NFT Collection Details (Requires Authentication)${NC}"
make_request "GET" "/nft/course-collection/123e4567-e89b-12d3-a456-426614174001" "" "test-token"
echo ""

echo -e "${GREEN}🎉 Testing Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Notes:${NC}"
echo "• All endpoints except /edupo-tokens/info require JWT authentication"
echo "• Replace 'test-token' with a real JWT token for actual testing"
echo "• The server must be running on localhost:8080"
echo "• Some endpoints may return errors if the database is not properly set up"
echo ""
echo -e "${BLUE}🔗 For more information, see: backend/NFT_API_DOCUMENTATION.md${NC}"
