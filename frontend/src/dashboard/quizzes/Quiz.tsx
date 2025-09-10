import { Button } from "@/shared/components/ui";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QuestionComponent, Results } from "../components/quizzes";
import { mockQuestions } from "../constants/quizzes";

export interface QuizAttempt {
  questionId: number;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number;
}

export default function Quiz () {
  const [currentView, setCurrentView] = useState<
    "taking" | "results"
  >("taking");
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(300);
  const location = useLocation()
  const navigate = useNavigate()

  const selectedQuiz = location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ")

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleAnswerQuestion = (answer: string | number) => {
    const currentQuestion = mockQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
      timeSpent: 30, // Mock time spent
    };

    setQuizAttempts([...quizAttempts, attempt]);

    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizAttempts([]);
    setCurrentView("taking");
    setTimeRemaining(300);
  };

  const handleFinishQuiz = () => {
    setCurrentView("results");
    setTimeRemaining(null);
  };

  const calculateScore = () => {
    const correctAnswers = quizAttempts.filter(
      (attempt) => attempt.isCorrect
    ).length;
    return Math.round((correctAnswers / quizAttempts.length) * 100) || 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReturn = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/chat");
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      timeRemaining !== null &&
      timeRemaining > 0
    ) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleFinishQuiz();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, currentView]);

  //Results View
  if (currentView === "results" && selectedQuiz) {
    const score = calculateScore();
    const correctAnswers = quizAttempts.filter(
      (attempt) => attempt.isCorrect
    ).length;

    return (
      <Results 
        score={score}
        correctAnswers={correctAnswers}
        quizAttempts={quizAttempts}
        handleRestart={handleRestartQuiz}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex max-sm:flex-col sm:items-center justify-between gap-y-2 p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleReturn}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-bold text-white text-lg">
              {selectedQuiz}
            </h2>
            <p className="text-sm text-white/60 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </p>
          </div>
        </div>

        <div className="max-sm:pl-10 flex justify-between items-center gap-4">
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 px-3 py-1 bg-dark-card/60 rounded-lg">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-white font-mono">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-dark-card/60 rounded-lg">
            <span className="text-white/60 text-sm">Progress:</span>
            <span className="text-turbo-purple font-medium">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-dark-background">
        <div
          className="h-full bg-gradient-to-r from-turbo-purple to-turbo-indigo transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-dark-card/20">
        <div className="max-w-4xl mx-auto">
          <QuestionComponent
            question={currentQuestion}
            onAnswer={handleAnswerQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={mockQuestions.length}
          />
        </div>
      </div>
    </div>
  );
}