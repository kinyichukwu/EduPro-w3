import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Share2,
  Settings,
  Crown,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { mockUserData } from "../constants/profile";
import { ReferralTab, SettingsTab, SubscriptionTab } from "../components/profile";
import { useAuthStore } from "@/store/useAuthStore";

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
        {/* Header Banner */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-white/5 bg-gradient-to-r from-dark-card/80 to-dark-accent/30 backdrop-blur-lg shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10" />
            <CardContent className="relative p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={user?.avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-turbo-indigo/50"
                    />
                    <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white text-xs px-2">
                      Free
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user?.full_name ?? user?.username ?? "N/A"} 
                    </h1>
                    <p className="text-dark-muted">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-dark-muted">
                      <Zap size={16} />
                      <span>
                        {mockUserData.prompts.used} /{" "}
                        {mockUserData.prompts.total} prompts left
                      </span>
                    </div>
                    <Progress
                      value={
                        (mockUserData.prompts.used /
                          mockUserData.prompts.total) *
                        100
                      }
                      className="w-32 h-2 mt-1"
                    />
                  </div>
                  {mockUserData.plan === "Free" && (
                    <Button className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg hover:shadow-turbo-purple/20">
                      <Crown size={16} className="mr-2" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6 "
          >
            <TabsList className="grid w-full h-full grid-cols-3 bg-dark-accent/30 backdrop-blur-lg p-1 rounded-xl">
              <TabsTrigger
                value="subscription"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <CreditCard size={16} />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg text-dark-muted hover:bg-white/5 hover:text-white"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Referral</span>
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
            <SubscriptionTab />

            {/* Referral Tab */}
            <ReferralTab />

            {/* Settings Tab */}
            <SettingsTab />
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};
