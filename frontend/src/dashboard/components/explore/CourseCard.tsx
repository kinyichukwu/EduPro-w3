import { Course } from "@/dashboard/constants/explore";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, Users, Star, Coins } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className={cn("h-full border-white/5 hover:border-white/10 bg-dark-card/40 backdrop-blur-sm hover:bg-dark-card/60 transition-all duration-300 cursor-pointer", className)}>
        <div className="relative">
          <div className="h-40 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 rounded-t-lg flex items-center justify-center">
          </div>
          {course.isNew && (
            <Badge className="absolute top-3 left-3 bg-green-500/90 text-white">
              New
            </Badge>
          )}
          {course.isPopular && (
            <Badge className="absolute top-3 right-3 bg-orange-500/90 text-white">
              <TrendingUp size={12} className="mr-1" />
              Popular
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {course.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course.difficulty}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-white group-hover:text-turbo-purple transition-colors line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-sm text-white/60 line-clamp-2">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>{course.students} students</span>
            </div>
            <div className="flex items-center gap-2">
              {course.price === 0 || course.price === "Free" ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Free
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Coins size={16} className=
                  "text-yellow-500" />
                  <span className="font-semibold text-white">{course.price}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span>{course.rating}</span>
            </div>
          </div>

          {/* <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {course.price === 0 || course.price === "Free" ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Free
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Coins size={16} className="text-yellow-500" />
                  <span className="font-semibold text-white">{course.price}</span>
                </div>
              )}
            </div>
            
            <Button size="sm" className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg">
              <ShoppingCart size={14} className="mr-1" />
              {course.price === 0 || course.price === "Free" ? "Enroll" : "Purchase"}
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </motion.div>
  );
};