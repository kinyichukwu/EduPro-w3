import { supabase } from "../lib/supabaseClient";
import { getApiBaseUrl } from "./index";
import type {
  SwapRequest,
  SwapExecuteResponse,
  SignSwapTransactionRequest,
  SubmitSwapTransactionRequest,
  SwapStatus,
} from "../shared/types/solana/swap";

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

// Course Types
export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  total_modules: number;
  completed_modules: number;
  students_count: number;
  earnings: number;
  price: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  
  // NFT fields
  price_edu_tokens?: number;
  price_token_mint?: string;
  nft_mint_address?: string;
  platform_fee_bps?: number;
  nft_metadata_uri?: string;
  creation_tx_signature?: string;
  view_on_chain_url?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order_index: number;
  status: "draft" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ModuleLink {
  id: string;
  module_id: string;
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

export interface ModuleWithLinks {
  module: CourseModule;
  links: ModuleLink[];
}

export interface CourseStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_students: number;
  total_earnings: number;
}

// Request Types
export interface CreateCourseRequest {
  title: string;
  description: string;
  price?: number;
}

export interface CreateCourseWithPaymentRequest {
  title: string;
  description: string;
  price_edu_tokens: number;
  creation_tx_signature: string;
  creator_wallet: string;
}

export interface PurchaseCourseRequest {
  purchase_tx_signature: string;
  buyer_wallet: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  status?: "draft" | "published" | "archived";
  thumbnail_url?: string;
}

export interface CreateModuleRequest {
  title: string;
  description: string;
  content?: string;
  order_index: number;
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  content?: string;
  order_index?: number;
  status?: "draft" | "completed";
}

export interface AddModuleLinkRequest {
  url: string;
  title?: string;
  description?: string;
}

export interface GenerateContentRequest {
  prompt: string;
}

export interface GenerateContentResponse {
  content: string;
}

// New API Types for Progress Tracking
export interface UpdateCourseStatusRequest {
  status: "draft" | "published" | "archived";
}

export interface CourseProgressRequest {
  module_id: string;
  completed: boolean;

  progress: number; // 0-100
}

export interface CourseProgressResponse {
  course_id: string;
  user_id: string;
  progress: number;
  completed_modules: number;
  total_modules: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface CourseLearningContent {
  course: Course;
  modules: CourseModule[];
  progress?: CourseProgressResponse;
}

// NFT Course Types
export interface CoursePurchase {
  id: string;
  course_id: string;
  buyer_user_id: string;
  buyer_wallet_address: string;
  purchase_tx_signature: string;
  nft_mint_address: string;
  total_amount_paid: number;
  platform_amount: number;
  seller_amount: number;
  platform_fee_bps: number;
  purchase_status: 'pending' | 'confirmed' | 'failed';
  nft_mint_tx_signature?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface CourseWithPurchaseInfo {
  course: Course;
  is_purchased: boolean;
  purchase?: CoursePurchase;
  can_access: boolean;
  price_display_edu: number;
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
  // Public request without auth header
  private async requestPublic<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      if (data && typeof data === "object" && "success" in data) {
        const success = (data as any).success as boolean;
        if (success) {
          return { data: (data as any).data };
        }
        return { error: (data as any).error || "API request failed" };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
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

  // NOTE: requestWithCustomAuth removed due to no references. Re-add if needed.

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

  async rateFlashcard(
    deckId: string,
    flashcardId: string,
    request: any
  ): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/flashcards/decks/${deckId}/cards/${flashcardId}/rate`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
  }

  async generateAIFlashcards(
    deckId: string,
    request: any
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/flashcards/decks/${deckId}/generate`, {
      method: "POST",
      body: JSON.stringify(request),
    });
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

  // Deduct endpoint for transferring SOL from user wallet to EduPro
  async deductFromWallet(request: {
    wallet_address: string;
    amount: number;
    token_mint: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/payment/deduct", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Wallet balance endpoints
  async getWalletBalance(address: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/solana/wallet/${address}/balance`);
  }

  async getTokenBalance(
    address: string,
    mintAddress: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(
      `/solana/wallet/${address}/token-balance?mint=${mintAddress}`
    );
  }

  async getEduTokenBalance(address: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/solana/wallet/${address}/edutoken-balance`);
  }

  // Course Management APIs
  async createCourse(
    request: CreateCourseRequest
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getCourses(params?: {
    status?: "draft" | "published" | "archived";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Course[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = `/courses${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<Course[]>(url);
  }

  async getCourse(courseId: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}`);
  }

  async enrollInCourse(courseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/courses/${courseId}/enroll`, {
      method: "POST",
    });
  }

  async getEnrolledCourses(params?: { page?: number; limit?: number }): Promise<ApiResponse<Course[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const url = `/courses/enrolled${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.request<Course[]>(url);
  }

  // Public browse endpoints (no auth)
  async getPublicCourses(params?: { page?: number; limit?: number }): Promise<ApiResponse<Course[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const url = `/courses/browse${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.requestPublic<Course[]>(url);
  }

  async getPublicCourse(courseId: string): Promise<ApiResponse<Course>> {
    return this.requestPublic<Course>(`/courses/browse/${courseId}`);
  }

  async updateCourse(
    courseId: string,
    request: UpdateCourseRequest
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    return this.request<CourseStats>("/courses/stats");
  }

  // NFT Course APIs
  async createCourseWithPayment(
    request: CreateCourseWithPaymentRequest
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>("/courses/create-with-payment", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async purchaseCourse(
    courseId: string,
    request: PurchaseCourseRequest
  ): Promise<ApiResponse<CoursePurchase>> {
    return this.request<CoursePurchase>(`/courses/${courseId}/purchase`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPublicCoursesWithPurchaseInfo(): Promise<ApiResponse<CourseWithPurchaseInfo[]>> {
    return this.request<CourseWithPurchaseInfo[]>("/courses/public-with-purchase-info");
  }

  async getUserPurchasedCourses(): Promise<ApiResponse<CoursePurchase[]>> {
    return this.request<CoursePurchase[]>("/courses/my-purchases");
  }

  async getCourseDetails(courseId: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}/details`);
  }

  // Module Management APIs
  async createModule(
    courseId: string,
    request: CreateModuleRequest
  ): Promise<ApiResponse<CourseModule>> {
    return this.request<CourseModule>(`/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getModules(courseId: string): Promise<ApiResponse<CourseModule[]>> {
    return this.request<CourseModule[]>(`/courses/${courseId}/modules`);
  }

  async getModule(
    courseId: string,
    moduleId: string
  ): Promise<ApiResponse<ModuleWithLinks>> {
    return this.request<ModuleWithLinks>(
      `/courses/${courseId}/modules/${moduleId}`
    );
  }

  async updateModule(
    courseId: string,
    moduleId: string,
    request: UpdateModuleRequest
  ): Promise<ApiResponse<CourseModule>> {
    return this.request<CourseModule>(
      `/courses/${courseId}/modules/${moduleId}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
  }

  async deleteModule(
    courseId: string,
    moduleId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE",
    });
  }

  async addModuleLink(
    courseId: string,
    moduleId: string,
    request: AddModuleLinkRequest
  ): Promise<ApiResponse<ModuleLink>> {
    return this.request<ModuleLink>(
      `/courses/${courseId}/modules/${moduleId}/links`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async deleteModuleLink(
    courseId: string,
    moduleId: string,
    linkId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/courses/${courseId}/modules/${moduleId}/links/${linkId}`,
      {
        method: "DELETE",
      }
    );
  }

  // AI Content Generation
  async generateModuleTitle(
    courseId: string,
    request: GenerateContentRequest
  ): Promise<ApiResponse<GenerateContentResponse>> {
    return this.request<GenerateContentResponse>(
      `/courses/${courseId}/modules/generate-title`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async generateModuleContent(
    courseId: string,
    request: GenerateContentRequest
  ): Promise<ApiResponse<GenerateContentResponse>> {
    return this.request<GenerateContentResponse>(
      `/courses/${courseId}/modules/generate-content`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  // Solana swap endpoints
  async getSwapQuote(
    request: SwapRequest
  ): Promise<ApiResponse<SwapExecuteResponse>> {
    return this.request<SwapExecuteResponse>("/api/solana/swap/quote", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async executeSwap(
    request: SwapRequest
  ): Promise<ApiResponse<SwapExecuteResponse>> {
    return this.request<SwapExecuteResponse>("/api/solana/swap/execute", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async signSwapTransaction(
    request: SignSwapTransactionRequest
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/api/solana/swap/sign", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitSwapTransaction(
    request: SubmitSwapTransactionRequest
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/api/solana/swap/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSwapStatus(swapId: string): Promise<ApiResponse<SwapStatus>> {
    return this.request<SwapStatus>(`/api/solana/swap/status/${swapId}`, {
      method: "GET",
    });
  }

  // New Course Progress & Learning APIs
  async updateCourseStatus(
    courseId: string,
    request: UpdateCourseStatusRequest
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}/status`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async updateChapter(
    chapterId: string,
    request: UpdateModuleRequest
  ): Promise<ApiResponse<CourseModule>> {
    return this.request<CourseModule>(`/chapters/${chapterId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }

  async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/chapters/${chapterId}`, {
      method: "DELETE",
    });
  }

  async getCourseLearningContent(
    courseId: string
  ): Promise<ApiResponse<CourseLearningContent>> {
    return this.request<CourseLearningContent>(`/courses/${courseId}/learn`);
  }

  async getCourseProgress(
    courseId: string
  ): Promise<ApiResponse<CourseProgressResponse>> {
    return this.request<CourseProgressResponse>(
      `/courses/${courseId}/progress`
    );
  }

  async updateCourseProgress(
    courseId: string,
    request: CourseProgressRequest
  ): Promise<ApiResponse<CourseProgressResponse>> {
    return this.request<CourseProgressResponse>(
      `/courses/${courseId}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify(request),
      }
    );
  }
}

export const apiService = new ApiService();
export default apiService;
