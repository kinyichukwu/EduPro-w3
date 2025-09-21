import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, BookOpen, Sparkles, Edit3, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onCreateModule: (module: {
    title: string;
    description: string;
    useAI: boolean;
    aiPrompt?: string;
    content?: string;
  }) => void;
}

export const CreateModuleModal = ({
  isOpen,
  onClose,
  courseId,
  onCreateModule,
}: CreateModuleModalProps) => {
  const [moduleTitle, setModuleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai">(
    "manual"
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleCreateModule = async () => {
    if (!moduleTitle.trim() || !description.trim()) return;

    setIsCreating(true);

    try {
      // If AI assisted, generate content first
      let moduleContent = "";
      if (creationMethod === "ai") {
        try {
          const contentResponse = await apiService.generateModuleContent(
            courseId,
            {
              prompt:
                aiPrompt.trim() ||
                `Generate comprehensive content for module: ${moduleTitle}. Description: ${description}`,
            }
          );

          if (contentResponse.error) {
            throw new Error(contentResponse.error);
          }

          moduleContent = contentResponse.data!.content;
        } catch (error) {
          console.error("Failed to generate AI content:", error);
          toast.error(
            "Failed to generate AI content, creating module without it"
          );
        }
      }

      onCreateModule({
        title: moduleTitle,
        description: description,
        useAI: creationMethod === "ai",
        aiPrompt: creationMethod === "ai" ? aiPrompt : undefined,
        content: moduleContent, // Pass the generated content
      });

      resetForm();
    } catch (error) {
      console.error("Failed to create module:", error);
      toast.error("Failed to create module");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      // Generate smart suggestion based on course context - no prompt needed
      const response = await apiService.generateModuleTitle(courseId, {
        prompt:
          "Generate the next logical module for this course based on existing modules and course structure",
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Parse the response to extract title and description
      const content = response.data!.content;
      const lines = content.split("\n").filter((line) => line.trim());

      // Assume first line is title, rest is description
      if (lines.length > 0) {
        setModuleTitle(lines[0].replace(/^(Title:|Module:)\s*/i, "").trim());
        if (lines.length > 1) {
          setDescription(
            lines
              .slice(1)
              .join(" ")
              .replace(/^(Description:)\s*/i, "")
              .trim()
          );
        }
      }

      toast.success("Module suggestion generated!");
    } catch (error) {
      toast.error("Failed to generate suggestion");
      console.error("AI generation error:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const resetForm = () => {
    setModuleTitle("");
    setDescription("");
    setCreationMethod("manual");
    setAiPrompt("");
    setIsCreating(false);
    setIsGeneratingAI(false);
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
            className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 max-sm:p-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">
                  Add New Module
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Create a new module for your course
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

            {/* Content */}
            <div className="p-6 max-sm:px-4 space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white">
                      Module Title *
                    </label>
                    <Button
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      size="sm"
                      variant="ghost"
                      className="text-turbo-purple hover:text-turbo-purple/80 hover:bg-turbo-purple/10 text-xs"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      {isGeneratingAI ? "Generating..." : "AI Suggest"}
                    </Button>
                  </div>
                  <Input
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g., Introduction to Components"
                    className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Module Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this module will cover and what students will learn"
                    rows={3}
                    className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  />
                </div>

                {/* Creation Method */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    How would you like to create this module?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setCreationMethod("manual")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        creationMethod === "manual"
                          ? "border-turbo-purple bg-turbo-purple/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-turbo-purple">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-white">
                          Manual Creation
                        </h3>
                      </div>
                      <p className="text-sm text-white/60">
                        Create an empty module and add content yourself
                      </p>
                    </button>

                    <button
                      onClick={() => setCreationMethod("ai")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        creationMethod === "ai"
                          ? "border-turbo-purple bg-turbo-purple/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-turbo-purple">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-white">AI Assisted</h3>
                      </div>
                      <p className="text-sm text-white/60">
                        Let AI help generate initial content for this module
                      </p>
                    </button>
                  </div>
                </div>

                {/* AI Content Requirements */}
                {creationMethod === "ai" && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Content Requirements{" "}
                      <span className="text-white/60">(Optional)</span>
                    </label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Any specific topics, examples, or requirements for the module content? Leave blank for AI to decide based on course context..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple/20"
                      rows={3}
                    />
                  </div>
                )}

                {/* Next Steps Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      {creationMethod === "manual"
                        ? "Module will be created as a draft"
                        : "AI will generate initial content based on your description"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      You can edit and add content using our rich text editor
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      Add links and resources to enhance learning
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      Mark as complete when ready for students
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between max-sm:p-4 p-6 border-t border-white/10">
              <div className="text-sm text-white/60">
                {creationMethod === "ai" && "AI generation included"}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreateModule}
                  disabled={
                    isCreating || !moduleTitle.trim() || !description.trim()
                  }
                  className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {creationMethod === "ai" ? (
                        <Sparkles className="w-4 h-4 mr-2" />
                      ) : (
                        <BookOpen className="w-4 h-4 mr-2" />
                      )}
                      Create Module
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
