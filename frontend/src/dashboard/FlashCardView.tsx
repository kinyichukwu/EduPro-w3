import { useState, useEffect } from "react";
import { Progress } from "@/shared/components/ui/progress";
import { Button } from "@/shared/components/ui/button";
import {
  Bookmark,
  Volume2,
  ChevronDown,
  Flame,
  Star,
  Info,
} from "lucide-react";

// Mock data
const mockDecks = [
  { id: 1, name: "Physics", count: 50 },
  { id: 2, name: "Biology", count: 35 },
  { id: 3, name: "Chemistry", count: 42 },
];

const mockCards = [
  {
    id: 1,
    front: "What is Newton's First Law?",
    back: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
    hasAudio: true,
  },
  {
    id: 2,
    front: "What is the formula for kinetic energy?",
    back: "KE = ½mv²\nWhere m is mass and v is velocity.",
    hasAudio: false,
  },
  {
    id: 3,
    front: "What is the SI unit of force?",
    back: "Newton (N)",
    hasAudio: true,
  },
];

export default function FlashcardApp() {
  const [currentDeck, setCurrentDeck] = useState(mockDecks[0]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(20);
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(125);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeckSelector, setShowDeckSelector] = useState(false);

  const currentCard = mockCards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardRating = (rating: "hard" | "okay" | "easy") => {
    // Show appropriate toast message based on rating
    let message = "";
    let xpGain = 0;

    if (rating === "hard") {
      message = "Got it next time—review sooner!";
      xpGain = 5;
    } else if (rating === "okay") {
      message = "Good job! Keep practicing.";
      xpGain = 10;
    } else if (rating === "easy") {
      message = "Mastered! See you in ≈ 20 days.";
      xpGain = 15;
    }

    setXp(xp + xpGain);
    setToastMessage(`+${xpGain} XP • Streak ${streak} days`);
    setShowToast(true);

    // Update progress
    setProgress((prev) => Math.min(prev + 10, 100));

    // Move to next card
    setTimeout(() => {
      setIsFlipped(false);
      setCurrentCardIndex((currentCardIndex + 1) % mockCards.length);
    }, 500);

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-purple-600 to-cyan-400 flex flex-col items-center overflow-hidden relative">
      {/* Background Blur Elements - Creating glassmorphic effect */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/30 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"></div>

      {/* A. Global Header */}
      <div className="w-full bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        {/* Deck Selector */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 transition rounded-full px-4 py-1 text-white"
            onClick={() => setShowDeckSelector(!showDeckSelector)}
          >
            <span>
              {currentDeck.name} • {currentDeck.count}
            </span>
            <ChevronDown size={16} />
          </button>

          {/* Dropdown menu */}
          {showDeckSelector && (
            <div className="absolute top-full mt-2 bg-white/20 backdrop-blur-lg rounded-lg border border-white/20 w-48 overflow-hidden z-20">
              {mockDecks.map((deck) => (
                <button
                  key={deck.id}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 text-white transition"
                  onClick={() => {
                    setCurrentDeck(deck);
                    setShowDeckSelector(false);
                  }}
                >
                  {deck.name} • {deck.count}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Streak & XP */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
            <Flame size={16} className="text-amber-400 mr-1" />
            <span className="text-white text-sm">{streak}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">{xp} XP</span>
            <Progress value={progress} className="w-32 h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-4 relative">
        {/* B. Flashcard Canvas */}
        <div
          className="w-full max-w-lg aspect-video bg-white/20 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 transition-all duration-500 cursor-pointer relative"
          onClick={handleFlip}
        >
          {/* Card content wrapper */}
          <div className="w-full h-full relative">
            {/* Front of card */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${
                isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <h3 className="text-white text-2xl font-semibold text-center">
                {currentCard.front}
              </h3>

              {/* Hint CTA */}
              <button
                className="absolute bottom-4 left-4 text-white/70 hover:text-white text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
              >
                Need a hint?
              </button>
            </div>

            {/* Back of card */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${
                isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <p className="text-white text-lg text-center whitespace-pre-line">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>

        {/* Hint Overlay */}
        {showHint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md rounded-lg p-4 max-w-xs z-10">
            <p className="text-white text-sm">
              Try thinking about the fundamental principles of motion and
              inertia...
            </p>
            <button
              className="mt-2 text-cyan-300 text-xs"
              onClick={() => setShowHint(false)}
            >
              Got it
            </button>
          </div>
        )}

        {/* D. Floating FABs */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {currentCard.hasAudio && (
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
              <Volume2 size={20} />
            </button>
          )}

          <button
            className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center ${
              isBookmarked ? "text-amber-400" : "text-white"
            } hover:bg-white/30 transition`}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
          >
            <Star size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* C. Rating Footer */}
      {isFlipped && (
        <div className="w-full max-w-3xl mx-auto p-4 grid grid-cols-3 gap-4">
          <Button
            className="bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-lg border border-white/20"
            onClick={() => handleCardRating("hard")}
          >
            Hard
          </Button>
          <Button
            className="bg-amber-500/80 hover:bg-amber-500 text-white backdrop-blur-lg border border-white/20"
            onClick={() => handleCardRating("okay")}
          >
            Okay
          </Button>
          <Button
            className="bg-green-500/80 hover:bg-green-500 text-white backdrop-blur-lg border border-white/20"
            onClick={() => handleCardRating("easy")}
          >
            Too Easy
          </Button>
        </div>
      )}

      {/* E. Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-lg rounded-full px-6 py-2 border border-white/20 text-white shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* F. Session Summary (Would appear after specific conditions) */}
      {progress === 100 && (
        <div className="fixed inset-x-0 bottom-0 bg-white/20 backdrop-blur-lg border-t border-white/20 p-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-white text-lg font-semibold mb-2">
              Session Summary
            </h3>
            <div className="flex justify-between text-white">
              <div>Cards reviewed: 10</div>
              <div>Retention: 88%</div>
              <div>New cards: 3</div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-cyan-400 text-white">
              Complete Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
