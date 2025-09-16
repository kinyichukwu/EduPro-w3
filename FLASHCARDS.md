# EduPro Flashcards

A comprehensive flashcard system with spaced repetition for effective learning.

## Features

### Deck Management

- **Create Decks**: Organize flashcards by topic with customizable colors and difficulty levels
- **Bulk Import**: Add multiple cards at once or generate them with AI
- **Statistics**: Track progress with detailed analytics per deck

### Smart Learning

- **Spaced Repetition**: Cards appear based on mastery level and review intervals
- **Adaptive Difficulty**: System adjusts based on your performance
- **Multiple Study Modes**: Sequential, random, difficult cards only, or review mode

### Card States

- **New**: Never studied
- **Learning**: Recently introduced, frequent reviews
- **Review**: Established knowledge, longer intervals
- **Mastered**: Well-known cards, infrequent reviews

## API Endpoints

### Decks

```
POST   /api/flashcards/decks              # Create deck
GET    /api/flashcards/decks              # List user's decks
GET    /api/flashcards/decks/:id          # Get specific deck
PUT    /api/flashcards/decks/:id          # Update deck
DELETE /api/flashcards/decks/:id          # Delete deck
```

### Cards

```
POST   /api/flashcards/decks/:id/cards       # Add single card
POST   /api/flashcards/decks/:id/cards/bulk  # Add multiple cards
GET    /api/flashcards/decks/:id/cards       # Get all cards in deck
GET    /api/flashcards/decks/:id/cards/study # Get cards for study session
```

### Study Sessions

```
POST   /api/flashcards/study/sessions        # Start study session
PUT    /api/flashcards/study/sessions/:id    # End session with results
GET    /api/flashcards/stats                 # Get user statistics
```

## Database Schema

### Core Tables

- **flashcard_decks**: Deck metadata and statistics
- **flashcards**: Individual cards with mastery tracking
- **study_sessions**: Learning session records

### Key Features

- Auto-updating deck statistics via triggers
- Spaced repetition algorithm built-in
- User isolation and data integrity

## Frontend Integration

### Hooks Available

- `useDecks()`: Manage deck CRUD operations
- `useFlashcards()`: Handle individual cards
- `useStudySession()`: Control study sessions
- `useFlashcardStats()`: Access user analytics

### Usage Example

```typescript
import { useDecks, useFlashcards } from "@/shared/hooks/useFlashcards";

const { decks, createDeck, deleteDeck } = useDecks();
const { flashcards, createFlashcard } = useFlashcards(deckId);
```

## Study Algorithm

1. **New Cards**: Introduced gradually based on user settings
2. **Review Timing**: Cards reappear based on success rate
   - Correct: Interval increases (1d → 3d → 7d → 14d)
   - Incorrect: Reset to 1 hour for re-learning
3. **Mastery Progression**: Cards advance through states based on consecutive correct answers

## Getting Started

1. **Create a Deck**: Choose topic, difficulty, and color
2. **Add Cards**: Use manual entry, bulk import, or AI generation
3. **Start Studying**: Select study mode and begin learning
4. **Track Progress**: Monitor statistics and adjust study habits

The system automatically optimizes review schedules to maximize retention while minimizing study time.
