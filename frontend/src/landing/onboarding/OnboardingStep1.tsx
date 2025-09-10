import { Card } from "@/shared/components/ui/card";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  GraduationCap, 
  PenTool, 
  Award, 
  UserCheck 
} from "lucide-react";
import { useState } from "react";

const roleOptions = [
  {
    id: "undergraduate",
    name: "Undergraduate",
    description: "Currently enrolled in an undergraduate program",
    icon: BookOpen,
  },
  {
    id: "university",
    name: "University Student",
    description: "Enrolled in a university program",
    icon: GraduationCap,
  },
  {
    id: "jamb",
    name: "Writing JAMB",
    description: "Preparing for JAMB examinations",
    icon: PenTool,
  },
  {
    id: "masters",
    name: "Master's Student",
    description: "Enrolled in a master's degree program",
    icon: Award,
  },
  {
    id: "lecturer",
    name: "Lecturer",
    description: "Teaching at a university or college",
    icon: UserCheck,
  },
];

const OnboardingStep1 = () => {
  // const { userDetails, updateUserDetails } = useAuth();
  const [userDetails, setUserDetails] = useState<{ role: string }>({
    role: "",
  });

  const handleSelectRole = (role: string) => {
    setUserDetails({ role });
  };

  return (
    <div>
      <h2 className="text-xl text-white/90 font-semibold mb-4">What best describes you?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleOptions.map((role) => {
          const isSelected = userDetails.role === role.id;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer h-full p-4 hover:border-purple-600 transition-all ${
                  isSelected
                    ? "bg-indigo-900/10 border-purple-600 ring-1 ring-indigo-700"
                    : "bg-dark-card border-dark-accent hover:bg-dark-accent/20"
                }`}
                onClick={() => handleSelectRole(role.id)}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-purple-600/20 text-purple-600"
                        : "bg-white/10 text-dark-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg text-white/90 font-semibold">{role.name}</h3>
                    <p className="text-sm text-dark-muted">{role.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingStep1;