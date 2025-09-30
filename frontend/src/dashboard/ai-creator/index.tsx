import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  Plus,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { CreateCourseModal } from "./CreateCourseModal";
import { CourseCard } from "./CourseCard";
import { useCourseManagement } from "@/hooks/useCourses";
import { CreateCourseWithPaymentRequest } from "@/services/api";

export default function AICreator() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    courses,
    stats,
    filter,
    isLoading,
    isCreating,
    error,
    setFilter,
    // createCourse,
  } = useCourseManagement();

  const handleCreateCourse = async (courseData: CreateCourseWithPaymentRequest) => {
    try {
      // Import the API service to use the new method
      const { apiService } = await import("@/services");
      const response = await apiService.createCourseWithPayment(courseData);
      
      if (!response.error) {
        setShowCreateModal(false);
        // Refresh the courses list
        window.location.reload(); // Simple refresh, could be improved with proper state management
      } else {
        throw new Error(response.error || 'Failed to create course');
      }
    } catch (error) {
      console.error("Failed to create course:", error);
      // Error toast is already shown by the modal
    }
  };

  const filteredCourses = courses.filter(
    (course) => filter === "all" || course.status === filter
  );

  return (
    <div className="h-full w-full px-3 py-5 space-y-6">
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
              disabled={isCreating}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isCreating ? "Creating..." : "Create Course"}
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
                <p className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.total_courses || 0
                  )}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.total_students || 0
                  )}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `$${stats?.total_earnings || 0}`
                  )}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    stats?.published_courses || 0
                  )}
                </p>
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
            {(["all", "draft", "published", "archived"] as const).map(
              (status) => (
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
              )
            )}
          </div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load courses
            </h3>
            <p className="text-white/60 mb-6">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-white/10"></div>
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-8 bg-white/10 rounded"></div>
                    <div className="h-8 bg-white/10 rounded"></div>
                    <div className="h-8 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === "all" ? "No courses yet" : `No ${filter} courses`}
            </h3>
            <p className="text-white/60 mb-6">
              {filter === "all"
                ? "Create your first course to get started"
                : `You don't have any ${filter} courses yet`}
            </p>
            {filter === "all" && (
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreating}
                className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isCreating ? "Creating..." : "Create Your First Course"}
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
