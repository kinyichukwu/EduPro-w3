import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  BookOpen,
  Users,
  DollarSign,
  Eye,
  MoreVertical,
  Calendar,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { Course } from "@/services/api";

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();

  const handleEditCourse = () => {
    navigate(`/dashboard/ai-creator/${course.id}`);
  };

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "archived":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      {/* Course Thumbnail/Header */}
      <div className="relative h-32 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 flex items-center justify-center">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-12 h-12 text-turbo-purple/60" />
        )}

        {/* Status Badge */}
        <div
          className={cn(
            "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(course.status)
          )}
        >
          {course.status}
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-black/20 hover:bg-black/40 text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-white text-lg line-clamp-1 mb-1">
            {course.title}
          </h3>
          <p className="text-white/60 text-sm line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1">
          <div className="text-center border border-purple/10 bg-white/5 rounded-xl py-3 px-1">
            <div className="flex items-center justify-center text-turbo-purple">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">{course.total_modules}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Modules</p>
          </div>

          <div className="text-center border border-purple/10 bg-white/5 rounded-xl py-3 px-1">
            <div className="flex items-center justify-center text-turbo-indigo">
              <Users className="w-4 h-4" />
              <span className="font-medium">{course.students_count}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Students</p>
          </div>

          <div className="text-center border border-purple/10 bg-white/5 rounded-xl py-3 px-1">
            <div className="flex items-center justify-center text-green-500">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">{course.earnings}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Earned</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(course.created_at)}</span>
          </div>
          {course.updated_at !== course.created_at && (
            <span>Updated {formatDate(course.updated_at)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleEditCourse}
            className="flex-[3] bg-turbo-purple/20 hover:bg-turbo-purple/30 text-turbo-purple border border-turbo-purple/30 hover:border-turbo-purple/50"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Course
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 hover:bg-white/10 text-white/70 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Setup
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
