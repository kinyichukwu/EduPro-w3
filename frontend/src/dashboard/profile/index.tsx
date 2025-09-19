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
    <div className="mx-auto px-3 sm:px-4 md:px-6 py-6 max-w-7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="relative w-full overflow-hidden border-white/10 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-purple-900/20 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-turbo-purple/10 via-transparent to-turbo-indigo/15" />
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400/20 to-transparent blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-400/20 to-transparent blur-xl" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* User Info Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={user?.avatar ?? "/placeholder.svg"} alt={user?.full_name ?? user?.username ?? "N/A"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {user?.full_name?.charAt(0) ?? user?.username?.charAt(0) ?? "N/A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.full_name ?? user?.username ?? "N/A"}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="default" className="text-xs bg-green/80 text-white">
                      <Crown className="mr-1 h-3 w-3" /> Active Learner
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:flex lg:flex-row lg:items-center lg:gap-6">
                  <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 p-4">
                      <div className="rounded-lg bg-amber-500/20 p-2 border border-amber-500/30">
                        <Coins className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-300">
                          {mockUserData?.eduproCoins?.toLocaleString()}
                        </p>
                        <p className="text-xs text-amber-400">EduPro Coins</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 backdrop-blur-sm">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">Prompts</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {mockUserData?.prompts?.used} / {mockUserData?.prompts?.total}
                        </span>
                      </div>

                      <Progress
                        value={(mockUserData.prompts.used / mockUserData.prompts.total) * 100}
                        className="h-2"
                      />

                      <p className="text-xs text-muted-foreground">
                        {mockUserData?.prompts?.total - mockUserData?.prompts?.used} prompts left this month
                      </p>
                    </div>
                  </Card>

                  {mockUserData.plan === "Free" && (
                    <Button className="bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white shadow-lg shadow-turbo-purple/20 hover:shadow-turbo-purple/30 hover:scale-105 transition-all">
                      <Crown size={16} className="mr-2" /> 
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid h-full w-full grid-cols-4 rounded-xl bg-dark-accent/40 p-1 backdrop-blur-lg">
              <TabsTrigger
                value="rewards"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-dark-muted transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-dark-muted transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Referral</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-dark-muted transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <History size={16} />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-dark-muted transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg"
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
