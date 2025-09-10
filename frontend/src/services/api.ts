import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:8080';

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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
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
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication endpoints
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    });
  }

  // User management endpoints
  async getOnboarding(): Promise<ApiResponse<OnboardingResponse>> {
    return this.request<OnboardingResponse>('/api/user/onboarding');
  }

  async updateOnboarding(onboardingData: Partial<OnboardingData>): Promise<ApiResponse<OnboardingResponse>> {
    return this.request<OnboardingResponse>('/api/user/onboarding', {
      method: 'PUT',
      body: JSON.stringify(onboardingData),
    });
  }

  async updateProfile(profileData: {
    username?: string;
    full_name?: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
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
      // For internal endpoints, we might not need auth headers since it's called during registration
      const response = await fetch(`${API_BASE_URL}/api/internal/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('User creation failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  // Health check endpoint (public)
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: `Backend health check failed: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: 'Backend server is not responding',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;