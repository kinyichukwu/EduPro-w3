import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  FileText,
  Target,
  Award,
  Sparkles,
  Play,
  Trophy,
  Bookmark,
  Download,
  Smartphone,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Course as UiCourse } from "../constants/explore";
import type { Course as ApiCourse } from "@/services/api";
import { usePublicCourse } from "@/hooks/useCourses";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface Review {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  comment: string;
  date: string;
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<UiCourse | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["section-1"])
  );

  // Mock curriculum data - no videos, focusing on reading materials, quizzes, and assignments
  const curriculum = [
    {
      id: "section-1",
      title: "Introduction to Python",
      lessons: [
        {
          id: "1",
          title: "What is Python?",
          type: "reading",
          estimatedTime: "10 min",
          isPreview: true,
        },
        {
          id: "2",
          title: "Setting up Python Environment",
          type: "reading",
          estimatedTime: "15 min",
          isPreview: true,
        },
        {
          id: "3",
          title: "Python Basics Quiz",
          type: "quiz",
          estimatedTime: "5 min",
          isPreview: false,
        },
        {
          id: "4",
          title: "Your First Python Program",
          type: "assignment",
          estimatedTime: "20 min",
          isPreview: false,
        },
      ],
    },
    {
      id: "section-2",
      title: "Python Fundamentals",
      lessons: [
        {
          id: "5",
          title: "Variables and Data Types",
          type: "reading",
          estimatedTime: "25 min",
          isPreview: false,
        },
        {
          id: "6",
          title: "Control Structures",
          type: "reading",
          estimatedTime: "30 min",
          isPreview: false,
        },
        {
          id: "7",
          title: "Functions and Modules",
          type: "reading",
          estimatedTime: "35 min",
          isPreview: false,
        },
        {
          id: "8",
          title: "Fundamentals Quiz",
          type: "quiz",
          estimatedTime: "10 min",
          isPreview: false,
        },
      ],
    },
    {
      id: "section-3",
      title: "Advanced Topics",
      lessons: [
        {
          id: "9",
          title: "Object-Oriented Programming",
          type: "reading",
          estimatedTime: "45 min",
          isPreview: false,
        },
        {
          id: "10",
          title: "File Handling",
          type: "reading",
          estimatedTime: "20 min",
          isPreview: false,
        },
        {
          id: "11",
          title: "Final Project",
          type: "assignment",
          estimatedTime: "2 hours",
          isPreview: false,
        },
      ],
    },
  ];

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: "1",
      user: { name: "Sarah Johnson" },
      rating: 5,
      comment: "Great course with clear explanations and practical exercises.",
      date: "2024-01-15",
    },
    {
      id: "2",
      user: { name: "Mike Chen" },
      rating: 4,
      comment: "Well-structured content, learned a lot from the assignments.",
      date: "2024-01-10",
    },
  ];

  const { data: apiCourse } = usePublicCourse(courseId ?? "");

  useEffect(() => {
    if (!apiCourse) {
      setCourse(null);
      return;
    }
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
    setCourse(mapToUiCourse(apiCourse));
  }, [apiCourse]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEnroll = async () => {
    try {
      if (!courseId) return;
      const resp = await apiService.enrollInCourse(courseId);
      if (resp.error) throw new Error(resp.error);
      setIsEnrolled(true);
      navigate(`/dashboard/course/${courseId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to enroll");
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "reading":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <Target className="w-4 h-4" />;
      case "assignment":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Course not found
          </h2>
          <Button onClick={() => navigate("/dashboard/explore")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = curriculum.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  return (
    <div className="h-full w-full space-y-6 px-3 py-5">
      {/* Header Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {course.title}
            </h1>
            <p className="text-white/60 mt-1">
              {course.description}
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

        {/* Course Hero Content */}
        <motion.div 
          className="relative overflow-hidden rounded-xl sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-purple-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 px-4 sm:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Course Info */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                      {course.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-white/20 text-white/80"
                    >
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {course.rating}
                          </p>
                          <p className="text-sm text-white/60">Rating</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {course.students.toLocaleString()}
                          </p>
                          <p className="text-sm text-white/60">Students</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {course.duration}
                          </p>
                          <p className="text-sm text-white/60">Duration</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {totalLessons}
                          </p>
                          <p className="text-sm text-white/60">Lessons</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Instructor Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turbo-purple to-turbo-indigo flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {course.instructor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Instructor
                      </p>
                      <p className="text-white/60 text-sm">{course.instructor}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    {/* Price Section */}
                    <div className="text-center mb-6">
                      {course.originalPrice && (
                        <div className="text-sm text-white/60 line-through mb-2">
                          {course.originalPrice} coins
                        </div>
                      )}
                      <div className="text-3xl font-bold text-white mb-3">
                        {course.price === 0 || course.price === "Free"
                          ? "Free"
                          : `${course.price} coins`}
                      </div>
                      {course.originalPrice && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Save{" "}
                          {course.originalPrice -
                            (typeof course.price === "number"
                              ? course.price
                              : 0)}{" "}
                          coins
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                        onClick={handleEnroll}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Enrolled
                          </>
                        ) : course.price === 0 || course.price === "Free" ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Enroll for Free
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            Enroll Now
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        onClick={handleWishlist}
                      >
                        <Bookmark
                          className={`w-4 h-4 mr-2 ${
                            isWishlisted ? "fill-current" : ""
                          }`}
                        />
                        {isWishlisted ? "Saved" : "Save for Later"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* What's Included Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold gradient-text flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            What's Included
          </h2>
          <p className="text-white/60 mt-1">
            Everything you get with this premium course
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Lifetime Access</h4>
              <p className="text-white/60 text-sm">Learn at your own pace, forever</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Downloadable Resources</h4>
              <p className="text-white/60 text-sm">Take materials with you offline</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Certificate of Completion</h4>
              <p className="text-white/60 text-sm">Showcase your achievement</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Mobile & Desktop Access</h4>
              <p className="text-white/60 text-sm">Learn anywhere, anytime</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Interactive Quizzes</h4>
              <p className="text-white/60 text-sm">Test your knowledge as you learn</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">AI-Powered Learning</h4>
              <p className="text-white/60 text-sm">Personalized learning experience</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold gradient-text">
            What you'll learn
          </h2>
          <p className="text-white/60 mt-1">
            Key skills and knowledge you'll gain from this course
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {course.features?.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-white/90">{feature}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Course Content Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold gradient-text">
            Course Content
          </h2>
          <p className="text-white/60 mt-1">
            {curriculum.length} sections • {totalLessons} lessons • {course.duration} total length
          </p>
        </div>

        <div className="space-y-4">
          {curriculum.map((section, sectionIndex) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="group bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-dark-card/80 hover:border-turbo-purple/30 transition-all duration-300 p-4 flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-turbo-purple to-turbo-indigo rounded-lg flex items-center justify-center text-white font-bold">
                    {sectionIndex + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-white group-hover:text-turbo-purple transition-colors">
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <p className="text-sm text-white/60">
                        {section.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-white/40 group-hover:text-turbo-purple transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-turbo-purple transition-colors" />
                )}
              </button>

              {expandedSections.has(section.id) && (
                <div className="mt-4 ml-4 space-y-2">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <motion.div
                      key={lesson.id}
                      className="group bg-dark-card/40 backdrop-blur-lg border border-white/5 rounded-lg hover:bg-dark-card/60 hover:border-turbo-purple/20 transition-all duration-300 p-3 flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: lessonIndex * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-medium">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          {getLessonIcon(lesson.type)}
                          <span className="text-white/90 group-hover:text-white transition-colors">
                            {lesson.title}
                          </span>
                          {lesson.isPreview && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              Preview
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/60">
                          {lesson.estimatedTime}
                        </span>
                        {lesson.isPreview && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-4 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold gradient-text">Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-white font-semibold">
                {course.rating}
              </span>
              <span className="text-white/60">
                ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.slice(0, 2).map((review, index) => (
            <motion.div 
              key={review.id} 
              className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-turbo-purple to-turbo-indigo rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {review.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">
                      {review.user.name}
                    </h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/90">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
