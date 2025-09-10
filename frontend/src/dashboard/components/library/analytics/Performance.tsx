import { motion } from "framer-motion";
import {
  ArrowDown,
  ChevronRight,
  ArrowUp,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../../GlassCard";

export const Performance = () => {
  // Mock data for subject performance
  const subjectPerformance = [
    {
      id: 1,
      subject: "Mathematics",
      score: 82,
      change: 4,
      trend: "up",
      questions: 45,
      time: "8h 20m",
    },
    {
      id: 2,
      subject: "Physics",
      score: 75,
      change: -2,
      trend: "down",
      questions: 32,
      time: "5h 45m",
    },
    {
      id: 3,
      subject: "Chemistry",
      score: 68,
      change: 6,
      trend: "up",
      questions: 28,
      time: "4h 10m",
    },
    {
      id: 4,
      subject: "Biology",
      score: 91,
      change: 3,
      trend: "up",
      questions: 22,
      time: "3h 30m",
    },
    {
      id: 5,
      subject: "English",
      score: 65,
      change: 0,
      trend: "steady",
      questions: 18,
      time: "2h 15m",
    },
  ];

  // Helper function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp size={16} className="text-emerald-500" />;
      case "down":
        return <ArrowDown size={16} className="text-red-500" />;
      default:
        return <ChevronRight size={16} className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Subject Performance */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold">Subject Performance</h3>
        </div>

        <div className="p-6 space-y-6">
          {subjectPerformance.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium">{subject.subject}</span>
                    <div
                      className={`ml-2 flex items-center text-xs ${
                        subject.trend === "up"
                          ? "text-emerald-500"
                          : subject.trend === "down"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {getTrendIcon(subject.trend)}
                      <span className="ml-0.5">
                        {Math.abs(subject.change)}%
                      </span>
                    </div>
                  </div>
                  <span className="font-bold">{subject.score}%</span>
                </div>

                <div className="w-full bg-gray-200/20 rounded-full h-2.5 mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    style={{ width: `${subject.score}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {subject.questions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {subject.time}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-500 h-6 px-2"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Performance Insights */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Performance Insights</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Strengths</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-lg">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h5 className="font-medium">Cell Biology (91%)</h5>
                  <p className="text-xs text-gray-500">
                    Consistent high scores in cellular structure questions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-lg">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h5 className="font-medium">Algebra (85%)</h5>
                  <p className="text-xs text-gray-500">
                    Strong performance in equation solving and factorization
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">
              Areas to Improve
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-red-100/20 dark:bg-red-900/10 rounded-lg">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 flex-shrink-0">
                  <ArrowDown size={16} />
                </div>
                <div>
                  <h5 className="font-medium">Classical Mechanics (58%)</h5>
                  <p className="text-xs text-gray-500">
                    Difficulty with force and motion calculation problems
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-100/20 dark:bg-red-900/10 rounded-lg">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 flex-shrink-0">
                  <ArrowDown size={16} />
                </div>
                <div>
                  <h5 className="font-medium">Calculus (62%)</h5>
                  <p className="text-xs text-gray-500">
                    Need more practice with integration techniques
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <Button className="max-sm:w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
            Generate Study Plan
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}