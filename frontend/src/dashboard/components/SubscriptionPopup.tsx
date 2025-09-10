import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limit: "uploads" | "prompts" | "flashcards" | "quizzes";
}

export const SubscriptionPopup = ({
  isOpen,
  onClose,
  limit,
}: SubscriptionPopupProps) => {
  const limitMessages = {
    uploads: "You've reached your limit for free uploads this month.",
    prompts: "You've reached your limit for free prompts this month.",
    flashcards: "You've reached your limit for free flashcards this month.",
    quizzes: "You've reached your limit for free quizzes this month.",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            // Close only if clicking the backdrop, not the modal itself
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="max-w-md w-full glass-card rounded-xl border border-white/10 p-6 shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold gradient-text">
                Upgrade Your Plan
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 bg-dark-accent/50 hover:bg-dark-accent text-dark-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-dark-muted mb-6">
              {limitMessages[limit]} Upgrade to continue learning without
              interruptions.
            </p>

            {/* Pricing boxes */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                {
                  name: "Basic",
                  price: "9.99",
                  features: [
                    "10 uploads/mo",
                    "50 prompts/mo",
                    "Basic flashcards",
                  ],
                },
                {
                  name: "Premium",
                  price: "19.99",
                  features: [
                    "30 uploads/mo",
                    "Unlimited prompts",
                    "Advanced quizzes",
                    "Priority support",
                  ],
                  recommended: true,
                },
                {
                  name: "Ultimate",
                  price: "29.99",
                  features: [
                    "Unlimited everything",
                    "Team sharing",
                    "Custom AI training",
                    "24/7 Support",
                  ],
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative rounded-xl border p-4 text-center cursor-pointer transition-all ${
                    plan.recommended
                      ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-white/10 bg-dark-accent/30 hover:bg-dark-accent/50"
                  }`}
                  whileHover={{ y: -5, scale: 1.03 }}
                >
                  {plan.recommended && (
                    <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-semibold py-0.5 px-2 rounded-full whitespace-nowrap">
                      RECOMMENDED
                    </span>
                  )}
                  <div
                    className={`text-lg font-semibold mb-1 ${
                      plan.recommended ? "text-primary" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </div>
                  <div className="text-2xl font-bold mb-1 text-white">
                    ${plan.price}
                  </div>
                  <div className="text-xs text-dark-muted mb-3">per month</div>
                  <div className="flex flex-col items-start text-left mt-3 gap-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <Check
                          size={14}
                          className="text-primary mr-1.5 flex-shrink-0"
                        />
                        <span className="text-dark-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary to-indigo-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-primary/20 transition-all">
                View Pricing Plans
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg border border-white/10 font-medium text-white hover:bg-dark-accent/50 transition-colors"
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
