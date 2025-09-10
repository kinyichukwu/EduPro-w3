import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  CheckCircle2,
  FileQuestion,
  NotebookPen,
  Mic,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ProgressRing } from "./ProgressRing";

interface Quiz {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  timeLimit?: number;
  difficulty: "easy" | "medium" | "hard";
  type: "MCQ" | "True/False" | "Essay" | "Oral" | "Mixed";
  color: string;
  lastTaken?: Date;
  bestScore?: number;
  averageScore?: number;
  timesCompleted: number;
}

export const QuizCard: React.FC<{
  quiz: Quiz;
  onPlay: (quiz: Quiz) => void;
}> = ({ quiz, onPlay }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/20";
      case "medium":
        return "text-amber-400 bg-amber-400/20";
      case "hard":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MCQ":
        return <CheckCircle2 className="w-3 h-3 text-turbo-purple" />;
      case "True/False":
        return <FileQuestion className="w-3 h-3 text-turbo-indigo" />;
      case "Essay":
        return <NotebookPen className="w-3 h-3 text-green-400" />;
      case "Oral":
        return <Mic className="w-3 h-3 text-amber-400" />;
      case "Mixed":
        return <Sparkles className="w-3 h-3 text-turbo-purple" />;
      default:
        return <FileQuestion className="w-3 h-3 text-turbo-purple" />;
    }
  };

  return (
    <motion.div
      className="group bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-dark-card/80 hover:border-turbo-purple/30 transition-all duration-300 p-6 flex flex-col hover:scale-[1.02] hover:shadow-xl hover:shadow-turbo-purple/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: quiz.color }}
            />
            <span
              className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                quiz.difficulty
              )}`}
            >
              {quiz.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 flex items-center gap-1">
              {getTypeIcon(quiz.type)}
              {quiz.type}
            </span>
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-turbo-purple transition-colors leading-tight mb-2">
            {quiz.title}
          </h3>
          <p className="text-sm text-white/60 mb-3">{quiz.description}</p>
        </div>
        <ProgressRing value={quiz.bestScore ?? 0} size={50} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-background/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileQuestion className="w-3 h-3 text-turbo-purple" />
            <span className="text-xs text-white/60">Questions</span>
          </div>
          <div className="text-sm font-medium text-white">
            {quiz.questionCount}
          </div>
        </div>
        <div className="bg-dark-background/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-white/60">Time</span>
          </div>
          <div className="text-sm font-medium text-white">
            {quiz.timeLimit ? `${quiz.timeLimit}m` : "Unlimited"}
          </div>
        </div>
      </div>

      {quiz.timesCompleted > 0 && (
        <div className="mb-4 p-3 bg-dark-background/40 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/60">Best Score</span>
            <span className="text-green-400 font-medium">
              {quiz.bestScore}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Completed</span>
            <span className="text-white font-medium">
              {quiz.timesCompleted}x
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={() => onPlay(quiz)}
        className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Quiz
      </Button>
    </motion.div>
  );
};