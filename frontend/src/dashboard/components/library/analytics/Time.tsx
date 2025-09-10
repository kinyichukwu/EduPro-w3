import { motion } from "framer-motion";
import {
  Clock,
  LineChart,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../../GlassCard";

interface weeklyStudyTime {
  day: string
  hours: number
}

// Bar chart creator helper function
const BarChart = ({ data, maxValue }: { data: weeklyStudyTime[]; maxValue: number }) => (
  <div className="flex items-end gap-2 h-40">
    {data.map((item, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div className="w-full relative">
          <div
            className="w-full bg-gradient-to-t from-purple-500 to-indigo-600 rounded-t"
            style={{ height: `${(item.hours / maxValue) * 150}px` }}
          ></div>
          <div className="absolute inset-0 bg-white/10 rounded-t"></div>
        </div>
        <div className="text-xs mt-2 text-gray-500">{item.day}</div>
      </div>
    ))}
  </div>
);

export const Time = () => {
  // Mock data for weekly study time
  const weeklyStudyTime = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.0 },
    { day: "Fri", hours: 1.5 },
    { day: "Sat", hours: 4.0 },
    { day: "Sun", hours: 2.2 },
  ];

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Weekly Time Overview */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Weekly Study Time</h3>

        <div className="h-64">
          <BarChart data={weeklyStudyTime} maxValue={5} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div>
            <div className="text-sm text-gray-500">Total Time</div>
            <div className="text-2xl font-bold">17.2 hrs</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Daily Average</div>
            <div className="text-2xl font-bold">2.5 hrs</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Best Day</div>
            <div className="text-2xl font-bold">Saturday</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Goal Progress</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">86%</div>
              <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4">
            Subject Time Distribution
          </h3>

          <div className="space-y-5">
            {subjectPerformance.slice(0, 4).map((subject) => (
              <div key={subject.id}>
                <div className="flex justify-between mb-1 items-center">
                  <div className="flex items-center">
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <div className="text-sm font-medium">{subject.time}</div>
                </div>

                <div className="w-full bg-gray-200/20 rounded-full h-2.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    style={{
                      width: `${(parseInt(subject.time) / 10) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4">Productivity Insights</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <LineChart size={20} />
              </div>
              <div>
                <h4 className="font-medium">Most Productive Times</h4>
                <div className="text-sm text-gray-500 mt-1">
                  Your peak focus hours are between 6PM - 8PM
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-medium">Longest Study Session</h4>
                <div className="text-sm text-gray-500 mt-1">
                  2 hours 15 minutes on Saturday (Mathematics)
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Timer size={20} />
              </div>
              <div>
                <h4 className="font-medium">Average Session Length</h4>
                <div className="text-sm text-gray-500 mt-1">
                  45 minutes per study session
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Goal Setting */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold">Weekly Study Goal</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You're 86% towards your goal of 20 hours per week
            </p>
          </div>
          <Button
            variant="outline"
            className="max-sm:w-full text-purple-500 border-dashed"
          >
            Adjust Goal
          </Button>
        </div>

        <div className="w-full bg-gray-200/20 rounded-full h-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
            style={{ width: "86%" }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-500">0 hrs</span>
          <span className="text-gray-500">10 hrs</span>
          <span className="text-gray-500">20 hrs</span>
        </div>
      </GlassCard>
    </motion.div>
  )
}