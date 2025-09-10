import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Upload,
  Search,
  Filter,
  Bookmark,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../components/GlassCard";
import { Input } from "@/shared/components/ui/input";
import { examTopics, libraryFeatures, recentUploads } from "../constants/library";
import { cn } from "@/lib/utils";

export default function LibraryHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Animation variants for staggered animations
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
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section with Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-purple via-turbo-blue to-light-blue text-transparent bg-clip-text">
            Library Hub
          </h1>
          <p className="text-white/50 dark:text-white/60">
            All your educational resources in one place
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
            size={18}
          />
          <Input
            placeholder="Search library..."
            className="pl-10 pr-4 w-full md:w-64 bg-white/10 border-white/15 focus:ring-purple"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Feature Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {libraryFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="relative overflow-hidden rounded-xl transition-all duration-300 min-h-[280px] group"
              onClick={() => navigate(feature.path)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-90`}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Glass overlay effect */}
              <div className="absolute inset-0 backdrop-blur-[2px] opacity-10 group-hover:opacity-0 transition-opacity"></div>

              {/* Content */}
              <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
                <div>
                  <div className="p-3 bg-white/20 rounded-lg w-fit mb-4 backdrop-blur-sm">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm mb-6">
                    {feature.description}
                  </p>
                </div>

                <div>
                  <div className="mb-4 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-xl font-bold">{feature.stats.value}</div>
                    <div className="text-xs text-white/70">
                      {feature.stats.label}
                    </div>
                  </div>

                  <div className="w-max flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform cursor-pointer">
                    {feature.action}{" "}
                    <ChevronRight
                      size={16}
                      className="ml-1 group-hover:ml-2 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
      </motion.div>

      {/* Recently Uploaded & Bookmarked Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="h-max p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recently Uploaded</h2>
            <Button
              variant="ghost"
              className="text-xs flex items-center gap-1 text-purple"
            >
              View All <ChevronRight size={14} />
            </Button>
          </div>

          <div className="space-y-4">
            {recentUploads.map((file, index) => {
              const Icon = file.icon.name
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/15 dark:bg-white/10 rounded-lg">
                      <Icon 
                        size={16} 
                        className={cn (
                          file.icon.color
                        )}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-white/50 flex items-center gap-1">
                        <Clock size={12} /> {file.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/15 dark:bg-white/10 px-2 py-1 rounded">
                      {file.size}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-white/20"
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                </div>
            )})}

            <Button
              className="w-full mt-2 bg-gradient-to-r from-purple to-turbo-blue hover:from-purple hover:to-turbo-blue"
              onClick={() => navigate("/dashboard/library/upload")}
            >
              <Upload size={16} className="mr-2" /> Upload New Document
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Popular Exam Topics</h2>
            <Button
              variant="ghost"
              className="text-xs flex items-center gap-1 text-purple"
            >
              <Filter size={14} className="mr-1" /> Filter
            </Button>
          </div>

          <div className="space-y-3">
            {examTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-md text-xs font-medium ${topic.color}`}
                  >
                    {topic.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {topic.count} Questions
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-white/20"
                  >
                    <Bookmark size={14} />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completion Status</span>
                <span className="text-xs text-purple">65%</span>
              </div>
              <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple to-turbo-blue rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <Button
                  variant="outline"
                  className="text-xs border-dashed border-white/15 hover:border-purple w-full"
                >
                  <CheckCircle2 size={14} className="mr-1 text-green" />{" "}
                  Track Progress
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
