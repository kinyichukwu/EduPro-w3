# 🚀 EduPro Solana Integration Architecture

## 📋 **How It Works - Simple Summary**

Your EduPro platform now accepts **crypto payments** using Solana wallets:

### **Payment Flow (4 Steps)**

1. **Connect Wallet**: User connects Phantom/Solflare → `POST /api/wallet/connect`
2. **Generate Payment**: User selects course → Backend creates transaction → `POST /api/payment/generate`
3. **Sign Transaction**: User approves payment in wallet → Wallet signs transaction
4. **Submit & Confirm**: Frontend submits signed tx → `POST /api/payment/submit` → Blockchain confirms

### **What Users Can Do**

- Pay with **SOL, USDC, or PYUSD**
- Connect **Phantom, Solflare, Backpack** wallets
- **Instant payments** (no credit cards needed)
- **Global access** (no geographic restrictions)

### **What You Get**

- **~$0.01 transaction fees** (vs 3% credit card fees)
- **Direct payments** to your wallet
- **No chargebacks** or payment disputes
- **Global reach** without payment processors

---

## 🏗️ **Technical Architecture**

### **Backend (Go)**

```
backend/internal/
├── config/solana.go           # Solana configuration
├── services/solana/service.go # Core blockchain logic
├── handlers/wallet.go         # Wallet API endpoints
├── handlers/payment.go        # Payment API endpoints
└── models/user.go            # Extended with wallet/payment models
```

### **Frontend (React + TypeScript)**

```
frontend/src/
├── dashboard/components/wallet/
│   ├── WalletConnect.tsx      # Wallet connection UI
│   └── PaymentDemo.tsx        # Payment flow demo
├── shared/hooks/
│   ├── useWallet.ts           # Wallet state management
│   └── useSolanaPayment.ts    # Payment flow logic
├── services/solana.ts         # API client for Solana endpoints
└── shared/types/solana/       # TypeScript definitions
```

---

## 🔗 **API Endpoints**

### **Wallet Management**

- `POST /api/wallet/connect` - Connect wallet to user account
- `POST /api/wallet/verify` - Verify wallet ownership with signature
- `GET /api/wallet/list` - Get user's connected wallets
- `DELETE /api/wallet/:id` - Disconnect wallet

### **Payment Processing**

- `POST /api/payment/generate` - Generate unsigned transaction
- `POST /api/payment/submit` - Submit signed transaction
- `GET /api/payment/tokens` - Get supported tokens (SOL, USDC, PYUSD)
- `GET /api/payment/status/:id` - Check payment status

---

## 🗄️ **Database Setup (Supabase)**

Run this in your Supabase SQL Editor:

```sql
-- Create wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL CHECK (token_symbol IN ('SOL', 'USDC', 'PYUSD')),
    transaction_id TEXT UNIQUE, -- Solana signature
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
```

---

## ⚙️ **Environment Variables**

Copy the example files and fill in your actual values:

### **Backend**

```bash
# Copy backend/env.example to backend/.env
cp backend/env.example backend/.env

# Then edit backend/.env with your actual values:
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
SOLANA_RECIPIENT_WALLET=your_actual_wallet_address
GEMINI_API_KEY=your_actual_gemini_key
SUPABASE_URL=your_actual_supabase_url
# ... etc
```

### **Frontend**

```bash
# Copy frontend/env.example to frontend/.env
cp frontend/env.example frontend/.env

# Then edit frontend/.env with your actual values:
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet
VITE_SUPABASE_URL=your_actual_supabase_url
# ... etc
```

---

## 🧪 **Testing**

### **1. Start Both Servers**

```bash
# Backend
cd backend && go run cmd/api/main.go

# Frontend (new terminal)
cd frontend && yarn dev
```

### **2. Test Wallet Connection**

1. Open `http://localhost:5173`
2. Navigate to wallet components
3. Click "Connect Wallet" → Select Phantom
4. Approve connection → Click "Connect to EduPro"

### **3. Test Payment Flow**

1. Use PaymentDemo component
2. Select token (SOL/USDC/PYUSD)
3. Review payment → Sign in wallet
4. Monitor transaction status

---

## 🎯 **Integration with Existing EduPro**

### **Course Purchase Example**

```typescript
// In your course purchase flow
const handlePurchaseCourse = async (courseId: string, price: number) => {
  const paymentConfig = {
    priceId: courseId,
    usdAmount: price,
    supportedTokens: await solanaAPI.getSupportedTokens(),
    userWallet: publicKey,
    onSuccess: (result) => {
      // Grant course access
      // Update user subscription
      // Show success message
    },
    onError: (error) => {
      // Handle payment failure
    },
  };

  const { processPayment } = useSolanaPayment(paymentConfig);
  await processPayment();
};
```

---

## 🚀 **Next Steps**

### **Immediate**

1. ✅ Run Supabase migration script
2. ✅ Set environment variables
3. ✅ Test wallet connection
4. ✅ Test payment flow
5. 🔄 Integrate into course purchase flow

### **Production**

- Switch to mainnet endpoints
- Set up proper recipient wallet
- Add transaction monitoring
- Implement proper error handling

---

**🎉 Your EduPro platform is now Web3-enabled!**
