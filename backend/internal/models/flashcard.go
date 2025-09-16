package models

import (
	"time"

	"github.com/google/uuid"
)

// Deck represents a flashcard deck
type Deck struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	UserID        uuid.UUID  `json:"user_id" db:"user_id"`
	Name          string     `json:"name" db:"name"`
	Description   *string    `json:"description" db:"description"`
	Topic         *string    `json:"topic" db:"topic"`
	Difficulty    *string    `json:"difficulty" db:"difficulty"`
	Color         *string    `json:"color" db:"color"`
	TotalCards    int        `json:"total_cards" db:"total_cards"`
	MasteredCards int        `json:"mastered_cards" db:"mastered_cards"`
	AverageScore  float64    `json:"average_score" db:"average_score"`
	StudyTime     int        `json:"study_time" db:"study_time"` // in minutes
	LastStudied   *time.Time `json:"last_studied" db:"last_studied"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

// Flashcard represents a single flashcard
type Flashcard struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	DeckID        uuid.UUID  `json:"deck_id" db:"deck_id"`
	Front         string     `json:"front" db:"front"`
	Back          string     `json:"back" db:"back"`
	Difficulty    string     `json:"difficulty" db:"difficulty"`
	TimesReviewed int        `json:"times_reviewed" db:"times_reviewed"`
	TimesCorrect  int        `json:"times_correct" db:"times_correct"`
	Mastery       string     `json:"mastery" db:"mastery"`
	LastReviewed  *time.Time `json:"last_reviewed" db:"last_reviewed"`
	NextReview    *time.Time `json:"next_review" db:"next_review"`
	Tags          []string   `json:"tags" db:"tags"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

// StudySession represents a study session
type StudySession struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	DeckID         uuid.UUID  `json:"deck_id" db:"deck_id"`
	Mode           string     `json:"mode" db:"mode"`
	CardsStudied   int        `json:"cards_studied" db:"cards_studied"`
	CorrectAnswers int        `json:"correct_answers" db:"correct_answers"`
	TotalTime      int        `json:"total_time" db:"total_time"` // in seconds
	StartedAt      time.Time  `json:"started_at" db:"started_at"`
	CompletedAt    *time.Time `json:"completed_at" db:"completed_at"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}

// CreateDeckRequest represents the request to create a new deck
type CreateDeckRequest struct {
	Name        string  `json:"name" binding:"required,min=1,max=255"`
	Description *string `json:"description"`
	Topic       *string `json:"topic"`
	Difficulty  *string `json:"difficulty"`
	Color       *string `json:"color"`
}

// UpdateDeckRequest represents the request to update a deck
type UpdateDeckRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Topic       *string `json:"topic"`
	Difficulty  *string `json:"difficulty"`
	Color       *string `json:"color"`
}

// CreateFlashcardRequest represents the request to create a new flashcard
type CreateFlashcardRequest struct {
	Front      string    `json:"front" binding:"required,min=1"`
	Back       string    `json:"back" binding:"required,min=1"`
	Difficulty *string   `json:"difficulty"`
	Tags       *[]string `json:"tags"`
}

// UpdateFlashcardRequest represents the request to update a flashcard
type UpdateFlashcardRequest struct {
	Front      *string   `json:"front"`
	Back       *string   `json:"back"`
	Difficulty *string   `json:"difficulty"`
	Tags       *[]string `json:"tags"`
}

// CreateBulkFlashcardsRequest represents the request to create multiple flashcards
type CreateBulkFlashcardsRequest struct {
	Cards []CreateFlashcardRequest `json:"cards" binding:"required,min=1,dive"`
}

// StudyCardRequest represents a card study action
type StudyCardRequest struct {
	CardID    uuid.UUID `json:"card_id" binding:"required"`
	IsCorrect bool      `json:"is_correct"`
	TimeSpent int       `json:"time_spent"` // in seconds
}

// StartStudySessionRequest represents the request to start a study session
type StartStudySessionRequest struct {
	DeckID uuid.UUID `json:"deck_id" binding:"required"`
	Mode   *string   `json:"mode"`
}

// EndStudySessionRequest represents the request to end a study session
type EndStudySessionRequest struct {
	CardsStudied   int                `json:"cards_studied"`
	CorrectAnswers int                `json:"correct_answers"`
	TotalTime      int                `json:"total_time"`
	StudiedCards   []StudyCardRequest `json:"studied_cards"`
}

// DeckWithStats represents a deck with additional statistics
type DeckWithStats struct {
	Deck
	Outstanding int `json:"outstanding"` // Cards due for review
	New         int `json:"new"`         // New cards not yet studied
}

// FlashcardStats represents statistics for flashcards
type FlashcardStats struct {
	TotalDecks       int     `json:"total_decks"`
	TotalCards       int     `json:"total_cards"`
	MasteredCards    int     `json:"mastered_cards"`
	CardsToReview    int     `json:"cards_to_review"`
	AverageScore     float64 `json:"average_score"`
	TotalStudyTime   int     `json:"total_study_time"`   // in minutes
	StudyStreak      int     `json:"study_streak"`       // days
	LastStudySession *time.Time `json:"last_study_session"`
}

// NewEmptyFlashcardStats returns a FlashcardStats with zero values
func NewEmptyFlashcardStats() *FlashcardStats {
	return &FlashcardStats{
		TotalDecks:       0,
		TotalCards:       0,
		MasteredCards:    0,
		CardsToReview:    0,
		AverageScore:     0,
		TotalStudyTime:   0,
		StudyStreak:      0,
		LastStudySession: nil,
	}
}
