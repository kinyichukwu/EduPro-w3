"use client"

import { useState } from "react"
import { Gift, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { RewardCard } from "./RewardCard"

const rewardsData = [
  {
    id: "daily-login-7",
    title: "7-Day Login Streak",
    description: "Complete 7 consecutive days of logging in",
    reward: 50,
    progress: 100,
    maxProgress: 100,
    status: "claimable" as const,
    category: "daily",
    timeRemaining: null,
    icon: "🔥",
    rarity: "common" as const,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score 90% or higher on 5 quizzes",
    reward: 150,
    progress: 80,
    maxProgress: 100,
    status: "active" as const,
    category: "quiz",
    timeRemaining: "2 days",
    icon: "🧠",
    rarity: "rare" as const,
  },
  {
    id: "course-complete",
    title: "Course Completion",
    description: "Complete the Advanced JavaScript course",
    reward: 300,
    progress: 65,
    maxProgress: 100,
    status: "active" as const,
    category: "course",
    timeRemaining: "1 week",
    icon: "📚",
    rarity: "epic" as const,
  },
  {
    id: "referral-bonus",
    title: "Referral Bonus",
    description: "Invite 3 friends to join the platform",
    reward: 200,
    progress: 33,
    maxProgress: 100,
    status: "active" as const,
    category: "referral",
    timeRemaining: "No limit",
    icon: "👥",
    rarity: "rare" as const,
  },
  {
    id: "staking-reward",
    title: "Staking Rewards",
    description: "Stake 1000 EDU tokens for 30 days",
    reward: 100,
    progress: 0,
    maxProgress: 100,
    status: "locked" as const,
    category: "staking",
    timeRemaining: "Requires 1000 EDU",
    icon: "💎",
    rarity: "legendary" as const,
  },
  {
    id: "community-helper",
    title: "Community Helper",
    description: "Help 10 students in the forum",
    reward: 75,
    progress: 100,
    maxProgress: 100,
    status: "claimable" as const,
    category: "community",
    timeRemaining: null,
    icon: "🤝",
    rarity: "common" as const,
  },
]

interface RewardsSectionProps {
  walletConnected: boolean
}

export function RewardsSection({ walletConnected }: RewardsSectionProps) {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("reward")

  const filteredRewards = rewardsData.filter((reward) => {
    if (filter === "all") return true
    if (filter === "claimable") return reward.status === "claimable"
    if (filter === "active") return reward.status === "active"
    if (filter === "locked") return reward.status === "locked"
    return reward.category === filter
  })

  const sortedRewards = [...filteredRewards].sort((a, b) => {
    if (sortBy === "reward") return b.reward - a.reward
    if (sortBy === "progress") return b.progress - a.progress
    if (sortBy === "rarity") {
      const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
      return rarityOrder[b.rarity] - rarityOrder[a.rarity]
    }
    return 0
  })

  const claimableCount = rewardsData.filter((r) => r.status === "claimable").length
  const activeCount = rewardsData.filter((r) => r.status === "active").length

  return (
    <Card className="border-white/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">Available Rewards</CardTitle>
              <p className="text-muted-foreground text-sm">
                {claimableCount} ready to claim • {activeCount} in progress
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rewards</SelectItem>
                <SelectItem value="claimable">Claimable</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="staking">Staking</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reward">Reward</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rewards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sortedRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} walletConnected={walletConnected} />
          ))}
        </div>

        {sortedRewards.length === 0 && (
          <div className="p-16 text-center bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No rewards found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more rewards.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
