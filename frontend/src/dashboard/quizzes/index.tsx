import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QuizCard } from "../components/quizzes/QuizCard";
import { CreateQuizModal } from "../components/quizzes";

export interface Quiz {
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

export default function QuizView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: "Advanced Biology Quiz",
      description: "Test your knowledge of cellular biology and genetics",
      questionCount: 15,
      timeLimit: 30,
      difficulty: "hard",
      type: "Mixed",
      color: "#10b981",
      lastTaken: new Date("2024-01-15"),
      bestScore: 87,
      averageScore: 82,
      timesCompleted: 3,
    },
    {
      id: 2,
      title: "Physics Fundamentals",
      description: "Classical mechanics and thermodynamics concepts",
      questionCount: 20,
      timeLimit: 45,
      difficulty: "medium",
      type: "MCQ",
      color: "#3b82f6",
      lastTaken: new Date("2024-01-14"),
      bestScore: 92,
      averageScore: 88,
      timesCompleted: 5,
    },
    {
      id: 3,
      title: "Chemistry Quick Test",
      description: "Organic chemistry reactions and mechanisms",
      questionCount: 10,
      difficulty: "easy",
      type: "True/False",
      color: "#f59e0b",
      bestScore: 95,
      averageScore: 90,
      timesCompleted: 2,
    },
    {
      id: 4,
      title: "Mathematics Essay",
      description: "Explain mathematical concepts in detail",
      questionCount: 5,
      timeLimit: 60,
      difficulty: "hard",
      type: "Essay",
      color: "#a855f7",
      timesCompleted: 0,
    },
  ]);
  const navigate = useNavigate()

  const handleStartQuiz = (quiz: Quiz) => {
    navigate(`${quiz.title.trim().replace(/\s+/g, "-")}`);
  };

  const handleCreateQuiz = (newQuiz: Omit<Quiz, "id">) => {
    const quiz: Quiz = {
      ...newQuiz,
      id: Math.max(...quizzes.map((q) => q.id)) + 1,
      timesCompleted: 0,
    };
    setQuizzes([...quizzes, quiz]);
    setShowCreateModal(false);
  };

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-purple">
            {quizzes.length}
          </div>
          <div className="text-sm text-white/60">Available Quizzes</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-indigo">
            {quizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0)}
          </div>
          <div className="text-sm text-white/60">Total Questions</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(
              quizzes
                .filter((q) => q.bestScore)
                .reduce((sum, quiz) => sum + (quiz.bestScore ?? 0), 0) /
                quizzes.filter((q) => q.bestScore).length || 0
            )}
            %
          </div>
          <div className="text-sm text-white/60">Avg Score</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {quizzes.reduce((sum, quiz) => sum + quiz.timesCompleted, 0)}
          </div>
          <div className="text-sm text-white/60">Completed</div>
        </div>
      </div>

      {/* Main Quizzes Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-4 sm:p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Practice Quizzes
            </h1>
            <p className="text-white/60 mt-1">
              Test your knowledge with interactive quizzes
            </p>
          </div>

          <div className="flex max-md:justify-end gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>

            <Button
              variant="outline"
              className="w-full border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="min-w-max">AI Generate</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <QuizCard quiz={quiz} onPlay={handleStartQuiz} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateQuiz={handleCreateQuiz}
      />
    </div>
  );
}