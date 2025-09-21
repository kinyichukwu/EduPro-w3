import { FC, useState } from "react";
import { motion } from "framer-motion";
import { Decks } from "./Decks";
import { CreateDeckModal } from "./CreateDeckModal";
import { useFlashcardManager } from "@/shared/hooks/useFlashcards";
import type { CreateDeckRequest } from "@/services/flashcard";
import { Loader2, BookOpen, Target, TrendingUp, Clock } from "lucide-react";

export const Flashcards: FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use the manager hook that contains all business logic
  const {
    decks,
    calculatedStats,
    decksLoading,
    statsLoading,
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

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-turbo-purple/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-turbo-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {decksLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  calculatedStats.totalDecks
                )}
              </p>
              <p className="text-sm text-white/60">Active Decks</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-turbo-indigo/20 rounded-lg">
              <Target className="w-5 h-5 text-turbo-indigo" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {decksLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  calculatedStats.totalCards
                )}
              </p>
              <p className="text-sm text-white/60">Total Cards</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {decksLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `${calculatedStats.averageScore}%`
                )}
              </p>
              <p className="text-sm text-white/60">Avg Score</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {decksLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `${calculatedStats.totalStudyTime}h`
                )}
              </p>
              <p className="text-sm text-white/60">Study Time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Decks Section */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 max-sm:px-3 p-6">
        {decksError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load decks
            </h3>
            <p className="text-white/60 mb-6">
              {decksError instanceof Error ? decksError.message : "Something went wrong"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : decksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-white/10"></div>
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-8 bg-white/10 rounded"></div>
                    <div className="h-8 bg-white/10 rounded"></div>
                    <div className="h-8 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Decks
            decks={decks}
            onCreateDeck={() => setShowCreateModal(true)}
            onDeleteDeck={onDeleteDeck}
          />
        )}
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
