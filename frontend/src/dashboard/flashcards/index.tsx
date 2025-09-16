import { FC, useState } from "react";
import { Decks } from "./Decks";
import { CreateDeckModal } from "./CreateDeckModal";
import { useFlashcardManager } from "@/shared/hooks/useFlashcards";
import type { CreateDeckRequest } from "@/services/flashcard";

export const Flashcards: FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use the manager hook that contains all business logic
  const {
    decks,
    calculatedStats,
    decksLoading,
    decksError,
    handleCreateDeck,
    handleDeleteDeck,
  } = useFlashcardManager();

  // Pure UI event handlers
  const onCreateDeck = async (newDeck: CreateDeckRequest) => {
    const result = await handleCreateDeck(newDeck);
    if (result.success) {
      setShowCreateModal(false);
    }
    // TODO: Show error toast if result.success is false
  };

  const onDeleteDeck = async (id: string) => {
    const result = await handleDeleteDeck(id);
    // TODO: Show success/error toast based on result
  };

  // Show loading state
  if (decksLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-white/60">Loading flashcards...</div>
      </div>
    );
  }

  // Show error state
  if (decksError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-400">
          Error loading flashcards: {decksError}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-purple">
            {calculatedStats.totalDecks}
          </div>
          <div className="text-sm text-white/60">Active Decks</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-turbo-indigo">
            {calculatedStats.totalCards}
          </div>
          <div className="text-sm text-white/60">Total Cards</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {calculatedStats.averageScore}%
          </div>
          <div className="text-sm text-white/60">Avg Score</div>
        </div>
        <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {calculatedStats.totalStudyTime}h
          </div>
          <div className="text-sm text-white/60">Study Time</div>
        </div>
      </div>

      {/* Main Decks Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-3 p-6">
        <Decks
          decks={decks}
          onCreateDeck={() => setShowCreateModal(true)}
          onDeleteDeck={onDeleteDeck}
        />
      </section>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDeck={onCreateDeck}
      />
    </div>
  );
};
