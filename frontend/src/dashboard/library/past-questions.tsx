import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  History,
  Play,
  Search,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { GlassCard } from "../components/GlassCard";
import { examTypes, subjects } from "../constants/library";
import { Questions } from "../components/library/PastQuestions";

export default function PastQuestions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex max-sm:flex-col sm:items-center justify-between gap-y-2">
          <button
            onClick={() => navigate("/dashboard/library")}
            className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to Library
          </button>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search past questions..."
                className="pl-9 pr-4 h-9 w-full bg-white/10 border-gray-200/20 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1 h-9">
              <Filter size={14} /> Filters
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text">
            Past Questions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Practice with previous examination questions to improve your test
            performance
          </p>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Choose Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setSelectedSubject(
                  subject.id === selectedSubject ? null : subject.id
                )
              }
              className={`cursor-pointer rounded-xl relative overflow-hidden transition-all duration-300 h-28
                ${
                  subject.id === selectedSubject
                    ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900"
                    : ""
                }
              `}
            >
              <div
                className={`absolute inset-0 ${subject.color} opacity-90`}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>

              {subject.id === selectedSubject && (
                <div className="absolute top-2 right-2 bg-white/30 p-1 rounded-full backdrop-blur-sm">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              )}

              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                <div>
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <p className="text-xs text-white/80">
                    {subject.questions} Questions
                  </p>
                </div>

                <div className="mt-2">
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden w-full">
                    <div
                      className="h-full bg-white/70 rounded-full"
                      style={{
                        width: `${
                          (subject.completed / subject.questions) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-white/80 mt-1">
                    {subject.completed} / {subject.questions} Completed
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exam Types */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Examination Types</h2>
          <Button variant="ghost" size="sm" className="text-purple-500 text-xs">
            View All <ChevronRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examTypes.map((exam) => (
            <GlassCard
              key={exam.id}
              className="p-4 hover:bg-white/10 transition-colors cursor-pointer flex flex-row items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-base">{exam.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {exam.questions} Questions
                </p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <History size={16} className="text-white" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Past Question Papers */}
      <Questions />

      {/* Study Recommendations */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Recommended for You</h2>
        <GlassCard className="p-6 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 border border-purple-200/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Mathematics Crash Course
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Prepare for your upcoming exam with this focused review session
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-purple-500" />
                  <span className="text-sm">3 hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-purple-500" />
                  <span className="text-sm">85 Questions</span>
                </div>
              </div>
            </div>
            <Button className="max-md:w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              Start Course
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Quick Start */}
      <div className="text-center mt-12 mb-6">
        <h2 className="text-lg font-medium mb-2">Quick Start Practice</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xl mx-auto">
          Not sure where to begin? Start a randomized mock test based on your
          previous performance
        </p>
        <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-8">
          <Play size={16} className="mr-2" /> Begin Random Test
        </Button>
      </div>
    </div>
  );
}
