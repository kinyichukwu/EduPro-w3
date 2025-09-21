import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Eye,
  Settings,
  Users,
  DollarSign,
  Calendar,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateModuleModal } from "./CreateModuleModal";
import { ModuleCard } from "./ModuleCard";

interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  links: string[];
  order: number;
  status: "draft" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

interface Course {
  id: number;
  title: string;
  description: string;
  modules: Module[];
  students: number;
  earnings: number;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

// Sample course data
const sampleCourse: Course = {
  id: 1,
  title: "Introduction to React Development",
  description: "Learn the fundamentals of React.js and build modern web applications",
  modules: [
    {
      id: 1,
      title: "Getting Started with React",
      description: "Introduction to React, JSX, and components",
      content: "React is a JavaScript library for building user interfaces...",
      links: ["https://reactjs.org/docs/getting-started.html"],
      order: 1,
      status: "completed",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: 2,
      title: "State and Props",
      description: "Understanding React state management and props",
      content: "State allows React components to change their output over time...",
      links: ["https://reactjs.org/docs/state-and-lifecycle.html"],
      order: 2,
      status: "completed",
      createdAt: new Date("2024-01-22"),
      updatedAt: new Date("2024-01-25"),
    },
    {
      id: 3,
      title: "Event Handling",
      description: "Handling user interactions in React",
      content: "",
      links: [],
      order: 3,
      status: "draft",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
  ],
  students: 124,
  earnings: 2480,
  status: "published",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-02-20"),
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>(sampleCourse);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleBack = () => {
    navigate("/dashboard/ai-creator");
  };

  const handleCreateModule = (moduleData: { title: string; description: string }) => {
    const newModule: Module = {
      id: Date.now(),
      title: moduleData.title,
      description: moduleData.description,
      content: "",
      links: [],
      order: course.modules.length + 1,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    setShowCreateModal(false);
  };

  const handleEditModule = (moduleId: number) => {
    navigate(`/dashboard/ai-creator/${courseId}/modules/${moduleId}`);
  };

  const handleDeleteModule = (moduleId: number) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const completedModules = course.modules.filter(module => module.status === "completed").length;
  const totalModules = course.modules.length;

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text">
              {course.title}
            </h1>
            <p className="text-white/60 mt-1">
              {course.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-turbo-purple/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-turbo-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalModules}</p>
                <p className="text-sm text-white/60">Total Modules</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedModules}</p>
                <p className="text-sm text-white/60">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-turbo-indigo/20 rounded-lg">
                <Users className="w-5 h-5 text-turbo-indigo" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{course.students}</p>
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
                <p className="text-2xl font-bold text-white">${course.earnings}</p>
                <p className="text-sm text-white/60">Earnings</p>
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
              {completedModules} of {totalModules} modules completed
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>

        {course.modules.length === 0 ? (
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
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Module
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules
              .sort((a, b) => a.order - b.order)
              .map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModuleCard
                    module={module}
                    onEdit={() => handleEditModule(module.id)}
                    onDelete={() => handleDeleteModule(module.id)}
                  />
                </motion.div>
              ))}
          </div>
        )}
      </section>

      {/* Create Module Modal */}
      <CreateModuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateModule={handleCreateModule}
      />
    </div>
  );
}
