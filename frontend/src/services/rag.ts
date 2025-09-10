import { apiService } from './index';
import { useAuthStore } from '@/store/useAuthStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'file';
  content: string;
  created_at: string;
  metadata?: {
    source_url?: string;
    filename?: string;
    mime_type?: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  mime_type: string;
  size?: number;
  source_url: string;
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
  created_at: string;
}

export interface Citation {
  document_id: string;
  document_title: string;
  ordinal: number;
  snippet: string;
  source_url?: string;
}

export interface AskResponse {
  chat_id: string;
  answer: string;
  citations: Citation[];
}

class RAGService {
  /**
   * List all chats with pagination
   */
  async listChats(page: number = 1): Promise<ChatsResponse> {
    return apiService.get<ChatsResponse>('/chats', {
      query: { page: page.toString() }
    });
  }

  /**
   * Get messages for a specific chat with pagination
   */
  async getChatMessages(chatId: string, page: number = 1): Promise<ChatMessagesResponse> {
    return apiService.get<ChatMessagesResponse>(`/chats/:id`, {
      params: { id: chatId },
      query: { page: page.toString() }
    });
  }

  /**
   * Ask a question in a chat
   */
  async ask(query: string, chatId?: string): Promise<AskResponse> {
    const body: { query: string; chat_id?: string } = { query };
    if (chatId) {
      body.chat_id = chatId;
    }
    
    return apiService.post<AskResponse>('/ask', {
      body
    });
  }

  /**
   * List all documents with pagination
   */
  async listDocuments(page: number = 1): Promise<DocumentsResponse> {
    return apiService.get<DocumentsResponse>('/documents', {
      query: { page: page.toString() }
    });
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(
    formData: FormData, 
    chatId?: string,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Get auth token
      const token = useAuthStore.getState().user?.access_token;
      
      // Set up progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Handle APIResponse wrapper
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              resolve(response);
            }
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || `HTTP error! status: ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Request timeout'));
      });

      // Construct URL
      const baseUrl = apiService['apiPath'] || '/api';
      const url = chatId 
        ? `${baseUrl}/upload?chat_id=${encodeURIComponent(chatId)}`
        : `${baseUrl}/upload`;

      // Open request
      xhr.open('POST', url);
      
      // Set auth header
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Set timeout
      xhr.timeout = 300000; // 5 minutes

      // Send request
      xhr.send(formData);
    });
  }

  /**
   * Create a new chat
   */
  async createChat(): Promise<Chat> {
    return apiService.post<Chat>('/chats');
  }

  /**
   * Delete a chat (not implemented in backend yet)
   */
  async deleteChat(chatId: string): Promise<void> {
    return apiService.delete<void>(`/chats/:id`, {
      params: { id: chatId }
    });
  }

  /**
   * Update chat title (not implemented in backend yet)
   */
  async updateChatTitle(chatId: string, title: string): Promise<Chat> {
    return apiService.patch<Chat>(`/chats/:id`, {
      params: { id: chatId },
      body: { title }
    });
  }

  /**
   * Get a specific document (not implemented in backend yet)
   */
  async getDocument(documentId: string): Promise<Document> {
    return apiService.get<Document>(`/documents/:id`, {
      params: { id: documentId }
    });
  }

  /**
   * Delete a document (not implemented in backend yet)
   */
  async deleteDocument(documentId: string): Promise<void> {
    return apiService.delete<void>(`/documents/:id`, {
      params: { id: documentId }
    });
  }
}

export const ragService = new RAGService();
