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
  Heart,
  Coins,
  FileText,
  Target,
  Award,
  Globe,
  TrendingUp,
  Shield,
  Download,
  Smartphone,
  Zap,
  EyeIcon,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-white/60">
          <Link to="/dashboard/explore" className="hover:text-white transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-white">{course.title}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.difficulty}
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-3">
                  {course.title}
                </h1>
                
                <p className="text-white/70 mb-4">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <div className="flex items-center gap-1">
                    <span>By {course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
                    onClick={handleEnroll}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Enrolled
                      </>
                    ) : course.price === 0 || course.price === "Free" ? (
                      "Enroll for Free"
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Enroll for {course.price}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={isWishlisted ? "border-red-500 text-red-500" : ""}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Course Tabs - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-dark-card/40">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="related">Related</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* What you'll learn */}
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-turbo-purple" />
                        What you'll learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {course.features?.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-white/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Course Requirements */}
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-turbo-purple" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-white/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Basic computer skills</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>No prior programming experience required</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Windows, Mac, or Linux computer</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Internet connection</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Course Description */}
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-turbo-purple" />
                        About this course
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 leading-relaxed">
                        This comprehensive course is designed to take you from a complete beginner to a confident Python programmer. 
                        You'll learn through hands-on exercises, practical assignments, and real-world projects that will help you 
                        build a strong foundation in Python programming. The course covers everything from basic syntax to advanced 
                        concepts like object-oriented programming and file handling.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {course.tags && (
                    <Card className="bg-dark-card/40 border-white/5">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Globe className="w-5 h-5 text-turbo-purple" />
                          Topics covered
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs hover:bg-white/10 transition-colors">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="curriculum" className="mt-6">
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-turbo-purple" />
                        Course Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {curriculum.map((section, sectionIndex) => (
                          <div key={section.id} className="border border-white/10 rounded-lg">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                              <div>
                                <h3 className="font-medium text-white text-sm">
                                  Section {sectionIndex + 1}: {section.title}
                                </h3>
                                <p className="text-xs text-white/60">
                                  {section.lessons.length} lessons
                                </p>
                              </div>
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="w-4 h-4 text-white/60" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/60" />
                              )}
                            </button>
                            
                            {expandedSections.has(section.id) && (
                              <div className="border-t border-white/10">
                                {section.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {getLessonIcon(lesson.type)}
                                      <span className="text-white/80 text-sm max-sm:truncate">{lesson.title}</span>
                                      {lesson.isPreview && (
                                        <Badge className="max-sm:px-1 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                          <span className="hidden sm:block">Preview</span>
                                          <EyeIcon className="w-4 h-4 sm:hidden" />
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-white/60">{lesson.estimatedTime}</span>
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

                <TabsContent value="reviews" className="mt-6">
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-turbo-purple" />
                        Student Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-white/10 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-turbo-purple to-turbo-indigo rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {review.user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-white text-sm">{review.user.name}</h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating
                                            ? 'text-yellow-500 fill-current'
                                            : 'text-white/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-white/60">{review.date}</span>
                                </div>
                                <p className="text-white/80 text-sm">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="related" className="mt-6">
                  <Card className="bg-dark-card/40 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-turbo-purple" />
                        Related Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedCourses.map((relatedCourse) => (
                          <Link
                            key={relatedCourse.id}
                            to={`/dashboard/explore/course/${relatedCourse.id}`}
                            className="block p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                          >
                            <div className="flex gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-turbo-purple/20 to-turbo-indigo/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-turbo-purple" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                                  {relatedCourse.title}
                                </h4>
                                <p className="text-xs text-white/60 mb-2 line-clamp-2">
                                  {relatedCourse.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-white/60">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span>{relatedCourse.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{relatedCourse.students.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {relatedCourse.price === 0 || relatedCourse.price === "Free" ? (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                        Free
                                      </Badge>
                                    ) : (
                                      <span className="text-turbo-purple font-medium">{relatedCourse.price}</span>
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
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-dark-card/40 border-white/5 sticky top-6">
                <CardContent className="p-6">
                  {/* Pricing Section */}
                  <div className="text-center mb-6">
                    {course.originalPrice && (
                      <div className="text-sm text-white/60 line-through mb-1">
                        {course.originalPrice} coins
                      </div>
                    )}
                    <div className="text-3xl font-bold text-white mb-2">
                      {course.price === 0 || course.price === "Free" ? "Free" : course.price}
                    </div>
                    {course.originalPrice && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Save {course.originalPrice - (typeof course.price === 'number' ? course.price : 0)} coins
                      </Badge>
                    )}
                  </div>

                  {/* Enrollment Button */}
                  <Button
                    size="lg"
                    className="w-full mb-6 bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg hover:shadow-turbo-purple/25"
                    onClick={handleEnroll}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enrolled
                      </>
                    ) : course.price === 0 || course.price === "Free" ? (
                      "Enroll for Free"
                    ) : (
                      <>
                        <Coins className="w-5 h-5 mr-2" />
                        Enroll for {course.price}
                      </>
                    )}
                  </Button>

                  {/* Course Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">Duration</span>
                      </div>
                      <span className="text-white font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">Lessons</span>
                      </div>
                      <span className="text-white font-medium">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">Level</span>
                      </div>
                      <span className="text-white font-medium">{course.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">Students</span>
                      </div>
                      <span className="text-white font-medium">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-white/60 text-sm">Rating</span>
                      </div>
                      <span className="text-white font-medium">{course.rating}</span>
                    </div>
                  </div>

                  {/* Course Includes */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-turbo-purple" />
                      This course includes:
                    </h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-green-500" />
                        <span>Downloadable resources</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-green-500" />
                        <span>Mobile & desktop access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>Quizzes & assignments</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instructor Info */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-turbo-purple" />
                      Instructor
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-turbo-purple to-turbo-indigo rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {course.instructor.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{course.instructor}</p>
                        <p className="text-white/60 text-xs">Course Instructor</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
