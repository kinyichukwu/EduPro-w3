import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  Play,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { GlassCard } from "../GlassCard";
import { difficultyColors, pastQuestions, subjects } from "@/dashboard/constants/library";

export const Questions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Available Question Papers</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <SlidersHorizontal size={14} />
            <span className="max-sm:hidden">Sort by:</span>
            <select className="bg-transparent border-none font-medium text-purple-500 focus:outline-none cursor-pointer">
              <option>Recent</option>
              <option>Year</option>
              <option>Difficulty</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pastQuestions.map((question) => (
          <motion.div
            key={question.id}
            variants={itemVariants}
            className="relative"
          >
            <GlassCard className="p-0 overflow-hidden transition-all hover:shadow-lg">
              <div className="flex flex-col md:flex-row">
                {/* Left color bar */}
                <div
                  className={`w-full md:w-2 h-2 md:h-auto ${
                    subjects.find((s) => s.name === question.subject)
                      ?.color ?? "bg-gray-500"
                  }`}
                ></div>

                <div className="p-4 md:p-5 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold">
                          {question.subject}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {question.year}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            difficultyColors[
                              question.difficulty as keyof typeof difficultyColors
                            ]
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <BookOpen size={14} />
                          <span>
                            {question.examType} {question.paper}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>{question.questions} Questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{question.duration} Minutes</span>
                        </div>
                      </div>

                      {question.progress > 0 && (
                        <div className="mb-2 w-full md:max-w-md">
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">
                              {question.progress}%
                            </span>
                          </div>
                          <Progress
                            value={question.progress}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-center md:items-end gap-3 md:min-w-[120px]">
                      <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 w-full md:w-auto">
                        <Play size={14} className="mr-1" /> Practice
                      </Button>

                      <div className="flex flex-col md:flex-row items-center gap-2 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                        >
                          <Download size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                        >
                          <Star size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}