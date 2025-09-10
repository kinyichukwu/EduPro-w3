import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";
import { apiService } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [customLearningGoal, setCustomLearningGoal] = useState("");
  const [formData, setFormData] = useState({
    university: "",
    course: "",
    level: "",
    matricNumber: "",
    preferredUniversity: "",
    preferredCourse: "",
    jambSubjects: [] as string[],
    targetScore: "",
    jambYear: "",
    experience: "",
    title: "",
    educationLevel: "",
    experienceLevel: "",
    additionalDetails: "",
  });
  const [isPending, setIsPending] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const completeOnboarding = async () => {
    setIsPending(true);
    
    // Create flexible academic details based on role
    const academicDetails: any = {};
    
    // Common fields
    if (formData.university) academicDetails.university = formData.university;
    if (formData.course) academicDetails.course = formData.course;
    
    // Role-specific details
    if (selectedRole === 'jamb') {
      academicDetails.jamb_details = {
        preferred_university: formData.preferredUniversity || formData.university,
        preferred_course: formData.preferredCourse || formData.course,
        target_score: formData.targetScore,
        jamb_year: formData.jambYear,
        jamb_subjects: formData.jambSubjects || []
      };
    }
    
    if (selectedRole === 'undergraduate' || selectedRole === 'university' || selectedRole === 'masters') {
      academicDetails.university_details = {
        current_university: formData.university,
        current_course: formData.course,
        current_level: formData.level,
        matric_number: formData.matricNumber
      };
    }
    
    if (selectedRole === 'lecturer') {
      academicDetails.lecturer_details = {
        institution: formData.university,
        department: formData.course,
        experience: formData.experience,
        academic_title: formData.title
      };
    }
    
    if (selectedRole === 'custom') {
      academicDetails.custom_details = {
        learning_goal: customLearningGoal,
        education_level: formData.educationLevel,
        experience_level: formData.experienceLevel,
        additional_details: formData.additionalDetails
      };
    }
    
    const onboardingData = {
      role: selectedRole,
      custom_learning_goal: customLearningGoal,
      academic_details: academicDetails
    };

    try {
      await apiService.updateOnboarding(onboardingData);
      void queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      // navigate("/dashboard/chats");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      void completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    void completeOnboarding();
  };

  const stepTitles = [
    "Choose Your Role",
    "Academic Details",
    "Confirm & Complete",
  ];

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (selectedRole === "custom") {
          return selectedRole && customLearningGoal.trim().length > 0;
        }
        return selectedRole;
      case 2:
        return true; // Step 2 validation handled in OnboardingStep2
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-dark-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-turbo-purple/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turbo-indigo/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold gradient-text">
                EduPro AI
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Let's Set Up Your Profile
            </h1>
            <p className="text-xl text-white/60">
              This will only take a few minutes
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-card rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Progress Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {stepTitles[currentStep - 1]}
                </h2>
                <span className="text-sm text-white/60">
                  Step {currentStep} of 3
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mt-3">
                  {stepTitles.map((title, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          index + 1 <= currentStep
                            ? "bg-gradient-to-r from-turbo-purple to-turbo-indigo"
                            : "bg-white/20"
                        }`}
                      />
                      <span className="text-xs text-white/60 mt-1 hidden sm:block">
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <OnboardingStep1
                      selectedRole={selectedRole}
                      onRoleSelect={setSelectedRole}
                      customLearningGoal={customLearningGoal}
                      onCustomLearningGoalChange={setCustomLearningGoal}
                    />
                  )}
                  {currentStep === 2 && (
                    <OnboardingStep2
                      selectedRole={selectedRole}
                      customLearningGoal={customLearningGoal}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {currentStep === 3 && (
                    <OnboardingStep3
                      selectedRole={selectedRole}
                      customLearningGoal={customLearningGoal}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="max-sm:py-4 p-6 border-t border-white/10 bg-dark-card/20">
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      onClick={handleBack}
                      disabled={isPending}
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-turbo-purple/50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 3 && (
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      Skip for now
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isPending}
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentStep === 3 ? (
                      <>
                        {isPending ? (
                          <>
                            Completing...
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          </>
                        ) : (
                          <>
                            Complete Setup
                            <Sparkles className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center my-6 text-sm text-white/40"
          >
            You can always update these details later in your profile settings
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
