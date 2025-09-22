// Solana API service for EduPro integration
import type {
  ConnectWalletRequest,
  ConnectWalletResponse,
  VerifyWalletRequest,
  VerifyWalletResponse,
  WalletListResponse,
  GeneratePaymentRequest,
  GeneratePaymentResponse,
  SubmitPaymentRequest,
  SubmitPaymentResponse,
  SupportedTokensResponse,
  TokenInfo,
} from "../shared/types/solana/wallet";
import type { PaymentStatusResponse } from "../shared/types/solana/solana-pay";
import type { SwapRequest, SwapResponse, SwapQuoteResponse, SwapExecuteResponse } from "../shared/types/solana/swap";
import { apiService } from "./index";

class SolanaAPI {
  // Wallet endpoints
  async connectWallet(
    request: ConnectWalletRequest
  ): Promise<ConnectWalletResponse> {
    const response = await apiService.connectWallet(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async verifyWallet(
    request: VerifyWalletRequest
  ): Promise<VerifyWalletResponse> {
    const response = await apiService.verifyWallet(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getWallets(): Promise<WalletListResponse> {
    const response = await apiService.getWallets();
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async disconnectWallet(walletId: string): Promise<void> {
    const response = await apiService.disconnectWallet(walletId);
    if (response.error) throw new Error(response.error);
  }

  // Payment endpoints
  async generatePayment(
    request: GeneratePaymentRequest
  ): Promise<GeneratePaymentResponse> {
    const response = await apiService.generatePayment(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async submitPayment(
    request: SubmitPaymentRequest
  ): Promise<SubmitPaymentResponse> {
    const response = await apiService.submitPayment(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getSupportedTokens(): Promise<TokenInfo[]> {
    const response = await apiService.getSupportedTokens();
    if (response.error) throw new Error(response.error);
    const tokenResponse = response.data! as SupportedTokensResponse;
    return tokenResponse.tokens;
  }

  async getPaymentStatus(
    transactionId: string
  ): Promise<PaymentStatusResponse> {
    const response = await apiService.getPaymentStatus(transactionId);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Deduct SOL from user wallet to EduPro
  async deductFromWallet(request: {
    wallet_address: string;
    amount: number;
    token_mint: string;
  }): Promise<any> {
    const response = await apiService.deductFromWallet(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Swap endpoints
  async getSwapQuote(request: SwapRequest): Promise<SwapQuoteResponse> {
    const response = await apiService.getSwapQuote(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async executeSwap(request: SwapRequest): Promise<SwapExecuteResponse> {
    const response = await apiService.executeSwap(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Wallet balance endpoints
  async getWalletBalance(address: string): Promise<any> {
    const response = await apiService.getWalletBalance(address);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getTokenBalance(address: string, mintAddress: string): Promise<any> {
    const response = await apiService.getTokenBalance(address, mintAddress);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getEduTokenBalance(address: string): Promise<any> {
    const response = await apiService.getEduTokenBalance(address);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }
}

export const solanaAPI = new SolanaAPI();
