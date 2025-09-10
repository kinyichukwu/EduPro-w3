import { motion } from "framer-motion";
import {
  Book,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import { getTrendIcon } from "@/dashboard/library/analytics";
import { performanceStats } from "@/dashboard/constants/library";
import { GlassCard } from "../../GlassCard";

interface StatsProp {
  timeframe: "week" | "month" | "year"
}

export const Stats = ({timeframe}: StatsProp) => {
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {performanceStats.map((stat) => (
        <motion.div key={stat.id} variants={itemVariants}>
          <GlassCard className="p-5">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </h3>
              <div className={`p-2 rounded-full ${stat.color}`}>
                {stat.id === "questions" ? (
                  <Target size={16} className="text-white" />
                ) : stat.id === "accuracy" ? (
                  <PieChart size={16} className="text-white" />
                ) : stat.id === "streak" ? (
                  <TrendingUp size={16} className="text-white" />
                ) : (
                  <Book size={16} className="text-white" />
                )}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  <span
                    className={`flex items-center mr-1 ${
                      stat.trend === "up"
                        ? "text-emerald-500"
                        : stat.trend === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {getTrendIcon(stat.trend)}
                    {stat.change}%
                  </span>
                  <span className="text-gray-500">
                    vs. last {timeframe}
                  </span>
                </div>
              </div>

              <div className="h-10 w-20">
                {/* Small Sparkline Chart Placeholder */}
                <svg viewBox="0 0 100 30" className="h-full w-full">
                  <path
                    d={
                      stat.trend === "up"
                        ? "M0,30 L10,28 L20,25 L30,20 L40,15 L50,18 L60,13 L70,10 L80,8 L90,5 L100,0"
                        : "M0,5 L10,8 L20,10 L30,15 L40,10 L50,15 L60,20 L70,15 L80,25 L90,20 L100,30"
                    }
                    fill="none"
                    stroke={
                      stat.trend === "up"
                        ? "#10b981"
                        : stat.trend === "down"
                        ? "#ef4444"
                        : "#6b7280"
                    }
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  )
}