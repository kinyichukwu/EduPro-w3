import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Deck, Topic } from "./types";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeck: (deck: Omit<Deck, "id">) => void;
}

const topics: Topic[] = [
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

export const CreateDeckModal = ({
  isOpen,
  onClose,
  onCreateDeck,
}: CreateDeckModalProps) => {
  const [step, setStep] = useState<"topic" | "details" | "generation">("topic");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [generationMethod, setGenerationMethod] = useState<
    "manual" | "ai" | "upload"
  >("manual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateDeck = async () => {
    if (!selectedTopic || !deckName.trim()) return;

    if (generationMethod === "ai" && aiPrompt.trim()) {
      setIsGenerating(true);
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsGenerating(false);
    }

    const newDeck: Omit<Deck, "id"> = {
      name: deckName,
      description: description || `${selectedTopic.name} flashcards`,
      topic: selectedTopic.name,
      outstanding: 0,
      new: generationMethod === "ai" ? 15 : 0,
      totalCards: generationMethod === "ai" ? 15 : 0,
      masteredCards: 0,
      averageScore: 0,
      studyTime: 0,
      difficulty,
      color: selectedTopic.color,
    };

    onCreateDeck(newDeck);
    resetForm();
  };

  const resetForm = () => {
    setStep("topic");
    setSelectedTopic(null);
    setDeckName("");
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
                  Create New Deck
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {step === "topic" && "Choose a topic for your flashcards"}
                  {step === "details" && "Add deck details and settings"}
                  {step === "generation" && "Generate your flashcards"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center p-4 bg-dark-background/30">
              <div className="flex items-center space-x-4">
                {["topic", "details", "generation"].map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        step === stepName ||
                          ["topic", "details", "generation"].indexOf(step) >
                            index
                          ? "bg-turbo-purple text-white"
                          : "bg-white/20 text-white/60"
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div
                        className={cn(
                          "w-16 h-0.5 mx-2 transition-colors",
                          ["topic", "details", "generation"].indexOf(step) >
                            index
                            ? "bg-turbo-purple"
                            : "bg-white/20"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-sm:px-4 overflow-y-auto max-h-[60vh]">
              {/* Step 1: Topic Selection */}
              {step === "topic" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Select a Topic
                    </h3>
                    <p className="text-white/60">
                      Choose the subject area for your flashcards
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                          selectedTopic?.id === topic.id
                            ? "border-turbo-purple bg-turbo-purple/20"
                            : "border-white/20 hover:border-white/40 bg-dark-card/60"
                        )}
                      >
                        <div className="text-2xl mb-2">{topic.icon}</div>
                        <div className="font-medium text-sm">{topic.name}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {topic.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Deck Details */}
              {step === "details" && selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Deck Details</h3>
                    <p className="text-white/60">
                      Customize your {selectedTopic.name} deck
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Deck Name
                        </label>
                        <Input
                          value={deckName}
                          onChange={(e) => setDeckName(e.target.value)}
                          placeholder={`${selectedTopic.name} Fundamentals`}
                          className="bg-dark-background/50 border-white/10 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Description
                        </label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brief description of what this deck covers..."
                          rows={3}
                          className="bg-dark-background/50 border-white/10 text-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 ">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Difficulty Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["easy", "medium", "hard"] as const).map(
                            (level) => (
                              <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={cn(
                                  "px-3 h-10 rounded-lg border transition-colors capitalize",
                                  difficulty === level
                                    ? "border-turbo-purple bg-turbo-purple/20 text-turbo-purple"
                                    : "border-white/20 hover:border-white/40 bg-dark-background/50"
                                )}
                              >
                                {level}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="mb-2 w-full h-5"></div>
                        <div className="h-20 px-4 bg-dark-background/50 rounded-lg border border-white/10 flex items-center gap-3 mb-2">
                          <div className="text-xl">{selectedTopic.icon}</div>
                          <div>
                            <div className="font-medium">
                              {selectedTopic.name}
                            </div>
                            <div className="text-sm text-white/60">
                              {selectedTopic.description}
                            </div>
                          </div>
                        </div>
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
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Generate Flashcards
                    </h3>
                    <p className="text-white/60">
                      How would you like to create your flashcards?
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setGenerationMethod("manual")}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        generationMethod === "manual"
                          ? "border-turbo-purple bg-turbo-purple/20"
                          : "border-white/20 hover:border-white/40"
                      )}
                    >
                      <BookOpen
                        size={32}
                        className="mx-auto mb-3 text-turbo-purple"
                      />
                      <div className="font-medium mb-2">Manual Creation</div>
                      <div className="text-sm text-white/60">
                        Create cards one by one manually
                      </div>
                    </button>

                    <button
                      onClick={() => setGenerationMethod("ai")}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        generationMethod === "ai"
                          ? "border-turbo-purple bg-turbo-purple/20"
                          : "border-white/20 hover:border-white/40"
                      )}
                    >
                      <Sparkles
                        size={32}
                        className="mx-auto mb-3 text-turbo-indigo"
                      />
                      <div className="font-medium mb-2">AI Generation</div>
                      <div className="text-sm text-white/60">
                        Let AI create cards from your prompt
                      </div>
                    </button>

                    <button
                      onClick={() => setGenerationMethod("upload")}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        generationMethod === "upload"
                          ? "border-turbo-purple bg-turbo-purple/20"
                          : "border-white/20 hover:border-white/40"
                      )}
                    >
                      <div className="text-2xl mx-auto mb-3">📄</div>
                      <div className="font-medium mb-2">Upload Content</div>
                      <div className="text-sm text-white/60">
                        Upload documents to generate cards
                      </div>
                    </button>
                  </div>

                  {generationMethod === "ai" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          AI Prompt
                        </label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder={`Create flashcards about ${selectedTopic?.name.toLowerCase()} covering basic concepts, formulas, and key terms...`}
                          rows={4}
                          className="bg-dark-background/50 border-white/20 text-white resize-none"
                        />
                      </div>
                      <div className="text-sm text-white/60">
                        💡 Tip: Be specific about topics, difficulty level, and
                        number of cards you want
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 max-sm:p-4 border-t border-white/10">
              <div className="flex gap-3">
                {step !== "topic" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === "details") setStep("topic");
                      if (step === "generation") setStep("details");
                    }}
                    className="border-white/20 text-white/70 hover:bg-white/10"
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/20 text-white/70 hover:bg-white/10"
                >
                  Cancel
                </Button>

                {step === "topic" && (
                  <Button
                    onClick={() => setStep("details")}
                    disabled={!selectedTopic}
                    className="bg-turbo-purple hover:bg-turbo-purple/80"
                  >
                    Next
                  </Button>
                )}

                {step === "details" && (
                  <Button
                    onClick={() => setStep("generation")}
                    disabled={!deckName.trim()}
                    className="bg-turbo-purple hover:bg-turbo-purple/80"
                  >
                    Next
                  </Button>
                )}

                {step === "generation" && (
                  <Button
                    onClick={handleCreateDeck}
                    disabled={
                      isGenerating ||
                      (generationMethod === "ai" && !aiPrompt.trim())
                    }
                    className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      "Create Deck"
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
