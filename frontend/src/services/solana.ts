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
import { supabase } from "../lib/supabaseClient";

const API_BASE_URL =
  import.meta.env.VITE_APP_SERVER_URL || "http://localhost:8080/api";

class SolanaAPI {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No authentication token found");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Solana API request failed:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
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
