import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { SubscriptionPopup } from "./components/SubscriptionPopup";
import { Progress } from "@/shared/components/ui/progress";
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
  Search,
  Bell,
  Menu,
  X,
  Zap,
  BookOpen,
  BookText,
} from "lucide-react";
import { motion } from "framer-motion";

// Navigation items
const navItems = [
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
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

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
          className={`fixed top-0 bottom-0 left-0 z-30 h-screen backdrop-blur-lg glass-card transition-all ${
            sidebarOpen ? "w-64" : "w-0 md:w-20"
          } md:relative md:flex md:flex-col hidden overflow-hidden`}
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
          {/* Logo and brand */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            {sidebarOpen ? (
              <span className="font-bold text-2xl gradient-text">
                EduPro AI
              </span>
            ) : (
              <span className="font-bold text-3xl gradient-text mx-auto">
                E
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:flex hover:bg-white/10 text-dark-muted hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>

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
                <Zap size={16} className="mr-2" /> Upgrade Plan
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

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header
            className="w-full flex items-center justify-between p-4 border-b border-white/10 glass-card backdrop-blur-lg sticky top-0 z-20"
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-white/10 text-dark-muted hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
              <span className="font-bold text-2xl gradient-text md:hidden">
                EduPro AI
              </span>
            </div>
            <div className="flex-1 max-w-xl px-4 hidden md:block relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-dark-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search everything... docs, quizzes, flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-accent/30 py-2.5 pl-10 pr-4 text-white focus:border-turbo-indigo/50 focus:outline-none focus:ring-1 focus:ring-turbo-indigo/50 placeholder:text-dark-muted/70"
              />
            </div>
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
                    <Bell size={22} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-dark-accent/50"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo ring-2 ring-turbo-indigo/70">
                  <img
                    src="https://ui.shadcn.com/avatars/01.png"
                    className="h-full w-full rounded-full object-cover"
                    alt="User avatar"
                  />
                </div>
              </Button>
            </div>
          </header>

          {/* For mobile: search bar sits beneath header */}
          <div className="px-4 pt-3 md:hidden">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-accent/30 py-2.5 pl-10 pr-4 text-white focus:border-turbo-indigo/50 focus:outline-none focus:ring-1 focus:ring-turbo-indigo/50 placeholder:text-dark-muted/70"
              />
            </div>
          </div>

          {/* Main content area - where child routes will be rendered */}
          <main className="flex-1 py-4 md:py-6 md:px-3 w-full overflow-y-auto mb-30">
            <Outlet />
          </main>

          {/* Footer nav - sticky on mobile */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-40 flex justify-around items-center py-2.5"
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
