import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Brain, Calculator, Atom, Globe, Palette, Music, TrendingUp, ChevronRight, Sparkles, Zap, Star, Flame } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/explore';
import { mockCourses } from '../constants/explore';
import { Input } from '@/shared/components/ui';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const courseCategories = [
    { id: 'featured', name: 'Featured Courses', icon: Star, gradient: 'from-yellow-500 to-orange-500' },
    { id: 'popular', name: 'Most Popular', icon: Flame, gradient: 'from-red-500 to-pink-500' },
    { id: 'calculus', name: 'Calculus Mastery', icon: Calculator, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'wave-mechanics', name: 'Wave Mechanics', icon: Zap, gradient: 'from-purple-500 to-indigo-500' },
    { id: 'algebra', name: 'Advanced Algebra', icon: Brain, gradient: 'from-green-500 to-emerald-500' },
    { id: 'quantum-mechanics', name: 'Quantum Physics', icon: Atom, gradient: 'from-violet-500 to-purple-500' },
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
      {/* Premium Hero Section */}
      <motion.div 
        className="relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-purple-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
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
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Explore & Master
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Any Subject
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover thousands of premium courses, tutorials, and learning paths designed to help you master any subject with AI-powered personalization and cutting-edge technology.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Premium Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.section 
          className="mb-16"
          variants={itemVariants}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Choose from our expertly curated categories to find the perfect learning path for your goals
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/dashboard/explore/${category.id}`}>
                    <Card className={`group relative overflow-hidden border-white/10 bg-gradient-to-br ${category.bgGradient} backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-6 text-center relative z-10">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-white transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Explore courses
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Premium Course Collections */}
        {courseCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <motion.section 
              key={category.id} 
              className="mb-16"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{category.name}</h2>
                    <p className="text-white/60">Handpicked courses for accelerated learning</p>
                  </div>
                </div>
                <Link to={`/dashboard/explore/${category.id}`}>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                  >
                    View All 
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {mockCourses.slice(0, 4).map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex-shrink-0"
                    >
                      <CourseCard course={course} className="w-80" />
                    </motion.div>
                  ))}
                </div>
                
                {/* Gradient fade on scroll */}
                <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Explore; 