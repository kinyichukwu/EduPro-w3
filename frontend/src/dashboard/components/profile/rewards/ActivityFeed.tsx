"use client"

import { useState, useEffect } from "react"
import { Activity, Clock, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

interface ActivityItem {
  id: string
  type: "reward_claimed" | "achievement_unlocked" | "challenge_completed" | "streak_milestone" | "course_completed"
  title: string
  description: string
  timestamp: string
  amount?: number
  icon: string
  status: "confirmed" | "pending"
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    type: "reward_claimed",
    title: "Daily Login Reward",
    description: "7-day streak bonus claimed",
    timestamp: "2 minutes ago",
    amount: 50,
    icon: "🔥",
    status: "confirmed",
  },
  {
    id: "2",
    type: "achievement_unlocked",
    title: "Quiz Master",
    description: "Unlocked epic achievement",
    timestamp: "1 hour ago",
    amount: 200,
    icon: "🧠",
    status: "confirmed",
  },
  {
    id: "3",
    type: "challenge_completed",
    title: "Weekly Challenge",
    description: "Course Explorer completed",
    timestamp: "3 hours ago",
    amount: 150,
    icon: "🎓",
    status: "pending",
  },
  {
    id: "4",
    type: "streak_milestone",
    title: "Learning Streak",
    description: "Reached 20-day milestone",
    timestamp: "1 day ago",
    amount: 100,
    icon: "⚡",
    status: "confirmed",
  },
  {
    id: "5",
    type: "course_completed",
    title: "JavaScript Fundamentals",
    description: "Course completed with 95% score",
    timestamp: "2 days ago",
    amount: 300,
    icon: "📚",
    status: "confirmed",
  },
  {
    id: "6",
    type: "reward_claimed",
    title: "Community Helper",
    description: "Helped 10 students in forum",
    timestamp: "3 days ago",
    amount: 75,
    icon: "🤝",
    status: "confirmed",
  },
  {
    id: "7",
    type: "achievement_unlocked",
    title: "Knowledge Seeker",
    description: "Unlocked rare achievement",
    timestamp: "5 days ago",
    amount: 100,
    icon: "📖",
    status: "confirmed",
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState(activityData)
  const [showAll, setShowAll] = useState(false)

  const displayedActivities = showAll ? activities : activities.slice(0, 5)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update pending status to confirmed
      setActivities((prev) =>
        prev.map((activity) =>
          activity.status === "pending" && Math.random() > 0.7 ? { ...activity, status: "confirmed" } : activity,
        ),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-white/5 backdrop-blur-sm sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayedActivities.map((activity) => {
            return (
              <div
                key={activity.id}
                className="p-3 bg-dark-accent/20 hover:bg-dark-accent/10 rounded-lg border border-white/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-dark-accent/30 flex items-center justify-center border border-white/5">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white text-balance leading-tight">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      </div>

                      {activity.amount && (
                        <div className="flex items-center gap-1 text-xs">
                          <Sparkles className="h-3 w-3 text-yellow-400" />
                          <span className="font-semibold text-green-400">+{activity.amount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </div>

                      <Badge
                        variant={activity.status === "confirmed" ? "default" : "secondary"}
                        className={`text-xs ${
                          activity.status === "confirmed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {activity.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {activities.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full bg-dark-accent/20 hover:bg-dark-accent/10 border-white/5 text-white"
          >
            {showAll ? "Show Less" : `Show All (${activities.length - 5} more)`}
          </Button>
        )}

        {/* Activity Summary */}
        <div className="pt-4 border-t border-white/5">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">
                {activities.filter((a) => a.status === "confirmed").length}
              </div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {activities.filter((a) => a.status === "pending").length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
