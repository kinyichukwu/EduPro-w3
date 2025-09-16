import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Volume2,
  Flame,
  Star,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Shuffle,
  Target,
  BookOpen,
  Settings,
  Award,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import {
  useFlashcardStudy,
  type StudyMode,
} from "@/shared/hooks/useFlashcardStudy";

export default function EnhancedFlashcardApp() {
  const {
    // Data
    currentDeck,
    currentCard,
    currentCardIndex,
    studyCards,

    // UI State
    showHint,
    isBookmarked,
    showAnswer,
    showToast,
    toastMessage,

    // Study State
    studyMode,
    sessionStartTime,
    sessionStats,
    currentStreak,

    // Loading States
    loading,
    error,

    // Actions
    setStudyMode,
    handleFlip,
    handleCardRating,
    handleDeleteCard,
    setIsBookmarked,
    setShowHint,
  } = useFlashcardStudy();

  // Local UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const getStudyModeIcon = (mode: StudyMode) => {
    switch (mode) {
      case "random":
        return <Shuffle className="w-4 h-4" />;
      case "difficult":
        return <Target className="w-4 h-4" />;
      case "review":
        return <RotateCcw className="w-4 h-4" />;
      case "new":
        return <Plus className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStudyModeColor = (mode: StudyMode) => {
    switch (mode) {
      case "random":
        return "text-purple-400 bg-purple-400/20";
      case "difficult":
        return "text-red-400 bg-red-400/20";
      case "review":
        return "text-amber-400 bg-amber-400/20";
      case "new":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-turbo-indigo bg-turbo-indigo/20";
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    // TODO: Implement AI generation
    setTimeout(() => {
      setIsGeneratingAI(false);
    }, 2500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-white/60">Loading flashcards...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // No cards state
  if (!currentCard) {
    return (
      <div className="h-full w-full bg-dark-background text-dark-text flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-turbo-purple mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No cards available</h2>
          <p className="text-white/60 mb-6">
            {studyMode === "review" && "No cards are due for review right now."}
            {studyMode === "difficult" && "No difficult cards found."}
            {studyMode === "new" && "No new cards available."}
            {(studyMode === "sequential" || studyMode === "random") &&
              "This deck appears to be empty."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
            >
              {isGeneratingAI ? (
                <RotateCcw size={16} className="mr-2 animate-spin" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              {isGeneratingAI ? "Generating..." : "AI Generate Cards"}
            </Button>
            <Link to="/dashboard/flashcards">
              <Button
                variant="outline"
                className="border-white/20 text-white/70"
              >
                Back to Decks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-dark-background text-dark-text flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-mesh-gradient opacity-40 animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-turbo-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-turbo-indigo/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Enhanced Header */}
      <div className="w-full bg-dark-card/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10 px-4 py-3">
        <div className="flex gap-y-1 max-sm:flex-col items-center justify-between mb-3">
          {/* Left Section */}
          <div className="w-full flex items-center gap-4">
            <Link
              to="/dashboard/flashcards"
              className="flex items-center gap-2 text-white/70 hover:text-turbo-purple transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Decks</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">
                {currentDeck?.name || "Loading..."}
              </h1>
              <span
                className={cn(
                  "max-sm:hidden px-2 py-1 flex rounded-full text-xs font-medium",
                  getStudyModeColor(studyMode)
                )}
              >
                {getStudyModeIcon(studyMode)}
                <span className="ml-1 capitalize">{studyMode}</span>
              </span>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex max-sm:justify-between max-sm:w-full items-center gap-3">
            <span
              className={cn(
                "sm:hidden px-2 py-1 mr-auto flex rounded-full text-xs font-medium",
                getStudyModeColor(studyMode)
              )}
            >
              {getStudyModeIcon(studyMode)}
              <span className="ml-1 capitalize">{studyMode}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="flex gap-2 items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="text-white/60">
              Card {currentCardIndex + 1} of {studyCards.length}
            </div>
            <div className="w-24 sn:w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-turbo-purple to-turbo-indigo transition-all duration-300"
                style={{
                  width: `${
                    ((currentCardIndex + 1) / studyCards.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Flame size={16} className="text-amber-400" />
              <span className="text-white">{currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Award size={16} className="text-green-400" />
              <span className="text-white">
                {sessionStats.correctAnswers}/{sessionStats.cardsStudied}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock size={16} className="text-turbo-indigo" />
              <span className="text-white">
                {sessionStartTime
                  ? Math.floor(
                      (Date.now() - sessionStartTime.getTime()) / 60000
                    )
                  : 0}
                m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Card Info */}
        <div className="mb-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Target size={14} />
            <span>Difficulty: {currentCard.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} />
            <span>
              Accuracy:{" "}
              {Math.round(
                (sessionStats.correctAnswers /
                  Math.max(sessionStats.cardsStudied, 1)) *
                  100
              )}
              %
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw size={14} />
            <span>Reviewed {currentCard.times_reviewed} times</span>
          </div>
        </div>

        {/* Enhanced Flashcard */}
        <motion.div
          key={currentCardIndex}
          initial={{ opacity: 0, x: 100, rotateY: 0 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="w-full max-w-2xl sm:aspect-[4/3] min-h-[350px] relative cursor-pointer"
          onClick={handleFlip}
        >
          <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col p-5 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-turbo-purple font-medium">
                      Question
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlip();
                      }}
                      className="text-white/60 hover:text-turbo-purple"
                    >
                      <Eye size={16} />
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-white text-center leading-relaxed">
                      {currentCard.front}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      className="text-sm text-white/60 hover:text-turbo-purple transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                    >
                      Need a hint?
                    </button>

                    <div className="text-sm text-white/60">
                      Click to reveal answer
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute inset-0 flex flex-col p-5 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-green-400 font-medium">
                      Answer
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlip();
                      }}
                      className="text-white/60 hover:text-turbo-purple"
                    >
                      <EyeOff size={16} />
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <div className="text-lg text-white leading-relaxed whitespace-pre-line text-center">
                      {currentCard.back}
                    </div>
                  </div>

                  <div className="text-center text-sm text-white/60">
                    Rate your understanding
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Floating Action Buttons */}
        <div className="absolute top-4 sm:top-8 right-3 sm:right-8 flex flex-col gap-2 sm:gap-3">
          {currentCard.hasAudio && (
            <Button
              size="icon"
              className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-dark-card/80 backdrop-blur-lg border border-white/20 hover:bg-dark-card/90 hover:border-turbo-purple/30"
            >
              <Volume2 className="w-4 sm:w-5" />
            </Button>
          )}

          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={cn(
              "w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-dark-card/80 backdrop-blur-lg border border-white/20 hover:bg-dark-card/90",
              isBookmarked
                ? "text-amber-400 border-amber-400/30"
                : "hover:border-turbo-purple/30"
            )}
          >
            <Star
              className="w-4 sm:w-5"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </Button>

          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCard();
            }}
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-dark-card/80 backdrop-blur-lg border border-white/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
          >
            <Trash2 className="w-4 sm:w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            className="border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10 max-sm:text-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Card
          </Button>

          <Button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 max-sm:text-sm"
          >
            {isGeneratingAI ? (
              <RotateCcw size={16} className="mr-2 animate-spin" />
            ) : (
              <Sparkles size={16} className="mr-2" />
            )}
            {isGeneratingAI ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </div>

      {/* Rating Footer - Enhanced */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full p-6 bg-dark-card/90 backdrop-blur-lg border-t border-white/10"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <p className="text-white/80 font-medium">
                  How well did you know this?
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Your answer affects when you'll see this card again
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  size="lg"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 backdrop-blur-lg h-16"
                  onClick={() => handleCardRating("hard")}
                >
                  <div className="text-center">
                    <div className="font-medium">Hard</div>
                    <div className="text-xs opacity-80">See again soon</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 backdrop-blur-lg h-16"
                  onClick={() => handleCardRating("okay")}
                >
                  <div className="text-center">
                    <div className="font-medium">Good</div>
                    <div className="text-xs opacity-80">Normal interval</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 backdrop-blur-lg h-16"
                  onClick={() => handleCardRating("easy")}
                >
                  <div className="text-center">
                    <div className="font-medium">Easy</div>
                    <div className="text-xs opacity-80">Longer interval</div>
                  </div>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Mode Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold gradient-text mb-4">
                Study Mode
              </h3>

              <div className="space-y-3">
                {(
                  [
                    "sequential",
                    "random",
                    "difficult",
                    "review",
                    "new",
                  ] as StudyMode[]
                ).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setStudyMode(mode);
                      setShowSettings(false);
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      studyMode === mode
                        ? "border-turbo-purple bg-turbo-purple/20"
                        : "border-white/20 hover:border-white/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getStudyModeIcon(mode)}
                      <div>
                        <div className="font-medium capitalize">{mode}</div>
                        <div className="text-sm text-white/60">
                          {mode === "sequential" && "Study cards in order"}
                          {mode === "random" && "Randomized card order"}
                          {mode === "difficult" && "Focus on challenging cards"}
                          {mode === "review" && "Cards due for review"}
                          {mode === "new" && "New cards only"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-dark-card/90 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 text-white shadow-lg z-50 max-w-md text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
