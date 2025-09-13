import {
  apiService,
  type ChatsResponse,
  type ChatMessagesResponse,
  type DocumentsResponse,
  type UploadResponse,
  type AskResponse,
  type Chat,
  type Document,
} from "./api";

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
  async getChatMessages(
    chatId: string,
    page: number = 1
  ): Promise<ChatMessagesResponse> {
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
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<void> {
    const response = await apiService.deleteChat(chatId);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: string, title: string): Promise<Chat> {
    const response = await apiService.updateChat(chatId, { title });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await apiService.deleteDocument(documentId);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Reprocess a document
   */
  async reprocessDocument(documentId: string): Promise<void> {
    const response = await apiService.reprocessDocument(documentId);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Get document chunks for debugging
   */
  async getDocumentChunks(documentId: string, page: number = 1): Promise<any> {
    const response = await apiService.getDocumentChunks(documentId, page);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }
}

export const ragService = new RAGService();
