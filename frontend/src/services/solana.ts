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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

class SolanaAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Wallet endpoints
  async connectWallet(
    request: ConnectWalletRequest
  ): Promise<ConnectWalletResponse> {
    return this.request<ConnectWalletResponse>("/wallet/connect", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async verifyWallet(
    request: VerifyWalletRequest
  ): Promise<VerifyWalletResponse> {
    return this.request<VerifyWalletResponse>("/wallet/verify", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getWallets(): Promise<WalletListResponse> {
    return this.request<WalletListResponse>("/wallet/list");
  }

  async disconnectWallet(walletId: string): Promise<void> {
    return this.request<void>(`/wallet/${walletId}`, {
      method: "DELETE",
    });
  }

  // Payment endpoints
  async generatePayment(
    request: GeneratePaymentRequest
  ): Promise<GeneratePaymentResponse> {
    return this.request<GeneratePaymentResponse>("/payment/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitPayment(
    request: SubmitPaymentRequest
  ): Promise<SubmitPaymentResponse> {
    return this.request<SubmitPaymentResponse>("/payment/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
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
