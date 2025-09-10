import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  BookOpen,
  Award,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CreateCourseModal } from "./CreateCourseModal";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";

// Type definitions
interface Course {
  id: number;
  title: string;
  chapters: number;
  items: number;
  progress: number;
  color: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  lastStudied?: Date;
}

// Progress Ring Component
export const ProgressRing: React.FC<{ value: number; size?: number, textStyle?: string }> = ({
  value,
  size = 60,
  textStyle
}) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-in-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn ('text font-bold text-white', textStyle)}>{value}%</span>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  onPlay: (course: Course) => void;
}> = ({ course, onPlay }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/20";
      case "medium":
        return "text-amber-400 bg-amber-400/20";
      case "hard":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  return (
    <motion.div
      className="group bg-dark-card/60 backdrop-blur-lg   border border-white/10 rounded-xl hover:bg-dark-card/80 hover:border-turbo-purple/30 transition-all duration-300 p-6 flex flex-col hover:scale-[1.02] hover:shadow-xl hover:shadow-turbo-purple/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: course.color }}
            />
            <span
              className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                course.difficulty
              )}`}
            >
              {course.difficulty}
            </span>
          </div>
          <h3 className="font-bold text-lg text-white group-hover:text-turbo-purple transition-colors leading-tight mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-white/60 mb-3">{course.description}</p>
        </div>
        <ProgressRing value={course.progress} size={50} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-background/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3 h-3 text-turbo-purple" />
            <span className="text-xs text-white/60">Chapters</span>
          </div>
          <div className="text-sm font-medium text-white">
            {course.chapters}
          </div>
        </div>
        <div className="bg-dark-background/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-white/60">Items</span>
          </div>
          <div className="text-sm font-medium text-white">{course.items}</div>
        </div>
      </div>

      <Button
        onClick={() => onPlay(course)}
        className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Learning
      </Button>
    </motion.div>
  );
};


// Main Chat Component
export default function ChatView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Advanced Mathematics",
      chapters: 12,
      items: 48,
      progress: 67,
      color: "#a855f7",
      description: "Calculus, algebra, and advanced mathematical concepts",
      difficulty: "hard",
      lastStudied: new Date("2024-01-15"),
    },
    {
      id: 2,
      title: "Physics Fundamentals",
      chapters: 8,
      items: 32,
      progress: 23,
      color: "#3b82f6",
      description: "Classical mechanics and thermodynamics",
      difficulty: "medium",
      lastStudied: new Date("2024-01-14"),
    },
    {
      id: 3,
      title: "Chemistry Basics",
      chapters: 10,
      items: 40,
      progress: 89,
      color: "#10b981",
      description: "Organic and inorganic chemistry principles",
      difficulty: "easy",
      lastStudied: new Date("2024-01-16"),
    },
    {
      id: 4,
      title: "Biology Essentials",
      chapters: 15,
      items: 60,
      progress: 45,
      color: "#f59e0b",
      description: "Cell biology, genetics, and ecology",
      difficulty: "medium",
      lastStudied: new Date("2024-01-13"),
    },
  ]);
  const navigate = useNavigate()

  const handlePlayCourse = (course: Course) => {
    navigate(`/dashboard/ai-tutor/${course.title.trim().replace(/\s+/g, "-")}`);
  };

  const handleCreateCourse = (newCourse: Omit<Course, "id">) => {
    const course: Course = {
      ...newCourse,
      id: Math.max(...courses.map((c) => c.id)) + 1,
    };
    setCourses([...courses, course]);
    setShowCreateModal(false);
  };

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-purple">
            {courses.length}
          </div>
          <div className="text-sm text-white/60">Active Courses</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-indigo">
            {courses.reduce((sum, course) => sum + course.items, 0)}
          </div>
          <div className="text-sm text-white/60">Total Items</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(
              courses.reduce((sum, course) => sum + course.progress, 0) /
                courses.length
            )}
            %
          </div>
          <div className="text-sm text-white/60">Avg Progress</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">4.2h</div>
          <div className="text-sm text-white/60">Study Time</div>
        </div>
      </div>

      {/* Main Courses Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              AI Tutor Sessions
            </h1>
            <p className="text-white/60 mt-1">
              Start learning with personalized AI tutoring
            </p>
          </div>

          <div className="flex max-sm:flex-col max-md:justify-end gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>

            <Button
              variant="outline"
              className="border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Topics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CourseCard course={course} onPlay={handlePlayCourse} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCourse={handleCreateCourse}
      />
    </div>
  );
}
