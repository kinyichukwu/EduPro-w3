import { FC, useState } from "react";
import { Decks } from "./Decks";
import { CreateDeckModal } from "./CreateDeckModal";
import { Deck } from "./types";

export const Flashcards: FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: 1,
      name: "Physics Fundamentals",
      outstanding: 12,
      new: 3,
      description: "Classical mechanics and thermodynamics",
      topic: "Physics",
      totalCards: 45,
      masteredCards: 30,
      lastStudied: new Date("2024-01-15"),
      averageScore: 85,
      studyTime: 120,
      difficulty: "medium",
      color: "#8b5cf6",
    },
    {
      id: 2,
      name: "Organic Chemistry",
      outstanding: 8,
      new: 5,
      description: "Functional groups and reactions",
      topic: "Chemistry",
      totalCards: 32,
      masteredCards: 19,
      lastStudied: new Date("2024-01-14"),
      averageScore: 78,
      studyTime: 95,
      difficulty: "hard",
      color: "#06b6d4",
    },
    {
      id: 3,
      name: "Spanish Vocabulary",
      outstanding: 6,
      new: 12,
      description: "Common words and phrases",
      topic: "Language",
      totalCards: 150,
      masteredCards: 132,
      lastStudied: new Date("2024-01-16"),
      averageScore: 92,
      studyTime: 200,
      difficulty: "easy",
      color: "#34d399",
    },
    {
      id: 4,
      name: "World History",
      outstanding: 15,
      new: 2,
      description: "Major historical events and dates",
      topic: "History",
      totalCards: 68,
      masteredCards: 51,
      lastStudied: new Date("2024-01-13"),
      averageScore: 88,
      studyTime: 180,
      difficulty: "medium",
      color: "#f59e0b",
    },
    {
      id: 5,
      name: "Data Structures",
      outstanding: 4,
      new: 8,
      description: "Arrays, trees, graphs, and algorithms",
      topic: "Computer Science",
      totalCards: 55,
      masteredCards: 43,
      lastStudied: new Date("2024-01-12"),
      averageScore: 82,
      studyTime: 160,
      difficulty: "hard",
      color: "#ef4444",
    },
    {
      id: 6,
      name: "Human Anatomy",
      outstanding: 10,
      new: 6,
      description: "Body systems and medical terminology",
      topic: "Biology",
      totalCards: 78,
      masteredCards: 62,
      lastStudied: new Date("2024-01-11"),
      averageScore: 90,
      studyTime: 220,
      difficulty: "medium",
      color: "#8b5cf6",
    },
  ]);

  const handleCreateDeck = (newDeck: Omit<Deck, "id">) => {
    const deck: Deck = {
      ...newDeck,
      id: Math.max(...decks.map((d) => d.id)) + 1,
    };
    setDecks([...decks, deck]);
    setShowCreateModal(false);
  };

  const handleDeleteDeck = (id: number) => {
    setDecks(decks.filter((d) => d.id !== id));
  };

  // Calculate overall stats
  const totalCards = decks.reduce((sum, deck) => sum + deck.totalCards, 0);
  const averageScore = Math.round(
    decks.reduce((sum, deck) => sum + deck.averageScore, 0) / decks.length
  );
  const totalStudyTime = decks.reduce((sum, deck) => sum + deck.studyTime, 0);

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-purple">
            {decks.length}
          </div>
          <div className="text-sm text-white/60">Active Decks</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-indigo">
            {totalCards}
          </div>
          <div className="text-sm text-white/60">Total Cards</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {averageScore}%
          </div>
          <div className="text-sm text-white/60">Avg Score</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {Math.round(totalStudyTime / 60)}h
          </div>
          <div className="text-sm text-white/60">Study Time</div>
        </div>
      </div>

      {/* Main Decks Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-3 p-6">
        <Decks
          decks={decks}
          onCreateDeck={() => setShowCreateModal(true)}
          onDeleteDeck={handleDeleteDeck}
        />
      </section>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDeck={handleCreateDeck}
      />
    </div>
  );
};
