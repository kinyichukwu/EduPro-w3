import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, Sparkles, BookOpen, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Course {
  id: number;
  title: string;
  chapters: number;
  items: number;
  progress: number;
  color: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  lastStudied?: Date;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: Omit<Course, "id">) => void;
}

const subjects: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    icon: "⚛️",
    color: "#8b5cf6",
    description: "Classical mechanics, quantum physics, thermodynamics",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "🧪",
    color: "#06b6d4",
    description: "Organic, inorganic, analytical chemistry",
  },
  {
    id: "biology",
    name: "Biology",
    icon: "🧬",
    color: "#10b981",
    description: "Anatomy, genetics, ecology, cell biology",
  },
  {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    color: "#f59e0b",
    description: "Algebra, calculus, statistics, geometry",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    icon: "💻",
    color: "#ef4444",
    description: "Programming, algorithms, data structures",
  },
  {
    id: "history",
    name: "History",
    icon: "🏛️",
    color: "#8b5cf6",
    description: "World history, ancient civilizations",
  },
  {
    id: "language",
    name: "Languages",
    icon: "🌍",
    color: "#34d399",
    description: "Vocabulary, grammar, phrases",
  },
  {
    id: "literature",
    name: "Literature",
    icon: "📚",
    color: "#a855f7",
    description: "Classic works, poetry, analysis",
  },
  {
    id: "geography",
    name: "Geography",
    icon: "🗺️",
    color: "#0ea5e9",
    description: "Countries, capitals, landmarks",
  },
  {
    id: "art",
    name: "Art & Design",
    icon: "🎨",
    color: "#ec4899",
    description: "Art history, techniques, famous works",
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    color: "#f97316",
    description: "Theory, composers, instruments",
  },
  {
    id: "medicine",
    name: "Medicine",
    icon: "⚕️",
    color: "#dc2626",
    description: "Anatomy, diseases, treatments",
  },
];

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) => {
  const [step, setStep] = useState<"subject" | "details" | "generation">(
    "subject"
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [generationMethod, setGenerationMethod] = useState<
    "manual" | "ai" | "upload"
  >("manual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateCourse = async () => {
    if (!selectedSubject || !courseTitle.trim()) return;

    if (generationMethod === "ai" && aiPrompt.trim()) {
      setIsGenerating(true);
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsGenerating(false);
    }

    const newCourse: Omit<Course, "id"> = {
      title: courseTitle,
      description: description || `${selectedSubject.name} course`,
      chapters:
        generationMethod === "ai" ? Math.floor(Math.random() * 8) + 3 : 5,
      items:
        generationMethod === "ai" ? Math.floor(Math.random() * 30) + 15 : 20,
      progress: 0,
      difficulty,
      color: selectedSubject.color,
    };

    onCreateCourse(newCourse);
    resetForm();
  };

  const resetForm = () => {
    setStep("subject");
    setSelectedSubject(null);
    setCourseTitle("");
    setDescription("");
    setDifficulty("medium");
    setGenerationMethod("manual");
    setAiPrompt("");
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 max-sm:p-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">
                  Create New Course
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {step === "subject" && "Choose a subject for your course"}
                  {step === "details" && "Add course details and settings"}
                  {step === "generation" && "Generate your course content"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 max-sm:px-4 py-4 border-b border-white/5">
              <div className="flex justify-center items-center gap-2">
                {["subject", "details", "generation"].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                        step === s ||
                          index <
                            ["subject", "details", "generation"].indexOf(step)
                          ? "bg-turbo-purple text-white"
                          : "bg-white/10 text-white/40"
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div
                        className={cn(
                          "w-12 h-0.5 mx-2 transition-all",
                          index <
                            ["subject", "details", "generation"].indexOf(step)
                            ? "bg-turbo-purple"
                            : "bg-white/10"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-sm:px-4 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Subject Selection */}
              {step === "subject" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                      <motion.button
                        key={subject.id}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all group text-left",
                          selectedSubject?.id === subject.id
                            ? "border-turbo-purple bg-turbo-purple/10"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                        onClick={() => setSelectedSubject(subject)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl mb-2">{subject.icon}</div>
                        <h3 className="font-medium text-white text-sm mb-1">
                          {subject.name}
                        </h3>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {subject.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Course Details */}
              {step === "details" && selectedSubject && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl">{selectedSubject.icon}</div>
                    <div>
                      <h3 className="font-medium text-white">
                        {selectedSubject.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {selectedSubject.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Course Title *
                      </label>
                      <Input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder={`e.g., Introduction to ${selectedSubject.name}`}
                        className="bg-white/5 border-white/20 text-white placeholder-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Description
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this course will cover..."
                        rows={3}
                        className="bg-white/5 border-white/20 text-white placeholder-white/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["easy", "medium", "hard"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize",
                              difficulty === level
                                ? "border-turbo-purple bg-turbo-purple/10 text-turbo-purple"
                                : "border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Generation Method */}
              {step === "generation" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: "manual",
                        title: "Manual Setup",
                        description:
                          "Create an empty course and add content manually",
                        icon: <BookOpen className="w-5 h-5" />,
                      },
                      {
                        id: "ai",
                        title: "AI Generated",
                        description:
                          "Let AI generate course content based on your prompt",
                        icon: <Sparkles className="w-5 h-5" />,
                      },
                      {
                        id: "upload",
                        title: "Upload Content",
                        description:
                          "Upload your own materials to create the course",
                        icon: <Plus className="w-5 h-5" />,
                      },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setGenerationMethod(method.id as any)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          generationMethod === method.id
                            ? "border-turbo-purple bg-turbo-purple/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-turbo-purple">{method.icon}</div>
                          <h3 className="font-medium text-white">
                            {method.title}
                          </h3>
                        </div>
                        <p className="text-sm text-white/60">
                          {method.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {generationMethod === "ai" && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        AI Prompt
                      </label>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe the specific topics you want the AI to include in your course..."
                        rows={4}
                        className="bg-white/5 border-white/20 text-white placeholder-white/40"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between max-sm:p-4 p-6 border-t border-white/10">
              <div className="flex gap-3">
                {step !== "subject" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (step === "details") setStep("subject");
                      if (step === "generation") setStep("details");
                    }}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>

                {step !== "generation" ? (
                  <Button
                    onClick={() => {
                      if (step === "subject" && selectedSubject)
                        setStep("details");
                      if (step === "details" && courseTitle.trim())
                        setStep("generation");
                    }}
                    disabled={
                      (step === "subject" && !selectedSubject) ||
                      (step === "details" && !courseTitle.trim())
                    }
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateCourse}
                    disabled={isGenerating || !courseTitle.trim()}
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
