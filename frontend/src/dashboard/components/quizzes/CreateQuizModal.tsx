import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { Quiz } from "@/dashboard/quizzes";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuiz: (quiz: Omit<Quiz, "id">) => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  onCreateQuiz,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [type, setType] = useState<
    "MCQ" | "True/False" | "Essay" | "Oral" | "Mixed"
  >("MCQ");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onCreateQuiz({
      title,
      description: description || `A ${type} quiz on ${title}`,
      questionCount,
      timeLimit,
      difficulty,
      type,
      color: randomColor,
      timesCompleted: 0,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setQuestionCount(10);
    setTimeLimit(undefined);
    setDifficulty("medium");
    setType("MCQ");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">
              Create New Quiz
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quiz Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title..."
                  className="bg-white/5 border-white/20 text-white placeholder-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this quiz covers..."
                  rows={3}
                  className="bg-white/5 border-white/20 text-white placeholder-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Question Count
                  </label>
                  <Input
                    type="number"
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(parseInt(e.target.value) || 10)
                    }
                    min="1"
                    max="50"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Time Limit (minutes)
                  </label>
                  <Input
                    type="number"
                    value={timeLimit ?? ""}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Unlimited"
                    min="1"
                    max="180"
                    className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quiz Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["MCQ", "True/False", "Essay", "Oral", "Mixed"] as const
                  ).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium transition-all",
                        type === t
                          ? "border-turbo-purple bg-turbo-purple/10 text-turbo-purple"
                          : "border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium capitalize transition-all",
                        difficulty === level
                          ? "border-turbo-purple bg-turbo-purple/10 text-turbo-purple"
                          : "border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="flex-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
              >
                Create Quiz
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};