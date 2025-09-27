import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, BookOpen, DollarSign } from "lucide-react";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: { title: string; description: string; price?: number }) => void;
}

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [price, setPrice] = useState("");

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !description.trim()) return;

    setIsCreating(true);

    // Simulate course creation process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onCreateCourse({
      title: courseTitle,
      description: description,
      price: price ? parseFloat(price) : undefined,
    });

    resetForm();
    setIsCreating(false);
  };

  const resetForm = () => {
    setCourseTitle("");
    setDescription("");
    setPrice("");
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
            className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 max-sm:p-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">
                  Create New Course
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Start building your course and earn from teaching
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
            <div className="p-6 max-sm:px-4 space-y-6 overflow-y-auto flex-1">
              {/* Course Creation Fee Notice */}
              <div className="bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border border-turbo-purple/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-turbo-purple/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-turbo-purple" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      Course Creation Fee
                    </h3>
                    <p className="text-sm text-white/60">
                      A small fee of $10 is required to create a course. Start
                      earning from your first student!
                    </p>
                  </div>
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
                    placeholder="e.g., Introduction to Web Development"
                    className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Course Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course. What topics will you cover? What skills will they gain?"
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Course Price (EDU)
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers
                      if (value === "" || parseFloat(value) >= 0) {
                        setPrice(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent typing negative sign
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    pattern="^$|^\\d+(\\.\\d+)?$"
                    min={0}
                    step={0.000000001}
                    placeholder="e.g., 25.5"
                    className="bg-white/5 border-white/20 text-white placeholder-white/40 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ appearance: 'none' }}
                  />
                  <p className="mt-1 text-xs text-white/50">
                    Platform earns 3–7% per sale. You can change price later.
                  </p>
                </div>

                {/* Course Benefits */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      You'll be taken to your courses page
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      Click on your course to start creating modules
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      Use AI assistance or create content manually
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-turbo-purple">•</span>
                      Publish when ready and start earning
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between max-sm:p-4 p-6 border-t border-white/10">
              <div className="text-sm text-white/60">
                Course creation fee:{" "}
                <span className="text-white font-medium">$10</span>
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
                  onClick={handleCreateCourse}
                  disabled={
                    isCreating || !courseTitle.trim() || !description.trim()
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
                      <DollarSign className="w-4 h-4 mr-2" />
                      Create Course ($10)
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
