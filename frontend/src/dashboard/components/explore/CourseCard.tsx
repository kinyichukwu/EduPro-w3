import { Course } from "@/dashboard/constants/explore";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TrendingUp, Users, Star, Coins, BookOpen, ShoppingCart, Play, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCoursePayment } from "@/shared/hooks/useCoursePayment";
import { apiService } from "@/services";
import { toast } from "react-hot-toast";

interface CourseCardProps {
  course: Course & {
    isPurchased?: boolean;
    canAccess?: boolean;
    priceDisplayEDU?: number;
    viewOnChainURL?: string;
  };
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { purchaseCourse, isWalletConnected, walletAddress } = useCoursePayment();

  console.log('CourseCard received course:', course);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    
    if (!isWalletConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (course.isPurchased) {
      navigate(`/dashboard/course/${course.id}`);
      return;
    }

    setIsPurchasing(true);
    try {
      // Get course details for purchase
      const courseDetailsResponse = await apiService.getCourseDetails(String(course.id));
      if (courseDetailsResponse.error || !courseDetailsResponse.data) {
        throw new Error('Failed to get course details');
      }

      const courseDetails = courseDetailsResponse.data;

      // Execute purchase transaction
      const txSignature = await purchaseCourse(
        courseDetails.price_edu_tokens || 0,
        courseDetails.platform_fee_bps || 250,
        courseDetails.user_id // seller wallet - this would need to be the actual wallet address
      );

      // Submit purchase to backend
      const purchaseResponse = await apiService.purchaseCourse(String(course.id), {
        purchase_tx_signature: txSignature,
        buyer_wallet: walletAddress,
      });

      if (purchaseResponse.error) {
        throw new Error(purchaseResponse.error || 'Purchase failed');
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    
    if (course.canAccess || course.price === 0) {
      navigate(`/dashboard/course/${course.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={handleCardClick}
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

        {/* Purchase Status Badge */}
        {course.isPurchased && (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
            Owned
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {course.isNew && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              New
            </Badge>
          )}
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
                  <span className="font-medium text-xs">{course.priceDisplayEDU || course.price}</span>
                </div>
                <p className="text-xs text-white/60 mt-1">EDU</p>
              </>
            )}
          </div>
        </div>

        {/* Duration and Instructor */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{course.duration}</span>
          <span>{course.instructor}</span>
        </div>

        {/* Action Button and NFT Link */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex flex-col">
            {course.viewOnChainURL && (
              <a
                href={course.viewOnChainURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on chain
              </a>
            )}
          </div>

          {course.isPurchased ? (
            <Button
              size="sm"
              className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              onClick={handlePurchase}
            >
              <Play className="w-4 h-4 mr-1" />
              Continue
            </Button>
          ) : course.price === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleCardClick}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Start Free
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
              onClick={handlePurchase}
              disabled={isPurchasing || !isWalletConnected}
            >
              {isPurchasing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};