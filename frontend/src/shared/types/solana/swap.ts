// Solana swap types for EduPro token swaps
export interface SwapRequest {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  userWallet: string;
}

export interface SwapQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  fixedRate: number;
  swapType: string;
  isSOLToEduPro: boolean;
  userWallet: string;
  orgWallet: string;
  message: string;
  expiresAt: number;
}

export interface SwapExecuteResponse {
  swapId: string;
  status: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  fixedRate: number;
  userWallet: string;
  orgWallet: string;
  solTransaction: string;
  edupoTransaction: string;
  message: string;
  expiresAt: number;
}

export interface SignSwapTransactionRequest {
  swapId: string;
  transaction: string;
  userWallet: string;
  signature: string;
}

export interface SubmitSwapTransactionRequest {
  swapId: string;
  transaction: string;
  signature: string;
  userWallet: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number; // smallest unit of input (lamports for SOL, 1e9 for EDU)
}

export interface SwapStatus {
  swapId: string;
  status: string; // pending, signed, submitted, completed, failed
  userWallet: string;
  orgWallet: string;
  inputAmount: number;
  outputAmount: number;
  fixedRate: number;
  solTransaction?: string;
  edupoTransaction?: string;
  solSignature?: string;
  edupoSignature?: string;
  createdAt: string;
  expiresAt: number;
  completedAt?: string;
}

export interface WalletBalance {
  wallet_address: string;
  balance_lamports: number;
  balance_sol: number;
}

export interface TokenBalance {
  wallet_address: string;
  mint_address: string;
  balance: number;
}

export interface EduTokenBalance {
  wallet_address: string;
  edutoken_balance: number;
}
