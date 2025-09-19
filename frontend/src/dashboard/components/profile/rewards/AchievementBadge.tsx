"use client"

import { useState } from "react"
import { Lock, Calendar, Sparkles } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlocked: boolean
  unlockedAt: string | null
  category: string
  requirement: string
  reward: number
  progress?: number
  maxProgress?: number
}

interface AchievementBadgeProps {
  achievement: Achievement
}

const rarityColors = {
  common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogTrigger asChild>
        <div
          className={`p-4 bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors cursor-pointer text-center ${
            achievement.unlocked ? "hover:border-white/10" : "opacity-60 hover:opacity-80"
          }`}
        >
          <div className="relative mb-3">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl border ${
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity]}`
                  : "bg-dark-accent/30 text-muted-foreground border-white/5"
              }`}
            >
              {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
            </div>
            {achievement.unlocked && (
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex items-center justify-center">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>

          <h3 className={cn("font-semibold text-sm mb-1", achievement.unlocked ? "text-white" : "text-muted-foreground")}>
            {achievement.title}
          </h3>

          <Badge variant="outline" className={cn("text-xs mb-2", achievement.unlocked ? rarityColors[achievement.rarity] : "bg-dark-accent/30 text-muted-foreground border-white/5")}>
            {achievement.rarity}
          </Badge>

          {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {achievement.progress}/{achievement.maxProgress}
              </div>
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1" />
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="border-white/5 backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border ${
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity]}`
                  : "bg-dark-accent/30 text-muted-foreground border-white/5"
              }`}
            >
              {achievement.unlocked ? achievement.icon : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{achievement.title}</h2>
              <Badge
                variant="outline"
                className={cn("text-xs", achievement.unlocked ? rarityColors[achievement.rarity] : "bg-dark-accent/30 text-muted-foreground border-white/5")}
              >
                {achievement.rarity}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{achievement.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Requirement</span>
              <span className="text-white">{achievement.requirement}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reward</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-white">{achievement.reward} EDU</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="text-white capitalize">{achievement.category}</span>
            </div>

            {achievement.unlocked && achievement.unlockedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unlocked</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-white">{formatDate(achievement.unlockedAt)}</span>
                </div>
              </div>
            )}
          </div>

          {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-white">
                  {achievement.progress}/{achievement.maxProgress} (
                  {Math.round((achievement.progress / achievement.maxProgress) * 100)}%)
                </span>
              </div>
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
            </div>
          )}

          {achievement.unlocked && (
            <div className="text-center py-4">
              <div className="text-green-400 font-semibold">🎉 Achievement Unlocked! 🎉</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
