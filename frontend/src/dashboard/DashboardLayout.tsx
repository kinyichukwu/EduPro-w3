import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SubscriptionPopup } from "./components/SubscriptionPopup";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import {
  Home,
  MessageCircle,
  UserRound,
  Library,
  Bell,
  Menu,
  X,
  Zap,
  BookOpen,
  BookText,
} from "lucide-react";
import { motion } from "framer-motion";
import SearchBar from "./components/SearchBar";
import { cn } from "@/shared/lib/utils";

// Navigation items
export const navItems = [
  {
    icon: <Home size={22} />,
    label: "Home",
    path: "/dashboard",
    color: "text-turbo-indigo",
  },
  {
    icon: <MessageCircle size={22} />,
    label: "Chat",
    path: "/dashboard/chat",
    color: "text-turbo-purple",
  },
  {
    icon: <BookOpen size={22} />,
    label: "Cards",
    path: "/dashboard/flashcards",
    color: `text-pink-500`,
  },
  {
    icon: <BookText size={22} />,
    label: "Quizzes",
    path: "/dashboard/quizzes",
    color: "text-turbo-blue",
  },
  {
    icon: <Library size={22} />,
    label: "Library",
    path: "/dashboard/library",
    color: `text-orange-500`,
  },
  {
    icon: <UserRound size={22} />,
    label: "Profile",
    path: "/dashboard/profile",
    color: `text-emerald-500`,
  },
];


export const DashboardLayout = () => {
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [limitType, setLimitType] = useState<
    "uploads" | "prompts" | "flashcards" | "quizzes"
  >("prompts");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if device is mobile or tablet
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!mobile && !sidebarOpen) {
        // Only open sidebar by default on larger screens if it wasn't manually closed
        setSidebarOpen(true);
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  const handleGoToSubscription = () => {
    // Future subscription page navigation
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Motion component that conditionally applies animations based on device type
  const MotionWrapper: React.FC<React.PropsWithChildren<any>> = ({
    children,
    ...props
  }) => {
    if (isMobile) {
      return <div {...props}>{children}</div>;
    }
    return <motion.div {...props}>{children}</motion.div>;
  };

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen flex bg-dark-background text-dark-text relative ">
        {/* Desktop Sidebar */}
        <motion.aside
          className={cn (
            "fixed top-0 h-screen pt-[57px] bottom-0 left-0 z-30 backdrop-blur-lg glass-card transition-all",
            sidebarOpen ? "w-64" : "w-0 md:w-20",
            "md:sticky shrink-0 md:flex md:flex-col hidden overflow-hidden",
          )}
          initial={false}
          animate={
            sidebarOpen
              ? { width: "16rem", opacity: 1, x: 0 }
              : {
                  width: isMobile ? "0rem" : "5rem",
                  opacity: isMobile ? 0 : 1,
                  x: isMobile ? "-100%" : 0,
                }
          }
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            backgroundColor: "rgba(21, 25, 37, 0.85)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "5px 0 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center rounded-lg transition-all group ${
                  sidebarOpen ? "px-4 justify-start" : "justify-center"
                } py-3 ${
                  isActive(item.path)
                    ? `bg-gradient-to-r from-turbo-purple/30 to-turbo-indigo/30 ${item.color}`
                    : "text-dark-muted hover:bg-dark-accent/30 hover:text-white"
                }`}
                onClick={() => {
                  if (item.label === "Chat") {
                    setSidebarOpen(false)
                  }
                }}
              >
                <span
                  className={`${
                    isActive(item.path) ? item.color : "group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span
                    className={`ml-3 ${
                      isActive(item.path)
                        ? item.color
                        : "group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {!sidebarOpen && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute left-full ml-2 invisible group-hover:visible"></div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )}
              </Link>
            ))}
          </nav>

          {/* Upgrade button */}
          <div className="p-4 border-t border-white/10">
            {sidebarOpen ? (
              <Button
                className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg hover:shadow-turbo-purple/20 text-white"
                onClick={handleGoToSubscription}
              >
                <Zap size={16} className="mr-2" /> 
                <span className="truncate line-clamp-1">Upgrade Plan</span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white"
                    size="icon"
                    onClick={handleGoToSubscription}
                  >
                    <Zap size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Upgrade Plan
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </motion.aside>

        <header
          className={cn (
            'w-full flex items-center md:justify-between p-2 border-b border-white/10 glass-card backdrop-blur-lg fixed left-0 top-0 z-40',
            location.pathname === "/dashboard/chat" && "hidden"
          )}
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center justify-between gap-2 max-md:hidden">
            <div className="w-16 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:flex hover:bg-white/10 text-dark-muted hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </Button>
            </div>
            <span className="font-bold text-2xl gradient-text truncate line-clamp-1">
              EduPro AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold w-max text-2xl gradient-text md:hidden">
              EduPro AI
            </span>
          </div>
          <SearchBar />
          <div className="flex items-center gap-2 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-dark-accent/50 text-dark-muted hover:text-turbo-indigo"
                >
                  <span className="sr-only">Notifications</span>
                  <span
                    className="absolute top-1 right-1 block h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: "#F43F5E" }}
                  ></span>
                  <Bell className="max-sm:h-[18px]" size={22} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-dark-accent/50"
              onClick={() => navigate("/dashboard/profile")}
            >
              <div className="h-7 sm:h-9 w-7 sm:w-9 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo ring-2 ring-turbo-indigo/70">
                <img
                  src="https://ui.shadcn.com/avatars/01.png"
                  className="h-full w-full rounded-full object-cover"
                  alt="User avatar"
                />
              </div>
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          {/* Main content area - where child routes will be rendered */}
          <main className={cn (
            "flex-1 w-full overflow-y-auto",
            location.pathname !== "/dashboard/chat" ? "py-4 md:py-6 md:px-3 mb-30 mt-16" : "mt-[58px"
          )}>
            <Outlet />
          </main>

          {/* Footer nav - sticky on mobile */}
          <nav
            className={cn(
              "md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-40 flex justify-around items-center py-2.5",
              location.pathname === "/dashboard/chat" && "hidden"
            )}
            style={{
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(12px)",
              background: "rgba(9,9,11,0.85)",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center p-1 rounded-md transition-all w-[50px] ${
                  isActive(item.path)
                    ? `${item.color}`
                    : "text-dark-muted hover:text-turbo-indigo"
                }`}
              >
                {React.cloneElement(item.icon, { size: 20 })}
                <span className="text-[10px] mt-0.5">{item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    className="h-1 w-4 rounded-full bg-current mt-1"
                    layoutId="activeMobileIndicator"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Subscription popup */}
          <SubscriptionPopup
            isOpen={showSubscriptionPopup}
            onClose={() => setShowSubscriptionPopup(false)}
            limit={limitType}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
