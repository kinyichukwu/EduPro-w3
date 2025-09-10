import { useState } from "react";
// import { useAuth } from "@/context/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  // const { completeOnboarding } = useAuth();
  const completeOnboarding = () => {
    console.log("Complete Onboarding");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 1) {
      handleNext();
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-left p-4 sm:p-6 md:p-8">
      <div className="border-2 border-neutral-800 bg-white/5 rounded-lg  w-full max-w-3xl p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            Complete Your Profile
          </h1>
          <p className="text-dark-muted">
            Help us customize your experience with a few more details
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-white/15 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/60">
            <span className={currentStep >= 1 ? "text-purple-400" : ""}>
              Your Role
            </span>
            <span className={currentStep >= 2 ? "text-purple-400" : ""}>
              Details
            </span>
            <span className={currentStep >= 3 ? "text-purple-500" : ""}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Onboarding Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <OnboardingStep1 />}
            {currentStep === 2 && <OnboardingStep2 />}
            {currentStep === 3 && <OnboardingStep3 />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="bg-transparent hover:bg-white/10 border border-white/20 text-white/90"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            {currentStep < 3 && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-dark-muted hover:text-white hover:bg-dark-accent/30"
              >
                Skip
              </Button>
            )}
            {currentStep < 3 ? (
              <Button onClick={handleNext} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Continue
              </Button>
            ) : (
              <Button onClick={completeOnboarding} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
