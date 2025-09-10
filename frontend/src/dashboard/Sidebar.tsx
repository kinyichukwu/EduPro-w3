import {
    // Home,
    // UserRound,
  // Zap,
  // BookText,
  // BookOpen,
  // Library,
  // BrainCircuit,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Button } from "@/shared/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
// import { useRef } from 'react';

const navItems = [
  // {
  //   icon: <Home size={22} />,
  //   label: "Home",
  //   path: "/dashboard",
  //   color: "text-turbo-indigo",
  // },
  // {
  //   icon: <BrainCircuit size={22} />,
  //   label: "AI Tutor",
  //   path: "/dashboard/ai-tutor",
  //   color: "text-turbo-purple",
  // },
  {
    icon: <MessageCircle size={22} />,
    label: "Chats",
    path: "/dashboard/chats",
    color: "text-turbo-purple",
  },
  // {
  //   icon: <BookOpen size={22} />,
  //   label: "Cards",
  //   path: "/dashboard/flashcards",
  //   color: `text-pink-500`,
  // },
  // {
  //   icon: <BookText size={22} />,
  //   label: "Quizzes",
  //   path: "/dashboard/quizzes",
  //   color: "text-turbo-blue",
  // },
  // {
  //   icon: <Library size={22} />,
  //   label: "Library",
  //   path: "/dashboard/library",
  //   color: `text-orange-500`,
  // },
  // {
  //   icon: <UserRound size={22} />,
  //   label: "Profile",
  //   path: "/dashboard/profile",
  //   color: `text-emerald-500`,
  // },
];

export const Sidebar = ({
  sidebarOpen,
}: // setSidebarOpen, isMobile, hovered, setHovered
{
  sidebarOpen: boolean;
  // setSidebarOpen: (open: boolean) => void, isMobile: boolean, hovered: boolean, setHovered: (hovered: boolean) => void
}) => {
  // const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      const timer = setTimeout(() => {
        setShowLabel(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowLabel(false);
    }
  }, [sidebarOpen]);

  // const handleMouseEnter = () => {
  //   if (!isMobile && !sidebarOpen) {
  //     hoverTimeout.current = setTimeout(() => {
  //       setHovered(true);
  //       setSidebarOpen(true);
  //     }, 500);
  //   }
  // };

  // const handleMouseLeave = () => {
  //   if (hoverTimeout.current) {
  //     clearTimeout(hoverTimeout.current);
  //     hoverTimeout.current = null;
  //   }

  //   // Only close if it was opened via hover
  //   if (!isMobile && hovered) {
  //     setHovered(false);
  //     setSidebarOpen(false);
  //   }
  // };

  return (
    <aside
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
      className={cn(
        "sticky top-0 h-screen pt-[57px] space-y-2 bottom-0 left-0 z-30 flex flex-col backdrop-blur-lg glass-card transition-all",
        sidebarOpen ? "w-60" : "w-0 md:w-20",

        "max-md:hidden"
      )}
      style={{
        backgroundColor: "rgba(21, 25, 37, 0.85)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "5px 0 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <nav className="flex-1 py-4 space-y-3">
        {navItems.map((item) => (
          <Fragment key={item.label}>
            {sidebarOpen ? (
              <div className="flex px-3">
                <Link
                  to={item.path}
                  className={cn(
                    "px-4 py-3 flex items-center rounded-lg transition-all group",
                    isActive(item.path)
                      ? `bg-gradient-to-r from-turbo-purple/30 to-turbo-indigo/30 ${item.color}`
                      : "hover:bg-white/10",
                    sidebarOpen && "w-full"
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span
                      className={cn(
                        "ml-3 leading-0 transition-all",
                        showLabel ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <div className="flex px-3">
                    <Link
                      to={item.path}
                      className={cn(
                        "px-4 py-3 flex items-center rounded-lg transition-all group",
                        isActive(item.path)
                          ? `bg-gradient-to-r from-turbo-purple/30 to-turbo-indigo/30 ${item.color}`
                          : "hover:bg-white/10",
                        sidebarOpen && "w-full"
                      )}
                    >
                      {item.icon}
                    </Link>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            )}
          </Fragment>
        ))}
      </nav>

      {/* <div className="px-5 py-4 border-t border-white/10">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "px-3 flex justify-start bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg hover:shadow-turbo-purple/20 text-white",
            sidebarOpen && "w-full px-7"
          )}
        >
          {sidebarOpen ? (
            <div className="flex items-center w-full">
              <Zap size={16} className="shrink-0" />
              <span
                className={cn(
                  "ml-3 transition-all duration-500 overflow-hidden truncate",
                  sidebarOpen ? "opacity-100" : "opacity-0"
                )}
              >
                Upgrade Plan
              </span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Zap size={16} className="shrink-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Upgrade</TooltipContent>
            </Tooltip>
          )}
        </Button>
      </div> */}
    </aside>
  );
};
