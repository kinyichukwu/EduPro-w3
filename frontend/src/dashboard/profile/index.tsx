import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Share2,
  Settings,
  Crown,
  Zap,
  Coins,
  History,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { mockUserData } from "../constants/profile";
import { ReferralTab, SettingsTab, RewardsTab, TransactionHistoryTab } from "../components/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const user = useAuthStore((s) => s.user);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-6xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="w-full p-3.5 sm:p-6 relative overflow-hidden border-white/5 bg-gradient-to-r from-dark-card/80 to-dark-accent/30 backdrop-blur-lg shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10" />
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* User Info Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatar ?? "/placeholder.svg"} alt={user?.full_name ?? user?.username ?? "N/A"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {user?.full_name?.charAt(0) ?? user?.username?.charAt(0) ?? "N/A"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-card-foreground">{user?.full_name ?? user?.username ?? "N/A"}</h2>
                  <p className="text-dark-muted">{user?.email}</p>
                  <Badge variant="default" className="text-xs bg-green/80 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Active Learner
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">{mockUserData?.eduproCoins?.toLocaleString()}</p>
                    <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400">EduPro Coins</p>
                  </div>
                </div>

                <div className="col-span-2 col-start-1 row-start-1 flex-1 min-w-[170px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-card-foreground">Prompts</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {mockUserData?.prompts?.used} / {mockUserData?.prompts?.total}
                    </span>
                  </div>

                  <Progress
                    value={
                      (mockUserData.prompts.used /
                        mockUserData.prompts.total) *
                      100
                    }
                    className="w-20 h-2 mt-1"
                  />

                  <p className="text-xs text-muted-foreground">{(mockUserData?.prompts?.total - mockUserData?.prompts?.used)} prompts left this month</p>
                </div>

                {mockUserData.plan === "Free" && (
                  <Button className="max-sm:h-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg hover:shadow-turbo-purple/20">
                    <Crown size={16} className="mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6 "
          >
            <TabsList className="grid w-full h-full grid-cols-4 bg-dark-accent/30 backdrop-blur-lg p-1 rounded-xl">
              <TabsTrigger
                value="rewards"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Referral</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <History size={16} />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Subscription Tab */}
            <RewardsTab />

            {/* Referral Tab */}
            <ReferralTab />

            {/* Transaction History Tab */}
            <TransactionHistoryTab />

            {/* Settings Tab */}
            <SettingsTab />
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};
