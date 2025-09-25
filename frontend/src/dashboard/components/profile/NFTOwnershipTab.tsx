import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Image,
  Star,
  CheckCircle,
  Clock,
  Gift,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface NFTItem {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'membership' | 'course' | 'achievement';
  status: 'owned' | 'pending' | 'transferred';
  acquiredDate: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
}

export function NFTOwnershipTab() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  // Mock data - in real implementation, this would come from the NFT API
  useEffect(() => {
    const mockNFTs: NFTItem[] = [
      {
        id: "1",
        name: "EduPro Membership NFT",
        description: "Exclusive membership badge for verified EduPro users",
        image: "/Edupro.svg",
        type: "membership",
        status: "owned",
        acquiredDate: "2024-01-15",
        rarity: "rare",
        metadata: {
          benefits: ["Early access to courses", "Reduced fees", "Community perks"]
        }
      },
      {
        id: "2",
        name: "Blockchain Fundamentals Course NFT",
        description: "Certificate of completion for Blockchain Fundamentals course",
        image: "/Edupro.svg",
        type: "course",
        status: "owned",
        acquiredDate: "2024-01-20",
        rarity: "common",
        metadata: {
          courseId: "blockchain-101",
          completionDate: "2024-01-20",
          score: 95,
          duration: "4 weeks"
        }
      },
      {
        id: "3",
        name: "Quiz Master Achievement",
        description: "Awarded for completing 50 quizzes with 90%+ accuracy",
        image: "/Edupro.svg",
        type: "achievement",
        status: "owned",
        acquiredDate: "2024-01-25",
        rarity: "epic",
        metadata: {
          quizzesCompleted: 50,
          averageScore: 92,
          streakDays: 15
        }
      },
      {
        id: "4",
        name: "React Development Course NFT",
        description: "Certificate for completing advanced React development course",
        image: "/Edupro.svg",
        type: "course",
        status: "owned",
        acquiredDate: "2024-02-01",
        rarity: "rare",
        metadata: {
          courseId: "react-advanced",
          completionDate: "2024-02-01",
          score: 88,
          duration: "6 weeks"
        }
      },
      {
        id: "5",
        name: "Study Streak Champion",
        description: "30-day consecutive study streak achievement",
        image: "/Edupro.svg",
        type: "achievement",
        status: "owned",
        acquiredDate: "2024-02-10",
        rarity: "legendary",
        metadata: {
          streakDays: 30,
          totalStudyTime: "120 hours",
          badges: ["Consistency", "Dedication", "Perseverance"]
        }
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setNfts(mockNFTs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'membership': return Gift;
      case 'course': return BookOpen;
      case 'achievement': return Trophy;
      default: return Award;
    }
  };

  const filteredNFTs = {
    all: nfts,
    membership: nfts.filter(nft => nft.type === 'membership'),
    courses: nfts.filter(nft => nft.type === 'course'),
    achievements: nfts.filter(nft => nft.type === 'achievement')
  };

  const [activeFilter, setActiveFilter] = useState<'all' | 'membership' | 'courses' | 'achievements'>('all');

  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* NFT Collection Header */}
        <motion.div variants={itemVariants}>
          <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                NFT Collection
              </h1>
              <p className="text-white/60 mt-1">
                Your digital achievements and course certificates
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-white/60">Total NFTs</p>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  <span className="text-3xl font-bold text-white">{nfts.length}</span>
                </div>
              </div>

              <div className="h-12 w-px bg-white/20"></div>

              <div className="text-right">
                <p className="text-sm text-white/60">Rare+ NFTs</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">
                    {nfts.filter(nft => nft.rarity === 'rare' || nft.rarity === 'epic' || nft.rarity === 'legendary').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All NFTs', count: nfts.length },
              { key: 'membership', label: 'Membership', count: filteredNFTs.membership.length },
              { key: 'courses', label: 'Courses', count: filteredNFTs.courses.length },
              { key: 'achievements', label: 'Achievements', count: filteredNFTs.achievements.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === key
                    ? "bg-turbo-purple text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* NFT Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(isLoading ? Array(6).fill(null) : filteredNFTs[activeFilter]).map((nft, index) => {
              const TypeIcon = getTypeIcon(nft?.type || 'achievement');
              const rarityColor = getRarityColor(nft?.rarity);

              if (isLoading) {
                return (
                  <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="h-32 bg-white/10 rounded-lg"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={nft.id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors"
                >
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 flex items-center justify-center">
                    <div className="p-4 bg-white/10 rounded-full">
                      <TypeIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className={`${rarityColor} text-xs`}>
                        {nft.rarity || 'common'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className={`text-xs ${
                        nft.type === 'membership' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        nft.type === 'course' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}>
                        {nft.type}
                      </Badge>
                    </div>
                  </div>

                  {/* NFT Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{nft.name}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {nft.description}
                      </p>
                    </div>

                    {/* Metadata */}
                    {nft.metadata && (
                      <div className="space-y-2">
                        {Object.entries(nft.metadata).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-white font-medium">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status and Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {nft.status === 'owned' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className="text-sm text-white/60">
                          Acquired {new Date(nft.acquiredDate).toLocaleDateString()}
                        </span>
                      </div>

                      <Button variant="outline" size="sm" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Collection Stats */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Collection Statistics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{filteredNFTs.membership.length}</p>
                <p className="text-sm text-white/60">Membership</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{filteredNFTs.courses.length}</p>
                <p className="text-sm text-white/60">Courses</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{filteredNFTs.achievements.length}</p>
                <p className="text-sm text-white/60">Achievements</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {nfts.filter(nft => nft.rarity === 'rare' || nft.rarity === 'epic' || nft.rarity === 'legendary').length}
                </p>
                <p className="text-sm text-white/60">Rare+</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
