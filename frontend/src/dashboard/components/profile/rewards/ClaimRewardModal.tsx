"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Sparkles, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

interface Reward {
  id: string
  title: string
  description: string
  reward: number
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface ClaimRewardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reward: Reward
  onClaimSuccess: () => void
}

export function ClaimRewardModal({ open, onOpenChange, reward, onClaimSuccess }: ClaimRewardModalProps) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const handleClaim = () => {
    setClaiming(true)
    // Simulate blockchain transaction
    setTimeout(() => {
      setClaiming(false)
      setClaimed(true)
      setConfetti(true)
      setTimeout(() => {
        onClaimSuccess()
      }, 3000)
    }, 3000)
  }

  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => setConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confetti])

  if (claimed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass border-border/50 max-w-md">
          <div className="text-center py-8 relative overflow-hidden">
            {confetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`,
                    }}
                  >
                    🎉
                  </div>
                ))}
              </div>
            )}

            <div className="gradient-success p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Trophy className="h-10 w-10 text-success-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2 animate-in slide-in-from-bottom duration-500">Reward Claimed!</h2>
            <p className="text-muted-foreground mb-6 animate-in slide-in-from-bottom duration-700">
              Your tokens have been added to your wallet
            </p>
            <div className="gradient-success p-4 rounded-lg mb-6 animate-in slide-in-from-bottom duration-1000">
              <div className="flex items-center justify-center gap-2 text-success-foreground">
                <Sparkles className="h-5 w-5" />
                <span className="text-2xl font-bold">+{reward.reward} EDU</span>
              </div>
            </div>
            <div className="text-4xl animate-bounce">🎉</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{reward.icon}</span>
            Claim Reward
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{reward.title}</h3>
            <p className="text-muted-foreground text-sm">{reward.description}</p>
          </div>

          <div className="gradient-primary p-6 rounded-lg text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6" />
              <span className="text-3xl font-bold">{reward.reward}</span>
              <span className="text-lg">EDU</span>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {reward.rarity} reward
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Transaction Fee</span>
              <span>~0.001 SOL</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Network</span>
              <span>Solana Mainnet</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>You will receive</span>
              <span className="text-success">{reward.reward} EDU</span>
            </div>
          </div>

          <Button onClick={() => void handleClaim()} disabled={claiming} className="w-full gradient-success text-success-foreground">
            {claiming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-success-foreground/30 border-t-success-foreground mr-2" />
                Processing Transaction...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Claim
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will initiate a blockchain transaction. Make sure you have enough SOL for gas fees.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
