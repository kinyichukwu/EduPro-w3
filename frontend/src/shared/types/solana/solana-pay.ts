import { PublicKey } from "@solana/web3.js";

// Payment-related types for EduPro integration

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

export interface PaymentStatusResponse {
  purchase_id: string;
  transaction_id: string;
  status: "confirmed" | "pending" | "failed";
  amount: number;
  currency: string;
  created_at: string;
  confirmed_at?: string;
}

export interface SupportedTokensResponse {
  tokens: TokenInfo[];
}

export interface TokenInfo {
  symbol: "SOL" | "USDC" | "PYUSD";
  name: string;
  mint_address: string;
  decimals: number;
}

// Frontend payment state types
export interface PaymentState {
  step: PaymentStep;
  selectedToken: TokenInfo | null;
  amount: number;
  tokenAmount: string;
  transaction: string | null;
  transactionId: string | null;
  error: string | null;
  isLoading: boolean;
  expiresAt: number | null;
}

export type PaymentStep =
  | "select-token"
  | "review-payment"
  | "sign-transaction"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export interface TokenBalance {
  token: TokenInfo;
  balance: number;
  uiAmount: number; // Balance in human-readable format
  hasBalance: boolean;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

// Payment flow configuration
export interface PaymentConfig {
  priceId: string;
  usdAmount: number;
  supportedTokens: TokenInfo[];
  userWallet: PublicKey | null;
  onSuccess: (result: SubmitPaymentResponse) => void;
  onError: (error: PaymentError) => void;
  onCancel: () => void;
}

// Transaction monitoring
export interface TransactionStatus {
  signature: string;
  confirmationStatus: "processed" | "confirmed" | "finalized" | "failed";
  confirmations: number;
  slot?: number;
  blockTime?: number;
  error?: string;
}

// Solana Pay specific types
export interface SolanaPayTransaction {
  transaction: string;
  message: string;
  label?: string;
  memo?: string;
}

// Payment method types
export type PaymentMethod = "traditional" | "solana-pay";

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresWallet: boolean;
}
