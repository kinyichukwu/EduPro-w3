import { motion } from "framer-motion";
import {
  Coins,
  TrendingUp,
  Calendar,
  Lock,
  Unlock,
  Info,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface StakingTabProps {
  stakingInfo: { stakedAmount: number; rewards: number; duration: number } | null;
}

export function StakingTab({ stakingInfo }: StakingTabProps) {
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

  const stakingTiers = [
    {
      name: "Bronze",
      minStake: 0,
      maxStake: 1000,
      apy: 5.0,
      perks: ["Basic rewards", "Community access"],
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30"
    },
    {
      name: "Silver",
      minStake: 1000,
      maxStake: 5000,
      apy: 8.0,
      perks: ["Enhanced rewards", "Priority support", "Early access to courses"],
      color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    },
    {
      name: "Gold",
      minStake: 5000,
      maxStake: 10000,
      apy: 12.0,
      perks: ["Premium rewards", "VIP support", "Exclusive content", "Governance voting"],
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    },
    {
      name: "Diamond",
      minStake: 10000,
      maxStake: Infinity,
      apy: 20.0,
      perks: ["Maximum rewards", "Dedicated support", "Custom features", "Revenue sharing"],
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    }
  ];

  const getCurrentTier = () => {
    if (!stakingInfo) return stakingTiers[0];
    const stake = stakingInfo.stakedAmount;
    return stakingTiers.find(tier => stake >= tier.minStake && stake <= tier.maxStake) || stakingTiers[0];
  };

  const currentTier = getCurrentTier();

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Staking Overview Header */}
        <motion.div variants={itemVariants}>
          <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Staking Dashboard
              </h1>
              <p className="text-white/60 mt-1">
                Stake your EDU tokens to earn rewards and unlock perks
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-white/60">Current Stake</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-orange-400" />
                  <span className="text-3xl font-bold text-white">
                    {stakingInfo ? stakingInfo.stakedAmount.toLocaleString('en-US') : "0"}
                  </span>
                </div>
              </div>

              <div className="h-12 w-px bg-white/20"></div>

              <div className="text-right">
                <p className="text-sm text-white/60">Total Rewards</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">
                    +{stakingInfo ? stakingInfo.rewards.toLocaleString('en-US') : "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Staking Status */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Current Staking Status</h2>
              <Badge className={`${currentTier.color} text-sm`}>
                {currentTier.name} Tier
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Lock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Staked Amount</p>
                    <p className="text-2xl font-bold text-white">
                      {stakingInfo ? stakingInfo.stakedAmount.toLocaleString('en-US') : "0"} EDU
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">APY</p>
                    <p className="text-2xl font-bold text-white">{currentTier.apy}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Duration</p>
                    <p className="text-2xl font-bold text-white">
                      {stakingInfo ? stakingInfo.duration : 0} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Staking Tiers */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Staking Tiers</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm">
                {stakingTiers.filter(tier => {
                  const stake = stakingInfo?.stakedAmount || 0;
                  return stake >= tier.minStake && stake <= tier.maxStake;
                }).length} Active
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {stakingTiers.map((tier) => {
                const isCurrentTier = currentTier.name === tier.name;
                const stake = stakingInfo?.stakedAmount || 0;
                const canUpgrade = stake >= tier.minStake && stake < tier.maxStake && tier.maxStake !== Infinity;

                return (
                  <div
                    key={tier.name}
                    className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden p-6 transition-colors ${
                      isCurrentTier
                        ? "ring-2 ring-turbo-purple/50 bg-turbo-purple/5"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{tier.name} Tier</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${tier.color} text-xs`}>
                            {tier.apy}% APY
                          </Badge>
                          {isCurrentTier && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">Min Stake</p>
                        <p className="text-lg font-bold text-white">
                          {tier.minStake.toLocaleString('en-US')} EDU
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-1">Perks</p>
                        <ul className="space-y-1">
                          {tier.perks.map((perk, perkIndex) => (
                            <li key={perkIndex} className="text-sm text-white/60 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-turbo-purple rounded-full"></div>
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {canUpgrade && (
                      <Button
                        className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                        size="sm"
                      >
                        Upgrade to {tier.name}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Staking Actions */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Staking Actions</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white p-4 h-auto"
                size="lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Lock className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Stake More EDU</p>
                    <p className="text-sm text-green-300">Increase your stake to earn more rewards</p>
                  </div>
                </div>
              </Button>

              <Button
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-4 h-auto"
                size="lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Unlock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Unstake EDU</p>
                    <p className="text-sm text-orange-300">Withdraw your staked tokens</p>
                  </div>
                </div>
              </Button>
            </div>

            <Alert className="mt-6 border-blue-500/30 bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <div className="space-y-2">
                  <p className="font-medium">Staking Information:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Minimum staking period: 30 days</li>
                    <li>• Rewards are distributed daily</li>
                    <li>• Early unstaking may result in penalty</li>
                    <li>• Higher tiers unlock additional platform benefits</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
