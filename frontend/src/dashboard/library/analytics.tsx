import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Performance, Stats, Time, Topics } from "../components/library/analytics";


export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <ArrowUp size={16} className="text-emerald-500" />;
    case "down":
      return <ArrowDown size={16} className="text-red-500" />;
    default:
      return <ChevronRight size={16} className="text-gray-400" />;
  }
};

export default function LibraryAnalytics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"performance" | "topics" | "time">(
    "performance"
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "year"
  >("month");

  return (
    <div className="w-full flex flex-col overflow-hidden bg-re px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/library")}
            className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to Library
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1 h-9">
              <Download size={14} className="mr-1" /> Export
            </Button>
            <Button variant="outline" className="flex items-center gap-1 h-9">
              <Printer size={14} className="mr-1" /> Print
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text">
            Analytics & Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your study patterns, question performance, and progress over
            time
          </p>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Button
            variant={selectedTimeframe === "week" ? "default" : "outline"}
            className={`px-2.5 sm:px-4 h-9 max-sm:text-sm ${
              selectedTimeframe === "week"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                : ""
            }`}
            onClick={() => setSelectedTimeframe("week")}
          >
            Week
          </Button>
          <Button
            variant={selectedTimeframe === "month" ? "default" : "outline"}
            className={`px-2.5 sm:px-4 h-9 max-sm:text-sm ${
              selectedTimeframe === "month"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                : ""
            }`}
            onClick={() => setSelectedTimeframe("month")}
          >
            Month
          </Button>
          <Button
            variant={selectedTimeframe === "year" ? "default" : "outline"}
            className={`px-2.5 sm:px-4 h-9 max-sm:text-sm ${
              selectedTimeframe === "year"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                : ""
            }`}
            onClick={() => setSelectedTimeframe("year")}
          >
            Year
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm text-gray-500">
            {selectedTimeframe === "week"
              ? "May 1 - May 7, 2023"
              : selectedTimeframe === "month"
              ? "May 2023"
              : "2023"}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown size={16} />
          </Button>
        </div>
      </div>

      {/* Performance Stats */}
      <Stats timeframe={selectedTimeframe} />

      {/* Tab Selection */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-800">
          <button
            className={`px-4 pb-2 h-8 shrink-0 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "performance"
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
          <button
            className={`h-8 px-4 pb-2 shrink-0 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "topics"
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("topics")}
          >
            <span className="w-max">Topic Mastery</span>
          </button>
          <button
            className={`h-8 px-4 pb-2 shrink-0 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "time"
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("time")}
          >
            Study Time
          </button>
        </div>
      </div>

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <Performance />
      )}

      {/* Topic Mastery Tab */}
      {activeTab === "topics" && (
        <Topics />
      )}

      {/* Study Time Tab */}
      {activeTab === "time" && (
        <Time />
      )}
    </div>
  );
}
