"use client"

import { useState } from "react"
import { Target, Calendar, Users, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ChallengeCard } from "./ChallengeCard"

const challengesData = {
  daily: [
    {
      id: "daily-quiz",
      title: "Daily Quiz Master",
      description: "Complete 3 quizzes with 80% accuracy",
      reward: 25,
      progress: 67,
      maxProgress: 100,
      timeRemaining: "18h 42m",
      difficulty: "Easy" as const,
      participants: 1247,
      icon: "🧠",
      type: "daily" as const,
    },
    {
      id: "daily-streak",
      title: "Learning Streak",
      description: "Study for at least 30 minutes",
      reward: 15,
      progress: 100,
      maxProgress: 100,
      timeRemaining: "Completed",
      difficulty: "Easy" as const,
      participants: 892,
      icon: "📚",
      type: "daily" as const,
    },
  ],
  weekly: [
    {
      id: "weekly-courses",
      title: "Course Explorer",
      description: "Complete 2 full courses this week",
      reward: 150,
      progress: 50,
      maxProgress: 100,
      timeRemaining: "4d 12h",
      difficulty: "Medium" as const,
      participants: 456,
      icon: "🎓",
      type: "weekly" as const,
    },
    {
      id: "weekly-community",
      title: "Community Helper",
      description: "Help 5 students in the forum",
      reward: 100,
      progress: 80,
      maxProgress: 100,
      timeRemaining: "4d 12h",
      difficulty: "Medium" as const,
      participants: 234,
      icon: "🤝",
      type: "weekly" as const,
    },
  ],
  monthly: [
    {
      id: "monthly-mastery",
      title: "Subject Mastery",
      description: "Achieve 95% average in JavaScript fundamentals",
      reward: 500,
      progress: 78,
      maxProgress: 100,
      timeRemaining: "18d 6h",
      difficulty: "Hard" as const,
      participants: 89,
      icon: "⚡",
      type: "monthly" as const,
    },
    {
      id: "monthly-mentor",
      title: "Mentor Status",
      description: "Mentor 10 new students this month",
      reward: 300,
      progress: 30,
      maxProgress: 100,
      timeRemaining: "18d 6h",
      difficulty: "Hard" as const,
      participants: 45,
      icon: "👨‍🏫",
      type: "monthly" as const,
    },
  ],
}

export function ChallengesSection() {
  const [activeTab, setActiveTab] = useState("daily")

  const getTotalChallenges = (type: keyof typeof challengesData) => challengesData[type].length
  const getActiveChallenges = (type: keyof typeof challengesData) =>
    challengesData[type].filter((c) => c.progress < 100).length

  return (
    <Card className="border-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white">Active Challenges</CardTitle>
            <p className="text-muted-foreground text-sm">Complete challenges to earn bonus rewards</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-accent/20 border-white/5">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily ({getActiveChallenges("daily")}/{getTotalChallenges("daily")})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weekly ({getActiveChallenges("weekly")}/{getTotalChallenges("weekly")})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Monthly ({getActiveChallenges("monthly")}/{getTotalChallenges("monthly")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {challengesData.daily.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {challengesData.weekly.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {challengesData.monthly.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Challenge Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Challenges</p>
                <p className="text-2xl font-bold text-white">
                  {challengesData.daily.filter((c) => c.progress === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Progress</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    challengesData.weekly.reduce((acc, c) => acc + c.progress, 0) / challengesData.weekly.length,
                  )}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Average completion</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Community Rank</p>
                <p className="text-2xl font-bold text-white">#47</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
