import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { Badge } from "@/shared/components/ui/badge";

const adminNavItems = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "/admin",
    color: "text-turbo-indigo",
    description: "Overview & KPIs",
  },
  {
    icon: <FileText size={20} />,
    label: "Content",
    path: "/admin/content",
    color: "text-turbo-purple",
    description: "Materials & Moderation",
    badge: "3",
  },
  {
    icon: <HelpCircle size={20} />,
    label: "Question Bank",
    path: "/admin/questions",
    color: "text-turbo-blue",
    description: "MCQ & Test Manager",
  },
  {
    icon: <Users size={20} />,
    label: "Users",
    path: "/admin/users",
    color: "text-green-500",
    description: "Students & Course Reps",
  },
  {
    icon: <BarChart3 size={20} />,
    label: "Analytics",
    path: "/admin/analytics",
    color: "text-orange-500",
    description: "Performance Insights",
  },
  {
    icon: <CreditCard size={20} />,
    label: "Payments",
    path: "/admin/payments",
    color: "text-emerald-500",
    description: "Billing & Revenue",
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
    path: "/admin/settings",
    color: "text-slate-400",
    description: "System Configuration",
  },
];

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
}

export const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  hovered,
  setHovered,
}: AdminSidebarProps) => {
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !sidebarOpen) {
      hoverTimeout.current = setTimeout(() => {
        setHovered(true);
        setSidebarOpen(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }

    if (!isMobile && hovered) {
      setHovered(false);
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "sticky top-0 h-screen flex flex-col backdrop-blur-lg transition-all duration-300 ease-in-out border-r border-white/5 z-30",
        sidebarOpen ? "w-72" : "w-0 md:w-16",
        isMobile && !sidebarOpen && "hidden"
      )}
      style={{
        backgroundColor: "rgba(17, 18, 21, 0.95)",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-turbo-purple to-turbo-indigo flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin Portal</span>
              <span className="text-xs text-dark-muted">EduPro Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
        {adminNavItems.map((item) => (
          <div key={item.label} className="px-3">
            <Link
              to={item.path}
              className={cn(
                "group relative flex items-center rounded-xl p-3 transition-all duration-200",
                isActive(item.path)
                  ? `bg-gradient-to-r from-turbo-purple/20 to-turbo-indigo/20 border border-turbo-purple/30 ${item.color} shadow-lg`
                  : "hover:bg-white/5 text-dark-muted hover:text-white",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "flex-shrink-0 p-2 rounded-lg transition-colors",
                    isActive(item.path)
                      ? "bg-gradient-to-br from-turbo-purple/30 to-turbo-indigo/30"
                      : "group-hover:bg-white/10"
                  )}
                >
                  {item.icon}
                </div>

                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-dark-muted group-hover:text-dark-muted/80">
                          {item.description}
                        </div>
                      </div>
                      {item.badge && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1.5 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-dark-card border border-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {item.label}
                </div>
              )}

              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-turbo-purple to-turbo-indigo rounded-l-full" />
              )}
            </Link>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* System Status */}
        <div className="flex items-center gap-2 text-xs text-dark-muted">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {sidebarOpen ? "System Healthy" : ""}
        </div>

        {/* Quick Actions */}
        {sidebarOpen && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border-turbo-purple/20 text-turbo-purple hover:from-turbo-purple/20 hover:to-turbo-indigo/20"
            >
              <Zap size={14} className="mr-2" />
              System Monitor
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
