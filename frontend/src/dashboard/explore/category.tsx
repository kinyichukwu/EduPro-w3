import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { mockCourses } from "../constants/explore";
import { CourseCard, CourseListItem } from "../components/explore";
import { useParams } from "react-router-dom";

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

  return (
    <div className="min-h-screen relative">
      <div className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 capitalize">{currentCategory} Courses</h1>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
              Discover thousands of courses, tutorials, and learning paths designed to help you master {currentCategory} with AI-powered personalization.
            </p>
          </div>
          
          <div className="w-full flex flex-col gap-y-4">
            <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
              <div className="max-w-2xl max-sm:w-full flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-10 border-0 bg-dark-card"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-full border-white/20 bg-dark-card"
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                </Button>
                
                <div className="flex border border-white/20 rounded-md bg-dark-card">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-full rounded-r-none"
                  >
                    <Grid3X3 size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-full rounded-l-none"
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {showFilters && (
              <motion.div
                // initial={{ opacity: 0, height: 0 }}
                // animate={{ opacity: 1, height: "auto" }}
                // exit={{ opacity: 0, height: 0 }}
                // transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10"
              >
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((price) => (
                      <SelectItem key={price.value} value={price.value}>
                        {price.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-6 py-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseListItem key={course.id} course={course} />
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <BookOpen size={64} className="mx-auto text-white/20" />
              <h3 className="text-xl font-semibold text-white/60">No courses found</h3>
              <p className="text-white/40">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
        <p className="text-white/60 text-center">
          Showing {filteredCourses.length} of {mockCourses.length} courses
        </p>
      </div>
    </div>
  );
};
