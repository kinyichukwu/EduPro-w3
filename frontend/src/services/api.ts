import { supabase } from "../lib/supabaseClient";
import { getApiBaseUrl } from "./index";

// RAG Types
export interface Citation {
  document_id: string;
  document_title: string;
  ordinal: number;
  snippet: string;
  source_url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "file";
  content: string;
  created_at: string;
  metadata?: {
    source_url?: string;
    filename?: string;
    mime_type?: string;
  };
  citations?: Citation[];
}

export interface Chat {
  id: string;
  title?: string | null;
  last_message?: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  source_url?: string | null;
  mime_type: string;
  processing_status: string;
  error?: string | null;
  size?: number | null;
  checksum?: string | null;
  created_at: string;
}

// Backend API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  meta?: {
    request_id?: string;
    processing_time_ms?: number;
    version?: string;
  };
}

// Backend pagination structures
export interface DocumentsResponse {
  documents: Document[];
  page: number;
  total: number;
  has_more: boolean;
}

export interface ChatsResponse {
  chats: Chat[];
  page: number;
  total: number;
  has_more: boolean;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  page: number;
  total: number;
  has_more: boolean;
}

export interface UploadResponse {
  document_id: string;
  title: string;
  source_url: string;
  mime_type: string;
}

export interface AskResponse {
  chat_id: string;
  answer: string;
  citations: Citation[];
}

const API_BASE_URL = getApiBaseUrl();

// Derive the API origin (scheme + host) for non-/api endpoints like /health
let API_ORIGIN: string;
try {
  const url = new URL(API_BASE_URL, window.location.origin);
  API_ORIGIN = `${url.protocol}//${url.host}`;
} catch {
  API_ORIGIN = window.location.origin;
}

// Types matching the backend API
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar?: string;
  supabase_id: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  id?: string;
  user_id?: string;
  role: string;
  custom_learning_goal?: string;
  academic_details?: any; // Flexible JSON structure
  created_at?: string;
  completed_at?: string;
  updated_at?: string;
}

export interface AcademicDetails {
  university?: string;
  course?: string;
  jamb_details?: JAMBDetails;
  university_details?: UniversityDetails;
  lecturer_details?: LecturerDetails;
  custom_details?: CustomDetails;
}

export interface JAMBDetails {
  preferred_university: string;
  preferred_course: string;
  target_score?: string;
  jamb_year?: string;
  jamb_subjects: string[];
}

export interface UniversityDetails {
  current_university: string;
  current_course: string;
  current_level?: string;
  matric_number?: string;
}

export interface LecturerDetails {
  institution: string;
  department: string;
  experience?: string;
  academic_title?: string;
}

export interface CustomDetails {
  learning_goal: string;
  education_level?: string;
  experience_level?: string;
  additional_details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar?: string;
  onboarding_data?: OnboardingData;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponse {
  onboarding_data?: OnboardingData;
  is_completed: boolean;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
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
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
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

  // Authentication endpoints
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/auth/me");
  }

  async refreshToken(): Promise<
    ApiResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>
  > {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  // User management endpoints
  async getOnboarding(): Promise<ApiResponse<OnboardingResponse>> {
    return this.request<OnboardingResponse>("/user/onboarding");
  }

  async updateOnboarding(
    onboardingData: Partial<OnboardingData>
  ): Promise<ApiResponse<OnboardingResponse>> {
    return this.request<OnboardingResponse>("/user/onboarding", {
      method: "PUT",
      body: JSON.stringify(onboardingData),
    });
  }

  async updateProfile(profileData: {
    username?: string;
    full_name?: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Internal endpoint for user creation (called after Supabase auth)
  async createUser(userData: {
    email: string;
    username: string;
    full_name?: string;
    supabase_id: string;
  }): Promise<ApiResponse<User>> {
    try {
      // Internal endpoint lives under /api/internal/users
      const response = await fetch(`${API_BASE_URL}/internal/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error("User creation failed:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  // Health check endpoint (public)
  async healthCheck(): Promise<
    ApiResponse<{ status: string; message: string }>
  > {
    try {
      const response = await fetch(`${API_ORIGIN}/health`);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: `Backend health check failed: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: "Backend server is not responding",
      };
    }
  }

  // RAG endpoints
  async getChats(page: number = 1): Promise<ApiResponse<ChatsResponse>> {
    return this.request<ChatsResponse>(`/chats?page=${page}`);
  }

  async createChat(): Promise<ApiResponse<Chat>> {
    return this.request<Chat>("/chats", { method: "POST" });
  }

  async getChatMessages(
    chatId: string,
    page: number = 1
  ): Promise<ApiResponse<ChatMessagesResponse>> {
    return this.request<ChatMessagesResponse>(`/chats/${chatId}?page=${page}`);
  }

  async askQuestion(
    query: string,
    chatId?: string,
    documentIds?: string[]
  ): Promise<ApiResponse<AskResponse>> {
    const body: any = { query };
    if (chatId) body.chat_id = chatId;
    if (documentIds && documentIds.length > 0) body.document_ids = documentIds;
    return this.request<AskResponse>("/ask", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getDocuments(
    page: number = 1
  ): Promise<ApiResponse<DocumentsResponse>> {
    return this.request<DocumentsResponse>(`/documents?page=${page}`);
  }

  async uploadFile(
    formData: FormData,
    chatId?: string
  ): Promise<ApiResponse<UploadResponse>> {
    const headers = await this.getAuthHeaders();
    // Remove Content-Type for FormData - cast to any to avoid type issues
    const headersObj = headers as any;
    delete headersObj["Content-Type"];

    const url = chatId
      ? `${API_BASE_URL}/upload?chat_id=${chatId}`
      : `${API_BASE_URL}/upload`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // New RAG endpoints
  async deleteChat(chatId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/chats/${chatId}`, {
      method: "DELETE",
    });
  }

  async updateChat(
    chatId: string,
    data: { title?: string }
  ): Promise<ApiResponse<Chat>> {
    return this.request<Chat>(`/chats/${chatId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(
    documentId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  async reprocessDocument(
    documentId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/documents/${documentId}/reprocess`,
      { method: "POST" }
    );
  }

  async getDocumentChunks(
    documentId: string,
    page: number = 1
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/documents/${documentId}/chunks?page=${page}`);
  }

  async ragHealth(): Promise<ApiResponse<any>> {
    return this.request<any>("/rag/health");
  }

  // Flashcard endpoints
  async createDeck(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/flashcards/decks", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getDecks(): Promise<ApiResponse<any>> {
    return this.request<any>("/flashcards/decks");
  }

  async getDeck(deckId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}`);
  }

  async updateDeck(deckId: string, request: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteDeck(deckId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/flashcards/decks/${deckId}`, {
      method: "DELETE",
    });
  }

  async createFlashcard(
    deckId: string,
    request: any
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}/cards`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async createBulkFlashcards(
    deckId: string,
    request: any
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}/cards/bulk`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getFlashcards(deckId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}/cards`);
  }

  async getStudyCards(
    deckId: string,
    limit?: number
  ): Promise<ApiResponse<any>> {
    const query = limit ? `?limit=${limit}` : "";
    return this.request<any>(`/flashcards/decks/${deckId}/cards/study${query}`);
  }

  async startStudySession(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/flashcards/study/sessions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async endStudySession(
    sessionId: string,
    request: any
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/study/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async getFlashcardStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/flashcards/stats");
  }

  // Solana endpoints
  async connectWallet(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/wallet/connect", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async verifyWallet(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/wallet/verify", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getWallets(): Promise<ApiResponse<any>> {
    return this.request<any>("/wallet/list");
  }

  async disconnectWallet(walletId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/wallet/${walletId}`, {
      method: "DELETE",
    });
  }

  async generatePayment(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/payment/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitPayment(request: any): Promise<ApiResponse<any>> {
    return this.request<any>("/payment/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSupportedTokens(): Promise<ApiResponse<any>> {
    return this.request<any>("/payment/tokens");
  }

  async getPaymentStatus(transactionId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/payment/status/${transactionId}`);
  }
}

export const apiService = new ApiService();
export default apiService;
