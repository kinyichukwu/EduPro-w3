import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Grid3X3,
  List,
  Filter,
  ArrowLeft,
  Star,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { mockCourses } from "../constants/explore";
import { CourseCard, CourseListItem } from "../components/explore";
import { useParams, Link } from "react-router-dom";

export default function ExploreCategory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = useParams().category ?? "Calculus";

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === "all" || course.difficulty.toLowerCase() === selectedLevel;
      const matchesPrice = selectedPrice === "all" || 
        (selectedPrice === "free" && (course.price === 0 || course.price === "Free")) ||
        (selectedPrice === "paid" && (typeof course.price === "number" ? course.price > 0 : course.price !== "Free"));

      return matchesSearch && matchesLevel && matchesPrice;
    }).sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case "price-low":
          return (typeof a.price === "number" ? a.price : 0) - (typeof b.price === "number" ? b.price : 0);
        case "price-high":
          return (typeof b.price === "number" ? b.price : 0) - (typeof a.price === "number" ? a.price : 0);
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedLevel, selectedPrice, sortBy]);

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ];

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Highest Rated" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
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

          {/* Premium Search & Filters */}
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >

            {/* Results Summary */}
            <div className="flex items-center justify-between text-white/70 mb-2">
              <div className="flex items-center gap-4">
                <span>{filteredCourses.length} courses found</span>
                {searchTerm && (
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    Searching: "{searchTerm}"
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Updated daily</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Course Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <CourseListItem course={course} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <BookOpen size={40} className="text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No courses found</h3>
                  <p className="text-white/60 mb-6">
                    We couldn't find any courses matching your criteria. Try adjusting your search or filters.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLevel("all");
                      setSelectedPrice("all");
                      setSortBy("popular");
                    }}
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Footer */}
          {filteredCourses.length > 0 && (
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Card className="inline-block bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-6 text-white/70">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Showing {filteredCourses.length} of {mockCourses.length} courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>Premium quality guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
