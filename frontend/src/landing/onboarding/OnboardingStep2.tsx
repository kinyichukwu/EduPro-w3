import React, { useState } from "react";
// import { useAuth } from "@/context/AuthContext";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
  "Landmark University"
];

const courses = [
  "Computer Science",
  "Electrical Engineering",
  "Medicine and Surgery",
  "Law",
  "Accounting",
  "Business Administration",
  "Economics",
  "Mass Communication",
  "Civil Engineering",
  "Architecture"
];

const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level"
];

export interface userDetails {
	role: string;
	universityDetails: {
		university: string;
		course: string;
		level: string;
		matricNumber: string;
	};
	jambDetails: {
		preferredUniversity: string;
		preferredCourse: string;
	};
	email: string;
}

const OnboardingStep2 = () => {
  // const { userDetails, updateUserDetails } = useAuth();
  const [userDetails, setUserDetails] = useState<userDetails>({
    role: "jamb",
    universityDetails: {
			university: "",
			course: "",
			level: "",
			matricNumber: "",
    },
    jambDetails: {
			preferredUniversity: "",
			preferredCourse: "",
    },
		email: "",
  });

  const handleUniversityChange = (value: string) => {
    const updatedDetails = {
      ...userDetails,
      universityDetails: {
        ...userDetails.universityDetails,
        university: value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const handleCourseChange = (value: string) => {
    const updatedDetails = {
      ...userDetails,
      universityDetails: {
        ...userDetails.universityDetails,
        course: value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const handleLevelChange = (value: string) => {
    const updatedDetails = {
      ...userDetails,
      universityDetails: {
        ...userDetails.universityDetails,
        level: value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const handleMatricNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedDetails = {
      ...userDetails,
      universityDetails: {
        ...userDetails.universityDetails,
        matricNumber: e.target.value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const handlePreferredUniversityChange = (value: string) => {
    const updatedDetails = {
      ...userDetails,
      jambDetails: {
        ...userDetails.jambDetails,
        preferredUniversity: value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const handlePreferredCourseChange = (value: string) => {
    const updatedDetails = {
      ...userDetails,
      jambDetails: {
        ...userDetails.jambDetails,
        preferredCourse: value,
      },
    };
    setUserDetails(updatedDetails);
  };

  const isUniversityStudent =
    userDetails.role === "undergraduate" ||
    userDetails.role === "university" ||
    userDetails.role === "masters";

  const isJambStudent = userDetails.role === "jamb";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

      {isUniversityStudent && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select 
                onValueChange={handleUniversityChange}
                value={userDetails.universityDetails?.university}
              >
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course of Study</Label>
              <Select 
                onValueChange={handleCourseChange}
                value={userDetails.universityDetails?.course}
              >
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level/Year</Label>
              <Select 
                onValueChange={handleLevelChange}
                value={userDetails.universityDetails?.level}
              >
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricNumber">Matric Number</Label>
              <Input
                id="matricNumber"
                placeholder="Enter your matric number"
                className="auth-input bg-white/10"
                value={userDetails.universityDetails?.matricNumber || ""}
                onChange={handleMatricNumberChange}
              />
            </div>
          </div>
        </div>
      )}

      {isJambStudent && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredUniversity">Preferred University</Label>
              <Select 
                onValueChange={handlePreferredUniversityChange}
                value={userDetails.jambDetails?.preferredUniversity}
              >
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select preferred university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredCourse">Preferred Course</Label>
              <Select 
                onValueChange={handlePreferredCourseChange}
                value={userDetails.jambDetails?.preferredCourse}
              >
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select preferred course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {!isUniversityStudent && !isJambStudent && (
        <div className="text-center p-6">
          <p className="text-dark-muted">No additional information needed for your role.</p>
        </div>
      )}
    </div>
  );
};

export default OnboardingStep2;