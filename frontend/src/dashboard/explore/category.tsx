import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { mockCourses } from "../constants/explore";
import { CourseCard } from "../components/explore";
import { useParams, Link } from "react-router-dom";

export default function ExploreCategory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const currentCategory = useParams().category ?? "Calculus";

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === "all" || course.difficulty.toLowerCase() === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [searchTerm, selectedLevel]);

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Premium Header Section */}
      <motion.div 
        className="relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-purple-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              to="/dashboard/explore" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
          </motion.div>

          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 capitalize">
                {currentCategory} Category
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent capitalize"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentCategory}
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Courses
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Master {currentCategory} with our expertly curated courses, featuring AI-powered personalization and cutting-edge learning techniques.
            </motion.p>
          </div>

          {/* Simplified Search */}
          <motion.div 
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-0 rounded-2xl text-lg backdrop-blur-xl"
              />
            </div>
          </motion.div>

          {/* Simple filter bar */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex gap-2">
              {levels.slice(1).map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(selectedLevel === level.value ? "all" : level.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedLevel === level.value
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Clean Course Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">No courses found</h3>
              <p className="text-white/40">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
