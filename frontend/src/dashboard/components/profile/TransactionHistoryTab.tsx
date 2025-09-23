import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Gift,
  BookOpen,
  Users,
  Brain,
  HelpCircle,
  Star,
  ArrowLeftRight,
  Coins,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { mockTransactions } from "@/dashboard/constants/profile";
import { useState, useMemo, useEffect, useRef } from "react"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { solanaAPI } from "@/services/solana"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useSwap } from "@/shared/hooks/useSwap"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Progress } from "@/shared/components/ui/progress"
import type { SwapRequest } from "@/shared/types/solana/swap"

const categoryIcons = {
  quiz: BookOpen,
  purchase: TrendingDown,
  referral: Users,
  tutoring: Brain,
  streak: Star,
  access: HelpCircle,
  welcome: Gift,
}

const categoryColors = {
  quiz: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purchase: "bg-red-500/10 text-red-400 border-red-500/20",
  referral: "bg-green-500/10 text-green-400 border-green-500/20",
  tutoring: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  streak: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  access: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  welcome: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export const TransactionHistoryTab = () => {
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
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "earned" | "spent">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showConversionModal, setShowConversionModal] = useState(false)

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || transaction.type === filterType
      const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
      const matchesStatus = filterStatus === "all" || transaction.status === filterStatus

      return matchesSearch && matchesType && matchesCategory && matchesStatus
    })
  }, [searchTerm, filterType, filterCategory, filterStatus])

  const totalEarned = mockTransactions
    .filter((t) => t.type === "earned" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSpent = Math.abs(
    mockTransactions
      .filter((t) => t.type === "spent" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
  )

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={20} />
                  Transaction History
                </h2>
                  
                  {/* Conversion Button */}
                  <Dialog open={showConversionModal} onOpenChange={setShowConversionModal}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/20 hover:bg-white/5"
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Convert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-white/10 bg-dark-card/90 backdrop-blur-xl max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                          <ArrowLeftRight className="h-5 w-5" />
                          Currency Conversion
                        </DialogTitle>
                      </DialogHeader>
                      <ConversionModal onClose={() => setShowConversionModal(false)} />
                    </DialogContent>
                  </Dialog>
                </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-green-500/20 bg-green-500/5 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Earned</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-400">+{totalEarned}</p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-2 border border-green-500/20">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="border-red-500/20 bg-red-500/5 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Spent</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-400">-{totalSpent}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-2 border border-red-500/20">
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </div>
                
                <div className={cn(
                  "border rounded-lg p-4",
                  totalEarned - totalSpent >= 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Net Balance</p>
                      <p
                        className={cn(
                          "text-xl sm:text-2xl font-bold",
                          totalEarned - totalSpent >= 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {totalEarned - totalSpent >= 0 ? "+" : ""}
                        {totalEarned - totalSpent}
                      </p>
                    </div>
                    <div className={cn(
                      "rounded-lg p-2 border",
                      totalEarned - totalSpent >= 0 
                        ? "bg-green-500/10 border-green-500/20" 
                        : "bg-red-500/10 border-red-500/20"
                    )}>
                      <Coins className={cn(
                        "h-6 w-6",
                        totalEarned - totalSpent >= 0 ? "text-green-400" : "text-red-400"
                      )} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="border-white/10 bg-dark-accent/20 rounded-lg p-4 border">
                  <div className="flex flex-col md:flex-row max-md:space-y-4 md:space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-dark-card/50 border-white/10"
                        />
                      </div>
                    </div>

                    <Select value={filterType} onValueChange={(value: "all" | "earned" | "spent") => setFilterType(value)}>
                      <SelectTrigger className="w-full md:w-[140px] bg-dark-card/50 border-white/10">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-white/10">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="earned">Earned</SelectItem>
                        <SelectItem value="spent">Spent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full md:w-[140px] bg-dark-card/50 border-white/10">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-white/10">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="tutoring">Tutoring</SelectItem>
                        <SelectItem value="streak">Streak</SelectItem>
                        <SelectItem value="access">Access</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-[140px] bg-dark-card/50 border-white/10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-white/10">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="p-16 text-center rounded-lg border border-white/10 bg-dark-accent/10">
                    <p className="text-white/60">No transactions found matching your criteria.</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const IconComponent = categoryIcons[transaction.category]
                    return (
                      <div key={transaction.id} className="p-4 rounded-lg border border-white/10 bg-dark-accent/10 hover:bg-dark-accent/20 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Icon */}
                            <div className={cn("p-2 rounded-lg border", categoryColors[transaction.category])}>
                              <IconComponent className="h-5 w-5" />
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-white truncate">{transaction.title}</h3>
                                <Badge
                                  variant={
                                    transaction.status === "completed"
                                      ? "default"
                                      : transaction.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={cn(
                                    "text-xs max-sm:hidden",
                                    transaction.status === "completed" && "bg-green-500/10 text-green-400 border-green-500/20",
                                    transaction.status === "pending" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                                    transaction.status === "failed" && "bg-red-500/10 text-red-400 border-red-500/20"
                                  )}
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {transaction.date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    })}
                                </p>
                                <Badge
                                  variant={
                                    transaction.status === "completed"
                                      ? "default"
                                      : transaction.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={cn(
                                    "text-xs sm:hidden",
                                    transaction.status === "completed" && "bg-green-500/10 text-green-400 border-green-500/20",
                                    transaction.status === "pending" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                                    transaction.status === "failed" && "bg-red-500/10 text-red-400 border-red-500/20"
                                  )}
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right shrink-0 ml-4">
                            <p
                              className={cn(
                                "text-lg font-bold",
                                transaction.type === "earned" ? "text-green-400" : "text-red-400",
                              )}
                            >
                              {transaction.type === "earned" ? "+" : ""}
                              {transaction.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">coins</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Conversion Modal Component
interface ConversionModalProps {
  onClose: () => void;
}

const ConversionModal = ({ onClose }: ConversionModalProps) => {
  const { publicKey, connected } = useWallet();
  const {
    isLoading,
    error,
    swapData,
    step,
    currentTransaction,
    executeSwap,
    signAndSubmitSOL,
    signAndSubmitEduPro,
    completeSwap,
    reset,
  } = useSwap();

  const [conversionType, setConversionType] = useState<"edu-to-sol" | "sol-to-edu">("sol-to-edu")
  const [amount, setAmount] = useState("")
  const [balances, setBalances] = useState<{ edu: number; sol: number }>({ edu: 0, sol: 0 })
  const [isLoadingBalances, setIsLoadingBalances] = useState(true)
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

  // Token addresses
  const SOL_MINT = "So11111111111111111111111111111111111111112"
  const EDUPRO_MINT = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"
  const FIXED_RATE = 1000; // 1 SOL = 1000 EduPro tokens

  // Calculate conversion amounts
  const amountNum = parseFloat(amount) || 0;
  const amountInSmallestUnit = Math.floor(amountNum * 1e9);
  const convertedAmount = conversionType === "sol-to-edu" ? amountNum * FIXED_RATE : amountNum / FIXED_RATE;

  // Get wallet balances when wallet is connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !publicKey) {
        setIsLoadingBalances(false)
        return
      }

      setIsLoadingBalances(true)
      try {
        const [eduBalance, solBalance] = await Promise.all([
          solanaAPI.getEduTokenBalance(publicKey.toString()),
          solanaAPI.getWalletBalance(publicKey.toString())
        ])
        setBalances({
          edu: eduBalance.edutoken_balance / 1e9,
          sol: solBalance.balance_sol
        })
      } catch (error) {
        console.error("Failed to fetch balances:", error)
        setBalances({ edu: 0, sol: 0 })
      } finally {
        setIsLoadingBalances(false)
      }
    }

    fetchBalances()
  }, [connected, publicKey])

  // Reset swap state when modal opens
  useEffect(() => {
    if (connected) {
      reset();
    }
  }, [connected, reset]);

  // Track previous connection state to only close modal on new connections
  const prevConnectedRef = useRef(connected)
  
  useEffect(() => {
    const wasDisconnected = !prevConnectedRef.current
    
    if (connected && wasDisconnected) {
      const timer = setTimeout(() => {
        onClose()
      }, 100)
      
      prevConnectedRef.current = connected
      return () => clearTimeout(timer)
    }
    
    prevConnectedRef.current = connected
  }, [connected, onClose])

  const handleSwap = async () => {
    if (!publicKey || !connected) {
      return;
    }

    // Check if user has sufficient balance
    if (conversionType === "sol-to-edu" && amountNum > balances.sol) {
      alert("Insufficient SOL balance")
      return
    }
    if (conversionType === "edu-to-sol" && amountNum > balances.edu) {
      alert("Insufficient EduPro token balance")
      return
    }

    try {
      const request: SwapRequest = {
        inputMint: conversionType === "sol-to-edu" ? SOL_MINT : EDUPRO_MINT,
        outputMint: conversionType === "sol-to-edu" ? EDUPRO_MINT : SOL_MINT,
        amount: amountInSmallestUnit,
        slippageBps: 100,
        userWallet: publicKey.toString(),
      };

      if (isAutoMode) {
        await completeSwap(request);
        // Refresh balances after successful swap
        setTimeout(async () => {
          try {
            const [eduBalance, solBalance] = await Promise.all([
              solanaAPI.getEduTokenBalance(publicKey.toString()),
              solanaAPI.getWalletBalance(publicKey.toString())
            ])
            setBalances({
              edu: eduBalance.edutoken_balance / 1e9,
              sol: solBalance.balance_sol
            })
          } catch (error) {
            console.error("Failed to refresh balances:", error)
          }
        }, 3000)
      } else {
        await executeSwap(request);
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const handleSignSOL = async () => {
    try {
      await signAndSubmitSOL();
    } catch (error) {
      console.error("Failed to sign SOL transaction:", error);
    }
  };

  const handleSignEduPro = async () => {
    try {
      await signAndSubmitEduPro();
      // Refresh balances after successful completion
      setTimeout(async () => {
        try {
          const [eduBalance, solBalance] = await Promise.all([
            solanaAPI.getEduTokenBalance(publicKey!.toString()),
            solanaAPI.getWalletBalance(publicKey!.toString())
          ])
          setBalances({
            edu: eduBalance.edutoken_balance / 1e9,
            sol: solBalance.balance_sol
          })
        } catch (error) {
          console.error("Failed to refresh balances:", error)
        }
      }, 3000)
    } catch (error) {
      console.error("Failed to sign EduPro transaction:", error);
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "executing":
        return "Creating swap transactions...";
      case "signing":
        if (currentTransaction === "sol") {
          return "Please sign the SOL transaction in your wallet";
        } else if (currentTransaction === "edupo") {
          return "Please sign the EduPro transaction in your wallet";
        }
        return "Ready to sign transactions";
      case "submitting":
        return "Submitting transactions to blockchain...";
      case "completed":
        return "Swap completed successfully!";
      case "error":
        return "Swap failed";
      default:
        return "Ready to swap";
    }
  };

  const getProgressValue = () => {
    switch (step) {
      case "executing":
        return 25;
      case "signing":
        return currentTransaction === "sol" ? 50 : 75;
      case "submitting":
        return 90;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const isStepCompleted = (targetStep: string) => {
    const stepOrder = ["idle", "executing", "signing", "submitting", "completed"];
    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(targetStep);
    return currentIndex > targetIndex;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Check */}
      {!connected ? (
        <div className="p-8 text-center bg-dark-accent/20 rounded-xl border border-white/10">
          <div className="mb-4">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to access the swap functionality and view your balances.
            </p>
            
            <div onClick={() => !connected && onClose()}>
              <WalletMultiButton className="!bg-white/10 !text-white !border !border-white/20 !rounded-lg !px-6 !py-2 !font-medium hover:!bg-white/20 transition-colors" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">EDU Balance</span>
                </div>
                {isLoadingBalances && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xl font-bold text-white">
                {isLoadingBalances ? "..." : `${balances.edu.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EDU`}
              </p>
            </div>
            <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">SOL Balance</span>
                </div>
                {isLoadingBalances && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xl font-bold text-white">
                {isLoadingBalances ? "..." : `${balances.sol.toFixed(4)} SOL`}
              </p>
            </div>
          </div>

          {/* Swap Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">You pay</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{amount || "0"} {conversionType === "sol-to-edu" ? "SOL" : "EDU"}</div>
                <div className="text-xs text-muted-foreground">
                  {amountInSmallestUnit.toLocaleString()} {conversionType === "sol-to-edu" ? "lamports" : "token units"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">You receive</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{convertedAmount.toLocaleString()} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}</div>
                <div className="text-xs text-muted-foreground">
                  Fixed rate: 1 {conversionType === "sol-to-edu" ? "SOL" : "EDU"} = {FIXED_RATE} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Conversion Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={conversionType === "sol-to-edu" ? "default" : "outline"}
                onClick={() => setConversionType("sol-to-edu")}
                className={conversionType === "sol-to-edu" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
                disabled={isLoading}
              >
                <Wallet className="h-4 w-4 mr-2" />
                SOL → EDU
              </Button>
              <Button
                variant={conversionType === "edu-to-sol" ? "default" : "outline"}
                onClick={() => setConversionType("edu-to-sol")}
                className={conversionType === "edu-to-sol" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
                disabled={isLoading}
              >
                <Coins className="h-4 w-4 mr-2" />
                EDU → SOL
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Amount ({conversionType === "sol-to-edu" ? "SOL" : "EDU"})
            </label>
            <Input
              type="number"
              step={conversionType === "sol-to-edu" ? "0.001" : "1"}
              min={conversionType === "sol-to-edu" ? "0.001" : "1"}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="bg-dark-accent/20 border-white/10 text-white"
            />
            <div className="text-xs text-muted-foreground">
              Available: {conversionType === "sol-to-edu" ? `${balances.sol.toFixed(4)} SOL` : `${balances.edu.toFixed(2)} EDU`}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Swap Mode</label>
            <div className="flex gap-2">
              <Button
                variant={isAutoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoMode(true)}
                disabled={isLoading}
                className={isAutoMode ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
              >
                Auto (Recommended)
              </Button>
              <Button
                variant={!isAutoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoMode(false)}
                disabled={isLoading}
                className={!isAutoMode ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
              >
                Manual
              </Button>
            </div>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{getStepDescription()}</span>
                <span>{getProgressValue()}%</span>
              </div>
              <Progress value={getProgressValue()} className="w-full" />
            </div>
          )}

          {/* Manual Steps */}
          {!isAutoMode && swapData && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Transaction Steps:</div>
              
              {/* SOL Transaction */}
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {isStepCompleted("signing") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm">Sign {conversionType === "sol-to-edu" ? "SOL" : "EDU"} Transaction</span>
                </div>
                {step === "signing" && currentTransaction === "sol" && (
                  <Button size="sm" onClick={handleSignSOL} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign"}
                  </Button>
                )}
              </div>

              {/* EduPro Transaction */}
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {isStepCompleted("completed") ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm">Sign {conversionType === "sol-to-edu" ? "EDU" : "SOL"} Transaction</span>
                </div>
                {step === "submitting" && (
                  <Button size="sm" onClick={handleSignEduPro} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {step === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Swap completed successfully! You received {convertedAmount.toLocaleString()} {conversionType === "sol-to-edu" ? "EDU" : "SOL"} tokens.
              </AlertDescription>
            </Alert>
          )}

          {/* Important Info */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
              <div className="space-y-1">
                <span className="text-sm text-blue-400 font-medium">Fixed Rate Swap</span>
                <p className="text-xs text-muted-foreground">
                  This swap uses a fixed exchange rate of 1 SOL = 1000 EDU tokens. You'll need to sign two transactions to complete the swap.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSwap}
              disabled={
                !connected ||
                !amount ||
                parseFloat(amount) <= 0 ||
                isLoading ||
                isLoadingBalances ||
                (conversionType === "sol-to-edu" && amountNum > balances.sol) ||
                (conversionType === "edu-to-sol" && amountNum > balances.edu)
              }
              className="flex-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white border-0 hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isAutoMode ? "Processing..." : "Execute Swap"}
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  {isAutoMode ? "Complete Swap" : "Execute Swap"}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30">
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
