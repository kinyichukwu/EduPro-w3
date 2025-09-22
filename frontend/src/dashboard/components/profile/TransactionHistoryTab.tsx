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
  const [conversionType, setConversionType] = useState<"edu-to-sol" | "sol-to-edu">("sol-to-edu")
  const [amount, setAmount] = useState("")
  const [isConverting, setIsConverting] = useState(false)
  const [balances, setBalances] = useState<{ edu: number; sol: number }>({ edu: 0, sol: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [swapQuote, setSwapQuote] = useState<any>(null)
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Get real wallet address from Solana wallet adapter
  const { connected, publicKey } = useWallet()
  const userWallet = publicKey?.toString() || ""

  // Token addresses from API documentation
  const SOL_MINT = "So11111111111111111111111111111111111111112"
  const EDUPRO_MINT = "8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV"

  // Get wallet balances when wallet is connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !userWallet) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [eduBalance, solBalance] = await Promise.all([
          solanaAPI.getEduTokenBalance(userWallet),
          solanaAPI.getWalletBalance(userWallet)
        ])
        setBalances({
          edu: eduBalance.edutoken_balance / 1e9, // Convert from token units to EDU
          sol: solBalance.balance_sol
        })
      } catch (error) {
        console.error("Failed to fetch balances:", error)
        // Set default values on error
        setBalances({ edu: 0, sol: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [connected, userWallet])

  // Track previous connection state to only close modal on new connections
  const prevConnectedRef = useRef(connected)
  
  // Close modal when wallet connects (to avoid z-index issues with wallet selection)
  // Only close if wallet was previously disconnected and now connects
  useEffect(() => {
    const wasDisconnected = !prevConnectedRef.current
    
    if (connected && wasDisconnected) {
      // Small delay to ensure wallet connection is fully processed
      const timer = setTimeout(() => {
        onClose()
      }, 100)
      
      // Update the ref for next time
      prevConnectedRef.current = connected
      
      return () => clearTimeout(timer)
    }
    
    // Always update the ref
    prevConnectedRef.current = connected
  }, [connected, onClose])

  // Get swap quote when amount or conversion type changes
  useEffect(() => {
    const getSwapQuote = async () => {
      if (!connected || !userWallet || !amount || parseFloat(amount) <= 0) {
        setSwapQuote(null)
        return
      }

      setIsGettingQuote(true)
      try {
        // Convert amounts to proper units based on conversion direction
        let amountInSmallestUnit: number
        
        if (conversionType === "sol-to-edu") {
          // Converting SOL to EduPro: amount is in SOL, convert to lamports
          amountInSmallestUnit = Math.floor(parseFloat(amount) * 1e9)
        } else {
          // Converting EduPro to SOL: amount is in EduPro tokens, convert to token units
          amountInSmallestUnit = Math.floor(parseFloat(amount) * 1e9)
        }

        const swapRequest = {
          inputMint: conversionType === "sol-to-edu" ? SOL_MINT : EDUPRO_MINT,
          outputMint: conversionType === "sol-to-edu" ? EDUPRO_MINT : SOL_MINT,
          amount: amountInSmallestUnit,
          slippageBps: 100, // 1%
          userWallet: userWallet
        }

        const quote = await solanaAPI.getSwapQuote(swapRequest)
        setSwapQuote(quote)
      } catch (error) {
        console.error("Failed to get swap quote:", error)
        setSwapQuote(null)
      } finally {
        setIsGettingQuote(false)
      }
    }

    // Debounce the quote request
    const timeoutId = setTimeout(getSwapQuote, 500)
    return () => clearTimeout(timeoutId)
  }, [amount, conversionType, userWallet, connected, SOL_MINT, EDUPRO_MINT])

  const handleGetQuote = async () => {
    if (!connected || !userWallet || !amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    // Check if user has sufficient balance
    const amountNum = parseFloat(amount)
    if (conversionType === "sol-to-edu" && amountNum > balances.sol) {
      alert("Insufficient SOL balance")
      return
    }
    if (conversionType === "edu-to-sol" && amountNum > balances.edu) {
      alert("Insufficient EduPro token balance")
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmConversion = async () => {
    if (!swapQuote) return

    setIsConverting(true)
    try {
      // Execute the swap with the same parameters used for the quote
      const swapRequest = {
        inputMint: swapQuote.inputMint,
        outputMint: swapQuote.outputMint,
        amount: parseInt(swapQuote.inAmount),
        slippageBps: 100,
        userWallet: userWallet
      }

      const result = await solanaAPI.executeSwap(swapRequest)

      // Show success message with transaction details
      const outputAmount = (parseFloat(result.outAmount) / 1e9).toFixed(conversionType === "sol-to-edu" ? 2 : 6)
      const outputToken = conversionType === "sol-to-edu" ? "EduPro tokens" : "SOL"
      
      alert(`✅ Swap Executed Successfully!\n\n🆔 Swap ID: ${result.swapId}\n📊 Status: ${result.status}\n\n💰 You will receive: ${outputAmount} ${outputToken}\n\n⚠️ Important: ${result.message}\n\n🔗 The swap involves two transactions that need to be signed. Please check your wallet for transaction prompts.`)

      // Refresh balances after a delay to allow for transaction confirmation
      setTimeout(async () => {
        try {
          const [eduBalance, solBalance] = await Promise.all([
            solanaAPI.getEduTokenBalance(userWallet),
            solanaAPI.getWalletBalance(userWallet)
          ])
          setBalances({
            edu: eduBalance.edutoken_balance / 1e9,
            sol: solBalance.balance_sol
          })
        } catch (error) {
          console.error("Failed to refresh balances:", error)
          // Don't alert here as the swap was successful
        }
      }, 3000)

      // Reset form
      setAmount("")
      setSwapQuote(null)
      setShowConfirmation(false)
    } catch (error) {
      console.error("Conversion failed:", error)
      
      // Better error handling
      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Check for specific error types
      if (errorMessage.includes("Insufficient")) {
        alert(`❌ Swap Failed: Insufficient Balance\n\nPlease ensure you have enough ${conversionType === "sol-to-edu" ? "SOL" : "EduPro tokens"} in your wallet to complete this swap.`)
      } else if (errorMessage.includes("expired")) {
        alert(`❌ Swap Failed: Quote Expired\n\nThe swap quote has expired. Please try again to get a fresh quote.`)
      } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
        alert(`❌ Swap Failed: Network Error\n\nPlease check your internet connection and try again.`)
      } else {
        alert(`❌ Swap Failed\n\nError: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
      }
    } finally {
      setIsConverting(false)
    }
  }

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
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xl font-bold text-white">
                {isLoading ? "..." : `${balances.edu.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EDU`}
              </p>
            </div>
            <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">SOL Balance</span>
                </div>
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xl font-bold text-white">
                {isLoading ? "..." : `${balances.sol.toFixed(4)} SOL`}
              </p>
            </div>
          </div>

      {!showConfirmation ? (
        <>
          {/* Conversion Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Conversion Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={conversionType === "sol-to-edu" ? "default" : "outline"}
                onClick={() => setConversionType("sol-to-edu")}
                className={conversionType === "sol-to-edu" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
              >
                <Wallet className="h-4 w-4 mr-2" />
                SOL → EDU
              </Button>
              <Button
                variant={conversionType === "edu-to-sol" ? "default" : "outline"}
                onClick={() => setConversionType("edu-to-sol")}
                className={conversionType === "edu-to-sol" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
              >
                <Coins className="h-4 w-4 mr-2" />
                EDU → SOL
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">
              Amount to Convert ({conversionType === "sol-to-edu" ? "SOL" : "EDU"})
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-dark-accent/20 border-white/10 text-white pr-20"
                step="0.001"
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {conversionType === "sol-to-edu" ? "SOL" : "EDU"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Available: {conversionType === "sol-to-edu" ? `${balances.sol.toFixed(4)} SOL` : `${balances.edu.toFixed(2)} EDU`}
            </div>
          </div>

          {/* Real-time Quote Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="space-y-3">
              {isGettingQuote ? (
                <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Getting quote...</p>
                </div>
              ) : swapQuote ? (
                <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">You will receive:</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          {(parseFloat(swapQuote.outAmount) / 1e9).toFixed(conversionType === "sol-to-edu" ? 2 : 6)} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Exchange Rate:</span>
                      <span>1 {conversionType === "sol-to-edu" ? "SOL" : "EDU"} = {swapQuote.fixedRate || 1000} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Swap Type:</span>
                      <span className="text-blue-400">Fixed Price</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
                  <p className="text-sm text-red-400">Unable to get quote. Please try again.</p>
                </div>
              )}
            </div>
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

          {/* Get Quote Button */}
          <Button
            onClick={handleGetQuote}
            disabled={
              !connected ||
              !amount ||
              parseFloat(amount) <= 0 ||
              isGettingQuote ||
              isLoading ||
              !swapQuote ||
              (conversionType === "sol-to-edu" && parseFloat(amount) > balances.sol) ||
              (conversionType === "edu-to-sol" && parseFloat(amount) > balances.edu)
            }
            className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white border-0 hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
          >
            {isGettingQuote ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Quote...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Review Swap
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          {/* Confirmation Step */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Confirm Swap</h3>
              <p className="text-sm text-muted-foreground">Please review the details before proceeding</p>
            </div>

            {/* Swap Summary */}
            <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You're sending:</span>
                  <span className="text-white font-medium">
                    {amount} {conversionType === "sol-to-edu" ? "SOL" : "EDU"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You'll receive:</span>
                  <span className="text-green-400 font-medium">
                    {swapQuote && (parseFloat(swapQuote.outAmount) / 1e9).toFixed(conversionType === "sol-to-edu" ? 2 : 6)} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exchange Rate:</span>
                    <span className="text-white text-sm">
                      1 {conversionType === "sol-to-edu" ? "SOL" : "EDU"} = {swapQuote?.fixedRate || 1000} {conversionType === "sol-to-edu" ? "EDU" : "SOL"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-xs text-yellow-300">
                    You will need to sign two transactions: one to send {conversionType === "sol-to-edu" ? "SOL to the organization wallet" : "EDU tokens to the organization"} and another to receive {conversionType === "sol-to-edu" ? "EDU tokens" : "SOL"} in your wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"
                disabled={isConverting}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmConversion}
                disabled={isConverting}
                className="flex-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white border-0 hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Execute Swap
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
        </>
      )}
    </div>
  )
}
