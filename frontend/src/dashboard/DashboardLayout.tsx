import * as React from "react";
import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  // useNavigate
} from "react-router-dom";
import { SubscriptionPopup } from "./components/SubscriptionPopup";
import {
  TooltipProvider,
  // TooltipTrigger,
  // Tooltip,
  // TooltipContent,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import {
  Home,
  UserRound,
  Library,
  Menu,
  X,
  BookOpen,
  BookText,
  BrainCircuit,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
// import SearchBar from "./components/SearchBar";
import { cn } from "@/shared/lib/utils";
import { Sidebar } from "./Sidebar";
import EduproLogo from "@/shared/assets/Edupro.svg";
import Onboarding from "@/landing/onboarding/Onboarding";
import { useGetOnboardingStatus } from "./hooks/useOnboarding";
import { useAuthStore } from "@/store/useAuthStore";
import { Toaster } from "@/shared/components/ui/sonner";

// Navigation items
const navItems = [
  {
    icon: <Home size={22} />,
    label: "Home",
    path: "/dashboard",
    color: "text-turbo-indigo",
  },
  {
    icon: <BrainCircuit size={22} />,
    label: "AI Tutor",
    path: "/dashboard/ai-tutor",
    color: "text-turbo-purple",
  },
  {
    icon: <MessageCircle size={22} />,
    label: "Chats",
    path: "/dashboard/chats",
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
  const [limitType, __] = useState<
    "uploads" | "prompts" | "flashcards" | "quizzes"
  >("prompts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: onboardingData } = useGetOnboardingStatus(!!user);
  const isOnboarded = user ? (onboardingData?.is_completed ?? true) : true
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const isChatPage =
    /^\/dashboard\/ai-tutor\/[^/]+\/[^/]+$/.test(location.pathname) ||
    /^\/dashboard\/chats(\/.+)?$/.test(location.pathname);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname, isOnboarded]);

  return (
    <>
      {!isOnboarded && !isChatPage ? (
        <Onboarding />
      ) : (
        <TooltipProvider>
          <div className="w-full min-h-[100dvh] flex bg-dark-background text-dark-text relative ">
            {/* Desktop Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} />

            <header
              className={cn(
                "w-full flex items-center justify-between p-2 border-b border-white/10 glass-card backdrop-blur-lg fixed left-0 top-0 z-40"
              )}
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-16 flex items-center justify-center max-md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:flex hover:bg-white/10 text-dark-muted hover:text-white"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                  </Button>
                </div>
                {/* {location.pathname !== "/dashboard/chat" ? ( */}
                <Link
                  to={"/dashboard/chats"}
                  className="flex items-center cursor-pointer gap-2"
                >
                  <img
                    src={EduproLogo}
                    alt="Edupro Logo"
                    className="w-8 h-8 text-white"
                  />
                  <span className="text-2xl font-bold gradient-text">
                    EduPro AI
                  </span>
                </Link>
              </div>

              {/* <SearchBar /> */}

              <div className="flex items-center gap-2 md:gap-4">
              {!user ? (
                <>
                  <Button
                    className="text-sm"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  {/* <Tooltip>
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
                  </Tooltip> */}
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
                </>
              )}
              </div>
            </header>

            <div className="flex-1 flex flex-col">
              {/* Main content area - where child routes will be rendered */}
              <main
                className={cn(
                  "flex-1 w-full overflow-y-auto overflow-x-hidden",
                  "mt-[50px] mb-[70px]",
                  isChatPage && "mb-0"
                )}
              >
                <Outlet />
              </main>

              {/* Footer nav - sticky on mobile */}
              <nav
                className={cn(
                  "md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-40 flex justify-around items-center py-2.5",
                  isChatPage && "hidden"
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
      )}
      <Toaster position="top-right" className="bg-black text-white" />
    </>
  );
};
