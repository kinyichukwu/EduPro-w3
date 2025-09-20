import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Globe,
  TrendingUp,
  Shield,
  Download,
  Smartphone,
  EyeIcon,
  Sparkles,
  Play,
  Trophy,
  Bookmark
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { mockCourses } from '../constants/explore';
import { Course } from '../constants/explore';

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
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['section-1']));

  // Mock curriculum data - no videos, focusing on reading materials, quizzes, and assignments
  const curriculum = [
    {
      id: 'section-1',
      title: 'Introduction to Python',
      lessons: [
        { id: '1', title: 'What is Python?', type: 'reading', estimatedTime: '10 min', isPreview: true },
        { id: '2', title: 'Setting up Python Environment', type: 'reading', estimatedTime: '15 min', isPreview: true },
        { id: '3', title: 'Python Basics Quiz', type: 'quiz', estimatedTime: '5 min', isPreview: false },
        { id: '4', title: 'Your First Python Program', type: 'assignment', estimatedTime: '20 min', isPreview: false },
      ],
    },
    {
      id: 'section-2',
      title: 'Python Fundamentals',
      lessons: [
        { id: '5', title: 'Variables and Data Types', type: 'reading', estimatedTime: '25 min', isPreview: false },
        { id: '6', title: 'Control Structures', type: 'reading', estimatedTime: '30 min', isPreview: false },
        { id: '7', title: 'Functions and Modules', type: 'reading', estimatedTime: '35 min', isPreview: false },
        { id: '8', title: 'Fundamentals Quiz', type: 'quiz', estimatedTime: '10 min', isPreview: false },
      ],
    },
    {
      id: 'section-3',
      title: 'Advanced Topics',
      lessons: [
        { id: '9', title: 'Object-Oriented Programming', type: 'reading', estimatedTime: '45 min', isPreview: false },
        { id: '10', title: 'File Handling', type: 'reading', estimatedTime: '20 min', isPreview: false },
        { id: '11', title: 'Final Project', type: 'assignment', estimatedTime: '2 hours', isPreview: false },
      ],
    },
  ];

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      user: { name: 'Sarah Johnson' },
      rating: 5,
      comment: 'Great course with clear explanations and practical exercises.',
      date: '2024-01-15',
    },
    {
      id: '2',
      user: { name: 'Mike Chen' },
      rating: 4,
      comment: 'Well-structured content, learned a lot from the assignments.',
      date: '2024-01-10',
    },
  ];

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.id.toString() === courseId);
    setCourse(foundCourse ?? null);
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <Target className="w-4 h-4" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Button onClick={() => navigate('/dashboard/explore')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
  const relatedCourses = mockCourses
    .filter(c => c.id !== course.id && c.category === course.category)
    .slice(0, 4);

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Enhanced Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              to="/dashboard/explore" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Explore
            </Link>
          </motion.div>

          {/* Course Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Course Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white/80">
                    {course.difficulty}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{course.rating}</div>
                    <div className="text-white/60 text-sm">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{course.students.toLocaleString()}</div>
                    <div className="text-white/60 text-sm">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{course.duration}</div>
                    <div className="text-white/60 text-sm">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{totalLessons}</div>
                    <div className="text-white/60 text-sm">Lessons</div>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-turbo-purple to-turbo-indigo flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Instructor</p>
                    <p className="text-white/80">{course.instructor}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Premium Enrollment Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-6"
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardContent className="p-8">
                    {/* Price Section */}
                    <div className="text-center mb-8">
                      {course.originalPrice && (
                        <div className="text-lg text-white/60 line-through mb-2">
                          {course.originalPrice} coins
                        </div>
                      )}
                      <div className="text-4xl font-bold text-white mb-3">
                        {course.price === 0 || course.price === "Free" ? "Free" : `${course.price} coins`}
                      </div>
                      {course.originalPrice && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Save {course.originalPrice - (typeof course.price === 'number' ? course.price : 0)} coins
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 mb-8">
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={handleEnroll}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Enrolled
                          </>
                        ) : course.price === 0 || course.price === "Free" ? (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Enroll for Free
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5 mr-2" />
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
                        <Bookmark className={`w-5 h-5 mr-2 ${isWishlisted ? "fill-current" : ""}`} />
                        {isWishlisted ? "Saved" : "Save for Later"}
                      </Button>
                    </div>

                    {/* Course Includes */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        What's Included
                      </h4>
                      <ul className="space-y-3 text-white/80">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span>Lifetime access to course</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span>Downloadable resources</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <span>Certificate of completion</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <span>Mobile & desktop access</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-orange-400 flex-shrink-0" />
                          <span>Interactive quizzes</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="lg:col-span-3">
            {/* Enhanced Tabs */}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-12">
                <TabsList className="grid grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-xl px-6 py-3 font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum" 
                    className="rounded-xl px-6 py-3 font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="rounded-xl px-6 py-3 font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger 
                    value="related" 
                    className="rounded-xl px-6 py-3 font-medium text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turbo-purple data-[state=active]:to-turbo-indigo data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    Related
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* What you'll learn */}
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        What you'll learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {course.features?.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-white/90 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Course Requirements */}
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-white/90">Basic computer skills</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-white/90">No prior programming experience required</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-white/90">Windows, Mac, or Linux computer</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-white/90">Internet connection</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Course Description */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      About this course
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90 leading-relaxed text-lg">
                      This comprehensive course is designed to take you from a complete beginner to a confident Python programmer. 
                      You'll learn through hands-on exercises, practical assignments, and real-world projects that will help you 
                      build a strong foundation in Python programming. The course covers everything from basic syntax to advanced 
                      concepts like object-oriented programming and file handling.
                    </p>
                  </CardContent>
                </Card>

                {/* Tags */}
                {course.tags && (
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        Topics covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {course.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="border-white/20 text-white/80 hover:bg-white/10 transition-colors px-4 py-2 text-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>


              <TabsContent value="curriculum" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      Course Curriculum
                    </CardTitle>
                    <p className="text-white/70 mt-2">
                      {curriculum.length} sections • {totalLessons} lessons • {course.duration} total length
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {curriculum.map((section, sectionIndex) => (
                        <div key={section.id} className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-white/10 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                {sectionIndex + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-lg">
                                  {section.title}
                                </h3>
                                <p className="text-sm text-white/60 mt-1">
                                  {section.lessons.length} lessons
                                </p>
                              </div>
                            </div>
                            {expandedSections.has(section.id) ? (
                              <ChevronUp className="w-5 h-5 text-white/60" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-white/60" />
                            )}
                          </button>
                          
                          {expandedSections.has(section.id) && (
                            <div className="border-t border-white/10 bg-white/5">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-medium">
                                      {lessonIndex + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {getLessonIcon(lesson.type)}
                                      <span className="text-white/90 font-medium">{lesson.title}</span>
                                      {lesson.isPreview && (
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1">
                                          <EyeIcon className="w-3 h-3 mr-1" />
                                          Preview
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-white/60">{lesson.estimatedTime}</span>
                                    {lesson.isPreview && (
                                      <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10 h-8 px-3">
                                        <Play className="w-3 h-3 mr-1" />
                                        Preview
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      Student Reviews
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-white font-semibold text-lg">{course.rating}</span>
                      </div>
                      <span className="text-white/60">({reviews.length} reviews)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-turbo-purple to-turbo-indigo rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold">
                                {review.user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="font-semibold text-white">{review.user.name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-white/30'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-white/60">{review.date}</span>
                              </div>
                              <p className="text-white/90 leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="related" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-3 text-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      Related Courses
                    </CardTitle>
                    <p className="text-white/70 mt-2">
                      More courses in {course.category} that you might like
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedCourses.map((relatedCourse) => (
                        <Link
                          key={relatedCourse.id}
                          to={`/dashboard/explore/course/${relatedCourse.id}`}
                          className="group block p-6 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-turbo-purple/30 to-turbo-indigo/30 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <BookOpen className="w-8 h-8 text-turbo-purple" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-turbo-purple transition-colors">
                                {relatedCourse.title}
                              </h4>
                              <p className="text-sm text-white/70 mb-4 line-clamp-2">
                                {relatedCourse.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span>{relatedCourse.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{relatedCourse.students.toLocaleString()}</span>
                                </div>
                                <div>
                                  {relatedCourse.price === 0 || relatedCourse.price === "Free" ? (
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                      Free
                                    </Badge>
                                  ) : (
                                    <span className="text-turbo-purple font-semibold">{relatedCourse.price} coins</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
