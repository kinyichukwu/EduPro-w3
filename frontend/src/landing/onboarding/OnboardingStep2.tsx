import React from "react";
import { motion } from "framer-motion";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { GraduationCap, PenTool, BookOpen, User, School } from "lucide-react";

// Mock data for dropdowns
const universities = [
  "University of Lagos",
  "University of Ibadan",
  "Ahmadu Bello University",
  "University of Nigeria",
  "Obafemi Awolowo University",
  "University of Benin",
  "University of Ilorin",
  "Federal University of Technology, Akure",
  "Covenant University",
  "Landmark University",
];

const universityCourses = [
  "Computer Science",
  "Electrical Engineering",
  "Medicine and Surgery",
  "Law",
  "Accounting",
  "Business Administration",
  "Economics",
  "Mass Communication",
  "Civil Engineering",
  "Architecture",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Biochemistry",
  "Microbiology",
  "Physics",
  "Mathematics",
  "Chemistry",
  "English Language",
  "Political Science",
  "Psychology",
];

const jambSubjects = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature in English",
  "Geography",
  "Agricultural Science",
  "Commerce",
  "Accounting",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "History",
  "Fine Arts",
  "Music",
  "French",
  "Hausa",
  "Igbo",
  "Yoruba",
];

const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level",
];

interface FormData {
  university: string;
  course: string;
  level: string;
  matricNumber: string;
  preferredUniversity: string;
  preferredCourse: string;
  jambSubjects: string[];
  targetScore: string;
  jambYear: string;
  experience: string;
  title: string;
  educationLevel: string;
  experienceLevel: string;
  additionalDetails: string;
}

interface OnboardingStep2Props {
  selectedRole: string;
  customLearningGoal: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  selectedRole,
  customLearningGoal,
  formData,
  setFormData,
}) => {
  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isUniversityStudent = [
    "undergraduate",
    "university",
    "masters",
  ].includes(selectedRole);
  const isJambStudent = selectedRole === "jamb";
  const isLecturer = selectedRole === "lecturer";
  const isCustom = selectedRole === "custom";

  const getRoleIcon = () => {
    switch (selectedRole) {
      case "jamb":
        return <PenTool className="w-6 h-6 text-amber-500" />;
      case "undergraduate":
      case "university":
        return <GraduationCap className="w-6 h-6 text-turbo-purple" />;
      case "masters":
        return <BookOpen className="w-6 h-6 text-green-500" />;
      case "lecturer":
        return <User className="w-6 h-6 text-purple-500" />;
      case "custom":
        return <School className="w-6 h-6 text-orange-500" />;
      default:
        return <School className="w-6 h-6 text-turbo-indigo" />;
    }
  };

  const getRoleTitle = () => {
    switch (selectedRole) {
      case "jamb":
        return "JAMB Preparation Details";
      case "undergraduate":
      case "university":
        return "University Information";
      case "masters":
        return "Master's Program Details";
      case "lecturer":
        return "Teaching Information";
      case "custom":
        return "Learning Preferences";
      default:
        return "Academic Information";
    }
  };

  const getRoleDescription = () => {
    switch (selectedRole) {
      case "jamb":
        return "Help us prepare the best study materials for your JAMB examination";
      case "undergraduate":
      case "university":
        return "Tell us about your current university and course of study";
      case "masters":
        return "Share details about your master's program";
      case "lecturer":
        return "Let us know about your teaching specialization";
      case "custom":
        return `Help us understand more about your "${customLearningGoal}" learning journey`;
      default:
        return "Provide your academic details";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          {getRoleIcon()}
          <h2 className="text-2xl font-semibold text-white">
            {getRoleTitle()}
          </h2>
        </div>
        <p className="text-white/60">{getRoleDescription()}</p>
      </div>

      {/* JAMB Student Form */}
      {isJambStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Preferred University
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("preferredUniversity", value)
                }
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your preferred university" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universities.map((university) => (
                    <SelectItem
                      key={university}
                      value={university}
                      className="text-white hover:bg-white/10"
                    >
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Preferred Course
              </Label>
              <Select
                onValueChange={(value) =>
                  updateFormData("preferredCourse", value)
                }
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your preferred course" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universityCourses.map((course) => (
                    <SelectItem
                      key={course}
                      value={course}
                      className="text-white hover:bg-white/10"
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Target JAMB Score
              </Label>
              <Input
                placeholder="e.g., 300"
                value={formData.targetScore}
                onChange={(e) => updateFormData("targetScore", e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-turbo-purple/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">JAMB Year</Label>
              <Select
                onValueChange={(value) => updateFormData("jambYear", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select JAMB year" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  <SelectItem
                    value="2024"
                    className="text-white hover:bg-white/10"
                  >
                    2024
                  </SelectItem>
                  <SelectItem
                    value="2025"
                    className="text-white hover:bg-white/10"
                  >
                    2025
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80 font-medium">
              JAMB Subjects (Select 4)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jambSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    const currentSubjects = formData.jambSubjects;
                    if (currentSubjects.includes(subject)) {
                      updateFormData(
                        "jambSubjects",
                        currentSubjects.filter((s) => s !== subject)
                      );
                    } else if (currentSubjects.length < 4) {
                      updateFormData("jambSubjects", [
                        ...currentSubjects,
                        subject,
                      ]);
                    }
                  }}
                  className={`p-3 rounded-lg border text-sm transition-all duration-200 ${
                    formData.jambSubjects.includes(subject)
                      ? "bg-turbo-purple/20 border-turbo-purple/50 text-turbo-purple"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/60">
              Selected: {formData.jambSubjects.length}/4 subjects
            </p>
          </div>
        </motion.div>
      )}

      {/* University Student Form */}
      {isUniversityStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">University</Label>
              <Select
                onValueChange={(value) => updateFormData("university", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universities.map((university) => (
                    <SelectItem
                      key={university}
                      value={university}
                      className="text-white hover:bg-white/10"
                    >
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Course of Study
              </Label>
              <Select
                onValueChange={(value) => updateFormData("course", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universityCourses.map((course) => (
                    <SelectItem
                      key={course}
                      value={course}
                      className="text-white hover:bg-white/10"
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">Current Level</Label>
              <Select onValueChange={(value) => updateFormData("level", value)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {levels.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="text-white hover:bg-white/10"
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Matric Number (Optional)
              </Label>
              <Input
                placeholder="Enter your matric number"
                value={formData.matricNumber}
                onChange={(e) => updateFormData("matricNumber", e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-turbo-purple/50"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Lecturer Form */}
      {isLecturer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">Institution</Label>
              <Select
                onValueChange={(value) => updateFormData("university", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your institution" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universities.map((university) => (
                    <SelectItem
                      key={university}
                      value={university}
                      className="text-white hover:bg-white/10"
                    >
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Department/Subject
              </Label>
              <Select
                onValueChange={(value) => updateFormData("course", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  {universityCourses.map((course) => (
                    <SelectItem
                      key={course}
                      value={course}
                      className="text-white hover:bg-white/10"
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Years of Experience
              </Label>
              <Select
                onValueChange={(value) => updateFormData("experience", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  <SelectItem
                    value="0-2"
                    className="text-white hover:bg-white/10"
                  >
                    0-2 years
                  </SelectItem>
                  <SelectItem
                    value="3-5"
                    className="text-white hover:bg-white/10"
                  >
                    3-5 years
                  </SelectItem>
                  <SelectItem
                    value="6-10"
                    className="text-white hover:bg-white/10"
                  >
                    6-10 years
                  </SelectItem>
                  <SelectItem
                    value="10+"
                    className="text-white hover:bg-white/10"
                  >
                    10+ years
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 font-medium">
                Academic Title
              </Label>
              <Select onValueChange={(value) => updateFormData("title", value)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-turbo-purple/50">
                  <SelectValue placeholder="Select your title" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-white/10">
                  <SelectItem
                    value="assistant-lecturer"
                    className="text-white hover:bg-white/10"
                  >
                    Assistant Lecturer
                  </SelectItem>
                  <SelectItem
                    value="lecturer-ii"
                    className="text-white hover:bg-white/10"
                  >
                    Lecturer II
                  </SelectItem>
                  <SelectItem
                    value="lecturer-i"
                    className="text-white hover:bg-white/10"
                  >
                    Lecturer I
                  </SelectItem>
                  <SelectItem
                    value="senior-lecturer"
                    className="text-white hover:bg-white/10"
                  >
                    Senior Lecturer
                  </SelectItem>
                  <SelectItem
                    value="associate-professor"
                    className="text-white hover:bg-white/10"
                  >
                    Associate Professor
                  </SelectItem>
                  <SelectItem
                    value="professor"
                    className="text-white hover:bg-white/10"
                  >
                    Professor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Learning Form */}
      {isCustom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Your Learning Goal: "{customLearningGoal}"
              </h3>
              <p className="text-white/60 text-sm">
                Help us understand your background so we can provide the most
                relevant content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">
                  Current Education Level (Optional)
                </Label>
                <Select
                  onValueChange={(value) =>
                    updateFormData("educationLevel", value)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-orange-500/50">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-white/10">
                    <SelectItem
                      value="high-school"
                      className="text-white hover:bg-white/10"
                    >
                      High School
                    </SelectItem>
                    <SelectItem
                      value="undergraduate"
                      className="text-white hover:bg-white/10"
                    >
                      Undergraduate
                    </SelectItem>
                    <SelectItem
                      value="graduate"
                      className="text-white hover:bg-white/10"
                    >
                      Graduate
                    </SelectItem>
                    <SelectItem
                      value="postgraduate"
                      className="text-white hover:bg-white/10"
                    >
                      Postgraduate
                    </SelectItem>
                    <SelectItem
                      value="professional"
                      className="text-white hover:bg-white/10"
                    >
                      Professional
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-white hover:bg-white/10"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 font-medium">
                  Experience Level (Optional)
                </Label>
                <Select
                  onValueChange={(value) =>
                    updateFormData("experienceLevel", value)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-orange-500/50">
                    <SelectValue placeholder="How familiar are you?" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-white/10">
                    <SelectItem
                      value="beginner"
                      className="text-white hover:bg-white/10"
                    >
                      Beginner - Just starting out
                    </SelectItem>
                    <SelectItem
                      value="intermediate"
                      className="text-white hover:bg-white/10"
                    >
                      Intermediate - Some experience
                    </SelectItem>
                    <SelectItem
                      value="advanced"
                      className="text-white hover:bg-white/10"
                    >
                      Advanced - Very experienced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-white/80 font-medium">
                  Additional Details (Optional)
                </Label>
                <Input
                  placeholder="Any specific goals, timelines, or requirements?"
                  value={formData.additionalDetails}
                  onChange={(e) =>
                    updateFormData("additionalDetails", e.target.value)
                  }
                  className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Optional Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center p-4 bg-white/5 border border-white/10 rounded-lg"
      >
        <p className="text-white/60 text-sm">
          Don't worry if you don't have all the information right now. You can
          always update these details later in your profile settings.
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingStep2;
