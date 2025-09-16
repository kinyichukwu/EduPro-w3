-- Flashcard Tables Migration
-- This migration creates tables for flashcard functionality

-- Flashcard decks table
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    color VARCHAR(7), -- For hex color codes like #8b5cf6
    total_cards INTEGER DEFAULT 0,
    mastered_cards INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    study_time INTEGER DEFAULT 0, -- in minutes
    last_studied TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    mastery VARCHAR(20) CHECK (mastery IN ('new', 'learning', 'review', 'mastered')) DEFAULT 'new',
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    tags JSONB, -- Array of tags as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    mode VARCHAR(20) CHECK (mode IN ('sequential', 'random', 'difficult', 'review', 'new')) DEFAULT 'sequential',
    cards_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_topic ON flashcard_decks(topic);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_difficulty ON flashcard_decks(difficulty);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_created_at ON flashcard_decks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_mastery ON flashcards(mastery);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_deck_id ON study_sessions(deck_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at DESC);

-- Triggers to automatically update updated_at
CREATE TRIGGER update_flashcard_decks_updated_at 
    BEFORE UPDATE ON flashcard_decks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at 
    BEFORE UPDATE ON flashcards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update deck stats when cards are modified
CREATE OR REPLACE FUNCTION update_deck_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_cards and mastered_cards count for the deck
    UPDATE flashcard_decks 
    SET 
        total_cards = (
            SELECT COUNT(*) 
            FROM flashcards 
            WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
        ),
        mastered_cards = (
            SELECT COUNT(*) 
            FROM flashcards 
            WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id) 
            AND mastery = 'mastered'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.deck_id, OLD.deck_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update deck stats when cards are added, updated, or deleted
CREATE TRIGGER update_deck_stats_on_card_insert
    AFTER INSERT ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_stats();

CREATE TRIGGER update_deck_stats_on_card_update
    AFTER UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_stats();

CREATE TRIGGER update_deck_stats_on_card_delete
    AFTER DELETE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_stats();
