import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Coins,
  Crown,
  Flame,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";

export function RewardsTab() {
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

  const rewards = [
    {
      id: 1,
      title: "Study Streak Master",
      description: "Complete 30 consecutive days of studying",
      progress: 23,
      total: 30,
      reward: "500 EduPro Coins",
      icon: Target,
    },
    {
      id: 2,
      title: "Quiz Champion",
      description: "Score 90% or higher on 10 quizzes",
      progress: 7,
      total: 10,
      reward: "Premium Badge",
      icon: Trophy,
    },
    {
      id: 3,
      title: "Knowledge Seeker",
      description: "Complete 50 flashcard sessions",
      progress: 34,
      total: 50,
      reward: "300 EduPro Coins",
      icon: Star,
    }
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Completed your first quiz",
      date: "Jan 15, 2024",
      icon: CheckCircle,
      earned: true
    },
    {
      title: "Week Warrior",
      description: "7-day study streak",
      date: "Jan 20, 2024", 
      icon: Calendar,
      earned: true
    },
    {
      title: "Speed Learner",
      description: "Complete 5 lessons in one day",
      date: "Coming soon",
      icon: Zap,
      earned: false
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Rewards Portfolio Header */}
        <motion.div variants={itemVariants}>
          <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Rewards Dashboard
              </h1>
              <p className="text-white/60 mt-1">
                Track your learning progress and claim rewards
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-white/60">Total Earned</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">1,250</span>
                </div>
              </div>
              
              <div className="h-12 w-px bg-white/20"></div>
              
              <div className="text-right">
                <p className="text-sm text-white/60">This Month</p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">+180</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">1,250</p>
                  <p className="text-sm text-white/60">Portfolio Value</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">23</p>
                  <p className="text-sm text-white/60">Active Streak</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-white/60">Achievements</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">87%</p>
                  <p className="text-sm text-white/60">Success Rate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Active Challenges */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Challenges</h2>
              <Badge className="bg-turbo-purple/20 text-turbo-purple border-turbo-purple/30 text-sm">
                3 Active
              </Badge>
            </div>
            <div className="space-y-6">
              {rewards.map((reward, index) => (
                <div
                  key={reward.id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        index === 0 ? 'bg-emerald-500/20' :
                        index === 1 ? 'bg-amber-500/20' :
                        'bg-violet-500/20'
                      }`}>
                        <reward.icon className={`h-6 w-6 ${
                          index === 0 ? 'text-emerald-400' :
                          index === 1 ? 'text-amber-400' :
                          'text-violet-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-md">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        index === 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        index === 1 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      } px-3 py-1`}>
                        <Coins className="h-3 w-3 mr-1" />
                        {reward.reward}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          {reward.progress}
                        </span>
                        <span className="text-sm text-white/60">/ {reward.total}</span>
                        <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                          {Math.round((reward.progress / reward.total) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={(reward.progress / reward.total) * 100} 
                        className={`h-3 ${
                          index === 0 ? 'bg-emerald-500/20' :
                          index === 1 ? 'bg-amber-500/20' :
                          'bg-violet-500/20'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievement Collection */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Achievement Collection</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm">
                {achievements.filter(a => a.earned).length}/{achievements.length} Unlocked
              </Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden p-6 transition-colors ${
                    achievement.earned
                      ? "hover:bg-green-500/10"
                      : "hover:bg-white/10"
                  }`}
                >
                  {/* Achievement Icon */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                      achievement.earned 
                        ? "bg-gradient-to-br from-green-400 to-emerald-600" 
                        : "bg-gradient-to-br from-gray-400 to-gray-600 grayscale"
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.earned ? "text-white" : "text-gray-300"
                      }`} />
                    </div>
                    
                    {/* Achievement Info */}
                    <div className="space-y-2">
                      <h3 className={`font-bold text-lg ${
                        achievement.earned ? "text-white" : "text-gray-400"
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        achievement.earned ? "text-white/60" : "text-gray-500"
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    
                    {/* Achievement Date/Status */}
                    <div className="w-full pt-2">
                      <div className={`rounded-lg border px-3 py-2 text-center ${
                        achievement.earned
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-gray-500/30 bg-gray-500/10"
                      }`}>
                        <p className={`text-xs font-medium ${
                          achievement.earned ? "text-green-300" : "text-gray-400"
                        }`}>
                          {achievement.earned ? (
                            <>
                              <Trophy className="inline h-3 w-3 mr-1" />
                              Earned {achievement.date}
                            </>
                          ) : (
                            <>
                              <Clock className="inline h-3 w-3 mr-1" />
                              {achievement.date}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
