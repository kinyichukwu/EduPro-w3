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
          <Card className="w-full border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <div className="p-6">
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
                <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-dark-accent/20 px-4 py-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-xl font-bold text-white">
                        {mockUserData?.eduproCoins?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">EduPro Coins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-dark-accent/20 px-4 py-2">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-xl font-bold text-white">
                        {mockUserData?.prompts?.used}/{mockUserData?.prompts?.total}
                      </p>
                      <p className="text-xs text-muted-foreground">Prompts Used</p>
                    </div>
                  </div>

                  {mockUserData.plan === "Free" && (
                    <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20">
                      <Crown size={16} className="mr-2" /> 
                      Upgrade
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
