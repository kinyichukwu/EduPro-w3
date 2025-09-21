import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, BookOpen, Sparkles, Edit3 } from "lucide-react";

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateModule: (module: { title: string; description: string }) => void;
}

export const CreateModuleModal = ({
  isOpen,
  onClose,
  onCreateModule,
}: CreateModuleModalProps) => {
  const [moduleTitle, setModuleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai">(
    "manual"
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateModule = async () => {
    if (!moduleTitle.trim() || !description.trim()) return;

    setIsCreating(true);

    // Simulate module creation process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onCreateModule({
      title: moduleTitle,
      description: description,
    });

    resetForm();
    setIsCreating(false);
  };

  const resetForm = () => {
    setModuleTitle("");
    setDescription("");
    setCreationMethod("manual");
    setIsCreating(false);
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
            className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20"
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
                  <label className="block text-sm font-medium text-white mb-2">
                    Module Title *
                  </label>
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
