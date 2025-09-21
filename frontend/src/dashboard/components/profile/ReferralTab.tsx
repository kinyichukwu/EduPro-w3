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
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Coming Soon Hero */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-8 md:p-12 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
            
            <div className="relative z-10">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30">
                <Users className="h-10 w-10 text-purple-400" />
              </div>
              
              <div className="mx-auto max-w-2xl space-y-4">
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 mb-4">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Coming Soon
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                  Referral Program
                </h1>
                
                <p className="text-lg text-white/60">
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
            </div>
          </div>
        </motion.div>

        {/* Preview Features */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-green-500/10 p-2 border border-green-500/20">
                  <Gift className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Earn Rewards</h3>
              </div>
              <p className="text-sm text-white/60">
                Get EduPro coins and premium features for every successful referral.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/20">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Build Community</h3>
              </div>
              <p className="text-sm text-white/60">
                Help friends succeed in their studies while growing your network.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-yellow-500/10 p-2 border border-yellow-500/20">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">Unlock Tiers</h3>
              </div>
              <p className="text-sm text-white/60">
                Progress through referral tiers to unlock exclusive benefits.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Development Timeline
            </h2>
            <div className="space-y-4">
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
            </div>
          </div>
        </motion.div>

        {/* Stay Updated */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Stay in the loop</h3>
                <p className="text-sm text-white/60">
                  Be the first to know when referrals go live and get early access.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};