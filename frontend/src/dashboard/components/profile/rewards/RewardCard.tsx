"use client"

import { useState } from "react"
import { Clock, CheckCircle, Lock, Sparkles } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { ClaimRewardModal } from "./ClaimRewardModal"
import { cn } from "@/shared/lib/utils"

interface Reward {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  maxProgress: number
  status: "claimable" | "active" | "locked"
  category: string
  timeRemaining: string | null
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface RewardCardProps {
  reward: Reward
  walletConnected: boolean
}

const rarityColors = {
  common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export function RewardCard({ reward, walletConnected }: RewardCardProps) {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const handleClaim = () => {
    if (!walletConnected) {
      alert("Please connect your wallet first")
      return
    }
    setShowClaimModal(true)
  }

  const onClaimSuccess = () => {
    setClaimed(true)
    setShowClaimModal(false)
  }

  if (claimed) {
    return (
      <div className="p-4 bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors opacity-75">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-green-400">Reward Claimed!</h3>
            <p className="text-sm text-muted-foreground mt-1">+{reward.reward} EDU added to wallet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{reward.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-balance leading-tight">{reward.title}</h3>
              <Badge variant="outline" className={cn("mt-1 text-xs", rarityColors[reward.rarity])}>
                {reward.rarity}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="font-bold text-lg text-white">{reward.reward}</span>
              <span className="text-sm text-muted-foreground">EDU</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{reward.description}</p>

        {/* Progress Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-white">
              {reward.progress}% ({Math.floor((reward.progress / 100) * reward.maxProgress)}/{reward.maxProgress})
            </span>
          </div>
          <Progress value={reward.progress} className="h-2" />
        </div>

        {/* Time Remaining */}
        {reward.timeRemaining && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>{reward.timeRemaining}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {reward.status === "claimable" && (
            <Button onClick={handleClaim} className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20">
              <CheckCircle className="h-4 w-4 mr-2" />
              Claim Reward
            </Button>
          )}

          {reward.status === "active" && (
            <Button variant="outline" className="w-full bg-blue-500/10 text-blue-400 border-blue-500/20" disabled>
              <Clock className="h-4 w-4 mr-2" />
              In Progress
            </Button>
          )}

          {reward.status === "locked" && (
            <Button variant="outline" className="w-full bg-gray-500/10 text-gray-400 border-gray-500/20" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Locked
            </Button>
          )}
        </div>
      </div>

      <ClaimRewardModal
        open={showClaimModal}
        onOpenChange={setShowClaimModal}
        reward={reward}
        onClaimSuccess={onClaimSuccess}
      />
    </>
  )
}
