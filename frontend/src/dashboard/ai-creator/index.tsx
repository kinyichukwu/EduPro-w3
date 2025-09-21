import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Plus, BookOpen, Users, Clock, DollarSign } from "lucide-react";
import { CreateCourseModal } from "./CreateCourseModal";
import { CourseCard } from "./CourseCard";

interface Course {
  id: number;
  title: string;
  description: string;
  modules: number;
  students: number;
  earnings: number;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}

// Sample courses data
const sampleCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to React Development",
    description: "Learn the fundamentals of React.js and build modern web applications",
    modules: 8,
    students: 124,
    earnings: 2480,
    status: "published",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    description: "Master advanced JavaScript concepts including closures, promises, and async/await",
    modules: 12,
    students: 89,
    earnings: 1780,
    status: "published",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-25"),
  },
  {
    id: 3,
    title: "Python for Data Science",
    description: "Complete guide to using Python for data analysis and machine learning",
    modules: 5,
    students: 0,
    earnings: 0,
    status: "draft",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
];

export default function AICreator() {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  const handleCreateCourse = (courseData: { title: string; description: string }) => {
    const newCourse: Course = {
      id: Date.now(),
      title: courseData.title,
      description: courseData.description,
      modules: 0,
      students: 0,
      earnings: 0,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCourses(prev => [newCourse, ...prev]);
    setShowCreateModal(false);
  };

  const filteredCourses = courses.filter(course => 
    filter === "all" || course.status === filter
  );

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
    totalEarnings: courses.reduce((sum, course) => sum + course.earnings, 0),
    publishedCourses: courses.filter(course => course.status === "published").length,
  };

  return (
    <div className="h-full w-full space-y-6">
      {/* Header Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              AI Course Creator
            </h1>
            <p className="text-white/60 mt-1">
              Create and manage your courses with AI assistance
            </p>
          </div>

          <div className="flex max-sm:flex-col max-md:justify-end gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                <p className="text-sm text-white/60">Total Courses</p>
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
                <Users className="w-5 h-5 text-turbo-indigo" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                <p className="text-sm text-white/60">Total Students</p>
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
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">${stats.totalEarnings}</p>
                <p className="text-sm text-white/60">Total Earnings</p>
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
                <p className="text-2xl font-bold text-white">{stats.publishedCourses}</p>
                <p className="text-sm text-white/60">Published</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Courses</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "draft", "published", "archived"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === status
                    ? "bg-turbo-purple text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === "all" ? "No courses yet" : `No ${filter} courses`}
            </h3>
            <p className="text-white/60 mb-6">
              {filter === "all" 
                ? "Create your first course to get started" 
                : `You don't have any ${filter} courses yet`
              }
            </p>
            {filter === "all" && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
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
