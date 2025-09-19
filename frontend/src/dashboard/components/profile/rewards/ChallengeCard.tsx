"use client"

import { Clock, Users, Zap, CheckCircle } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface Challenge {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  maxProgress: number
  timeRemaining: string
  difficulty: "Easy" | "Medium" | "Hard"
  participants: number
  icon: string
  type: "daily" | "weekly" | "monthly"
}

interface ChallengeCardProps {
  challenge: Challenge
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
}

const typeColors = {
  daily: "bg-green-500/10 text-green-400 border-green-500/20",
  weekly: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  monthly: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isCompleted = challenge.progress >= 100
  const isExpired = challenge.timeRemaining === "Expired"

  return (
    <div className="p-4 bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{challenge.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-balance leading-tight">{challenge.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", difficultyColors[challenge.difficulty])}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", typeColors[challenge.type])}>
                {challenge.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="font-bold text-lg text-white">{challenge.reward}</span>
            <span className="text-sm text-muted-foreground">EDU</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{challenge.description}</p>

      {/* Progress Section */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-white">{challenge.progress}%</span>
        </div>
        <Progress value={challenge.progress} className="h-2" />
      </div>

      {/* Challenge Info */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{challenge.timeRemaining}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{challenge.participants.toLocaleString()} participating</span>
        </div>
      </div>

      {/* Action Section */}
      <div className="pt-2">
        {isCompleted ? (
          <div className="flex items-center justify-center py-2 text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Challenge Completed!</span>
          </div>
        ) : isExpired ? (
          <Button variant="outline" className="w-full bg-gray-500/10 text-gray-400 border-gray-500/20" disabled>
            Challenge Expired
          </Button>
        ) : (
          <Button variant="outline" className="w-full bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
            View Details
          </Button>
        )}
      </div>
    </div>
  )
}
