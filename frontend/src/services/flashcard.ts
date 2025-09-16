import { apiService } from "./index";

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
  outstanding?: number; // Cards due for review
  new?: number; // New cards not yet studied
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  times_reviewed: number;
  times_correct: number;
  mastery: "new" | "learning" | "review" | "mastered";
  last_reviewed?: string;
  next_review?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  mode: "sequential" | "random" | "difficult" | "review" | "new";
  cards_studied: number;
  correct_answers: number;
  total_time: number; // in seconds
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface FlashcardStats {
  total_decks: number;
  total_cards: number;
  mastered_cards: number;
  cards_to_review: number;
  average_score: number;
  total_study_time: number; // in minutes
  study_streak: number; // days
  last_study_session?: string;
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
  tags?: string[];
}

export interface CreateBulkFlashcardsRequest {
  cards: CreateFlashcardRequest[];
}

export interface StartStudySessionRequest {
  deck_id: string;
  mode?: "sequential" | "random" | "difficult" | "review" | "new";
}

export interface StudyCardRequest {
  card_id: string;
  is_correct: boolean;
  time_spent: number; // in seconds
}

export interface EndStudySessionRequest {
  cards_studied: number;
  correct_answers: number;
  total_time: number; // in seconds
  studied_cards: StudyCardRequest[];
}

class FlashcardAPI {
  // Deck operations
  async createDeck(request: CreateDeckRequest): Promise<Deck> {
    return await apiService.post<Deck>("/flashcards/decks", { body: request });
  }

  async getDecks(): Promise<Deck[]> {
    return await apiService.get<Deck[]>("/flashcards/decks");
  }

  async getDeck(deckId: string): Promise<Deck> {
    return await apiService.get<Deck>(`/flashcards/decks/${deckId}`);
  }

  async updateDeck(deckId: string, request: UpdateDeckRequest): Promise<Deck> {
    return await apiService.put<Deck>(`/flashcards/decks/${deckId}`, {
      body: request,
    });
  }

  async deleteDeck(deckId: string): Promise<void> {
    return await apiService.delete<void>(`/flashcards/decks/${deckId}`);
  }

  // Flashcard operations
  async createFlashcard(
    deckId: string,
    request: CreateFlashcardRequest
  ): Promise<Flashcard> {
    return await apiService.post<Flashcard>(
      `/flashcards/decks/${deckId}/cards`,
      { body: request }
    );
  }

  async createBulkFlashcards(
    deckId: string,
    request: CreateBulkFlashcardsRequest
  ): Promise<Flashcard[]> {
    return await apiService.post<Flashcard[]>(
      `/flashcards/decks/${deckId}/cards/bulk`,
      { body: request }
    );
  }

  async getFlashcards(deckId: string): Promise<Flashcard[]> {
    return await apiService.get<Flashcard[]>(
      `/flashcards/decks/${deckId}/cards`
    );
  }

  async getStudyCards(
    deckId: string,
    mode?: string,
    limit?: number
  ): Promise<{
    cards: Flashcard[];
    mode: string;
    count: number;
  }> {
    const query: Record<string, string> = {};
    if (mode) query.mode = mode;
    if (limit) query.limit = limit.toString();

    return await apiService.get<{
      cards: Flashcard[];
      mode: string;
      count: number;
    }>(`/flashcards/decks/${deckId}/cards/study`, { query });
  }

  // Study session operations
  async startStudySession(
    request: StartStudySessionRequest
  ): Promise<StudySession> {
    return await apiService.post<StudySession>("/flashcards/study/sessions", {
      body: request,
    });
  }

  async endStudySession(
    sessionId: string,
    request: EndStudySessionRequest
  ): Promise<StudySession> {
    return await apiService.put<StudySession>(
      `/flashcards/study/sessions/${sessionId}`,
      { body: request }
    );
  }

  // Statistics
  async getFlashcardStats(): Promise<FlashcardStats> {
    return await apiService.get<FlashcardStats>("/flashcards/stats");
  }
}

// Create and export a single instance
export const flashcardAPI = new FlashcardAPI();
