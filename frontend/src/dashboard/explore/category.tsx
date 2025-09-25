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
import type { Course as UiCourse } from "../constants/explore";
import { CourseCard } from "../components/explore";
import { useParams, Link } from "react-router-dom";
import { usePublicCourses } from "@/hooks/useCourses";
import type { Course as ApiCourse } from "@/services/api";

export default function ExploreCategory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const currentCategory = useParams().categoryId ?? "All";
  const { data: apiCourses = [], isLoading } = usePublicCourses({ page: 1, limit: 50 });

  const mapToUiCourse = (c: ApiCourse): UiCourse => ({
    id: c.id,
    title: c.title,
    description: c.description,
    instructor: "Course Creator", // TODO: add instructor to API/course model
    category: "General", // TODO: add category to API/course model
    difficulty: "Beginner", // TODO: add difficulty/level to API
    price: c.price,
    rating: 4.8, // TODO: add rating to API
    students: c.students_count ?? 0,
    duration: `${c.total_modules} modules`,
    thumbnail: c.thumbnail_url || undefined,
  });

  const allUiCourses: UiCourse[] = (apiCourses || []).map(mapToUiCourse);

  const filteredCourses = useMemo(() => {
    return allUiCourses.filter((course) => {
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



  return (
    <div className="h-full w-full space-y-6 lg:p-12 p-6">
      {/* Header Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text capitalize">
              {currentCategory} Courses
            </h1>
            <p className="text-white/60 mt-1">
              Master {currentCategory} with our expertly curated courses
            </p>
          </div>
          
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/dashboard/explore" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Explore
            </Link>
          </motion.div>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative overflow-hidden rounded-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-purple-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 px-8 py-12">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 capitalize">
                  {currentCategory} Category
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent capitalize"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Explore {currentCategory}
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Learning Path
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Discover courses featuring AI-powered personalization and cutting-edge learning techniques.
              </motion.p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Search */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-0 rounded-xl backdrop-blur-xl"
                  />
                </div>
              </motion.div>

              {/* Filter buttons */}
              <motion.div 
                className="flex items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {levels.slice(1).map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(selectedLevel === level.value ? "all" : level.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedLevel === level.value
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Courses Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white capitalize">{currentCategory} Courses</h2>
            <p className="text-white/60 mt-1">{isLoading ? "Loading..." : `${filteredCourses.length} courses available`}</p>
          </div>
        </div>
        
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">No courses found</h3>
            <p className="text-white/40">Try adjusting your search or filters</p>
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
    </div>
  );
};
