import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Blocks,
  BookOpen,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Clock,
  GraduationCap,
  Library,
  LineChart,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { GlassCard } from "../components/GlassCard";

export const DashboardHome = () => {
  const navigate = useNavigate();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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

  // Main feature cards that navigate to different sections
  const featureCards = [
    {
      title: "AI Tutor",
      description: "Get intelligent tutoring and personalized learning support",
      icon: <BrainCircuit size={24} />,
      stats: { value: 15, label: "Sessions This Week" },
      color: "from-green to-teal",
      path: "/dashboard/ai-tutor",
      action: "Ask AI",
    },
    {
      title: "Library",
      description: "Browse past questions, notes, and educational resources",
      icon: <Library size={24} />,
      stats: { value: 24, label: "Materials" },
      color: "from-turbo-blue to-light-blue",
      path: "/dashboard/library",
      action: "Explore Resources",
    },
    {
      title: "Study Room",
      description: "Access your courses, study materials, and learning paths",
      icon: <BookOpen size={24} />,
      stats: { value: 4, label: "Active Courses" },
      color: "from-turbo-purple to-purple/90",
      path: "/dashboard/quizzes",
      action: "Continue Learning",
    },
    {
      title: "Performance",
      description: "Track your progress, achievements, and exam readiness",
      icon: <LineChart size={24} />,
      stats: { value: "78%", label: "Average Score" },
      color: "from-amber to-orange",
      path: "/dashboard/performance",
      action: "View Analytics",
    },
  ];

  // Most recent activity data
  const recentActivities = [
    {
      title: "Completed Physics Quiz",
      time: "2 hours ago",
      score: "85%",
      icon: <Trophy className="text-amber" size={16} />,
    },
    {
      title: "Studied Organic Chemistry",
      time: "Yesterday",
      duration: "45 min",
      icon: <Clock className="text-turbo-blue" size={16} />,
    },
    {
      title: "Created Biology Flashcards",
      time: "2 days ago",
      count: "24 cards",
      icon: <Blocks className="text-green" size={16} />,
    },
  ];

  // Weekly study goal progress
  const weeklyProgress = 78;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Section with Study Goal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-purple via-turbo-blue to-light-blue text-transparent bg-clip-text">
            Welcome back, Alex
          </h1>
          <p className="text-white/60">
            Your learning journey continues
          </p>
        </div>

        <GlassCard className="p-4 w-full md:w-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-purple" />
              <span className="font-medium">Weekly Study Goal</span>
            </div>
            <TrendingUp size={18} className="text-green" />
          </div>
          <Progress value={weeklyProgress} className="h-2 mb-2" />
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-white/60">{weeklyProgress}% completed</span>
            <span className="font-medium">5h 12m this week</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Feature Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {featureCards.map((card) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            className="relative overflow-hidden rounded-xl transition-all duration-300 min-h-[280px] group"
            onClick={() => navigate(card.path)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90`}
            ></div>
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Glass overlay effect */}
            <div className="absolute inset-0 backdrop-blur-[2px] opacity-10 group-hover:opacity-0 transition-opacity"></div>

            {/* Content */}
            <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
              <div>
                <div className="p-3 bg-white/20 rounded-lg w-fit mb-4 backdrop-blur-sm">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/80 text-sm mb-6">{card.description}</p>
              </div>

              <div>
                <div className="mb-4 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                  <div className="text-xl font-bold">{card.stats.value}</div>
                  <div className="text-xs text-white/70">
                    {card.stats.label}
                  </div>
                </div>

                <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                  {card.action}{" "}
                  <ChevronRight
                    size={16}
                    className="ml-1 group-hover:ml-2 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <Button
              variant="ghost"
              className="text-xs flex items-center gap-1 text-purple"
            >
              View All <ChevronRight size={14} />
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 dark:bg-white/5 rounded-full">
                    {activity.icon}
                  </div>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-xs text-gray">{activity.time}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {activity.score ?? activity.duration ?? activity.count}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Upcoming</h2>
            <Button
              variant="ghost"
              className="text-xs flex items-center gap-1 text-purple"
            >
              Calendar <ChevronRight size={14} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200/20 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/10 text-purple rounded-lg">
                  <GraduationCap size={18} />
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-white/10 text-purple">
                  Tomorrow
                </div>
              </div>
              <h3 className="font-medium mb-1">Math Final Exam</h3>
              <p className="text-xs text-white/60">9:00 AM - 11:00 AM</p>
              <Progress value={90} className="h-1.5 mt-3" />
              <p className="text-xs text-right mt-1 text-purple">
                90% Ready
              </p>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              Schedule Study Session
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardHome;
