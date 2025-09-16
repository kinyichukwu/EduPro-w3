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
  private async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: object
  ): Promise<T> {
    try {
      switch (method.toUpperCase()) {
        case "GET":
          return await apiService.get<T>(endpoint);
        case "POST":
          return await apiService.post<T>(endpoint, { body });
        case "PUT":
          return await apiService.put<T>(endpoint, { body });
        case "DELETE":
          return await apiService.delete<T>(endpoint);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      console.error("Solana API request failed:", error);
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred");
    }
  }

  // Wallet endpoints
  async connectWallet(
    request: ConnectWalletRequest
  ): Promise<ConnectWalletResponse> {
    return this.request<ConnectWalletResponse>(
      "/wallet/connect",
      "POST",
      request
    );
  }

  async verifyWallet(
    request: VerifyWalletRequest
  ): Promise<VerifyWalletResponse> {
    return this.request<VerifyWalletResponse>(
      "/wallet/verify",
      "POST",
      request
    );
  }

  async getWallets(): Promise<WalletListResponse> {
    return this.request<WalletListResponse>("/wallet/list");
  }

  async disconnectWallet(walletId: string): Promise<void> {
    return this.request<void>(`/wallet/${walletId}`, "DELETE");
  }

  // Payment endpoints
  async generatePayment(
    request: GeneratePaymentRequest
  ): Promise<GeneratePaymentResponse> {
    return this.request<GeneratePaymentResponse>(
      "/payment/generate",
      "POST",
      request
    );
  }

  async submitPayment(
    request: SubmitPaymentRequest
  ): Promise<SubmitPaymentResponse> {
    return this.request<SubmitPaymentResponse>(
      "/payment/submit",
      "POST",
      request
    );
  }

  async getSupportedTokens(): Promise<TokenInfo[]> {
    const response = await this.request<SupportedTokensResponse>(
      "/payment/tokens"
    );
    return response.tokens;
  }

  async getPaymentStatus(
    transactionId: string
  ): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(
      `/payment/status/${transactionId}`
    );
  }
}

export const solanaAPI = new SolanaAPI();
