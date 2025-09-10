import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import {
  Settings,
  Bell,
  Menu,
  X,
  Search,
  HelpCircle,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { Badge } from "@/shared/components/ui/badge";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [contextSheetOpen, setContextSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Check viewport size
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen flex bg-dark-background text-dark-text">
        {/* Admin Sidebar / Nav Rail */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          hovered={sidebarHovered}
          setHovered={setSidebarHovered}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="w-full flex items-center justify-between p-4 border-b border-white/5 bg-dark-card/40 backdrop-blur-lg sticky top-0 z-40">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-dark-muted hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>

              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-turbo-purple" />
                <span className="font-bold text-xl gradient-text">
                  Admin Portal
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-turbo-purple/20 text-turbo-purple border-turbo-purple/30"
                >
                  v2.1
                </Badge>
              </div>

              {/* Environment Badge */}
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Production
              </Badge>
            </div>

            {/* Center - Global Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users, content, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-accent/30 border border-white/10 rounded-lg text-sm placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-turbo-purple/50 focus:border-turbo-purple/50"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* AI Assistant Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-turbo-purple/20 text-dark-muted hover:text-turbo-purple"
                    onClick={() => setContextSheetOpen(!contextSheetOpen)}
                  >
                    <HelpCircle size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Assistant</TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-dark-accent/50 text-dark-muted hover:text-turbo-indigo"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>System Alerts (3)</TooltipContent>
              </Tooltip>

              {/* Settings */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-dark-accent/50 text-dark-muted hover:text-white"
                    onClick={() => navigate("/admin/settings")}
                  >
                    <Settings size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Admin Settings</TooltipContent>
              </Tooltip>

              {/* Admin Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="text-right">
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-dark-muted">Super Admin</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo ring-2 ring-turbo-indigo/50">
                  <img
                    src="https://ui.shadcn.com/avatars/02.png"
                    className="h-full w-full rounded-full object-cover"
                    alt="Admin avatar"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex">
            {/* Page Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </div>

            {/* Context Side-sheet (AI Assistant / Help) */}
            {contextSheetOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-white/5 bg-dark-card/40 backdrop-blur-sm"
              >
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI Assistant</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setContextSheetOpen(false)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="text-sm text-dark-muted">
                      Need help with admin tasks? I can assist with:
                    </div>
                    <div className="space-y-2">
                      {[
                        "User management queries",
                        "Content moderation",
                        "Payment issues",
                        "System monitoring",
                        "Reports generation",
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 bg-dark-accent/20 rounded-lg hover:bg-dark-accent/30 cursor-pointer"
                        >
                          <ChevronRight
                            size={14}
                            className="text-turbo-purple"
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
