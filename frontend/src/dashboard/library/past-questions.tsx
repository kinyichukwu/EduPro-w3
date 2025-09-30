import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  History,
  Play,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { GlassCard } from "../components/GlassCard";
import { examTypes, subjects, pastQuestions } from "../constants/library";
import { Questions } from "../components/library/PastQuestions";

export default function PastQuestions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Calculate stats for overview cards
  const totalQuestions = pastQuestions.reduce((sum, q) => sum + q.questions, 0);
  const totalCompleted = pastQuestions.reduce((sum, q) => sum + (q.progress * q.questions / 100), 0);
  const averageProgress = Math.round((totalCompleted / totalQuestions) * 100);
  const totalDuration = pastQuestions.reduce((sum, q) => sum + q.duration, 0);

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-turbo-purple/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-turbo-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
              <p className="text-sm text-white/60">Total Questions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-turbo-indigo/20 rounded-lg">
              <Target className="w-5 h-5 text-turbo-indigo" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averageProgress}%</p>
              <p className="text-sm text-white/60">Avg Progress</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pastQuestions.length}</p>
              <p className="text-sm text-white/60">Papers Available</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{Math.round(totalDuration / 60)}h</p>
              <p className="text-sm text-white/60">Total Time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex max-sm:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Past Questions</h1>
            <p className="text-white/60 mt-1">
              Practice with previous examination questions to improve your test performance
            </p>
          </div>

          <div className="flex max-md:justify-end gap-3">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search questions..."
                className="pl-9 pr-4 h-9 w-full bg-white/5 border-white/10 focus:ring-turbo-purple"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
            >
              <Filter size={14} className="mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Choose Subject</h2>
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
                      ? "ring-2 ring-turbo-purple ring-offset-2 dark:ring-offset-gray-900"
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
            <h2 className="text-xl font-semibold text-white">Examination Types</h2>
            <Button variant="ghost" size="sm" className="text-turbo-purple text-sm">
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
                  <h3 className="font-bold text-base text-white">{exam.name}</h3>
                  <p className="text-xs text-white/60">
                    {exam.questions} Questions
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-turbo-purple to-turbo-indigo">
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
          <h2 className="text-xl font-semibold mb-4 text-white">Recommended for You</h2>
          <GlassCard className="p-6 bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border border-turbo-purple/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Mathematics Crash Course
                </h3>
                <p className="text-white/60 mb-4">
                  Prepare for your upcoming exam with this focused review session
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-turbo-purple" />
                    <span className="text-sm">3 hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={16} className="text-turbo-purple" />
                    <span className="text-sm">85 Questions</span>
                  </div>
                </div>
              </div>
              <Button className="max-md:w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80">
                Start Course
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Quick Start */}
        <div className="text-center mt-12 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Quick Start Practice</h2>
          <p className="text-white/60 mb-4 max-w-xl mx-auto">
            Not sure where to begin? Start a randomized mock test based on your
            previous performance
          </p>
          <Button className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 px-8">
            <Play size={16} className="mr-2" /> Begin Random Test
          </Button>
        </div>
      </section>
    </div>
  );
}
