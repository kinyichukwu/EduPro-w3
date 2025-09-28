import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services";
import {
  BookOpen,
  ExternalLink,
  Play,
  Search,
  Coins,
  Calendar,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function LibraryHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get user's purchased courses
  const { data: purchasedCourses = [], isLoading, error } = useQuery({
    queryKey: ['user-purchased-courses'],
    queryFn: async () => {
      const response = await apiService.getUserPurchasedCourses();
      return response.success ? response.data : [];
    },
  });

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatEDUAmount = (amount: number) => {
    return (amount / 1e9).toFixed(2);
  };

  if (error) {
    toast.error('Failed to load purchased courses');
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">My Library</h1>
          <p className="text-white/60">Access your purchased courses and learning materials</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-64 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
          <Input
            placeholder="Search your courses..."
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-turbo-purple/20 to-turbo-indigo/20 border border-turbo-purple/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">{purchasedCourses.length}</h3>
              <p className="text-white/60">Courses Owned</p>
            </div>
            <BookOpen className="w-8 h-8 text-turbo-purple" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {purchasedCourses.reduce((sum, p) => sum + parseFloat(formatEDUAmount(p.total_amount_paid)), 0).toFixed(2)}
              </h3>
              <p className="text-white/60">EDU Spent</p>
            </div>
            <Coins className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {purchasedCourses.reduce((sum, p) => sum + (p.course?.total_modules || 0), 0)}
              </h3>
              <p className="text-white/60">Total Modules</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Purchased Courses Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">My Courses</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-dark-card/40 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-3 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : purchasedCourses.length === 0 ? (
          <div className="text-center py-12 bg-dark-card/40 rounded-xl border border-white/5">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-white/60 mb-6">Explore and purchase courses to start learning</p>
            <Button
              onClick={() => navigate('/dashboard/explore')}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
            >
              Explore Courses
            </Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {purchasedCourses
              .filter(purchase => 
                !searchQuery || 
                purchase.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                purchase.course?.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  variants={itemVariants}
                  className="bg-dark-card/60 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/dashboard/course/${purchase.course_id}`)}
                >
                  {/* Course Header */}
                  <div className="aspect-video bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 relative">
                    {purchase.course?.thumbnail_url ? (
                      <img 
                        src={purchase.course.thumbnail_url} 
                        alt={purchase.course.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                      Owned
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-white line-clamp-2 group-hover:text-turbo-purple transition-colors">
                        {purchase.course?.title || 'Course Title'}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2 mt-1">
                        {purchase.course?.description || 'Course description'}
                      </p>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center bg-white/5 rounded-lg py-2">
                        <div className="flex items-center justify-center gap-1 text-blue-400">
                          <BookOpen className="w-3 h-3" />
                          <span>{purchase.course?.total_modules || 0}</span>
                        </div>
                        <p className="text-white/60 mt-1">Modules</p>
                      </div>
                      
                      <div className="text-center bg-white/5 rounded-lg py-2">
                        <div className="flex items-center justify-center gap-1 text-green-400">
                          <Users className="w-3 h-3" />
                          <span>{purchase.course?.students_count || 0}</span>
                        </div>
                        <p className="text-white/60 mt-1">Students</p>
                      </div>
                      
                      <div className="text-center bg-white/5 rounded-lg py-2">
                        <div className="flex items-center justify-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3" />
                          <span>4.8</span>
                        </div>
                        <p className="text-white/60 mt-1">Rating</p>
                      </div>
                    </div>

                    {/* Purchase Info */}
                    <div className="border-t border-white/10 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Purchased:</span>
                        <span className="text-white flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(purchase.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Paid:</span>
                        <span className="text-green-400 flex items-center">
                          <Coins className="w-3 h-3 mr-1" />
                          {formatEDUAmount(purchase.total_amount_paid)} EDU
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex flex-col">
                        {purchase.nft_mint_address && (
                          <a
                            href={`https://explorer.solana.com/address/${purchase.nft_mint_address}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View NFT
                          </a>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/course/${purchase.course_id}`);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border border-turbo-purple/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-start border-white/20 text-white hover:bg-white/10 p-4 h-auto"
            onClick={() => navigate('/dashboard/explore')}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Explore Courses</div>
              <div className="text-xs text-white/60">Find new courses to purchase</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start border-white/20 text-white hover:bg-white/10 p-4 h-auto"
            onClick={() => navigate('/dashboard/ai-creator')}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Create Course</div>
              <div className="text-xs text-white/60">Share your knowledge</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start border-white/20 text-white hover:bg-white/10 p-4 h-auto"
            onClick={() => navigate('/dashboard/profile')}
          >
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">My Profile</div>
              <div className="text-xs text-white/60">Manage account settings</div>
            </div>
          </Button>
        </div>
      </section>
    </div>
  );
}