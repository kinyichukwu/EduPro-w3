import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Wallet,
  TrendingUp,
  AlertTriangle,
  X,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Search,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

// Mock data for payments
const transactions = [
  {
    id: "TXN_001",
    user: "John Doe",
    plan: "Student Pro",
    amount: "₦2,500",
    status: "completed",
    date: "2024-01-15",
    method: "Paystack",
    reference: "PS_REF_123456",
  },
  {
    id: "TXN_002",
    user: "Sarah Wilson",
    plan: "Unlimited",
    amount: "₦5,000",
    status: "pending",
    date: "2024-01-14",
    method: "Bank Transfer",
    reference: "BT_REF_789012",
  },
  {
    id: "TXN_003",
    user: "Mike Johnson",
    plan: "Student Pro",
    amount: "₦2,500",
    status: "failed",
    date: "2024-01-13",
    method: "Card",
    reference: "PS_REF_345678",
  },
];

const webhookLogs = [
  {
    id: "WH_001",
    event: "payment.success",
    provider: "Paystack",
    status: "processed",
    timestamp: "2024-01-15 14:30:25",
    attempts: 1,
  },
  {
    id: "WH_002",
    event: "payment.failed",
    provider: "Flutterwave",
    status: "failed",
    timestamp: "2024-01-15 12:15:10",
    attempts: 3,
  },
  {
    id: "WH_003",
    event: "subscription.created",
    provider: "Paystack",
    status: "processed",
    timestamp: "2024-01-14 09:45:32",
    attempts: 1,
  },
];

const walletBalances = [
  {
    name: "OpenAI API",
    balance: "₦15,450",
    usage: "₦8,200",
    limit: "₦50,000",
    status: "healthy",
  },
  {
    name: "Anthropic Claude",
    balance: "₦3,200",
    usage: "₦12,800",
    limit: "₦20,000",
    status: "low",
  },
  {
    name: "Google Cloud",
    balance: "₦28,900",
    usage: "₦5,100",
    limit: "₦40,000",
    status: "healthy",
  },
];

export const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("transactions");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || transaction.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-dark-muted">
            Transaction ledger, webhook monitoring, and wallet management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Ledger
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Sync Webhooks
          </Button>
        </div>
      </motion.div>

      {/* Revenue Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Revenue MTD</p>
                  <p className="text-xl font-bold text-green-500">₦847,200</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-indigo/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-turbo-indigo" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Transactions</p>
                  <p className="text-xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Failed Payments</p>
                  <p className="text-xl font-bold text-orange-500">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-purple/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-turbo-purple" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Growth Rate</p>
                  <p className="text-xl font-bold text-turbo-purple">+18%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-1 p-1 bg-dark-accent/30 rounded-xl backdrop-blur-sm">
          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("transactions")}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo"
          >
            <CreditCard size={16} className="mr-2" />
            Transaction Ledger
          </Button>
          <Button
            variant={activeTab === "webhooks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("webhooks")}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo"
          >
            <Activity size={16} className="mr-2" />
            Webhook Logs
          </Button>
          <Button
            variant={activeTab === "wallets" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("wallets")}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo"
          >
            <Wallet size={16} className="mr-2" />
            Wallet Balances
          </Button>
        </div>
      </motion.div>

      {/* Transaction Ledger */}
      {activeTab === "transactions" && (
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Filters */}
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-4 h-4" />
                  <Input
                    placeholder="Search by user, reference, or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-dark-accent/30 border-white/10"
                  />
                </div>
                <Select
                  value={selectedFilter}
                  onValueChange={setSelectedFilter}
                >
                  <SelectTrigger className="w-[180px] bg-dark-accent/30 border-white/10">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete payment transaction records
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-dark-accent/20">
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="border-white/5 hover:bg-dark-accent/10"
                    >
                      <TableCell>
                        <div className="font-medium text-sm">
                          {transaction.id}
                        </div>
                        <div className="text-xs text-dark-muted">
                          {transaction.reference}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {transaction.user}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.amount}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{transaction.method}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs",
                            transaction.status === "completed" &&
                              "bg-green-500/20 text-green-400 border-green-500/30",
                            transaction.status === "pending" &&
                              "bg-orange-500/20 text-orange-400 border-orange-500/30",
                            transaction.status === "failed" &&
                              "bg-red-500/20 text-red-400 border-red-500/30"
                          )}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-dark-muted">
                          {transaction.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <X className="mr-2 h-4 w-4" />
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Webhook Logs */}
      {activeTab === "webhooks" && (
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Webhook Activity</CardTitle>
              <CardDescription>
                Real-time webhook events and processing status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-dark-accent/20">
                    <TableHead>Event ID</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-white/5 hover:bg-dark-accent/10"
                    >
                      <TableCell>
                        <div className="font-medium text-sm">{log.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.event}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.provider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs",
                            log.status === "processed" &&
                              "bg-green-500/20 text-green-400 border-green-500/30",
                            log.status === "failed" &&
                              "bg-red-500/20 text-red-400 border-red-500/30"
                          )}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.attempts}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-dark-muted">
                          {log.timestamp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Wallet Balances */}
      {activeTab === "wallets" && (
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>API Wallet Balances</CardTitle>
              <CardDescription>
                Monitor API usage and credit balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletBalances.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="p-4 bg-dark-accent/20 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-turbo-indigo/10 flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-turbo-indigo" />
                        </div>
                        <div>
                          <h4 className="font-medium">{wallet.name}</h4>
                          <p className="text-xs text-dark-muted">
                            Usage: {wallet.usage} / {wallet.limit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">
                          {wallet.balance}
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            wallet.status === "healthy" &&
                              "bg-green-500/20 text-green-400 border-green-500/30",
                            wallet.status === "low" &&
                              "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          )}
                        >
                          {wallet.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Usage</span>
                        <span>
                          {wallet.usage} / {wallet.limit}
                        </span>
                      </div>
                      <div className="w-full bg-dark-accent/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-turbo-purple to-turbo-indigo h-2 rounded-full"
                          style={{
                            width: `${
                              (parseInt(wallet.usage.replace(/[₦,]/g, "")) /
                                parseInt(wallet.limit.replace(/[₦,]/g, ""))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        Add Funds
                      </Button>
                      <Button size="sm" variant="outline">
                        View Usage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
