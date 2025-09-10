// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  CheckCircle,
  User,
  GraduationCap,
  PenTool,
  Award,
  UserCheck,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react";
// import { useState } from "react";
import { motion } from "framer-motion";

interface OnboardingStep3Props {
  selectedRole: string;
  customLearningGoal: string;
}

// interface userDetails {
//   role: string,
//   universityDetails: {
//     university: string,
//     course: string,
//     level: string,
//     matricNumber: string,
//   },
//   jambDetails: {
//     preferredUniversity: string,
//     preferredCourse: string,
//   },
//   email: string,
// }

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  selectedRole,
  customLearningGoal,
}) => {
  // const { userDetails } = useAuth();
  // const [userDetails] = useState<userDetails>({
  //   role: "",
  //   universityDetails: {
  //     university: "",
  //     course: "",
  //     level: "",
  //     matricNumber: "",
  //   },
  //   jambDetails: {
  //     preferredUniversity: "",
  //     preferredCourse: "",
  //   },
  //   email: "",
  // });

  const getRoleIcon = () => {
    switch (selectedRole) {
      case "undergraduate":
        return <BookOpen className="w-8 h-8 text-turbo-purple" />;
      case "university":
        return <GraduationCap className="w-8 h-8 text-turbo-indigo" />;
      case "jamb":
        return <PenTool className="w-8 h-8 text-amber-500" />;
      case "masters":
        return <Award className="w-8 h-8 text-green-500" />;
      case "lecturer":
        return <UserCheck className="w-8 h-8 text-purple-500" />;
      case "custom":
        return <Sparkles className="w-8 h-8 text-orange-500" />;
      default:
        return <User className="w-8 h-8 text-turbo-purple" />;
    }
  };

  const getRoleName = () => {
    switch (selectedRole) {
      case "undergraduate":
        return "Undergraduate Student";
      case "university":
        return "University Student";
      case "jamb":
        return "JAMB Candidate";
      case "masters":
        return "Master's Student";
      case "lecturer":
        return "Lecturer";
      case "custom":
        return `Custom Learner: ${customLearningGoal}`;
      default:
        return "Student";
    }
  };

  const getRoleFeatures = () => {
    switch (selectedRole) {
      case "jamb":
        return [
          "JAMB-specific study materials and past questions",
          "Personalized study schedule based on your target score",
          "Subject-specific practice tests and mock exams",
          "Performance analytics and progress tracking",
        ];
      case "undergraduate":
        return [
          "Course-specific study materials and resources",
          "Assignment and project assistance",
          "Exam preparation and practice questions",
          "Academic writing and research support",
        ];
      case "university":
        return [
          "University-level academic resources",
          "Research and thesis assistance",
          "Course material organization and notes",
          "Study group collaboration tools",
        ];
      case "masters":
        return [
          "Advanced research methodologies and tools",
          "Thesis writing and academic publication support",
          "Specialized subject matter expertise",
          "Professional development resources",
        ];
      case "lecturer":
        return [
          "Course creation and curriculum development tools",
          "Student assessment and grading assistance",
          "Research collaboration and publication support",
          "Teaching methodology and pedagogy resources",
        ];
      case "custom":
        return [
          `Personalized content for "${customLearningGoal}"`,
          "Adaptive learning paths based on your goals",
          "Custom study materials and resources",
          "Progress tracking tailored to your objectives",
          "Flexible learning schedule and pace",
        ];
      default:
        return [
          "AI-powered study assistance",
          "Personalized learning recommendations",
          "Progress tracking and analytics",
          "Interactive learning tools",
        ];
    }
  };

  // const hasUniversityDetails =
  //   userDetails.universityDetails &&
  //   (userDetails.universityDetails.university ||
  //     userDetails.universityDetails.course ||
  //     userDetails.universityDetails.level ||
  //     userDetails.universityDetails.matricNumber);

  // const hasJambDetails =
  //   userDetails.jambDetails &&
  //   (userDetails.jambDetails.preferredUniversity ||
  //     userDetails.jambDetails.preferredCourse);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
            {getRoleIcon()}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome to EduPro AI!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/60 text-lg"
        >
          Your profile has been set up as a{" "}
          <span className="text-turbo-purple font-semibold">
            {getRoleName()}
          </span>
        </motion.p>
      </motion.div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-turbo-purple" />
          <h3 className="text-lg font-semibold text-white">Profile Summary</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Role</span>
            <span className="text-white font-medium">{getRoleName()}</span>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <span className="text-white/60">Account Type</span>
            <span className="text-turbo-purple font-medium">Free Plan</span>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <span className="text-white/60">Setup Status</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-400 font-medium">Complete</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features for Your Role */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border border-turbo-purple/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-turbo-purple" />
          <h3 className="text-lg font-semibold text-white">
            What's Available for You
          </h3>
        </div>

        <div className="grid gap-3">
          {getRoleFeatures().map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo" />
              <span className="text-white/80">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-turbo-indigo" />
          <h3 className="text-lg font-semibold text-white">
            Ready to Get Started?
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-turbo-purple/20 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-turbo-purple">1</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">
                Explore Your Dashboard
              </h4>
              <p className="text-sm text-white/60">
                Get familiar with all the tools and features available to you
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-turbo-indigo/20 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-turbo-indigo">2</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Start Learning</h4>
              <p className="text-sm text-white/60">
                Begin with our AI-powered study materials and interactive
                content
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-green-500">3</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">
                Track Your Progress
              </h4>
              <p className="text-sm text-white/60">
                Monitor your learning journey and celebrate your achievements
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Final Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center p-4 bg-turbo-purple/5 border border-turbo-purple/20 rounded-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-white">
            Setup Complete!
          </span>
        </div>
        <p className="text-xs text-white/60">
          You can always update your profile information later from your account
          settings
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingStep3;
