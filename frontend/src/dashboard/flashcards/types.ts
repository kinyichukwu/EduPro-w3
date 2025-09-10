export interface Deck {
  id: number;
  name: string;
  outstanding: number;
  new: number;
  description: string;
  topic: string;
  totalCards: number;
  masteredCards: number;
  lastStudied?: Date;
  averageScore: number;
  studyTime: number; // in minutes
  difficulty: "easy" | "medium" | "hard";
  color: string;
};

export interface Card {
  id: number;
  front: string;
  back: string;
  hasAudio?: boolean;
  difficulty: "easy" | "medium" | "hard";
  timesReviewed: number;
  timesCorrect: number;
  lastReviewed?: Date;
  nextReview?: Date;
  mastery: "new" | "learning" | "review" | "mastered";
  tags?: string[];
};

export interface StudySession {
  id: number;
  deckId: number;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  totalTime: number; // in seconds
  mode: "sequential" | "random" | "difficult" | "review";
};

export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories?: string[];
};

export type StudyMode =
  | "sequential"
  | "random"
  | "difficult"
  | "review"
  | "new";
