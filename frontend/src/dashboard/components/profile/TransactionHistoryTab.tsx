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
} from "lucide-react";
import { TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { mockTransactions } from "@/dashboard/constants/profile";
import { useState, useMemo } from "react"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"

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
    <TabsContent value="transactions" className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp size={20} />
                    Transaction History
                  </CardTitle>
                  
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
                      <ConversionModal />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Earned</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-400">+{totalEarned}</p>
                        </div>
                        <div className="rounded-lg bg-green-500/10 p-2 border border-green-500/20">
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-xl sm:text-2xl font-bold text-red-400">-{totalSpent}</p>
                        </div>
                        <div className="rounded-lg bg-red-500/10 p-2 border border-red-500/20">
                          <TrendingDown className="h-6 w-6 text-red-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className={cn(
                    "border-white/10",
                    totalEarned - totalSpent >= 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Net Balance</p>
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-white/10 bg-dark-accent/20">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>

              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="p-16 text-center rounded-lg border border-white/10 bg-dark-accent/10">
                    <p className="text-muted-foreground">No transactions found matching your criteria.</p>
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
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TabsContent>
  );
};

// Conversion Modal Component
const ConversionModal = () => {
  const [conversionType, setConversionType] = useState<"edu-to-sol" | "sol-to-edu">("edu-to-sol")
  const [amount, setAmount] = useState("")
  const [isConverting, setIsConverting] = useState(false)

  // Mock exchange rates (in a real app, these would come from an API)
  const exchangeRates = {
    "edu-to-sol": 0.001, // 1 EDU = 0.001 SOL
    "sol-to-edu": 1000,  // 1 SOL = 1000 EDU
  }

  const convertedAmount = amount ? (parseFloat(amount) * exchangeRates[conversionType]).toFixed(6) : "0"

  const handleConversion = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    setIsConverting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConverting(false)
    
    // In a real app, you would handle the actual conversion here
    alert(`Conversion successful! ${amount} ${conversionType === "edu-to-sol" ? "EDU" : "SOL"} converted to ${convertedAmount} ${conversionType === "edu-to-sol" ? "SOL" : "EDU"}`)
  }

  return (
    <div className="space-y-6">
      {/* Current Balances */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">EDU Balance</span>
          </div>
          <p className="text-xl font-bold text-white">2,847 EDU</p>
        </div>
        <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">SOL Balance</span>
          </div>
          <p className="text-xl font-bold text-white">0.125 SOL</p>
        </div>
      </div>

      {/* Conversion Type Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Conversion Direction</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={conversionType === "edu-to-sol" ? "default" : "outline"}
            onClick={() => setConversionType("edu-to-sol")}
            className={conversionType === "edu-to-sol" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
          >
            <Coins className="h-4 w-4 mr-2" />
            EDU → SOL
          </Button>
          <Button
            variant={conversionType === "sol-to-edu" ? "default" : "outline"}
            onClick={() => setConversionType("sol-to-edu")}
            className={conversionType === "sol-to-edu" ? "bg-white/10 text-white border-white/20" : "bg-dark-accent/20 text-muted-foreground border-white/10 hover:bg-dark-accent/30"}
          >
            <Wallet className="h-4 w-4 mr-2" />
            SOL → EDU
          </Button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">
          Amount to Convert ({conversionType === "edu-to-sol" ? "EDU" : "SOL"})
        </label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-dark-accent/20 border-white/10 text-white"
        />
      </div>

      {/* Conversion Preview */}
      {amount && (
        <div className="p-4 bg-dark-accent/20 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You will receive:</span>
            <div className="text-right">
              <p className="text-lg font-bold text-white">
                {convertedAmount} {conversionType === "edu-to-sol" ? "SOL" : "EDU"}
              </p>
              <p className="text-xs text-muted-foreground">
                Rate: 1 {conversionType === "edu-to-sol" ? "EDU" : "SOL"} = {exchangeRates[conversionType]} {conversionType === "edu-to-sol" ? "SOL" : "EDU"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Fee Info */}
      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-sm text-yellow-400">Conversion Fee: 0.5%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Network fees may apply. Conversion rates are updated in real-time.
        </p>
      </div>

      {/* Convert Button */}
      <Button
        onClick={() => void handleConversion()}
        disabled={!amount || parseFloat(amount) <= 0 || isConverting}
        className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20"
      >
        {isConverting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Converting...
          </>
        ) : (
          <>
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Convert {conversionType === "edu-to-sol" ? "EDU to SOL" : "SOL to EDU"}
          </>
        )}
      </Button>
    </div>
  )
}
