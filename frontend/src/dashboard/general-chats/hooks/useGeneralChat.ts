import { useState } from "react";
import { apiService } from "@/services";

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
  meta: {
    request_id: string;
    processing_time: number;
    version: string;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
  topic: string;
  subject?: string;
  level?: string;
}

interface ExplanationResponse {
  explanation: string;
  key_points: string[];
  summary: string;
  examples: string[];
  topic: string;
  subject?: string;
  level?: string;
}

// Request Types
interface GenerateContentRequest {
  task: "quiz" | "explain";
  query: string;
  subject?: string;
  level?: string;
}

// Sleep Timer States
type SleepTimerState = {
  isWaiting: boolean;
  currentMessage: string;
  timeRemaining: number;
  retryAttempt: number;
};

const SLEEP_TIMER_MESSAGES = [
  "🔍 Checking for the best answer...",
  "🧠 Thinking deeply about your question...",
  "🌐 Searching the web for additional insights...",
  "⚡ Warming up the database...",
  "🎯 Preparing the perfect response...",
  "📚 Gathering relevant information...",
  "🔧 Fine-tuning the analysis...",
  "✨ Almost ready with your answer...",
];

const RETRY_DELAY_MS = 65 * 1000; // 1 minute 5 seconds
const MESSAGE_CYCLE_INTERVAL = 8000; // 8 seconds per message

export const useGeneralChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerState>({
    isWaiting: false,
    currentMessage: "",
    timeRemaining: 0,
    retryAttempt: 0,
  });

  // Sleep timer utility functions
  const startSleepTimer = (retryAttempt: number = 1) => {
    setSleepTimer({
      isWaiting: true,
      currentMessage: SLEEP_TIMER_MESSAGES[0],
      timeRemaining: RETRY_DELAY_MS,
      retryAttempt,
    });

    let messageIndex = 0;
    let timeLeft = RETRY_DELAY_MS;

    // Update countdown timer
    const countdownInterval = setInterval(() => {
      timeLeft -= 1000;
      setSleepTimer((prev) => ({
        ...prev,
        timeRemaining: timeLeft,
      }));

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % SLEEP_TIMER_MESSAGES.length;
      setSleepTimer((prev) => ({
        ...prev,
        currentMessage: SLEEP_TIMER_MESSAGES[messageIndex],
      }));
    }, MESSAGE_CYCLE_INTERVAL);

    // Cleanup intervals when timer ends
    setTimeout(() => {
      clearInterval(countdownInterval);
      clearInterval(messageInterval);
      setSleepTimer((prev) => ({
        ...prev,
        isWaiting: false,
      }));
    }, RETRY_DELAY_MS);
  };

  const resetSleepTimer = () => {
    setSleepTimer({
      isWaiting: false,
      currentMessage: "",
      timeRemaining: 0,
      retryAttempt: 0,
    });
  };

  // Enhanced request wrapper with retry logic
  const makeRequestWithRetry = async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        resetSleepTimer(); // Reset on success
        return result;
      } catch (err) {
        lastError = err as Error;

        // If this isn't the last attempt, start sleep timer
        if (attempt < maxRetries) {
          console.log(
            `Request attempt ${attempt} failed, starting sleep timer...`
          );
          startSleepTimer(attempt);

          // Wait for the sleep timer to complete
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

          console.log(`Retrying request (attempt ${attempt + 1})...`);
        }
      }
    }

    // If all retries failed, reset timer and throw error
    resetSleepTimer();
    throw lastError!;
  };

  const generateQuiz = async (
    query: string,
    subject?: string,
    level?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateContentRequest = {
        task: "quiz",
        query,
        subject,
        level,
      };

      const response = await makeRequestWithRetry(async () => {
        return await apiService.post<ApiResponse<QuizResponse>>("/query", {
          body: request,
        });
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to generate quiz");
      }

      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateExplanation = async (
    query: string,
    subject?: string,
    level?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateContentRequest = {
        task: "explain",
        query,
        subject,
        level,
      };

      const response = await makeRequestWithRetry(async () => {
        return await apiService.post<ApiResponse<ExplanationResponse>>(
          "/query",
          {
            body: request,
          }
        );
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to generate explanation");
      }

      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await makeRequestWithRetry(async () => {
        return await apiService.get<
          ApiResponse<{
            status: string;
            timestamp: string;
            version: string;
            uptime: string;
          }>
        >("/health");
      });

      return response.success && response.data?.status === "healthy";
    } catch (err) {
      console.error("Health check failed:", err);
      return false;
    }
  };

  const getAvailableTasks = async () => {
    try {
      const response = await makeRequestWithRetry(async () => {
        return await apiService.get<
          ApiResponse<{
            tasks: Array<{
              name: string;
              description: string;
              example: string;
            }>;
          }>
        >("/tasks");
      });

      return response.data?.tasks || [];
    } catch (err) {
      console.error("Failed to get available tasks:", err);
      return [];
    }
  };

  return {
    generateQuiz,
    generateExplanation,
    checkHealth,
    getAvailableTasks,
    isLoading,
    error,
    sleepTimer,
    clearError: () => setError(null),
    resetSleepTimer,
  };
};

// Export types for use in components
export type { QuizQuestion, QuizResponse, ExplanationResponse };
