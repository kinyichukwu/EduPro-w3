import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDeck, useFlashcards } from "./useFlashcards";
import { flashcardAPI, type Deck, type Flashcard } from "@/services/flashcard";

export interface StudyCard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  times_reviewed: number;
  next_review?: string; // ISO date string when card is due
  hasAudio?: boolean;
}

export type StudyMode =
  | "sequential"
  | "random"
  | "difficult"
  | "review"
  | "new";

export interface SessionStats {
  cardsStudied: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  totalTime: number; // in seconds
}

export const useFlashcardStudy = () => {
  const { id: deckId } = useParams<{ id: string }>();

  // Data hooks - only fetch what we need
  const { deck } = useDeck(deckId || null);
  const { flashcards, loading, error, fetchFlashcards, createFlashcard } =
    useFlashcards(deckId || null);

  // State
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [dueCards, setDueCards] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("sequential");
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsStudied: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    totalTime: 0,
  });

  // UI state
  const [showHint, setShowHint] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load deck
  useEffect(() => {
    if (deck) {
      setCurrentDeck(deck);
      // fetchFlashcards is automatically called by useFlashcards when deckId changes
    }
  }, [deck]);

  // Filter due cards
  useEffect(() => {
    if (!flashcards?.length) {
      setDueCards([]);
      return;
    }

    const now = new Date();
    const due = flashcards
      .map((fc: Flashcard) => ({
        id: fc.id,
        front: fc.front,
        back: fc.back,
        difficulty: (fc.difficulty as "easy" | "medium" | "hard") || "medium",
        times_reviewed: fc.times_reviewed,
        next_review: fc.next_review,
        hasAudio: false, // Default to false, can be enhanced later
      }))
      .filter((card) => {
        // Show new cards (no next_review) or cards that are due
        if (!card.next_review) return true;
        return new Date(card.next_review) <= now;
      });

    setDueCards(due);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionStartTime(new Date()); // Initialize session start time
  }, [flashcards]);

  // Actions
  const showCard = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const hideCard = useCallback(() => {
    setShowAnswer(false);
  }, []);

  const handleFlip = useCallback(() => {
    setShowAnswer((prev) => !prev);
  }, []);

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const rateCard = useCallback(
    async (rating: "hard" | "okay" | "easy") => {
      const currentCard = dueCards[currentCardIndex];
      if (!currentCard || !deckId) return;

      try {
        // Call backend API to rate the flashcard
        const response = await flashcardAPI.rateFlashcard(
          deckId,
          currentCard.id,
          { rating }
        );

        // Remove card from due list since it's been reviewed
        const newDueCards = dueCards.filter(
          (_, index) => index !== currentCardIndex
        );
        setDueCards(newDueCards);

        // Adjust current index
        if (currentCardIndex >= newDueCards.length && newDueCards.length > 0) {
          setCurrentCardIndex(newDueCards.length - 1);
        } else if (newDueCards.length === 0) {
          setCurrentCardIndex(0);
        }

        setShowAnswer(false);

        // Update session statistics
        const isCorrect = rating !== "hard";
        setSessionStats((prev) => ({
          ...prev,
          cardsStudied: prev.cardsStudied + 1,
          correctAnswers: isCorrect
            ? prev.correctAnswers + 1
            : prev.correctAnswers,
          streak: isCorrect ? prev.streak + 1 : 0,
          maxStreak: Math.max(
            prev.maxStreak,
            isCorrect ? prev.streak + 1 : prev.streak
          ),
        }));

        showToastMessage(
          `Card rated as ${rating}! Next review in ${
            response.interval_days
          } day${response.interval_days > 1 ? "s" : ""}`
        );
      } catch (error) {
        console.error("Failed to rate card:", error);
        showToastMessage("Failed to save rating");
      }
    },
    [dueCards, currentCardIndex, deckId, showToastMessage]
  );

  const createNewCard = useCallback(
    async (front: string, back: string) => {
      if (!deckId) return;

      try {
        await createFlashcard({
          front,
          back,
          difficulty: "medium",
        });

        // Refresh flashcards
        fetchFlashcards();
      } catch (error) {
        console.error("Failed to create card:", error);
        throw error;
      }
    },
    [deckId, createFlashcard]
  ); // Remove fetchFlashcards from dependencies

  const deleteCard = useCallback(async () => {
    const currentCard = dueCards[currentCardIndex];
    if (!currentCard || !deckId) return;

    try {
      await flashcardAPI.deleteFlashcard(deckId, currentCard.id);

      // Remove from due cards
      const newDueCards = dueCards.filter(
        (_, index) => index !== currentCardIndex
      );
      setDueCards(newDueCards);

      if (currentCardIndex >= newDueCards.length && newDueCards.length > 0) {
        setCurrentCardIndex(newDueCards.length - 1);
      }
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  }, [dueCards, currentCardIndex, deckId]);

  const handleDeleteCard = useCallback(async () => {
    await deleteCard();
  }, [deleteCard]);

  // Computed values
  const currentCard = dueCards[currentCardIndex] || null;
  const hasCards = dueCards.length > 0;
  const progress = hasCards
    ? ((currentCardIndex + 1) / dueCards.length) * 100
    : 0;

  return {
    // Data
    currentDeck,
    currentCard,
    hasCards,
    totalDue: dueCards.length,
    progress,
    currentCardIndex,
    studyCards: dueCards, // Alias for compatibility

    // UI State
    showAnswer,
    isFlipped: showAnswer, // Alias for compatibility
    showHint,
    isBookmarked,
    showToast,
    toastMessage,
    loading,
    error,

    // Study State
    studyMode,
    sessionStartTime,
    sessionStats,
    currentStreak: sessionStats.streak,

    // Actions
    showCard,
    hideCard,
    handleFlip,
    handleCardRating: rateCard, // Alias for UI compatibility
    handleDeleteCard,
    setStudyMode,
    setIsBookmarked,
    setShowHint,
    createNewCard,
    deleteCard,
    refreshCards: fetchFlashcards, // Expose fetchFlashcards for manual refresh
  };
};
