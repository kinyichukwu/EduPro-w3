// import { useAuthStore } from "@/store/useAuthStore";

import { useAuthStore } from '@/store/useAuthStore';

// Utility function to get the correct API base URL
export const getApiBaseUrl = (): string => {
  // 1. Check for runtime injected config (set by backend when serving HTML)
  const injectedConfig = (
    window as unknown as { __APP_CONFIG__?: { apiBaseUrl?: string } }
  ).__APP_CONFIG__?.apiBaseUrl;
  if (injectedConfig) {
    return `${injectedConfig}/api`;
  }

  // 2. Check for build-time environment variable
  const baseUrl = import.meta.env.VITE_APP_SERVER_URL || "";
  if (baseUrl) {
    return `${baseUrl}/api`;
  }

  // 3. Fallback to relative path
  return "/api";
};

type RequestOptions = {
  params?: Record<string, string | number>;
  body?: object;
  headers?: Record<string, string>;
  query?: Record<string, string>;
};

class ApiService {
  private apiPath: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Get base URL (host only) from environment variable or runtime injection
    const baseUrl = this.getBaseUrl();
    // Always append /api to the base URL for EDUPRO API
    this.apiPath = baseUrl ? `${baseUrl}/api` : "/api";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl(): string {
    // 1. Check for runtime injected config (set by backend when serving HTML)
    const injectedConfig = (
      window as unknown as { __APP_CONFIG__?: { apiBaseUrl?: string } }
    ).__APP_CONFIG__?.apiBaseUrl;
    if (injectedConfig) {
      return injectedConfig;
    }

    // 2. Check for build-time environment variable
    const envBaseUrl = import.meta.env.VITE_APP_SERVER_URL;
    if (envBaseUrl && typeof envBaseUrl === "string") {
      return envBaseUrl.trim();
    }

    // 3. Fallback to empty (will use relative path)
    return "";
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
  
    // Get token from Zustand store (or any auth store you're using)
    const token = useAuthStore.getState().user?.access_token; // adjust `user` if needed
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    return headers;
  }

  // Helper to format URL with path parameters
  private formatUrl(path: string, options?: RequestOptions): string {
    let url = path;

    // Replace path parameters
    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url = url.replace(`:${key}`, String(value));
      }
    }

    // Add query parameters
    if (options?.query) {
      const queryString = new URLSearchParams(options.query).toString();
      url = `${url}${queryString ? `?${queryString}` : ""}`;
    }

    return `${this.apiPath}${url}`;
  }

  // Generic request method
  private async request<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.formatUrl(path, options);
    const headers = { ...this.getHeaders(), ...options?.headers };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      
      // Handle APIResponse wrapper from backend
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          return data.data as T;
        } else {
          throw new Error(data.error || 'API request failed');
        }
      }
      
      return data as T;
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  // HTTP method wrappers
  public async get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return this.request<T>("GET", path, options);
  }

  public async post<T>(path: string, options?: RequestOptions) {
    return this.request<T>("POST", path, options);
  }

  public async put<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PUT", path, options);
  }

  public async patch<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PATCH", path, options);
  }

  public async delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}

// Create and export a single instance
export const apiService = new ApiService();

// Export the new enhanced API service
export { apiService as enhancedApiService } from './api';
export * from './api';
