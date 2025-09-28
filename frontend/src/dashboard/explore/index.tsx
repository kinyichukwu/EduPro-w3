import { motion } from 'framer-motion';
import { BookOpen, Brain, Calculator, Atom, Globe, Palette, Music, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/explore';
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services";
import type { Course as UiCourse } from "../constants/explore";
import type { CourseWithPurchaseInfo } from "@/services/api";

const Explore = () => {

  const categories = [
    { id: 'All', name: 'All Subjects', icon: BookOpen, gradient: 'from-blue-500 to-purple-600', bgGradient: 'from-blue-500/20 to-purple-600/10' },
    { id: 'math', name: 'Mathematics', icon: Calculator, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-500/20 to-cyan-500/10' },
    { id: 'science', name: 'Science', icon: Atom, gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-500/20 to-emerald-500/10' },
    { id: 'language', name: 'Languages', icon: Globe, gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-500/20 to-pink-500/10' },
    { id: 'art', name: 'Arts', icon: Palette, gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-500/20 to-rose-500/10' },
    { id: 'music', name: 'Music', icon: Music, gradient: 'from-orange-500 to-amber-500', bgGradient: 'from-orange-500/20 to-amber-500/10' },
    { id: 'ai', name: 'AI & Tech', icon: Brain, gradient: 'from-cyan-500 to-blue-500', bgGradient: 'from-cyan-500/20 to-blue-500/10' },
    { id: 'business', name: 'Business', icon: TrendingUp, gradient: 'from-emerald-500 to-green-500', bgGradient: 'from-emerald-500/20 to-green-500/10' },
  ];


  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const { data: coursesWithPurchaseInfo = [], isLoading } = useQuery({
    queryKey: ['public-courses-with-purchase-info'],
    queryFn: async () => {
      const response = await apiService.getPublicCoursesWithPurchaseInfo();
      return response.success ? response.data : [];
    },
  });

  const mapToUiCourse = (courseInfo: CourseWithPurchaseInfo): UiCourse & {
    isPurchased: boolean;
    canAccess: boolean;
    priceDisplayEDU: number;
    viewOnChainURL?: string;
  } => ({
    id: courseInfo.course.id,
    title: courseInfo.course.title,
    description: courseInfo.course.description,
    instructor: "Course Creator", // TODO: add instructor info
    category: "General",
    difficulty: "Beginner",
    price: courseInfo.price_display_edu, // Real price from backend
    rating: 4.8,
    students: courseInfo.course.students_count ?? 0,
    duration: `${courseInfo.course.total_modules} modules`,
    thumbnail: courseInfo.course.thumbnail_url || undefined,
    isPurchased: courseInfo.is_purchased,
    canAccess: courseInfo.can_access,
    priceDisplayEDU: courseInfo.price_display_edu,
    viewOnChainURL: courseInfo.course.view_on_chain_url,
  });

  const uiCourses = coursesWithPurchaseInfo.map(mapToUiCourse);

  return (
    <div className="h-full w-full space-y-6 px-3 py-5">
      {/* Header Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Explore Courses
            </h1>
            <p className="text-white/60 mt-1">
              Discover thousands of premium courses and learning paths
            </p>
          </div>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative overflow-hidden rounded-xl sm:mb-6"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-purple-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 px-4 sm:px-8 py-12">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-1">
                  AI-Powered Learning
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Explore & Master
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Any Subject
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Discover premium courses, tutorials, and learning paths designed to help you master any subject with AI-powered personalization.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Browse by Category</h2>
        </div>
        
        {/* Category buttons */}
        <div className="flex flex-wrap gap-3">
          {categories.slice(0, 8).map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/dashboard/explore/${category.id}`}>
                  <button className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${category.gradient} hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}>
                    <IconComponent className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">{category.name}</span>
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Featured Courses</h2>
              <Link className='sm:hidden' to="/dashboard/explore/featured">
                <Button 
                  variant="outline" 
                  className="max-sm:px-3 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4 sm:ml-2" />
                </Button>
          </Link>
            </div>
            <p className="text-white/60 mt-1">Start learning with our most popular courses</p>
          </div>
          <Link className='max-sm:hidden' to="/dashboard/explore/featured">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
              >
              View All
              <ChevronRight className="w-4 h-4 sm:ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(isLoading ? [] : uiCourses).slice(0, 6).map((course, index) => (
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
      </section>
    </div>
  );
};

export default Explore; 