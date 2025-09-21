import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  BookOpen,
  Edit3,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { CourseModule } from "@/services/api";

interface ModuleCardProps {
  module: CourseModule;
  courseId: string;
}

export const ModuleCard = ({ module, courseId }: ModuleCardProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/dashboard/ai-creator/${courseId}/modules/${module.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      {/* Module Header */}
      <div className="relative p-4 bg-gradient-to-br from-turbo-purple/10 to-turbo-indigo/10">
        {/* Module Order Badge */}
        <div className="absolute top-3 left-3 bg-turbo-purple/20 backdrop-blur-sm rounded-full px-2 py-1 border border-turbo-purple/30">
          <span className="text-xs font-medium text-turbo-purple">
            Module {module.order_index}
          </span>
        </div>

        {/* Status Badge */}
        <div
          className={cn(
            "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(module.status)
          )}
        >
          <div className="flex items-center gap-1">
            {module.status === "completed" ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {module.status}
          </div>
        </div>

        <div className="pt-8">
          <BookOpen className="w-8 h-8 text-turbo-purple/60 mb-3" />
        </div>
      </div>

      {/* Module Content */}
      <div className="p-4 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="font-semibold text-white text-lg mb-2 line-clamp-1">
            {module.title}
          </h3>
          <p className="text-white/60 text-sm line-clamp-2">
            {module.description}
          </p>
        </div>

        {/* Content Preview */}
        <div className="text-white/60 text-sm">
          {module.content ? (
            <p className="line-clamp-2">
              {module.content.substring(0, 100)}...
            </p>
          ) : (
            <p className="italic">No content yet</p>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(module.created_at)}</span>
          </div>
          {module.updated_at !== module.created_at && (
            <span>Updated {formatDate(module.updated_at)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleEdit}
            size="sm"
            className="flex-1 bg-turbo-purple/20 hover:bg-turbo-purple/30 text-turbo-purple border border-turbo-purple/30"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
