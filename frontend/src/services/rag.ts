import { apiService, type ChatsResponse, type ChatMessagesResponse, type DocumentsResponse, type UploadResponse, type AskResponse, type Chat, type Document } from './api';

export interface Citation {
  document_id: string;
  document_title: string;
  ordinal: number;
  snippet: string;
  source_url?: string;
}

class RAGService {
  /**
   * List all chats with pagination
   */
  async listChats(page: number = 1): Promise<ChatsResponse> {
    const response = await apiService.getChats(page);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Get messages for a specific chat with pagination
   */
  async getChatMessages(chatId: string, page: number = 1): Promise<ChatMessagesResponse> {
    const response = await apiService.getChatMessages(chatId, page);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Ask a question in a chat
   */
  async ask(query: string, chatId?: string): Promise<AskResponse> {
    const response = await apiService.askQuestion(query, chatId);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * List all documents with pagination
   */
  async listDocuments(page: number = 1): Promise<DocumentsResponse> {
    const response = await apiService.getDocuments(page);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(
    formData: FormData,
    chatId?: string,
    _onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    const response = await apiService.uploadFile(formData, chatId);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Create a new chat
   */
  async createChat(): Promise<Chat> {
    const response = await apiService.createChat();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Delete a chat (not implemented in backend yet)
   */
  async deleteChat(_chatId: string): Promise<void> {
    // For now, throw an error since this isn't implemented
    throw new Error('Delete chat not implemented yet');
  }

  /**
   * Update chat title (not implemented in backend yet)
   */
  async updateChatTitle(_chatId: string, _title: string): Promise<Chat> {
    // For now, throw an error since this isn't implemented
    throw new Error('Update chat title not implemented yet');
  }

  /**
   * Get a specific document (not implemented in backend yet)
   */
  async getDocument(_documentId: string): Promise<Document> {
    // For now, throw an error since this isn't implemented
    throw new Error('Get document not implemented yet');
  }

  /**
   * Delete a document (not implemented in backend yet)
   */
  async deleteDocument(_documentId: string): Promise<void> {
    // For now, throw an error since this isn't implemented
    throw new Error('Delete document not implemented yet');
  }
}

export const ragService = new RAGService();
