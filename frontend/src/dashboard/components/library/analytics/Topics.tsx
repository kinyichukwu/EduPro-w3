import { motion } from "framer-motion";
import {
  Target,
  Timer,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../../GlassCard";

export const Topics = () => {
  // Mock data for topic mastery
  const topicMastery = [
    { topic: "Algebra", mastery: 85, icon: "📊" },
    { topic: "Calculus", mastery: 62, icon: "📈" },
    { topic: "Organic Chemistry", mastery: 75, icon: "🧪" },
    { topic: "Classical Mechanics", mastery: 58, icon: "🔧" },
    { topic: "Cell Biology", mastery: 91, icon: "🔬" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery List */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4">Topic Mastery Levels</h3>

          <div className="space-y-6">
            {topicMastery.map((topic) => (
              <div key={topic.topic} className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{topic.icon}</span>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {topic.mastery}%
                  </span>
                </div>

                <div className="w-full bg-gray-200/20 rounded-full h-2.5">
                  <div
                    className={`h-full rounded-full ${
                      topic.mastery > 80
                        ? "bg-gradient-to-r from-emerald-500 to-green-600"
                        : topic.mastery > 65
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                        : "bg-gradient-to-r from-amber-500 to-orange-600"
                    }`}
                    style={{ width: `${topic.mastery}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Beginner</span>
                  <span>Proficient</span>
                  <span>Expert</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Mastery Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4">Mastery Distribution</h3>

          <div className="h-64 relative">
            {/* Placeholder for a pie chart - in a real implementation this would be a proper chart component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-48 w-48">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    transform="rotate(-90 50 50)"
                    strokeDashoffset="62.8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    transform="rotate(-90 50 50)"
                    strokeDashoffset="188.4"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <div className="text-3xl font-bold">74%</div>
                    <div className="text-xs text-gray-500">
                      Overall Mastery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <div className="text-xs">
                <div className="font-medium">Expert</div>
                <div className="text-gray-500">2 topics</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <div className="text-xs">
                <div className="font-medium">Proficient</div>
                <div className="text-gray-500">1 topic</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <div className="text-xs">
                <div className="font-medium">Developing</div>
                <div className="text-gray-500">2 topics</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recommended Practice */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Recommended Practice</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer">
            <h4 className="font-medium mb-2">Calculus Foundations</h4>
            <p className="text-xs text-gray-500 mb-3">
              Focused practice on integration techniques to boost your
              mastery
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Target size={12} />
                  35 Questions
                </span>
                <span className="flex items-center gap-1">
                  <Timer size={12} />
                  45 min
                </span>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                Start
              </Button>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer">
            <h4 className="font-medium mb-2">Mechanics Master</h4>
            <p className="text-xs text-gray-500 mb-3">
              Build your physics skills with force and motion problem
              solving
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Target size={12} />
                  28 Questions
                </span>
                <span className="flex items-center gap-1">
                  <Timer size={12} />
                  40 min
                </span>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                Start
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}