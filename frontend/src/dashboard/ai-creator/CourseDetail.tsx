import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Settings,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";
import { CreateModuleModal } from "./CreateModuleModal";
import { ModuleCard } from "./ModuleCard";
import { useCourse } from "@/hooks/useCourses";
import { useModuleManagement } from "@/hooks/useModules";
import { CreateModuleRequest } from "@/services/api";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(courseId!);

  // Fetch and manage modules
  const {
    modules,
    isLoading: modulesLoading,
    isCreating,
    error: modulesError,
    createModule,
  } = useModuleManagement(courseId!);

  const handleCreateModule = async (moduleData: {
    title: string;
    description: string;
    useAI: boolean;
    aiPrompt?: string;
    content?: string;
  }) => {
    try {
      const request: CreateModuleRequest = {
        title: moduleData.title,
        description: moduleData.description,
        order_index: (modules?.length ?? 0) + 1,
        content: moduleData.content || "",
      };

      await createModule(request);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create module:", error);
    }
  };

  if (!courseId) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Course not found
          </h2>
          <p className="text-white/60 mb-4">
            The course you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/dashboard/ai-creator")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-turbo-purple mx-auto mb-4" />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to load course
          </h2>
          <p className="text-white/60 mb-4">
            {courseError instanceof Error
              ? courseError.message
              : "Something went wrong"}
          </p>
          <Button onClick={() => navigate("/dashboard/ai-creator")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-3 py-5 space-y-6">
      {/* Header Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/ai-creator")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-white/60 text-lg">{course.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                course.status === "published"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : course.status === "draft"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {course.status}
            </span>
            <span className="text-white/40 text-sm">
              Created {new Date(course.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-turbo-purple/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-turbo-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {course.total_modules}
                </p>
                <p className="text-sm text-white/60">Modules</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-turbo-indigo/20 rounded-lg">
                <Users className="w-5 h-5 text-turbo-indigo" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {course.students_count}
                </p>
                <p className="text-sm text-white/60">Students</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${course.earnings}
                </p>
                <p className="text-sm text-white/60">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Course Modules</h2>
            <p className="text-white/60 text-sm mt-1">
              {course.completed_modules} of {course.total_modules} modules
              completed
            </p>
          </div>

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
            {isCreating ? "Creating..." : "Add Module"}
          </Button>
        </div>

        {modulesError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load modules
            </h3>
            <p className="text-white/60 mb-6">
              {modulesError instanceof Error
                ? modulesError.message
                : "Something went wrong"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Try Again
            </Button>
          </div>
        ) : modulesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden animate-pulse"
              >
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-white/10 rounded flex-1"></div>
                    <div className="h-8 bg-white/10 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : modules?.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No modules yet
            </h3>
            <p className="text-white/60 mb-6">
              Start building your course by adding your first module
            </p>
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
              {isCreating ? "Creating..." : "Create First Module"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {modules
              .sort((a, b) => a.order_index - b.order_index)
              .map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModuleCard module={module} courseId={courseId!} />
                </motion.div>
              ))}
          </div>
        )}
      </section>

      {/* Create Module Modal */}
      <CreateModuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        courseId={courseId || ""}
        onCreateModule={handleCreateModule}
      />
    </div>
  );
}
