import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Mic,
  Pause,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

interface Question {
  id: number;
  type: "MCQ" | "True/False" | "Essay" | "Oral";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  diagram?: string;
}

export const QuestionComponent: React.FC<{
  question: Question;
  onAnswer: (answer: string | number) => void;
  userAnswer?: string | number;
  showResult?: boolean;
  questionNumber: number;
  totalQuestions: number;
}> = ({
  question,
  onAnswer,
  userAnswer,
  showResult,
  questionNumber,
  totalQuestions,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | number | undefined
  >(userAnswer);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSubmit = () => {
    if (question.type === "Essay") {
      onAnswer(essayAnswer);
    } else if (question.type === "Oral") {
      onAnswer(`Recorded answer (${recordingTime}s)`);
    } else if (selectedAnswer !== undefined) {
      onAnswer(selectedAnswer);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="bg-dark-card/80 backdrop-blur-lg rounded-xl border border-white/10 p-4 sm:p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/60">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-xs px-3 py-1 rounded-full bg-turbo-purple/20 text-turbo-purple">
          {question.type}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-6">
        {question.question}
      </h3>

      {question.type === "MCQ" && (
        <div className="space-y-3 mb-6">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && setSelectedAnswer(index)}
              disabled={showResult}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                showResult
                  ? index === question.correctAnswer
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : index === selectedAnswer &&
                      index !== question.correctAnswer
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-dark-card/40 border-white/10 text-white/60"
                  : selectedAnswer === index
                  ? "bg-turbo-purple/20 border-turbo-purple/50 text-turbo-purple"
                  : "bg-dark-card/40 border-white/10 text-white hover:bg-dark-card/60 hover:border-white/20"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </span>
            </button>
          ))}
        </div>
      )}

      {question.type === "True/False" && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {["True", "False"].map((option) => (
            <button
              key={option}
              onClick={() => !showResult && setSelectedAnswer(option)}
              disabled={showResult}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 font-medium",
                showResult
                  ? option === question.correctAnswer
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : selectedAnswer === option &&
                      selectedAnswer !== question.correctAnswer
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-dark-card/40 border-white/10 text-white/60"
                  : selectedAnswer === option
                  ? "bg-turbo-purple/20 border-turbo-purple/50 text-turbo-purple"
                  : "bg-dark-card/40 border-white/10 text-white hover:bg-dark-card/60 hover:border-white/20"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "Essay" && (
        <div className="mb-6">
          <Textarea
            value={essayAnswer}
            onChange={(e) => setEssayAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            disabled={showResult}
            className="bg-dark-card/60 border-white/20 text-white placeholder-white/40 resize-none"
          />
          {showResult && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="font-medium text-green-300 mb-2">
                Sample Answer:
              </h4>
              <p className="text-white/80 text-sm">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {question.type === "Oral" && (
        <div className="mb-6">
          <div className="bg-dark-card/60 border border-white/20 rounded-lg p-6 text-center">
            <div className="mb-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
                  isRecording
                    ? "bg-red-500/20 border-2 border-red-500"
                    : "bg-turbo-purple/20 border-2 border-turbo-purple"
                )}
              >
                {isRecording ? (
                  <Pause className="w-6 h-6 text-red-400" />
                ) : (
                  <Mic className="w-6 h-6 text-turbo-purple" />
                )}
              </div>
              <p className="text-white/80 mb-2">
                {isRecording
                  ? "Recording..."
                  : "Click to start recording your answer"}
              </p>
              {isRecording && (
                <p className="text-turbo-purple font-mono text-lg">
                  {formatTime(recordingTime)}
                </p>
              )}
            </div>
            <Button
              onClick={() => {
                if (isRecording) {
                  setIsRecording(false);
                } else {
                  setIsRecording(true);
                  setRecordingTime(0);
                }
              }}
              disabled={showResult}
              className={cn(
                "px-6 py-2",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
              )}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>
          {showResult && (
            <div className="mt-4 p-4 bg-turbo-purple/10 border border-turbo-purple/30 rounded-lg">
              <h4 className="font-medium text-turbo-purple mb-2">
                Expected Answer:
              </h4>
              <p className="text-white/80 text-sm">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {showResult && (
        <div className="mb-6 p-4 bg-dark-background/40 rounded-lg">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-turbo-purple" />
            Explanation
          </h4>
          <p className="text-white/80 text-sm">{question.explanation}</p>
        </div>
      )}

      {!showResult && (
        <Button
          onClick={handleSubmit}
          disabled={
            ((question.type === "MCQ" || question.type === "True/False") &&
              selectedAnswer === undefined) ||
            (question.type === "Essay" && !essayAnswer.trim()) ||
            (question.type === "Oral" && recordingTime === 0)
          }
          className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
        >
          Submit Answer
        </Button>
      )}
    </motion.div>
  );
};