import { Course } from "@/dashboard/constants/explore";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, Users, Star, Coins, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  return (
    <Link to={`/dashboard/explore/course/${course.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {/* Course Thumbnail/Header */}
        <div className="relative h-32 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 flex items-center justify-center">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-turbo-purple/60" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {course.isNew && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                New
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {course.isPopular && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                <TrendingUp size={12} className="mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className="text-xs border-white/20 text-white/80"
              >
                {course.category}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs border-white/20 text-white/80"
              >
                {course.difficulty}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-white text-lg line-clamp-1 mb-1 group-hover:text-turbo-purple transition-colors">
              {course.title}
            </h3>
            
            <p className="text-white/60 text-sm line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center border border-white/10 bg-white/5 rounded-lg py-2 px-1">
              <div className="flex items-center justify-center gap-1 text-turbo-purple">
                <Users className="w-3 h-3" />
                <span className="font-medium text-xs">{course.students}</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Students</p>
            </div>

            <div className="text-center border border-white/10 bg-white/5 rounded-lg py-2 px-1">
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-medium text-xs">{course.rating}</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Rating</p>
            </div>

            <div className="text-center border border-white/10 bg-white/5 rounded-lg py-2 px-1">
              {course.price === 0 || course.price === "Free" ? (
                <>
                  <div className="flex items-center justify-center text-green-400">
                    <span className="font-medium text-xs">Free</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">Price</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <Coins className="w-3 h-3" />
                    <span className="font-medium text-xs">{course.price}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">Coins</p>
                </>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{course.duration}</span>
            <span>{course.instructor}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};