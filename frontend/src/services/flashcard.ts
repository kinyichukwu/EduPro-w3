import { apiService } from "./api";

// Types
export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  color?: string;
  total_cards: number;
  mastered_cards: number;
  average_score: number;
  study_time: number; // in minutes
  last_studied?: string;
  created_at: string;
  updated_at: string;
  // Optional UI properties
  outstanding?: number;
  new?: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
  mastery_level: number;
  times_reviewed: number;
  last_reviewed?: string;
  next_review?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  deck_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  total_cards: number;
  correct_answers: number;
  total_time?: number; // in seconds
  created_at: string;
}

export interface FlashcardStats {
  total_decks: number;
  total_cards: number;
  mastered_cards: number;
  cards_due_today: number;
  average_score: number;
  total_study_time: number; // in minutes
  longest_streak: number;
  current_streak: number;
}

// Request types
export interface CreateDeckRequest {
  name: string;
  description?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  color?: string;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  color?: string;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface CreateBulkFlashcardsRequest {
  flashcards: CreateFlashcardRequest[];
}

export interface StudyCardRequest {
  card_id: string;
  difficulty: "easy" | "medium" | "hard";
  time_spent: number; // in seconds
  correct: boolean;
}

export interface StartStudySessionRequest {
  deck_id: string;
}

export interface EndStudySessionRequest {
  total_time: number; // in seconds
  studied_cards: StudyCardRequest[];
}

export interface RateFlashcardRequest {
  rating: "hard" | "okay" | "easy";
}

export interface RateFlashcardResponse {
  message: string;
  rating: string;
  interval_days: number;
  next_review: string;
}

class FlashcardAPI {
  // Deck operations
  async createDeck(request: CreateDeckRequest): Promise<Deck> {
    const response = await apiService.createDeck(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getDecks(): Promise<Deck[]> {
    const response = await apiService.getDecks();
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getDeck(deckId: string): Promise<Deck> {
    const response = await apiService.getDeck(deckId);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async updateDeck(deckId: string, request: UpdateDeckRequest): Promise<Deck> {
    const response = await apiService.updateDeck(deckId, request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async deleteDeck(deckId: string): Promise<void> {
    const response = await apiService.deleteDeck(deckId);
    if (response.error) throw new Error(response.error);
  }

  // Flashcard operations
  async createFlashcard(
    deckId: string,
    request: CreateFlashcardRequest
  ): Promise<Flashcard> {
    const response = await apiService.createFlashcard(deckId, request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async createBulkFlashcards(
    deckId: string,
    request: CreateBulkFlashcardsRequest
  ): Promise<Flashcard[]> {
    const response = await apiService.createBulkFlashcards(deckId, request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getFlashcards(deckId: string): Promise<Flashcard[]> {
    const response = await apiService.getFlashcards(deckId);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async getStudyCards(deckId: string, limit?: number): Promise<Flashcard[]> {
    const response = await apiService.getStudyCards(deckId, limit);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async deleteFlashcard(deckId: string, flashcardId: string): Promise<void> {
    // TODO: Add this endpoint to the API service when backend supports it
    console.log(`Would delete flashcard ${flashcardId} from deck ${deckId}`);
    // For now, just simulate the API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async rateFlashcard(
    deckId: string,
    flashcardId: string,
    request: RateFlashcardRequest
  ): Promise<RateFlashcardResponse> {
    const response = await apiService.rateFlashcard(deckId, flashcardId, request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Study session operations
  async startStudySession(
    request: StartStudySessionRequest
  ): Promise<StudySession> {
    const response = await apiService.startStudySession(request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  async endStudySession(
    sessionId: string,
    request: EndStudySessionRequest
  ): Promise<StudySession> {
    const response = await apiService.endStudySession(sessionId, request);
    if (response.error) throw new Error(response.error);
    return response.data!;
  }

  // Statistics
  async getFlashcardStats(): Promise<FlashcardStats> {
    const response = await apiService.getFlashcardStats();
    if (response.error) throw new Error(response.error);
    return response.data!;
  }
}

// Create and export a single instance
export const flashcardAPI = new FlashcardAPI();
