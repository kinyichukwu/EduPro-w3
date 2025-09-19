"use client"

import { TrendingUp, Gift, Target, Flame, ArrowUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { CountUp, FadeIn } from "./Animations"

const summaryData = [
  {
    title: "Total Earned",
    value: 2847,
    unit: "EDU",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Tokens earned this month",
    progress: 75,
  },
  {
    title: "Available Rewards",
    value: 8,
    unit: "rewards",
    change: "+3 new",
    changeType: "positive" as const,
    icon: Gift,
    description: "Ready to claim",
    progress: 100,
  },
  {
    title: "Active Challenges",
    value: 5,
    unit: "ongoing",
    change: "2 ending soon",
    changeType: "neutral" as const,
    icon: Target,
    description: "Complete for bonus rewards",
    progress: 60,
  },
  {
    title: "Learning Streak",
    value: 23,
    unit: "days",
    change: "Personal best!",
    changeType: "positive" as const,
    icon: Flame,
    description: "Keep it up for streak bonus",
    progress: 92,
  },
]

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item, index) => (
        <FadeIn key={index} delay={index * 200}>
          <Card className="border-white/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-blue-400" />
                    <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CountUp
                      end={item.value}
                      duration={1500 + index * 200}
                      className="text-2xl font-bold text-white"
                    />
                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {item.changeType === "positive" && <ArrowUp className="h-3 w-3 text-green-400" />}
                    {item.changeType === "neutral" && <Clock className="h-3 w-3 text-yellow-400" />}
                    <span className="text-xs text-muted-foreground">{item.change}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-white">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </div>
  )
}
