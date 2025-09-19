import { motion } from "framer-motion";
import {
  Users,
  Gift,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Bell
} from "lucide-react";
import { TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

export const ReferralTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
    <TabsContent value="referral" className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Coming Soon Hero */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-gradient-to-br from-dark-card/80 via-dark-card/60 to-purple-900/20 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-xl" />
            
            <CardContent className="relative p-8 md:p-12 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30">
                <Users className="h-10 w-10 text-purple-400" />
              </div>
              
              <div className="mx-auto max-w-2xl space-y-4">
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 mb-4">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Coming Soon
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Referral Program
                </h1>
                
                <p className="text-lg text-muted-foreground">
                  Share EduPro with friends and earn amazing rewards together. 
                  Our referral system is being crafted to give you the best experience.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline" 
                  className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notify Me When Ready
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Features */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-green-500/10 p-2 border border-green-500/20">
                    <Gift className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">Earn Rewards</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get EduPro coins and premium features for every successful referral.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/20">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">Build Community</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Help friends succeed in their studies while growing your network.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-yellow-500/10 p-2 border border-yellow-500/20">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-white">Unlock Tiers</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Progress through referral tiers to unlock exclusive benefits.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-purple-400" />
                Development Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-accent/20 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">System Architecture</h4>
                    <p className="text-sm text-muted-foreground">Designing the referral tracking system</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    Complete
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-accent/20 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Reward System</h4>
                    <p className="text-sm text-muted-foreground">Building coin distribution and tier mechanics</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    In Progress
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-accent/20 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500/20 border border-gray-500/30">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">User Interface</h4>
                    <p className="text-sm text-muted-foreground">Creating beautiful referral dashboard</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                    Upcoming
                  </Badge>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-accent/20 border border-white/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500/20 border border-gray-500/30">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Testing & Launch</h4>
                    <p className="text-sm text-muted-foreground">Final testing and feature rollout</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                    Planned
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stay Updated */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Stay in the loop</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to know when referrals go live and get early access.
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TabsContent>
  );
};