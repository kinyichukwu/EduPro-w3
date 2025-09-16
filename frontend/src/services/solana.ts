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
}

export const solanaAPI = new SolanaAPI();
