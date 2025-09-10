import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Upload,
  DollarSign,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  CreditCard,
  FileText,
  Flag,
  UserPlus,
  Wallet,
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
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

// Mock data for the admin dashboard
const kpiData = [
  {
    title: "Active Users",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    period: "24h",
    color: "text-turbo-indigo",
    bgColor: "bg-turbo-indigo/10",
  },
  {
    title: "Docs Uploaded",
    value: "89",
    change: "+24%",
    trend: "up",
    icon: Upload,
    period: "today",
    color: "text-turbo-purple",
    bgColor: "bg-turbo-purple/10",
  },
  {
    title: "AI Cost",
    value: "₦45,230",
    change: "-8%",
    trend: "down",
    icon: Zap,
    period: "today",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Revenue",
    value: "₦2.4M",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    period: "MTD",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

const systemAlerts = [
  {
    type: "error",
    title: "Webhook Failure",
    message: "Paystack webhook failed 3 times in the last hour",
    time: "5 min ago",
    action: "View Logs",
  },
  {
    type: "warning",
    title: "Low Wallet Balance",
    message: "OpenAI API balance is below ₦10,000",
    time: "12 min ago",
    action: "Add Funds",
  },
  {
    type: "info",
    title: "Quota Breach",
    message: "User quota exceeded by 15% for premium users",
    time: "1 hour ago",
    action: "Review",
  },
];

const recentActivity = [
  {
    type: "upgrade",
    user: "John Doe",
    action: "upgraded to Pro",
    time: "2 min ago",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    type: "content",
    user: "Sarah Wilson",
    action: "approved chemistry notes",
    time: "5 min ago",
    icon: CheckCircle,
    color: "text-turbo-indigo",
  },
  {
    type: "refund",
    user: "Mike Johnson",
    action: "refund issued",
    time: "10 min ago",
    icon: CreditCard,
    color: "text-orange-500",
  },
  {
    type: "flag",
    user: "System",
    action: "content flagged for review",
    time: "15 min ago",
    icon: Flag,
    color: "text-red-500",
  },
];

const quickActions = [
  {
    title: "Review Flagged Content",
    description: "3 items pending review",
    icon: Eye,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    href: "/admin/content?filter=flagged",
  },
  {
    title: "Add PQ Batch",
    description: "Upload new past questions",
    icon: FileText,
    color: "text-turbo-purple",
    bgColor: "bg-turbo-purple/10",
    href: "/admin/questions/upload",
  },
  {
    title: "Credit User",
    description: "Grant prompts/uploads manually",
    icon: UserPlus,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    href: "/admin/users?action=credit",
  },
  {
    title: "Manage Wallets",
    description: "API balances & billing",
    icon: Wallet,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    href: "/admin/payments/wallets",
  },
];

export const AdminDashboardPage = () => {
  const [timeRange, setTimeRange] = useState("24h");

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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-dark-muted">
            Monitor system health and key performance indicators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity size={16} className="mr-2" />
            System Status
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-dark-accent/30 border border-white/10 rounded-lg text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </motion.div>

      {/* Hero KPIs */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiData.map((kpi) => (
          <motion.div key={kpi.title} variants={itemVariants}>
            <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm hover:bg-dark-card/60 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-muted">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          kpi.trend === "up" ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {kpi.change}
                      </span>
                      {kpi.trend === "up" ? (
                        <ArrowUpRight size={14} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-500" />
                      )}
                      <span className="text-xs text-dark-muted">
                        {kpi.period}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      kpi.bgColor
                    )}
                  >
                    <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Charts & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Charts */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>
                  Real-time performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simplified chart placeholders */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prompts per day</span>
                    <span className="text-green-500">+23% ↑</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>New subscriptions</span>
                    <span className="text-turbo-indigo">+12% ↑</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Server latency</span>
                    <span className="text-orange-500">145ms</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto p-4 border-white/10 hover:border-turbo-purple/50 hover:bg-turbo-purple/5 text-left justify-start"
                      asChild
                    >
                      <a href={action.href}>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              action.bgColor
                            )}
                          >
                            <action.icon
                              className={cn("w-5 h-5", action.color)}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {action.title}
                            </div>
                            <div className="text-xs text-dark-muted">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* System Alerts */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-white/5 bg-dark-accent/20 hover:bg-dark-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "text-xs px-2 py-0.5",
                              alert.type === "error" &&
                                "bg-red-500/20 text-red-400 border-red-500/30",
                              alert.type === "warning" &&
                                "bg-orange-500/20 text-orange-400 border-orange-500/30",
                              alert.type === "info" &&
                                "bg-turbo-indigo/20 text-turbo-indigo border-turbo-indigo/30"
                            )}
                          >
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-dark-muted">
                            {alert.time}
                          </span>
                        </div>
                        <div className="font-medium text-sm mt-1">
                          {alert.title}
                        </div>
                        <div className="text-xs text-dark-muted mt-1">
                          {alert.message}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} className="text-turbo-purple" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-accent/20 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center bg-dark-accent/30"
                      )}
                    >
                      <activity.icon size={14} className={cn(activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-dark-muted">
                          {activity.action}
                        </span>
                      </div>
                      <div className="text-xs text-dark-muted">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
