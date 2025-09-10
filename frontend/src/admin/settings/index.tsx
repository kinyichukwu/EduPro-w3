import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Key,
  Database,
  AlertTriangle,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Server,
  ToggleLeft,
  Lock,
  Download,
  Upload,
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
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

// Mock data for settings
const rateLimits = [
  { endpoint: "Chat API", limit: "100", period: "minute", current: 78 },
  { endpoint: "Upload API", limit: "50", period: "minute", current: 23 },
  { endpoint: "Quiz API", limit: "200", period: "minute", current: 145 },
];

const featureFlags = [
  {
    name: "AI Assistant",
    key: "ai_assistant_enabled",
    enabled: true,
    description: "Enable AI-powered study assistance",
  },
  {
    name: "Beta Features",
    key: "beta_features",
    enabled: false,
    description: "Allow access to experimental features",
  },
  {
    name: "Advanced Analytics",
    key: "advanced_analytics",
    enabled: true,
    description: "Enable detailed user analytics tracking",
  },
  {
    name: "Mobile Push",
    key: "mobile_push_notifications",
    enabled: true,
    description: "Send push notifications to mobile apps",
  },
];

const apiKeys = [
  {
    name: "OpenAI GPT-4",
    key: "sk-proj-****************************",
    status: "active",
    lastUsed: "2 hours ago",
  },
  {
    name: "Anthropic Claude",
    key: "ant-api-****************************",
    status: "active",
    lastUsed: "5 minutes ago",
  },
  {
    name: "Paystack",
    key: "pk_test_****************************",
    status: "active",
    lastUsed: "1 day ago",
  },
];

export const SettingsPage = () => {
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string>("");

  const handleCopyKey = (keyName: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(keyName);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [keyName]: !prev[keyName],
    }));
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-dark-muted">
            Configure system-wide settings, API keys, and security policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Config
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Import Config
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Limits */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server size={20} className="text-turbo-indigo" />
                Rate Limits
              </CardTitle>
              <CardDescription>
                Configure API rate limiting and throttling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateLimits.map((limit) => (
                <div
                  key={limit.endpoint}
                  className="p-4 bg-dark-accent/20 rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{limit.endpoint}</h4>
                      <p className="text-xs text-dark-muted">
                        Current: {limit.current} requests
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        limit.current / parseInt(limit.limit) > 0.8
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      )}
                    >
                      {Math.round(
                        (limit.current / parseInt(limit.limit)) * 100
                      )}
                      %
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`limit-${limit.endpoint}`}
                        className="text-xs"
                      >
                        Limit
                      </Label>
                      <Input
                        id={`limit-${limit.endpoint}`}
                        defaultValue={limit.limit}
                        className="mt-1 bg-dark-accent/30 border-white/10 text-xs"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`period-${limit.endpoint}`}
                        className="text-xs"
                      >
                        Period
                      </Label>
                      <Select defaultValue={limit.period}>
                        <SelectTrigger className="mt-1 bg-dark-accent/30 border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="second">Second</SelectItem>
                          <SelectItem value="minute">Minute</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button size="sm" className="w-full">
                <Save size={14} className="mr-2" />
                Save Rate Limits
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Flags */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft size={20} className="text-turbo-purple" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable system features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureFlags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between p-4 bg-dark-accent/20 rounded-xl border border-white/5"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{flag.name}</div>
                    <div className="text-xs text-dark-muted mt-1">
                      {flag.description}
                    </div>
                  </div>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => {
                      // Handle flag toggle
                    }}
                  />
                </div>
              ))}
              <Button size="sm" className="w-full">
                <Save size={14} className="mr-2" />
                Save Feature Flags
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* API Keys Vault */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} className="text-orange-500" />
              API Keys Vault
            </CardTitle>
            <CardDescription>
              Manage external service API keys and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.name}
                className="p-4 bg-dark-accent/20 rounded-xl border border-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <p className="text-xs text-dark-muted">
                      Last used: {apiKey.lastUsed}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      apiKey.status === "active"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {apiKey.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKeys[apiKey.name] ? "text" : "password"}
                      value={apiKey.key}
                      readOnly
                      className="bg-dark-accent/30 border-white/10 font-mono text-xs pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleKeyVisibility(apiKey.name)}
                      >
                        {showApiKeys[apiKey.name] ? (
                          <EyeOff size={12} />
                        ) : (
                          <Eye size={12} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyKey(apiKey.name, apiKey.key)}
                      >
                        {copied === apiKey.name ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Update
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full">
              <Key size={14} className="mr-2" />
              Add New API Key
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDPR Tools */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-green-500" />
                GDPR & Privacy Tools
              </CardTitle>
              <CardDescription>
                Data protection and privacy compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  <div className="font-medium text-sm mb-2">Data Retention</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">User Data</Label>
                      <Select defaultValue="2years">
                        <SelectTrigger className="mt-1 bg-dark-accent/30 border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                          <SelectItem value="5years">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Analytics</Label>
                      <Select defaultValue="90days">
                        <SelectTrigger className="mt-1 bg-dark-accent/30 border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30days">30 Days</SelectItem>
                          <SelectItem value="90days">90 Days</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full">
                    <Download size={14} className="mr-2" />
                    Export User Data
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Database size={14} className="mr-2" />
                    Run Data Cleanup
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <RefreshCw size={14} className="mr-2" />
                    Anonymize Old Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card className="border-red/30 bg-red/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red">
                <AlertTriangle size={20} />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red/70">
                Destructive actions that cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-red/10 rounded-lg border border-red/20">
                  <div className="font-medium text-sm mb-2 text-red">
                    System Maintenance
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red text-red hover:bg-red hover:text-white"
                    >
                      <Database size={14} className="mr-2" />
                      Clear All Caches
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red text-red hover:bg-red hover:text-white"
                    >
                      <RefreshCw size={14} className="mr-2" />
                      Reset Rate Limits
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-red/10 rounded-lg border border-red/20">
                  <div className="font-medium text-sm mb-2 text-red">
                    Data Operations
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red text-red hover:bg-red hover:text-white"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Purge Inactive Users
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red text-red hover:bg-red hover:text-white"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete System Logs
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-red/10 rounded-lg border border-red/20">
                  <div className="font-medium text-sm mb-2 text-red">
                    Emergency Actions
                  </div>
                  <Textarea
                    placeholder="Enter confirmation text to enable emergency actions..."
                    className="mb-2 bg-red/5 border-red/30 text-red placeholder:text-red/50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-red text-red hover:bg-red hover:text-white"
                    disabled
                  >
                    <Lock size={14} className="mr-2" />
                    Emergency Shutdown
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and configuration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <div className="font-medium text-sm">API Services</div>
                    <div className="text-xs text-dark-muted">
                      All operational
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <div className="font-medium text-sm">Database</div>
                    <div className="text-xs text-dark-muted">Healthy</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div>
                    <div className="font-medium text-sm">Webhooks</div>
                    <div className="text-xs text-dark-muted">2 failures</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
