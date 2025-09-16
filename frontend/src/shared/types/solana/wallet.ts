// Wallet-related types for EduPro integration

export interface Wallet {
  id: string;
  address: string;
  is_verified: boolean;
  is_primary: boolean;
  verified_at?: string;
  created_at: string;
}

export interface WalletListResponse {
  wallets: Wallet[];
  count: number;
}

export interface ConnectWalletRequest {
  address: string;
}

export interface ConnectWalletResponse {
  wallet: Wallet;
  message: string;
  verify_message: string;
}

export interface VerifyWalletRequest {
  wallet_id: string;
  message: string;
  signature: string;
}

export interface VerifyWalletResponse {
  wallet: Wallet;
  message: string;
}

export interface WalletError {
  error: string;
  message?: string;
}

export interface WalletConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
}

// Payment-related types that were in wallet.ts
export interface GeneratePaymentRequest {
  price_id: string;
  token: "SOL" | "USDC" | "PYUSD";
  user_wallet: string;
}

export interface GeneratePaymentResponse {
  transaction: string; // Base64 encoded unsigned transaction
  amount: number; // USD amount
  token_amount: string; // Token amount in smallest units
  token_symbol: "SOL" | "USDC" | "PYUSD";
  expires_at: number; // Unix timestamp
  instructions: string; // Human-readable instructions
}

export interface SubmitPaymentRequest {
  signed_transaction: string;
  price_id: string;
}

export interface SubmitPaymentResponse {
  purchase_id: string;
  transaction_id: string; // Solana signature
  status: "confirmed" | "pending" | "failed";
  amount: number;
  currency: string;
  processed_at: string;
  message: string;
}

export interface SupportedTokensResponse {
  tokens: TokenInfo[];
}

export interface TokenInfo {
  symbol: "SOL" | "USDC" | "PYUSD";
  name: string;
  mint: string;
  decimals: number;
}
