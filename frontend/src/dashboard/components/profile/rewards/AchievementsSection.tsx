"use client"

import { useState } from "react"
import { Trophy, Star, Lock, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { AchievementBadge } from "./AchievementBadge"

const achievementsData = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "👶",
    rarity: "common" as const,
    unlocked: true,
    unlockedAt: "2024-01-15",
    category: "milestone",
    requirement: "Complete 1 quiz",
    reward: 10,
  },
  {
    id: "quiz-novice",
    title: "Quiz Novice",
    description: "Complete 10 quizzes",
    icon: "🎯",
    rarity: "common" as const,
    unlocked: true,
    unlockedAt: "2024-01-20",
    category: "quiz",
    requirement: "Complete 10 quizzes",
    reward: 25,
  },
  {
    id: "streak-warrior",
    title: "Streak Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    rarity: "rare" as const,
    unlocked: true,
    unlockedAt: "2024-01-28",
    category: "streak",
    requirement: "7-day streak",
    reward: 50,
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Complete 5 different courses",
    icon: "📚",
    rarity: "rare" as const,
    unlocked: true,
    unlockedAt: "2024-02-05",
    category: "course",
    requirement: "Complete 5 courses",
    reward: 100,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score 100% on 25 quizzes",
    icon: "🧠",
    rarity: "epic" as const,
    unlocked: true,
    unlockedAt: "2024-02-12",
    category: "quiz",
    requirement: "100% on 25 quizzes",
    reward: 200,
  },
  {
    id: "community-champion",
    title: "Community Champion",
    description: "Help 50 students in the forum",
    icon: "🤝",
    rarity: "epic" as const,
    unlocked: false,
    unlockedAt: null,
    category: "community",
    requirement: "Help 50 students",
    reward: 250,
    progress: 32,
    maxProgress: 50,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Maintain 95% average across all subjects",
    icon: "💎",
    rarity: "legendary" as const,
    unlocked: false,
    unlockedAt: null,
    category: "performance",
    requirement: "95% average",
    reward: 500,
    progress: 87,
    maxProgress: 95,
  },
  {
    id: "mentor-supreme",
    title: "Mentor Supreme",
    description: "Successfully mentor 100 students",
    icon: "👑",
    rarity: "legendary" as const,
    unlocked: false,
    unlockedAt: null,
    category: "mentoring",
    requirement: "Mentor 100 students",
    reward: 1000,
    progress: 12,
    maxProgress: 100,
  },
  {
    id: "course-conqueror",
    title: "Course Conqueror",
    description: "Complete all available courses",
    icon: "🏆",
    rarity: "legendary" as const,
    unlocked: false,
    unlockedAt: null,
    category: "course",
    requirement: "Complete all courses",
    reward: 750,
    progress: 18,
    maxProgress: 25,
  },
]

export function AchievementsSection() {
  const [filter, setFilter] = useState("all")

  const filteredAchievements = achievementsData.filter((achievement) => {
    if (filter === "all") return true
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return achievement.rarity === filter || achievement.category === filter
  })

  const unlockedCount = achievementsData.filter((a) => a.unlocked).length
  const totalCount = achievementsData.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

  return (
    <Card className="border-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">Achievements</CardTitle>
              <p className="text-muted-foreground text-sm">
                {unlockedCount} of {totalCount} unlocked ({completionPercentage}% complete)
              </p>
            </div>
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="milestone">Milestones</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Achievement Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Common</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {achievementsData.filter((a) => a.rarity === "common" && a.unlocked).length}
                </p>
              </div>
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
          </div>

          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rare</p>
                <p className="text-2xl font-bold text-blue-400">
                  {achievementsData.filter((a) => a.rarity === "rare" && a.unlocked).length}
                </p>
              </div>
              <Star className="h-6 w-6 text-blue-400" />
            </div>
          </div>

          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Epic</p>
                <p className="text-2xl font-bold text-purple-400">
                  {achievementsData.filter((a) => a.rarity === "epic" && a.unlocked).length}
                </p>
              </div>
              <Star className="h-6 w-6 text-purple-400" />
            </div>
          </div>

          <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Legendary</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {achievementsData.filter((a) => a.rarity === "legendary" && a.unlocked).length}
                </p>
              </div>
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="p-16 text-center bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No achievements found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more achievements.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
