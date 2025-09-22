// Solana swap types for Jupiter integration
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

export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  priorityFee: number;
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
