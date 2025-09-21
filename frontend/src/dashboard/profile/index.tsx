import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Share2,
  Settings,
  Crown,
  History,
  TrendingUp,
  Wallet,
  Award,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Tabs,
} from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ReferralTab, SettingsTab, RewardsTab, TransactionHistoryTab } from "../components/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useEduProWallet } from "@/shared/hooks/useWallet";
import { solanaAPI } from "@/services/solana";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [eduproBalance, setEduproBalance] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  // Get wallet connection status
  const { connected, publicKey } = useWallet();
  const {
    wallets,
    isLoading: walletLoading,
    error: walletError,
    connectWalletToBackend,
    clearError,
    hasVerifiedWallet,
  } = useEduProWallet();
  
  const userWallet = publicKey?.toString() || "";

  // Fetch EduPro token and SOL balances when wallet is connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !userWallet) {
        setEduproBalance(0);
        setSolBalance(0);
        setBalanceError(null);
        return;
      }

      setIsLoadingBalance(true);
      setBalanceError(null);
      try {
        const [eduBalance, solBalanceData] = await Promise.all([
          solanaAPI.getEduTokenBalance(userWallet),
          solanaAPI.getWalletBalance(userWallet)
        ]);
        setEduproBalance(eduBalance.edutoken_balance / 1e9); // Convert from lamports to EDU
        setSolBalance(solBalanceData.balance_sol);
      } catch (error) {
        console.error("Failed to fetch balances:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch balances";
        setBalanceError(errorMessage);
        setEduproBalance(0);
        setSolBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalances();
  }, [connected, userWallet]);

  // Handle connecting wallet to backend
  const handleConnectToBackend = async () => {
    if (!publicKey) return;
    
    try {
      await connectWalletToBackend(publicKey.toString());
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    }
  };

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
    <div className="h-full w-full space-y-6 lg:p-12 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
            <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-turbo-purple/30 shadow-xl">
                    <AvatarImage src={user?.avatar ?? "/placeholder.svg"} alt={user?.full_name ?? user?.username ?? "N/A"} />
                    <AvatarFallback className="bg-gradient-to-br from-turbo-purple to-turbo-indigo text-white text-2xl font-bold">
                      {user?.email ? user.email.split('@')[0].substring(0, 2).toUpperCase() : user?.full_name?.charAt(0) ?? user?.username?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-green-400/30 to-green-500/30 shadow-sm">
                    <Crown className="h-3 w-3 text-white/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold gradient-text">
                    {user?.full_name ?? user?.username ?? "Profile"}
                  </h1>
                  <p className="text-white/60">{user?.email}</p>
                  <Badge variant="default" className="text-sm bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white border-0 px-3 py-1">
                    Active Learner
                  </Badge>
                </div>
              </div>

              {/* Wallet Connection Section */}
              <div className="flex max-sm:flex-col max-md:justify-end gap-3">
                {!connected ? (
                  <div className="text-center">
                    <div className="text-sm text-white/60 mb-2">Connect Wallet</div>
                    <WalletMultiButton className="!bg-gradient-to-r !from-turbo-purple !to-turbo-indigo hover:!from-turbo-purple/80 hover:!to-turbo-indigo/80 !text-white !border-0 !rounded-lg !px-6 !py-2 !font-medium" />
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 text-sm text-white/60 mb-2">
                      <Wallet className="h-4 w-4" />
                      Portfolio Balance
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-turbo-purple to-turbo-indigo shadow-lg p-2">
                        {isLoadingBalance ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : balanceError ? (
                          <AlertCircle className="h-6 w-6 text-white" />
                        ) : (
                          <img 
                            src="/Edupro.svg" 
                            alt="EduPro" 
                            className="h-8 w-8 object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">
                          {isLoadingBalance ? "..." : balanceError ? "Error" : eduproBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-purple-400 font-medium">
                          {isLoadingBalance ? "..." : balanceError ? "" : `${solBalance.toFixed(4)} SOL`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Status and Error Handling */}
            {connected && !hasVerifiedWallet && wallets?.length === 0 && (
              <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  <div className="flex items-center justify-between">
                    <span>Connect your wallet to EduPro backend to access all features</span>
                    <button
                      onClick={handleConnectToBackend}
                      disabled={walletLoading}
                      className="ml-4 px-3 py-1 bg-white/10 text-white border border-white/20 rounded hover:bg-white/20 disabled:opacity-50 text-sm"
                    >
                      {walletLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Connect"}
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {walletError && (
              <Alert className="mb-4 border-red/30 bg-red/5">
                <AlertCircle className="h-4 w-4 text-red" />
                <AlertDescription className="text-red flex items-center justify-between">
                  <span>{walletError}</span>
                  <button
                    onClick={clearError}
                    className="ml-4 px-3 py-1 bg-white/10 text-white border border-white/20 rounded hover:bg-white/20 text-sm"
                  >
                    Dismiss
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {balanceError && (
              <Alert className="mb-4 border-orange-500/30 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-orange-300">
                  Failed to load balance: {balanceError}
                </AlertDescription>
              </Alert>
            )}
          </section>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Learning Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24</p>
                    <p className="text-sm text-white/60">Courses Completed</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">156</p>
                    <p className="text-sm text-white/60">Achievement Points</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">89%</p>
                    <p className="text-sm text-white/60">Success Rate</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 rounded-lg">
                    <img 
                      src="/Edupro.svg" 
                      alt="EduPro" 
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {connected && eduproBalance > 0 ? `+${Math.floor(eduproBalance * 0.15).toLocaleString('en-US')}` : "-"}
                    </p>
                    <p className="text-sm text-white/60">EDU This Month</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Management</h2>
                
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {[
                    { value: "rewards", icon: CreditCard, label: "Rewards" },
                    { value: "referral", icon: Share2, label: "Referral" },
                    { value: "transactions", icon: History, label: "Transactions" },
                    { value: "settings", icon: Settings, label: "Settings" }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                        activeTab === value
                          ? "bg-turbo-purple text-white"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === "rewards" && <RewardsTab />}
                {activeTab === "referral" && <ReferralTab />}
                {activeTab === "transactions" && <TransactionHistoryTab />}
                {activeTab === "settings" && <SettingsTab />}
              </div>
            </Tabs>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
};
