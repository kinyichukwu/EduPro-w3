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
    <TabsContent value="rewards" className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Rewards Portfolio Header */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-gradient-to-br from-dark-card/90 via-dark-card/70 to-dark-card/50 backdrop-blur-xl">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Rewards Dashboard
                    </h1>
                  </div>
                  <p className="text-muted-foreground">Track your learning progress and claim rewards</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-400" />
                      <span className="text-3xl font-bold text-white">1,250</span>
                    </div>
                  </div>
                  
                  <div className="h-12 w-px bg-white/20"></div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">+180</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Premium Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-white/10 bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-transparent backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-200/80">Portfolio Value</p>
                  <p className="text-3xl font-bold text-white">1,250</p>
                  <p className="text-xs text-yellow-300/60 mt-1">EduPro Coins</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-transparent backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    23 Days
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-200/80">Active Streak</p>
                  <p className="text-3xl font-bold text-white">23</p>
                  <p className="text-xs text-orange-300/60 mt-1">Keep it going!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-transparent backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    Elite
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-200/80">Achievements</p>
                  <p className="text-3xl font-bold text-white">8</p>
                  <p className="text-xs text-purple-300/60 mt-1">Badges unlocked</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Progress value={87} className="w-16 h-2 bg-emerald-500/20" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Success Rate</p>
                  <p className="text-3xl font-bold text-white">87%</p>
                  <p className="text-xs text-emerald-300/60 mt-1">Performance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Premium Challenges */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/40 backdrop-blur-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Active Challenges
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    3 Active
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {rewards.map((reward, index) => (
                <div
                  key={reward.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-transparent p-6 hover:from-white/8 hover:via-white/4 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                       style={{
                         background: `linear-gradient(135deg, ${
                           index === 0 ? '#10b981/10' : 
                           index === 1 ? '#f59e0b/10' : 
                           '#8b5cf6/10'
                         } 0%, transparent 50%)`
                       }}>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                          index === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                          'bg-gradient-to-br from-violet-400 to-violet-600'
                        }`}>
                          <reward.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
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
                          <span className="text-sm text-muted-foreground">/ {reward.total}</span>
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
                        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r opacity-30"
                             style={{
                               background: `linear-gradient(90deg, ${
                                 index === 0 ? '#10b981' :
                                 index === 1 ? '#f59e0b' :
                                 '#8b5cf6'
                               } 0%, transparent ${(reward.progress / reward.total) * 100}%)`
                             }}>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium Achievements Gallery */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/40 backdrop-blur-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  Achievement Collection
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {achievements.filter(a => a.earned).length}/{achievements.length} Unlocked
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 ${
                      achievement.earned
                        ? "border-gradient-to-br from-green-500/30 to-emerald-500/20 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent hover:from-green-500/15 hover:via-emerald-500/8"
                        : "border-white/10 bg-gradient-to-br from-gray-500/5 via-gray-400/2 to-transparent hover:from-gray-500/8 hover:via-gray-400/4"
                    }`}
                  >
                    {/* Decorative Elements */}
                    {achievement.earned && (
                      <>
                        <div className="absolute top-2 right-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Achievement Icon */}
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${
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
                            achievement.earned ? "text-muted-foreground" : "text-gray-500"
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
