import { motion } from "framer-motion";
import { 
  Trophy, 
  Gift, 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  Target,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";
import { TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    <TabsContent value="rewards" className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Overview */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rewards</p>
                    <p className="text-2xl font-bold text-white">1,250</p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-2 border border-green-500/20">
                    <Gift className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+12%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Streaks</p>
                    <p className="text-2xl font-bold text-white">23</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 p-2 border border-orange-500/20">
                    <Target className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">7 days remaining</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-2 border border-purple-500/20">
                    <Award className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Star className="mr-1 h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">2 unlocked this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">87%</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/20">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <Progress value={87} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Active Challenges */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-lg border border-white/10 bg-dark-accent/20 hover:bg-dark-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg p-2 bg-white/5 border border-white/10">
                        <reward.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                      {reward.reward}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-white font-medium">
                        {reward.progress}/{reward.total}
                      </span>
                    </div>
                    <Progress 
                      value={(reward.progress / reward.total) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-purple-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 transition-all ${
                      achievement.earned
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-white/10 bg-dark-accent/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${
                        achievement.earned 
                          ? "bg-green-500/10 border-green-500/20" 
                          : "bg-gray-500/10 border-gray-500/20"
                      }`}>
                        <achievement.icon className={`h-5 w-5 ${
                          achievement.earned ? "text-green-400" : "text-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.earned ? "text-white" : "text-gray-400"
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {achievement.date}
                        </p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TabsContent>
  );
}
