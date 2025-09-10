import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  PenTool,
  Award,
  UserCheck,
  Check,
  Edit3,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const roleOptions = [
  {
    id: "jamb",
    name: "Writing JAMB",
    description: "Preparing for JAMB examinations",
    icon: PenTool,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "undergraduate",
    name: "Undergraduate",
    description: "Currently enrolled in an undergraduate program",
    icon: BookOpen,
    color: "from-turbo-purple to-turbo-indigo",
  },
  {
    id: "university",
    name: "University Student",
    description: "Enrolled in a university program",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "masters",
    name: "Master's Student",
    description: "Enrolled in a master's degree program",
    icon: Award,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "lecturer",
    name: "Lecturer",
    description: "Teaching at a university or college",
    icon: UserCheck,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "custom",
    name: "Other/Custom",
    description: "Something else - tell us what you want to learn",
    icon: Edit3,
    color: "from-orange-500 to-red-500",
  },
];

interface OnboardingStep1Props {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  customLearningGoal: string;
  onCustomLearningGoalChange: (goal: string) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  selectedRole,
  onRoleSelect,
  customLearningGoal,
  onCustomLearningGoalChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          What best describes you?
        </h2>
        <p className="text-white/60">
          This helps us personalize your learning experience and show relevant
          content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleOptions.map((role, index) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <button
                onClick={() => onRoleSelect(role.id)}
                className={`w-full h-full text-left p-6 rounded-xl border transition-all duration-300 group ${
                  isSelected
                    ? "bg-turbo-purple/10 border-turbo-purple/50 ring-2 ring-turbo-purple/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-r ${role.color} text-white`
                        : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white/80"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300 ${
                          isSelected
                            ? "text-turbo-purple"
                            : "text-white group-hover:text-turbo-purple"
                        }`}
                      >
                        {role.name}
                      </h3>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>

                    <p
                      className={`text-sm transition-colors duration-300 ${
                        isSelected ? "text-white/80" : "text-white/60"
                      }`}
                    >
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo rounded-b-xl"
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Learning Goal Input */}
      {selectedRole === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl">
            <Label className="text-white/80 font-medium mb-3 block">
              What do you want to learn or prepare for?
            </Label>
            <Input
              placeholder="e.g., Professional certification, Language learning, Skill development..."
              value={customLearningGoal}
              onChange={(e) => onCustomLearningGoalChange(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="text-xs text-white/60 mt-2">
              Help us understand your specific learning goals so we can
              personalize your experience
            </p>
          </div>
        </motion.div>
      )}

      {selectedRole && selectedRole !== "custom" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-turbo-purple/10 border border-turbo-purple/30 rounded-lg"
        >
          <p className="text-turbo-purple text-sm">
            Great choice! We'll customize your experience for{" "}
            <span className="font-semibold">
              {roleOptions.find((r) => r.id === selectedRole)?.name}
            </span>
          </p>
        </motion.div>
      )}

      {selectedRole === "custom" && customLearningGoal.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg"
        >
          <p className="text-orange-400 text-sm">
            Perfect! We'll help you with{" "}
            <span className="font-semibold">"{customLearningGoal}"</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingStep1;
