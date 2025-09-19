import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Share2,
  Settings,
  Crown,
  Coins,
  History,
  TrendingUp,
  Wallet,
  Award,
  BookOpen,
} from "lucide-react";
import {
  Card,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
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
        {/* User Profile Header */}
        <motion.div variants={itemVariants}>
          <Card className="w-full border-white/10 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-dark-card/40 backdrop-blur-xl">
            <div className="p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                {/* User Info Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/30 shadow-xl">
                      <AvatarImage src={user?.avatar ?? "/placeholder.svg"} alt={user?.full_name ?? user?.username ?? "N/A"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-bold">
                        {user?.full_name?.charAt(0) ?? user?.username?.charAt(0) ?? "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {user?.full_name ?? user?.username ?? "N/A"}
                    </h2>
                    <p className="text-muted-foreground text-base">{user?.email}</p>
                    <Badge variant="default" className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                      Active Learner
                    </Badge>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="lg:text-right">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Wallet className="h-4 w-4" />
                    Portfolio Balance
                  </div>
                  <div className="flex items-center gap-3 lg:justify-end">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {mockUserData?.eduproCoins?.toLocaleString()}
                      </p>
                      <p className="text-sm text-yellow-400 font-medium">EduPro Coins</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-white/10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24</p>
                    <p className="text-xs text-muted-foreground">Courses Completed</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">156</p>
                    <p className="text-xs text-muted-foreground">Achievement Points</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">89%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                    <Coins className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">+{mockUserData?.eduproCoins && Math.floor(mockUserData.eduproCoins * 0.15).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
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
