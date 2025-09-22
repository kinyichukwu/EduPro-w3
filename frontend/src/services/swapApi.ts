// Swap API service that uses test JWT tokens
import type {
  SwapRequest,
  SwapExecuteResponse,
  SignSwapTransactionRequest,
  SubmitSwapTransactionRequest,
  SwapStatus,
} from "../shared/types/solana/swap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class SwapApiService {
  private async getTestToken(): Promise<string> {
    try {
      console.log("Swap API: Requesting test token from:", `${API_BASE_URL}/test/generate-token`);
      const response = await fetch(`${API_BASE_URL}/test/generate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      console.log("Swap API: Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Swap API: HTTP error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Swap API: Token response received:", { success: data.success, hasData: !!data.data });
      
      if (data.success && data.data?.access_token) {
        console.log("Swap API: Token extracted successfully");
        return data.data.access_token;
      }
      
      console.error("Token generation failed:", data);
      throw new Error("Failed to get test token");
    } catch (error) {
      console.error("Failed to get test token:", error);
      throw new Error("Authentication failed");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getTestToken();
      console.log("Swap API: Got token, making request to", endpoint);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Handle backend APIResponse wrapper
      if (data && typeof data === "object" && "success" in data) {
        if (data.success) {
          return { data: data.data };
        } else {
          return { error: data.error || "API request failed" };
        }
      }

      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getSwapQuote(request: SwapRequest): Promise<ApiResponse<SwapExecuteResponse>> {
    return this.request<SwapExecuteResponse>("/solana/swap/quote", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async executeSwap(request: SwapRequest): Promise<ApiResponse<SwapExecuteResponse>> {
    return this.request<SwapExecuteResponse>("/solana/swap/execute", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async signSwapTransaction(request: SignSwapTransactionRequest): Promise<ApiResponse<any>> {
    return this.request<any>("/solana/swap/sign", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitSwapTransaction(request: SubmitSwapTransactionRequest): Promise<ApiResponse<any>> {
    return this.request<any>("/solana/swap/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSwapStatus(swapId: string): Promise<ApiResponse<SwapStatus>> {
    return this.request<SwapStatus>(`/solana/swap/status/${swapId}`, {
      method: "GET",
    });
  }
}

export const swapApiService = new SwapApiService();
export default swapApiService;
