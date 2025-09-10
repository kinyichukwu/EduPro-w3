# Sleep Timer Feature Implementation

## Overview

This feature implements a robust retry mechanism with a sleep timer for the chat functionality in `/dashboard/chats`. When the database is sleeping and requests fail, the system automatically retries after a 65-second delay while keeping users engaged with progressive loading messages.

## Key Features

### 🔄 Automatic Retry Logic

- **Retry Delay**: 1 minute 5 seconds (65 seconds)
- **Max Retries**: 2 attempts per request
- **Automatic Recovery**: Seamlessly handles database wake-up

### 🎯 Progressive Loading States

During the wait period, users see engaging messages that cycle every 8 seconds:

- 🔍 "Checking for the best answer..."
- 🧠 "Thinking deeply about your question..."
- 🌐 "Searching the web for additional insights..."
- ⚡ "Warming up the database..."
- 🎯 "Preparing the perfect response..."
- 📚 "Gathering relevant information..."
- 🔧 "Fine-tuning the analysis..."
- ✨ "Almost ready with your answer..."

### 🎨 Enhanced UI/UX

- **Sleep Timer Display**: Shows current message and countdown timer
- **Visual Feedback**: Amber-themed loading indicator with pulsing brain icon
- **Input Disabled**: Prevents new requests during retry period
- **Header Indicator**: Shows retry countdown in the chat header

## Technical Implementation

### Core Components

#### 1. Enhanced Hook (`useGeneralChat.ts`)

```typescript
// Sleep Timer State Management
type SleepTimerState = {
  isWaiting: boolean;
  currentMessage: string;
  timeRemaining: number;
  retryAttempt: number;
};

// Retry Logic with Progressive Messages
const makeRequestWithRetry = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> => {
  // Implements retry logic with sleep timer
};
```

#### 2. UI Components (`index.tsx`)

- **Sleep Timer UI**: Custom loading component with countdown
- **Progressive Messages**: Cycling status messages
- **Disabled States**: Input and buttons disabled during wait
- **Visual Indicators**: Amber color scheme for sleep state

### API Integration

- **All API calls** now use the retry mechanism
- **Transparent handling** - no changes needed to existing code
- **Graceful fallback** - shows error message if all retries fail

## Usage

The feature activates automatically when:

1. An API request fails (typically due to sleeping database)
2. System starts 65-second countdown with progressive messages
3. Automatically retries the request after countdown
4. Returns to normal operation on success

## Benefits

### For Users

- **No interruption** in workflow
- **Engaging feedback** during wait times
- **Automatic recovery** without manual intervention
- **Clear status indication** of what's happening

### For System

- **Database wake-up handling** without user intervention
- **Improved reliability** with automatic retries
- **Better error handling** with graceful degradation
- **Enhanced user experience** during system startup

## Configuration

### Timing Constants

```typescript
const RETRY_DELAY_MS = 65 * 1000; // 1 minute 5 seconds
const MESSAGE_CYCLE_INTERVAL = 8000; // 8 seconds per message
```

### Customization Options

- **Message content** can be easily modified
- **Timing intervals** are configurable
- **Visual styling** uses existing design system
- **Retry attempts** can be adjusted

## Testing

To test the sleep timer functionality:

1. Navigate to `/dashboard/chats`
2. Send a message when database is sleeping
3. Observe the sleep timer UI with progressive messages
4. Wait for automatic retry and success

## Future Enhancements

Potential improvements:

- **Health check integration** before requests
- **Predictive wake-up** based on usage patterns
- **User notification options** for long delays
- **Analytics tracking** of sleep timer usage
