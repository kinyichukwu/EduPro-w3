import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/shared/components/ui/progress";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import {
  Upload,
  BookText,
  BookOpen,
  Activity,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Flame,
} from "lucide-react";
import { BotMessageSquare } from "@/shared/components/BotMessageSquare";
import { motion } from "framer-motion";

// Define custom color palette to extend the app's theme
const customColors = {
  accent: "#F43F5E", // Vibrant red/pink for accents
  orange: "#F97316", // Warm orange for highlights
  emerald: "#10B981", // Emerald green for success states
  amber: "#F59E0B", // Amber for warning states
};

// Define the quick actions
const quickActions = [
  {
    label: "Upload Material",
    icon: <Upload />,
    tooltip: "Upload study notes, slides, or textbooks",
    disabled: false,
    color: "from-turbo-purple to-turbo-indigo",
  },
  {
    label: "Ask AI",
    icon: <BotMessageSquare />,
    tooltip: "Type a question or prompt for instant AI help",
    disabled: false,
    color: "from-turbo-indigo to-turbo-blue",
  },
  {
    label: "Generate Quiz",
    icon: <BookText />,
    tooltip: "Turn your material into a quiz for practice",
    disabled: true, // e.g., quota exhausted
    color: "from-turbo-blue to-blue-500",
  },
  {
    label: "Create Flashcards",
    icon: <BookOpen />,
    tooltip: "Extract flashcards from material or self-make",
    disabled: false,
    color: `from-pink-500 to-rose-500`, // Updated from red to pink/rose for softer accent
  },
];

// Define usage meter data
const usageMeterData = {
  prompts: {
    used: 7,
    limit: 10,
    label: "Prompts",
    color: "from-turbo-purple to-turbo-indigo",
  },
  uploads: {
    used: 2,
    limit: 3,
    label: "Uploads",
    color: "from-turbo-indigo to-turbo-blue",
  },
  streak: 5, // 5-day streak demo
};

// Define latest progress data
const latestProgress = [
  {
    subject: "Biology",
    mastery: 78,
    trend: "up",
    color: "from-turbo-indigo to-turbo-blue",
  },
  {
    subject: "Mathematics",
    mastery: 65,
    trend: "down",
    color: `from-turbo-purple to-pink-500`, // Matched flashcard accent
  },
  {
    subject: "English",
    mastery: 85,
    trend: "steady",
    color: `from-[${customColors.emerald}] to-green-500`, // Emerald to green
  },
];

// Define activity feed data
const activityFeed = [
  {
    type: "Completed Deck",
    desc: "Finished 'Cell Organelles' flashcards",
    link: "#",
    time: "30 min ago",
    icon: <BookOpen size={16} className="text-turbo-indigo" />,
  },
  {
    type: "Quiz Score",
    desc: "Scored 92% on 'Algebra Mock Test'",
    link: "#",
    time: "Today",
    icon: <BookText size={16} className="text-turbo-purple" />,
  },
  {
    type: "Upload",
    desc: "Uploaded 'Lecture 4 Slides'",
    link: "#",
    time: "Yesterday",
    icon: <Upload size={16} className={`text-pink-500`} />, // Matched flashcard accent
  },
];

export const DashboardHome = () => {
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [limitType, setLimitType] = useState<
    "uploads" | "prompts" | "flashcards" | "quizzes"
  >("prompts");

  // For responsive design
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

  const handleQuickAction = (actionType: string, disabled: boolean) => {
    if (disabled) return;

    if (actionType === "Upload Material") {
      setLimitType("uploads");
      setShowSubscriptionPopup(true);
    } else if (actionType === "Ask AI") {
      setLimitType("prompts");
      setShowSubscriptionPopup(true);
    }
  };

  const handleGoToSubscription = () => {
    // Future subscription page navigation
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
    <div className="px-4 md:px-0">
      {/* Welcome Message */}
      <MotionWrapper
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl md:text-2xl font-semibold mb-1">
          Welcome back, <span className="gradient-text">Alex</span>
        </h1>
        <p className="text-dark-muted text-sm md:text-base">
          You have completed{" "}
          <span className="text-turbo-indigo font-medium">78%</span> of your
          study goal this week. Keep it up!
        </p>
      </MotionWrapper>

      {/* Desktop View: 5-column grid with usage stats in the middle */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-8">
        {/* First two quick actions */}
        {quickActions
          .slice(0, 2)
          .map(({ label, icon, tooltip, disabled, color }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <div
                  className={`flex flex-col h-fit items-center justify-center gap-2 p-5 rounded-xl shadow min-h-[140px] transition-all w-full font-semibold group text-white ${
                    disabled
                      ? "opacity-50 pointer-events-none bg-dark-accent/20"
                      : "hover:shadow-xl cursor-pointer"
                  }`}
                  onClick={() =>
                    !disabled && handleQuickAction(label, disabled)
                  }
                  style={{
                    backgroundColor: "rgba(30, 35, 50, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${
                      disabled
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(var(--turbo-indigo-rgb, 99, 102, 241),0.3)"
                    }`,
                    boxShadow:
                      "0 8px 12px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${color} mb-2 shadow-lg`}
                  >
                    {React.cloneElement(icon, { size: 24 })}
                  </div>
                  <span className="text-sm text-center">{label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ))}

        {/* Usage Stats in middle position */}
        <div
          className="glass-card rounded-xl p-5 flex flex-col gap-4 border border-turbo-indigo/40 col-span-1 min-h-[18rem]"
          onClick={handleGoToSubscription}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold gradient-text text-base">
              Usage Stats
            </span>
          </div>

          <div>
            <div className="flex justify-between mb-1 items-baseline">
              <span className="text-sm font-medium text-dark-muted">
                Prompts
              </span>
              <span className="text-xs text-turbo-indigo font-semibold">
                {usageMeterData.prompts.used}/{usageMeterData.prompts.limit}
              </span>
            </div>
            <Progress
              value={
                (usageMeterData.prompts.used / usageMeterData.prompts.limit) *
                100
              }
              className="h-2 rounded-full bg-dark-accent/50"
              indicatorClassName="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1 items-baseline">
              <span className="text-sm font-medium text-dark-muted">
                Uploads
              </span>
              <span className="text-xs text-turbo-indigo font-semibold">
                {usageMeterData.uploads.used}/{usageMeterData.uploads.limit}
              </span>
            </div>
            <Progress
              value={
                (usageMeterData.uploads.used / usageMeterData.uploads.limit) *
                100
              }
              className="h-2 rounded-full bg-dark-accent/50"
              indicatorClassName="bg-gradient-to-r from-turbo-indigo to-turbo-blue"
            />
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <Flame size={18} className="text-amber-400" />
            <span className="text-xs font-medium text-white">
              {usageMeterData.streak}-Day Streak!
            </span>
          </div>
        </div>

        {/* Last two quick actions */}
        {quickActions
          .slice(2, 4)
          .map(({ label, icon, tooltip, disabled, color }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <div
                  className={`flex flex-col h-fit  items-center justify-center gap-2 p-5 rounded-xl shadow min-h-[140px] transition-all w-full font-semibold group text-white ${
                    disabled
                      ? "opacity-50 pointer-events-none bg-dark-accent/20"
                      : "hover:shadow-xl cursor-pointer"
                  }`}
                  onClick={() =>
                    !disabled && handleQuickAction(label, disabled)
                  }
                  style={{
                    backgroundColor: "rgba(30, 35, 50, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${
                      disabled
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(var(--turbo-indigo-rgb, 99, 102, 241),0.3)"
                    }`,
                    boxShadow:
                      "0 8px 12px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${color} mb-2 shadow-lg`}
                  >
                    {React.cloneElement(icon, { size: 24 })}
                  </div>
                  <span className="text-sm text-center">{label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ))}
      </div>

      {/* Tablet & Mobile View: Separate Quick Actions and Usage Stats */}
      <div className="lg:hidden">
        {/* Quick Action Cards */}
        <MotionWrapper
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`grid gap-4 w-full ${
              isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {quickActions.map(({ label, icon, tooltip, disabled, color }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center justify-center gap-2 p-4 md:p-6 rounded-xl shadow min-h-[120px] transition-all w-full font-semibold group text-white ${
                      disabled
                        ? "opacity-50 pointer-events-none bg-dark-accent/20"
                        : "hover:shadow-xl cursor-pointer"
                    }`}
                    onClick={() =>
                      !disabled && handleQuickAction(label, disabled)
                    }
                    style={{
                      backgroundColor: "rgba(30, 35, 50, 0.7)",
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${
                        disabled
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(var(--turbo-indigo-rgb, 99, 102, 241),0.3)"
                      }`,
                      boxShadow:
                        "0 8px 12px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      className={`p-3 rounded-full bg-gradient-to-br ${color} mb-2 shadow-lg`}
                    >
                      {React.cloneElement(icon, {
                        size: isMobile ? 20 : 24,
                      })}
                    </div>
                    <span className="text-xs md:text-sm text-center">
                      {label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </MotionWrapper>

        {/* Usage Meters for Mobile/Tablet */}
        <MotionWrapper
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            className="glass-card  rounded-xl p-5 flex flex-col gap-4 border border-turbo-indigo/40"
            onClick={handleGoToSubscription}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold gradient-text text-lg">
                Usage Stats
              </span>
              <span className="text-xs text-dark-muted">
                (Tap for plan details)
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1 items-baseline">
                <span className="text-sm font-medium text-dark-muted">
                  Prompts
                </span>
                <span className="text-xs text-turbo-indigo font-semibold">
                  {usageMeterData.prompts.used}/{usageMeterData.prompts.limit}
                </span>
              </div>
              <Progress
                value={
                  (usageMeterData.prompts.used / usageMeterData.prompts.limit) *
                  100
                }
                className="h-2.5 rounded-full bg-dark-accent/50"
                indicatorClassName="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
              />
              <span className="text-xs text-dark-muted block mt-1">
                {usageMeterData.prompts.limit - usageMeterData.prompts.used}{" "}
                left today
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1 items-baseline">
                <span className="text-sm font-medium text-dark-muted">
                  Uploads
                </span>
                <span className="text-xs text-turbo-indigo font-semibold">
                  {usageMeterData.uploads.used}/{usageMeterData.uploads.limit}
                </span>
              </div>
              <Progress
                value={
                  (usageMeterData.uploads.used / usageMeterData.uploads.limit) *
                  100
                }
                className="h-2.5 rounded-full bg-dark-accent/50"
                indicatorClassName="bg-gradient-to-r from-turbo-indigo to-turbo-blue"
              />
              <span className="text-xs text-dark-muted block mt-1">
                {usageMeterData.uploads.limit - usageMeterData.uploads.used}{" "}
                left this cycle
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 p-3 bg-dark-accent/40 rounded-lg border border-white/10">
              <div className="flex items-center gap-2.5">
                <Flame size={22} className="text-amber-400" />
                <div>
                  <span className="font-semibold text-white">
                    {usageMeterData.streak}-Day Streak!
                  </span>
                  <p className="text-xs text-dark-muted">
                    Keep the fire burning!
                  </p>
                </div>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 shadow-lg ring-2 ring-amber-500/50">
                <span className="text-white font-bold text-sm">
                  {usageMeterData.streak}
                </span>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>

      {/* Progress Snapshot + Recent Activity */}
      <MotionWrapper
        className={`grid gap-6 md:gap-8 ${
          isMobile ? "grid-cols-1" : "md:grid-cols-2"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Latest Progress Snapshot */}
        <div className="glass-card rounded-xl p-6 border-t border-turbo-purple/40 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <BarChart3 className="text-turbo-purple" size={22} />
            <span className="font-semibold text-lg text-white">
              Latest Progress Snapshot
            </span>
          </div>
          <div className="space-y-5">
            {latestProgress.map(({ subject, mastery, trend, color }) => (
              <div key={subject} className="flex items-center gap-3 md:gap-4">
                <span className="font-semibold flex-1 text-dark-muted group-hover:text-white transition-colors">
                  {subject}
                </span>
                <div className="flex items-center gap-2 w-full max-w-[160px] md:max-w-[180px]">
                  <Progress
                    value={mastery}
                    className="w-full h-2.5 mr-2 bg-dark-accent/50"
                    indicatorClassName={`bg-gradient-to-r ${color}`}
                  />
                  <span className="font-bold text-sm text-white">
                    {mastery}%
                  </span>
                </div>
                {trend === "up" && (
                  <div className="bg-green-500/20 p-1.5 rounded-full flex items-center justify-center">
                    <ArrowUp className="text-green-400" size={16} />
                  </div>
                )}
                {trend === "down" && (
                  <div className="bg-red-500/20 p-1.5 rounded-full flex items-center justify-center">
                    <ArrowDown className="text-red-400" size={16} />
                  </div>
                )}
                {trend === "steady" && (
                  <div className="bg-amber-500/20 p-1.5 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 text-xs font-bold transform translate-y-px">
                      —
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="link"
            className="mt-6 text-turbo-purple hover:text-turbo-indigo self-start px-0 text-sm"
            onClick={() => {
              /* Navigate to analytics page */
            }}
          >
            View detailed analytics →
          </Button>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card rounded-xl p-6 border-t border-turbo-blue/40 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <Activity className="text-turbo-blue" size={22} />
            <span className="font-semibold text-lg text-white">
              Recent Activity
            </span>
          </div>
          <ol className="divide-y divide-white/10 space-y-3 flex-1">
            {activityFeed.map((evt, idx) => (
              <li
                key={idx}
                className="pt-3 first:pt-0 flex items-center gap-3 hover:bg-dark-accent/20 p-2 -m-2 rounded-lg transition-all"
              >
                <div
                  className={`p-2.5 rounded-full bg-dark-accent/50 flex-shrink-0 border border-white/5 shadow-sm`}
                >
                  {React.cloneElement(evt.icon, {
                    className: evt.icon.props.className || "text-turbo-indigo",
                  })}
                </div>
                <div className="flex-1">
                  <a
                    href={evt.link}
                    className="font-medium text-turbo-blue hover:underline block text-sm mb-0.5"
                  >
                    {evt.type}
                  </a>
                  <span className="text-xs text-dark-muted">{evt.desc}</span>
                </div>
                <span className="text-xs bg-dark-accent/40 text-dark-muted py-1 px-2.5 rounded-full whitespace-nowrap self-start mt-1">
                  {evt.time}
                </span>
              </li>
            ))}
          </ol>
          <Button
            variant="outline"
            className="mt-6 border-turbo-blue/50 text-turbo-blue hover:text-white hover:bg-turbo-blue/20 w-full text-sm"
            onClick={() => {
              /* Navigate to activity page */
            }}
          >
            View All Activity
          </Button>
        </div>
      </MotionWrapper>
    </div>
  );
};
