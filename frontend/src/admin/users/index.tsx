import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Mail,
  GraduationCap,
  Ban,
  CheckCircle,
  MoreHorizontal,
  Edit3,
  Eye,
  RefreshCw,
  Download,
  Zap,
  Gift,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@university.edu",
    role: "student",
    plan: "Pro",
    status: "active",
    prompts: { used: 45, total: 500 },
    uploads: { used: 8, total: 50 },
    signupDate: "2024-01-15",
    lastActive: "2 hours ago",
    quotaOverride: false,
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@university.edu",
    role: "course_rep",
    plan: "Free",
    status: "active",
    prompts: { used: 18, total: 20 },
    uploads: { used: 5, total: 5 },
    signupDate: "2024-01-10",
    lastActive: "1 day ago",
    quotaOverride: true,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@university.edu",
    role: "student",
    plan: "Free",
    status: "suspended",
    prompts: { used: 20, total: 20 },
    uploads: { used: 4, total: 5 },
    signupDate: "2024-01-05",
    lastActive: "1 week ago",
    quotaOverride: false,
  },
];

export const UserManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesPlan = selectedPlan === "all" || user.plan === selectedPlan;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesPlan && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredUsers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredUsers.map((u) => u.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "course_rep":
        return <GraduationCap className="w-4 h-4 text-turbo-purple" />;
      default:
        return <Users className="w-4 h-4 text-turbo-indigo" />;
    }
  };

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
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-dark-muted">
            Manage students, course representatives, and admin accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Users
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
          >
            <UserPlus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-indigo/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-turbo-indigo" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Total Users</p>
                  <p className="text-xl font-bold">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Active Users</p>
                  <p className="text-xl font-bold text-green-500">2,634</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-purple/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-turbo-purple" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Course Reps</p>
                  <p className="text-xl font-bold text-turbo-purple">89</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Suspended</p>
                  <p className="text-xl font-bold text-orange-500">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-accent/30 border-white/10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="course_rep">Course Reps</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-10"
        >
          <Card className="border-turbo-purple/30 bg-turbo-purple/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedItems.length} users selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Gift size={14} className="mr-2" />
                      Grant Credits
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail size={14} className="mr-2" />
                      Send Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-400/30"
                    >
                      <Ban size={14} className="mr-2" />
                      Suspend
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedItems([])}
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Directory</CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-dark-accent/20">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredUsers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-white/5 hover:bg-dark-accent/10"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(user.id)}
                        onCheckedChange={() => handleSelectItem(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-dark-muted">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm capitalize">
                          {user.role.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          user.plan === "Pro" &&
                            "bg-turbo-purple/10 text-turbo-purple border-turbo-purple/30",
                          user.plan === "Free" &&
                            "bg-gray-500/10 text-gray-400 border-gray-500/30",
                          user.plan === "Unlimited" &&
                            "bg-green-500/10 text-green-400 border-green-500/30"
                        )}
                      >
                        {user.plan}
                        {user.quotaOverride && <Zap className="w-3 h-3 ml-1" />}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs">
                          Prompts: {user.prompts.used}/{user.prompts.total}
                        </div>
                        <div className="text-xs">
                          Uploads: {user.uploads.used}/{user.uploads.total}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs",
                          user.status === "active" &&
                            "bg-green-500/20 text-green-400 border-green-500/30",
                          user.status === "suspended" &&
                            "bg-red-500/20 text-red-400 border-red-500/30",
                          user.status === "pending" &&
                            "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-dark-muted">
                        {user.lastActive}
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Gift className="mr-2 h-4 w-4" />
                            Grant Credits
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
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
    </div>
  );
};
