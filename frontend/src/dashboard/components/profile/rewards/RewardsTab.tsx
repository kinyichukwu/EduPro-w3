// import { useState } from "react"
import { Trophy } from "lucide-react"
import { SummaryCards } from "./SummaryCards"
// import { WalletConnection } from "./WalletConnection"
import { RewardsSection } from "./RewardsSection"
import { ChallengesSection } from "./ChallengesSection"
import { AchievementsSection } from "./AchievementsSection"
import { ActivityFeed } from "./ActivityFeed"
import { TabsContent } from "@/shared/components/ui/tabs"

export function RewardsTab() {
  // const [walletConnected, setWalletConnected] = useState(false)

  return (
    <TabsContent value="rewards" className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rewards Dashboard</h1>
            <p className="text-muted-foreground">Manage your rewards and achievements</p>
          </div>
        </div>
        {/* <WalletConnection
          connected={walletConnected}
          onConnect={() => setWalletConnected(true)}
          onDisconnect={() => setWalletConnected(false)}
        /> */}
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Rewards Section */}
          <RewardsSection walletConnected={false} />

          {/* Challenges Section */}
          <ChallengesSection />

          {/* Achievements Section */}
          <AchievementsSection />
        </div>

        {/* Activity Feed Sidebar */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </TabsContent>
  )
}
