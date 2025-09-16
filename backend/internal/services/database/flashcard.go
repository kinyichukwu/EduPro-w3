package database

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// CreateDeck creates a new flashcard deck
func (c *Client) CreateDeck(userID uuid.UUID, req *models.CreateDeckRequest) (*models.Deck, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	deck := &models.Deck{
		ID:     uuid.New(),
		UserID: userID,
		Name:   req.Name,
	}

	// Set optional fields
	if req.Description != nil {
		deck.Description = req.Description
	}
	if req.Topic != nil {
		deck.Topic = req.Topic
	}
	if req.Difficulty != nil {
		deck.Difficulty = req.Difficulty
	}
	if req.Color != nil {
		deck.Color = req.Color
	}

	query := `
		INSERT INTO flashcard_decks (id, user_id, name, description, topic, difficulty, color, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING total_cards, mastered_cards, average_score, study_time, last_studied, created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, deck.ID, deck.UserID, deck.Name, deck.Description, 
		deck.Topic, deck.Difficulty, deck.Color).Scan(
		&deck.TotalCards, &deck.MasteredCards, &deck.AverageScore, 
		&deck.StudyTime, &deck.LastStudied, &deck.CreatedAt, &deck.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create deck", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create deck: %w", err)
	}

	logger.Info("Deck created successfully", zap.String("deck_id", deck.ID.String()))
	return deck, nil
}

// GetDecksByUserID retrieves all decks for a user
func (c *Client) GetDecksByUserID(userID uuid.UUID) ([]*models.DeckWithStats, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT 
			d.id, d.user_id, d.name, d.description, d.topic, d.difficulty, d.color,
			d.total_cards, d.mastered_cards, d.average_score, d.study_time, d.last_studied,
			d.created_at, d.updated_at,
			0::integer as outstanding,
			0::integer as new
		FROM flashcard_decks d
		WHERE d.user_id = $1
		ORDER BY d.created_at DESC
	`

	// Log the query being executed for debugging
	logger.Debug("Executing get decks query", 
		zap.String("query", query),
		zap.String("user_id", userID.String()))

	// Validate database connection before executing query
	if err := c.pool.Ping(ctx); err != nil {
		logger.Error("Database connection lost", zap.String("error", err.Error()))
		return nil, fmt.Errorf("database connection error: %w", err)
	}

	// Use pgx Query - no more prepared statement issues!
	rows, err := c.pool.Query(ctx, query, userID)
	if err != nil {
		logger.Error("Failed to get decks", 
			zap.String("error", err.Error()),
			zap.String("query", query),
			zap.String("user_id", userID.String()))
		return nil, fmt.Errorf("failed to get decks: %w", err)
	}
	defer rows.Close()

	var decks []*models.DeckWithStats
	for rows.Next() {
		deck := &models.DeckWithStats{}
		err := rows.Scan(
			&deck.ID, &deck.UserID, &deck.Name, &deck.Description, &deck.Topic,
			&deck.Difficulty, &deck.Color, &deck.TotalCards, &deck.MasteredCards,
			&deck.AverageScore, &deck.StudyTime, &deck.LastStudied,
			&deck.CreatedAt, &deck.UpdatedAt, &deck.Outstanding, &deck.New,
		)
		if err != nil {
			logger.Error("Failed to scan deck", 
				zap.String("error", err.Error()),
				zap.String("user_id", userID.String()))
			return nil, fmt.Errorf("failed to scan deck: %w", err)
		}
		decks = append(decks, deck)
	}

	return decks, nil
}

// GetDeckByID retrieves a deck by ID
func (c *Client) GetDeckByID(deckID, userID uuid.UUID) (*models.DeckWithStats, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT 
			d.id, d.user_id, d.name, d.description, d.topic, d.difficulty, d.color,
			d.total_cards, d.mastered_cards, d.average_score, d.study_time, d.last_studied,
			d.created_at, d.updated_at,
			COALESCE(due_cards.count, 0) as outstanding,
			COALESCE(new_cards.count, 0) as new
		FROM flashcard_decks d
		LEFT JOIN (
			SELECT deck_id, COUNT(*) as count
			FROM flashcards
			WHERE mastery IN ('learning', 'review') 
			AND (next_review IS NULL OR next_review <= NOW())
			GROUP BY deck_id
		) due_cards ON d.id = due_cards.deck_id
		LEFT JOIN (
			SELECT deck_id, COUNT(*) as count
			FROM flashcards
			WHERE mastery = 'new'
			GROUP BY deck_id
		) new_cards ON d.id = new_cards.deck_id
		WHERE d.id = $1 AND d.user_id = $2
	`

	deck := &models.DeckWithStats{}
	err := c.pool.QueryRow(ctx, query, deckID, userID).Scan(
		&deck.ID, &deck.UserID, &deck.Name, &deck.Description, &deck.Topic,
		&deck.Difficulty, &deck.Color, &deck.TotalCards, &deck.MasteredCards,
		&deck.AverageScore, &deck.StudyTime, &deck.LastStudied,
		&deck.CreatedAt, &deck.UpdatedAt, &deck.Outstanding, &deck.New,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("Deck not found", zap.String("deck_id", deckID.String()))
			return nil, fmt.Errorf("deck not found")
		}
		logger.Error("Failed to get deck", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get deck: %w", err)
	}

	return deck, nil
}

// UpdateDeck updates a deck
func (c *Client) UpdateDeck(deckID, userID uuid.UUID, req *models.UpdateDeckRequest) (*models.Deck, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		UPDATE flashcard_decks 
		SET 
			name = COALESCE($3, name),
			description = COALESCE($4, description),
			topic = COALESCE($5, topic),
			difficulty = COALESCE($6, difficulty),
			color = COALESCE($7, color),
			updated_at = NOW()
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, name, description, topic, difficulty, color, 
				  total_cards, mastered_cards, average_score, study_time, last_studied, 
				  created_at, updated_at
	`

	deck := &models.Deck{}
	err := c.pool.QueryRow(ctx, query, deckID, userID, req.Name, req.Description, 
		req.Topic, req.Difficulty, req.Color).Scan(
		&deck.ID, &deck.UserID, &deck.Name, &deck.Description, &deck.Topic,
		&deck.Difficulty, &deck.Color, &deck.TotalCards, &deck.MasteredCards,
		&deck.AverageScore, &deck.StudyTime, &deck.LastStudied,
		&deck.CreatedAt, &deck.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("Deck not found for update", zap.String("deck_id", deckID.String()))
			return nil, fmt.Errorf("deck not found")
		}
		logger.Error("Failed to update deck", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update deck: %w", err)
	}

	logger.Info("Deck updated successfully", zap.String("deck_id", deckID.String()))
	return deck, nil
}

// DeleteDeck deletes a deck and all its cards
func (c *Client) DeleteDeck(deckID, userID uuid.UUID) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `DELETE FROM flashcard_decks WHERE id = $1 AND user_id = $2`
	result, err := c.pool.Exec(ctx, query, deckID, userID)		
	if err != nil {
		logger.Error("Failed to delete deck", zap.String("error", err.Error()))
		return fmt.Errorf("failed to delete deck: %w", err)
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		logger.Warn("Deck not found for deletion", zap.String("deck_id", deckID.String()))
		return fmt.Errorf("deck not found")
	}

	logger.Info("Deck deleted successfully", zap.String("deck_id", deckID.String()))
	return nil
}

// CreateFlashcard creates a new flashcard in a deck
func (c *Client) CreateFlashcard(deckID uuid.UUID, req *models.CreateFlashcardRequest) (*models.Flashcard, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	card := &models.Flashcard{
		ID:     uuid.New(),
		DeckID: deckID,
		Front:  req.Front,
		Back:   req.Back,
		Mastery: "new",
	}

	// Set optional fields
	if req.Difficulty != nil {
		card.Difficulty = *req.Difficulty
	} else {
		card.Difficulty = "medium"
	}

	// Handle tags
	var tagsJSON []byte
	if req.Tags != nil && len(*req.Tags) > 0 {
		var err error
		tagsJSON, err = json.Marshal(*req.Tags)
		if err != nil {
			logger.Error("Failed to marshal tags", zap.String("error", err.Error()))
			return nil, fmt.Errorf("failed to marshal tags: %w", err)
		}
		card.Tags = *req.Tags
	}

	query := `
		INSERT INTO flashcards (id, deck_id, front, back, difficulty, mastery, tags, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING times_reviewed, times_correct, last_reviewed, next_review, created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, card.ID, card.DeckID, card.Front, card.Back, 
		card.Difficulty, card.Mastery, tagsJSON).Scan(
		&card.TimesReviewed, &card.TimesCorrect, &card.LastReviewed, 
		&card.NextReview, &card.CreatedAt, &card.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create flashcard", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create flashcard: %w", err)
	}

	logger.Info("Flashcard created successfully", zap.String("card_id", card.ID.String()))
	return card, nil
}

// CreateBulkFlashcards creates multiple flashcards in a deck
func (c *Client) CreateBulkFlashcards(deckID uuid.UUID, req *models.CreateBulkFlashcardsRequest) ([]*models.Flashcard, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	tx, err := c.pool.Begin(ctx)
	if err != nil {
		logger.Error("Failed to begin transaction", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var cards []*models.Flashcard
	for _, cardReq := range req.Cards {
		card := &models.Flashcard{
			ID:      uuid.New(),
			DeckID:  deckID,
			Front:   cardReq.Front,
			Back:    cardReq.Back,
			Mastery: "new",
		}

		// Set difficulty
		if cardReq.Difficulty != nil {
			card.Difficulty = *cardReq.Difficulty
		} else {
			card.Difficulty = "medium"
		}

		// Handle tags
		var tagsJSON []byte
		if cardReq.Tags != nil && len(*cardReq.Tags) > 0 {
			tagsJSON, err = json.Marshal(*cardReq.Tags)
			if err != nil {
				logger.Error("Failed to marshal tags", zap.String("error", err.Error()))
				return nil, fmt.Errorf("failed to marshal tags: %w", err)
			}
			card.Tags = *cardReq.Tags
		}

		query := `
			INSERT INTO flashcards (id, deck_id, front, back, difficulty, mastery, tags, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			RETURNING times_reviewed, times_correct, last_reviewed, next_review, created_at, updated_at
		`

		err = tx.QueryRow(ctx, query, card.ID, card.DeckID, card.Front, card.Back,
			card.Difficulty, card.Mastery, tagsJSON).Scan(
			&card.TimesReviewed, &card.TimesCorrect, &card.LastReviewed,
			&card.NextReview, &card.CreatedAt, &card.UpdatedAt)
		if err != nil {
			logger.Error("Failed to create flashcard in bulk", zap.String("error", err.Error()))
			return nil, fmt.Errorf("failed to create flashcard: %w", err)
		}

		cards = append(cards, card)
	}

	if err = tx.Commit(ctx); err != nil {
		logger.Error("Failed to commit transaction", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	logger.Info("Bulk flashcards created successfully", 
		zap.String("deck_id", deckID.String()), 
		zap.Int("count", len(cards)))
	return cards, nil
}

// GetFlashcardsByDeckID retrieves all flashcards in a deck
func (c *Client) GetFlashcardsByDeckID(deckID uuid.UUID) ([]*models.Flashcard, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, deck_id, front, back, difficulty, times_reviewed, times_correct,
			   mastery, last_reviewed, next_review, tags, created_at, updated_at
		FROM flashcards
		WHERE deck_id = $1
		ORDER BY created_at DESC
	`

	rows, err := c.pool.Query(ctx, query, deckID)
	if err != nil {
		logger.Error("Failed to get flashcards", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get flashcards: %w", err)
	}
	defer rows.Close()

	var cards []*models.Flashcard
	for rows.Next() {
		card := &models.Flashcard{}
		var tagsJSON []byte

		err := rows.Scan(
			&card.ID, &card.DeckID, &card.Front, &card.Back, &card.Difficulty,
			&card.TimesReviewed, &card.TimesCorrect, &card.Mastery,
			&card.LastReviewed, &card.NextReview, &tagsJSON,
			&card.CreatedAt, &card.UpdatedAt,
		)
		if err != nil {
			logger.Error("Failed to scan flashcard", zap.String("error", err.Error()))
			return nil, fmt.Errorf("failed to scan flashcard: %w", err)
		}

		// Unmarshal tags
		if tagsJSON != nil {
			err = json.Unmarshal(tagsJSON, &card.Tags)
			if err != nil {
				logger.Warn("Failed to unmarshal tags", zap.String("error", err.Error()))
				card.Tags = []string{}
			}
		}

		cards = append(cards, card)
	}

	return cards, nil
}

// GetFlashcardStats retrieves statistics for a user's flashcards
func (c *Client) GetFlashcardStats(userID uuid.UUID) (*models.FlashcardStats, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT 
			COUNT(DISTINCT d.id) as total_decks,
			COALESCE(SUM(d.total_cards), 0) as total_cards,
			COALESCE(SUM(d.mastered_cards), 0) as mastered_cards,
			COALESCE(SUM(d.study_time), 0) as total_study_time,
			COALESCE(AVG(d.average_score), 0) as average_score,
			MAX(d.last_studied) as last_study_session
		FROM flashcard_decks d
		WHERE d.user_id = $1
	`

	stats := &models.FlashcardStats{}
	
	// Log the query being executed for debugging
	logger.Debug("Executing flashcard stats query", 
		zap.String("query", query),
		zap.String("user_id", userID.String()))
	
	// Validate database connection before executing query
	if err := c.pool.Ping(ctx); err != nil {
		logger.Error("Database connection lost for stats", zap.String("error", err.Error()))
		return models.NewEmptyFlashcardStats(), nil
	}
	
	// Use pgx QueryRow - no more prepared statement issues!
	err := c.pool.QueryRow(ctx, query, userID).Scan(
		&stats.TotalDecks, &stats.TotalCards, &stats.MasteredCards,
		&stats.TotalStudyTime, &stats.AverageScore, &stats.LastStudySession,
	)
	if err != nil {
		logger.Error("Failed to get flashcard stats", 
			zap.String("error", err.Error()),
			zap.String("query", query),
			zap.String("user_id", userID.String()))
		// Return empty stats instead of failing
		return models.NewEmptyFlashcardStats(), nil
	}

	// Get cards to review count
	reviewQuery := `
		SELECT COUNT(*)
		FROM flashcards f
		JOIN flashcard_decks d ON f.deck_id = d.id
		WHERE d.user_id = $1 
		AND f.mastery IN ('learning', 'review')
		AND (f.next_review IS NULL OR f.next_review <= NOW())
	`

	err = c.pool.QueryRow(ctx, reviewQuery, userID).Scan(&stats.CardsToReview)
	if err != nil {
		logger.Warn("Failed to get cards to review count", zap.String("error", err.Error()))
		stats.CardsToReview = 0
	}

	// Calculate study streak (simplified - consecutive days with study sessions)
	// This is a basic implementation - could be enhanced with more complex logic
	streakQuery := `
		SELECT COUNT(DISTINCT DATE(started_at))
		FROM study_sessions
		WHERE user_id = $1
		AND started_at >= NOW() - INTERVAL '30 days'
	`

	err = c.pool.QueryRow(ctx, streakQuery, userID).Scan(&stats.StudyStreak)
	if err != nil {
		logger.Warn("Failed to get study streak", zap.String("error", err.Error()))
		stats.StudyStreak = 0
	}

	return stats, nil
}

// StartStudySession creates a new study session
func (c *Client) StartStudySession(userID uuid.UUID, req *models.StartStudySessionRequest) (*models.StudySession, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	session := &models.StudySession{
		ID:     uuid.New(),
		UserID: userID,
		DeckID: req.DeckID,
		Mode:   "sequential",
	}

	if req.Mode != nil {
		session.Mode = *req.Mode
	}

	query := `
		INSERT INTO study_sessions (id, user_id, deck_id, mode, started_at, created_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING started_at, created_at
	`

	err := c.pool.QueryRow(ctx, query, session.ID, session.UserID, session.DeckID, session.Mode).Scan(
		&session.StartedAt, &session.CreatedAt)
	if err != nil {
		logger.Error("Failed to start study session", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to start study session: %w", err)
	}

	logger.Info("Study session started successfully", zap.String("session_id", session.ID.String()))
	return session, nil
}

// EndStudySession ends a study session and updates statistics
func (c *Client) EndStudySession(sessionID uuid.UUID, req *models.EndStudySessionRequest) (*models.StudySession, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	tx, err := c.pool.Begin(ctx)
	if err != nil {
		logger.Error("Failed to begin transaction", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Update study session
	query := `
		UPDATE study_sessions 
		SET cards_studied = $2, correct_answers = $3, total_time = $4, completed_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, deck_id, mode, cards_studied, correct_answers, total_time, 
				  started_at, completed_at, created_at
	`

	session := &models.StudySession{}
	err = tx.QueryRow(ctx, query, sessionID, req.CardsStudied, req.CorrectAnswers, req.TotalTime).Scan(
		&session.ID, &session.UserID, &session.DeckID, &session.Mode,
		&session.CardsStudied, &session.CorrectAnswers, &session.TotalTime,
		&session.StartedAt, &session.CompletedAt, &session.CreatedAt,
	)
	if err != nil {
		logger.Error("Failed to end study session", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to end study session: %w", err)
	}

	// Update individual card statistics
	for _, studiedCard := range req.StudiedCards {
		// Update card review statistics
		updateCardQuery := `
			UPDATE flashcards 
			SET 
				times_reviewed = times_reviewed + 1,
				times_correct = times_correct + CASE WHEN $2 THEN 1 ELSE 0 END,
				last_reviewed = NOW(),
				next_review = CASE 
					WHEN $2 THEN 
						CASE 
							WHEN mastery = 'new' THEN NOW() + INTERVAL '1 day'
							WHEN mastery = 'learning' THEN NOW() + INTERVAL '3 days'
							WHEN mastery = 'review' THEN NOW() + INTERVAL '7 days'
							ELSE NOW() + INTERVAL '14 days'
						END
					ELSE NOW() + INTERVAL '1 hour'
				END,
				mastery = CASE
					WHEN $2 AND mastery = 'new' THEN 'learning'
					WHEN $2 AND mastery = 'learning' AND times_correct >= 2 THEN 'review'
					WHEN $2 AND mastery = 'review' AND times_correct >= 5 THEN 'mastered'
					WHEN NOT $2 AND mastery != 'new' THEN 'learning'
					ELSE mastery
				END,
				updated_at = NOW()
			WHERE id = $1
		`

		_, err = tx.Exec(ctx, updateCardQuery, studiedCard.CardID, studiedCard.IsCorrect)
		if err != nil {
			logger.Error("Failed to update card statistics", zap.String("error", err.Error()))
			return nil, fmt.Errorf("failed to update card statistics: %w", err)
		}
	}

	// Update deck statistics
	updateDeckQuery := `
		UPDATE flashcard_decks 
		SET 
			study_time = study_time + $2,
			last_studied = NOW(),
			average_score = (
				SELECT COALESCE(AVG(
					CASE WHEN s.cards_studied > 0 
					THEN (s.correct_answers::float / s.cards_studied::float) * 100 
					ELSE 0 END
				), 0)
				FROM study_sessions s 
				WHERE s.deck_id = $1 AND s.completed_at IS NOT NULL
			),
			updated_at = NOW()
		WHERE id = $1
	`

	_, err = tx.Exec(ctx, updateDeckQuery, session.DeckID, req.TotalTime/60) // Convert seconds to minutes
	if err != nil {
		logger.Error("Failed to update deck statistics", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update deck statistics: %w", err)
	}

	if err = tx.Commit(ctx); err != nil {
		logger.Error("Failed to commit transaction", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	logger.Info("Study session ended successfully", zap.String("session_id", sessionID.String()))
	return session, nil
}

// UpdateFlashcardProgress updates a flashcard's mastery level, times reviewed, and next review date
func (c *Client) UpdateFlashcardProgress(flashcardID string, masteryLevelChange int, nextReview time.Time) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		UPDATE flashcards 
		SET 
			mastery_level = GREATEST(0, mastery_level + $2),
			times_reviewed = times_reviewed + 1,
			next_review = $3,
			updated_at = NOW()
		WHERE id = $1
	`

	result, err := c.pool.Exec(ctx, query, flashcardID, masteryLevelChange, nextReview)
	if err != nil {
		logger.Error("Failed to update flashcard progress", 
			zap.String("flashcard_id", flashcardID),
			zap.String("error", err.Error()))
		return fmt.Errorf("failed to update flashcard progress: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		logger.Error("No flashcard found to update", zap.String("flashcard_id", flashcardID))
		return fmt.Errorf("flashcard not found")
	}

	logger.Info("Flashcard progress updated successfully", 
		zap.String("flashcard_id", flashcardID),
		zap.Int("mastery_level_change", masteryLevelChange),
		zap.String("next_review", nextReview.Format(time.RFC3339)))

	return nil
}
