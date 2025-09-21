import { Course } from "@/dashboard/constants/explore";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { Users, Star, Clock, Coins } from "lucide-react";

export const CourseListItem: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      // transition={{ delay: index * 0.05 }}
      whileHover={{ x: 5 }}
    >
      <div className="border border-white/5 bg-dark-card/40 backdrop-blur-sm hover:bg-dark-card/60 transition-all duration-300 cursor-pointer rounded-xl ">
        <div className="p-2 sm:p-4">
          <div className="flex gap-4">
            <div className="w-32 min-h-full bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 rounded-lg flex items-center justify-center flex-shrink-0">
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                    {course.isNew && (
                      <Badge className="bg-green-500/90 text-white text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-white hover:text-turbo-purple transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 line-clamp-1">
                    {course.description}
                  </p>
                </div>
                
                <div className="text-right space-y-2">
                  {/* <Button size="sm" className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg">
                    <ShoppingCart size={14} className="mr-1" />
                    {course.price === 0 || course.price === "Free" ? "Enroll" : "Purchase"}
                  </Button> */}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 gap-y-2 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
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
                <span className="text-white/40">by {course.instructor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};