import { useState, useEffect } from 'react';
import { 
  flashcardAPI, 
  Deck, 
  Flashcard, 
  FlashcardStats,
  StudySession,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateFlashcardRequest,
  CreateBulkFlashcardsRequest,
  StartStudySessionRequest,
  EndStudySessionRequest
} from '@/services/flashcard';

// Hook for managing decks
export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardAPI.getDecks();
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decks');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (request: CreateDeckRequest) => {
    setError(null);
    try {
      const newDeck = await flashcardAPI.createDeck(request);
      setDecks(prev => [newDeck, ...prev]); // Add to top of list
      return newDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateDeck = async (deckId: string, request: UpdateDeckRequest) => {
    setError(null);
    try {
      const updatedDeck = await flashcardAPI.updateDeck(deckId, request);
      setDecks(prev => prev.map(deck => 
        deck.id === deckId ? updatedDeck : deck
      ));
      return updatedDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deck';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteDeck = async (deckId: string) => {
    setError(null);
    try {
      await flashcardAPI.deleteDeck(deckId);
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return {
    decks,
    loading,
    error,
    fetchDecks,
    createDeck,
    updateDeck,
    deleteDeck,
  };
};

// Hook for managing a single deck
export const useDeck = (deckId: string | null) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeck = async () => {
    if (!deckId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardAPI.getDeck(deckId);
      setDeck(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deck');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  return {
    deck,
    loading,
    error,
    fetchDeck,
  };
};

// Hook for managing flashcards in a deck
export const useFlashcards = (deckId: string | null) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = async () => {
    if (!deckId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardAPI.getFlashcards(deckId);
      setFlashcards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (request: CreateFlashcardRequest) => {
    if (!deckId) throw new Error('No deck selected');
    
    setError(null);
    try {
      const newCard = await flashcardAPI.createFlashcard(deckId, request);
      setFlashcards(prev => [newCard, ...prev]); // Add to top of list
      return newCard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createBulkFlashcards = async (request: CreateBulkFlashcardsRequest) => {
    if (!deckId) throw new Error('No deck selected');
    
    setError(null);
    try {
      const newCards = await flashcardAPI.createBulkFlashcards(deckId, request);
      setFlashcards(prev => [...newCards, ...prev]); // Add to top of list
      return newCards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create flashcards';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [deckId]);

  return {
    flashcards,
    loading,
    error,
    fetchFlashcards,
    createFlashcard,
    createBulkFlashcards,
  };
};

// Hook for study sessions
export const useStudySession = () => {
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (request: StartStudySessionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newSession = await flashcardAPI.startStudySession(request);
      setSession(newSession);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start study session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string, request: EndStudySessionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSession = await flashcardAPI.endStudySession(sessionId, request);
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end study session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setSession(null);
    setError(null);
  };

  return {
    session,
    loading,
    error,
    startSession,
    endSession,
    clearSession,
  };
};

// Hook for getting study cards
export const useStudyCards = (deckId: string | null, mode?: string, limit?: number) => {
  const [studyData, setStudyData] = useState<{
    cards: Flashcard[];
    mode: string;
    count: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudyCards = async () => {
    if (!deckId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardAPI.getStudyCards(deckId, mode, limit);
      setStudyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyCards();
  }, [deckId, mode, limit]);

  return {
    studyData,
    loading,
    error,
    fetchStudyCards,
  };
};

// Hook for flashcard statistics
export const useFlashcardStats = () => {
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardAPI.getFlashcardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flashcard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// Combined hook for flashcard management (convenience hook)
export const useFlashcardManager = () => {
  const decksHook = useDecks();
  const statsHook = useFlashcardStats();
  const studySessionHook = useStudySession();

  return {
    // Decks
    decks: decksHook.decks,
    decksLoading: decksHook.loading,
    decksError: decksHook.error,
    fetchDecks: decksHook.fetchDecks,
    createDeck: decksHook.createDeck,
    updateDeck: decksHook.updateDeck,
    deleteDeck: decksHook.deleteDeck,

    // Stats
    stats: statsHook.stats,
    statsLoading: statsHook.loading,
    statsError: statsHook.error,
    fetchStats: statsHook.fetchStats,

    // Study sessions
    session: studySessionHook.session,
    sessionLoading: studySessionHook.loading,
    sessionError: studySessionHook.error,
    startSession: studySessionHook.startSession,
    endSession: studySessionHook.endSession,
    clearSession: studySessionHook.clearSession,
  };
};
