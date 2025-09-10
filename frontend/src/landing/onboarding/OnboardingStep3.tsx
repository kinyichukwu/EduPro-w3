// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { CheckCircle, User, GraduationCap, PenTool, Award, UserCheck, BookOpen, Mail } from "lucide-react";
import { useState } from "react";
import { userDetails } from "./OnboardingStep2";

const OnboardingStep3 = () => {
  // const { userDetails } = useAuth();
  const [userDetails] = useState<userDetails>({
    role: "",
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

  const getRoleIcon = () => {
    switch (userDetails.role) {
      case "undergraduate":
        return <BookOpen className="h-6 w-6 text-indigo-500" />;
      case "university":
        return <GraduationCap className="h-6 w-6 text-indigo-500" />;
      case "jamb":
        return <PenTool className="h-6 w-6 text-indigo-500" />;
      case "masters":
        return <Award className="h-6 w-6 text-indigo-500" />;
      case "lecturer":
        return <UserCheck className="h-6 w-6 text-indigo-500" />;
      default:
        return <User className="h-6 w-6 text-indigo-500" />;
    }
  };

  const getRoleName = () => {
    switch (userDetails.role) {
      case "undergraduate":
        return "Undergraduate";
      case "university":
        return "University Student";
      case "jamb":
        return "JAMB Student";
      case "masters":
        return "Master's Student";
      case "lecturer":
        return "Lecturer";
      default:
        return "User";
    }
  };

  const hasUniversityDetails =
    userDetails.universityDetails &&
    (userDetails.universityDetails.university ||
      userDetails.universityDetails.course ||
      userDetails.universityDetails.level ||
      userDetails.universityDetails.matricNumber);

  const hasJambDetails =
    userDetails.jambDetails &&
    (userDetails.jambDetails.preferredUniversity ||
      userDetails.jambDetails.preferredCourse);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-white/10 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
          {getRoleIcon()}
        </div>
        <h2 className="text-xl text-white/90 font-semibold">Confirm Your Details</h2>
        <p className="text-white/60">Please review the information you've provided</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-indigo-500" />
            <span className="font-medium text-white/90">Role</span>
          </div>
          <span>{getRoleName()}</span>
        </div>

        {userDetails.email && (
          <>
            <Separator className="bg-dark-accent/40" />
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-turbo-indigo" />
                <span className="font-medium">Email</span>
              </div>
              <span>{userDetails.email}</span>
            </div>
          </>
        )}

        {hasUniversityDetails && (
          <>
            <Separator className="bg-dark-accent/40" />
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-turbo-indigo" />
                <span className="font-medium">Academic Information</span>
              </div>
              <div className="ml-8 space-y-2">
                {userDetails.universityDetails?.university && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">University:</span>
                    <span>{userDetails.universityDetails.university}</span>
                  </div>
                )}
                {userDetails.universityDetails?.course && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Course:</span>
                    <span>{userDetails.universityDetails.course}</span>
                  </div>
                )}
                {userDetails.universityDetails?.level && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Level:</span>
                    <span>{userDetails.universityDetails.level}</span>
                  </div>
                )}
                {userDetails.universityDetails?.matricNumber && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Matric Number:</span>
                    <span>{userDetails.universityDetails.matricNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {hasJambDetails && (
          <>
            <Separator className="bg-dark-accent/40" />
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PenTool className="h-5 w-5 text-turbo-indigo" />
                <span className="font-medium">JAMB Information</span>
              </div>
              <div className="ml-8 space-y-2">
                {userDetails.jambDetails?.preferredUniversity && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Preferred University:</span>
                    <span>{userDetails.jambDetails.preferredUniversity}</span>
                  </div>
                )}
                {userDetails.jambDetails?.preferredCourse && (
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Preferred Course:</span>
                    <span>{userDetails.jambDetails.preferredCourse}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="pt-4 flex items-center justify-center space-x-2 text-sm text-dark-muted">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>You can update these details later from your profile</span>
      </div>
    </div>
  );
};

export default OnboardingStep3;
