import { cn } from "@/shared/lib/utils";
import { FC, ReactNode, MouseEvent } from "react";
import { Deck } from "./types";
import {
  Pencil,
  Trash,
  Plus,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

interface DecksProps {
  children?: ReactNode;
  className?: string;
  decks: Deck[];
  onCreateDeck: () => void;
  onDeleteDeck: (id: number) => void;
}

export const Decks: FC<DecksProps> = ({
  className,
  decks,
  onCreateDeck,
  onDeleteDeck,
}) => {
  const handleAction = (
    e: MouseEvent<HTMLButtonElement>,
    action: string,
    deckId: number
  ) => {
    e.preventDefault();

    if (action === "Delete") {
      if (window.confirm("Are you sure you want to delete this deck?")) {
        onDeleteDeck(deckId);
      }
    } else if (action === "Rename") {
      // TODO: Implement rename functionality
      console.log("Rename deck", deckId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/20";
      case "medium":
        return "text-amber-400 bg-amber-400/20";
      case "hard":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  const formatLastStudied = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)}>
      <div className="flex max-md:flex-col gap-y-5 lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Your Flashcard Decks
          </h1>
          <p className="text-white/60 mt-1">
            Master your subjects with spaced repetition
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCreateDeck}
            className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deck
          </Button>

          <Button
            variant="outline"
            className="min-w-max w-full border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Desktop: Fixed 3-column grid */}
      <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Link
            key={deck.id}
            to={`/dashboard/flashcards/${deck.id}`}
            className="group bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-dark-card/80 hover:border-turbo-purple/30 transition-all duration-300 p-6 flex flex-col hover:scale-[1.02] hover:shadow-xl hover:shadow-turbo-purple/10"
          >
            {/* Deck Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: deck.color }}
                  />
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    {deck.topic}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-turbo-purple transition-colors leading-tight">
                  {deck.name}
                </h3>
                <p className="text-sm text-white/60 mt-1 line-clamp-2">
                  {deck.description}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <Button
                  onClick={(e) => handleAction(e, "Rename", deck.id)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 p-1.5 bg-white/10 hover:bg-white/20"
                >
                  <Pencil className="w-3 h-3 text-white/50" />
                </Button>
                <Button
                  onClick={(e) => handleAction(e, "Delete", deck.id)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 p-1.5 bg-white/10 hover:bg-red-500/20"
                >
                  <Trash className="w-3 h-3 text-white/50 hover:text-red-400" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Progress</span>
                <span className="text-xs font-medium text-white">
                  {Math.round((deck.masteredCards / deck.totalCards) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-turbo-purple to-turbo-indigo h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(deck.masteredCards / deck.totalCards) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dark-background/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 text-turbo-purple" />
                  <span className="text-xs text-white/60">Cards</span>
                </div>
                <div className="text-sm font-medium text-white">
                  {deck.masteredCards}/{deck.totalCards}
                </div>
              </div>

              <div className="bg-dark-background/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-white/60">Score</span>
                </div>
                <div className="text-sm font-medium text-white">
                  {deck.averageScore}%
                </div>
              </div>
            </div>

            {/* Study Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="w-3 h-3" />
                  Study time
                </div>
                <span className="text-white font-medium">
                  {Math.round(deck.studyTime / 60)}h {deck.studyTime % 60}m
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-3 h-3" />
                  Last studied
                </div>
                <span className="text-white font-medium">
                  {formatLastStudied(deck.lastStudied)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div className="flex gap-2">
                {deck.outstanding > 0 && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    {deck.outstanding} due
                  </span>
                )}
                {deck.new > 0 && (
                  <span className="px-2 py-1 bg-turbo-indigo/20 text-turbo-indigo rounded-full text-xs font-medium">
                    {deck.new} new
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium capitalize",
                  getDifficultyColor(deck.difficulty)
                )}
              >
                {deck.difficulty}
              </span>
            </div>
          </Link>
        ))}

        {/* Create Deck Card - Desktop */}
        <button
          onClick={onCreateDeck}
          className="bg-dark-card/30 backdrop-blur-lg border-2 border-dashed border-white/20 rounded-2xl hover:border-turbo-purple/50 transition-all duration-300 p-6 flex flex-col items-center justify-center cursor-pointer group min-h-[320px]"
        >
          <div className="w-16 h-16 rounded-full bg-turbo-purple/20 flex items-center justify-center mb-4 group-hover:bg-turbo-purple/30 transition-colors">
            <Plus className="w-8 h-8 text-turbo-purple" />
          </div>
          <h3 className="font-semibold text-lg text-white/80 group-hover:text-turbo-purple transition-colors mb-2">
            Create New Deck
          </h3>
          <p className="text-sm text-white/60 text-center">
            Start learning with a new set of flashcards
          </p>
        </button>
      </div>

      {/* Mobile/Tablet: List Layout */}
      <div className="md:hidden space-y-3">
        {decks.map((deck) => (
          <Link
            key={deck.id}
            to={`/dashboard/flashcards/${deck.id}`}
            className={cn(
              "flex items-center bg-dark-card/60 backdrop-blur-lg hover:bg-dark-card/80 duration-300 justify-between rounded-md border border-white/10 hover:border-turbo-purple/30 px-4 py-4 transition-all",
            )}
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: deck.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">
                    {deck.name}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0",
                      getDifficultyColor(deck.difficulty)
                    )}
                  >
                    {deck.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span>
                    {deck.masteredCards}/{deck.totalCards} cards
                  </span>
                  <span>{deck.averageScore}% avg</span>
                  <span>{formatLastStudied(deck.lastStudied)}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  {deck.outstanding > 0 && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                      {deck.outstanding} due
                    </span>
                  )}
                  {deck.new > 0 && (
                    <span className="px-2 py-1 bg-turbo-indigo/20 text-turbo-indigo rounded-full text-xs">
                      {deck.new} new
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={(e) => handleAction(e, "Rename", deck.id)}
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 p-2 bg-white/10 hover:bg-white/20"
              >
                <Pencil className="w-3 h-3 text-white/50" />
              </Button>
              <Button
                onClick={(e) => handleAction(e, "Delete", deck.id)}
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 p-2 bg-white/10 hover:bg-red-500/20"
              >
                <Trash className="w-3 h-3 text-white/50 hover:text-red-400" />
              </Button>
            </div>
          </Link>
        ))}

        {/* Create Deck Button - Mobile */}
        <Button
          onClick={onCreateDeck}
          className="w-full bg-dark-card/40 backdrop-blur-lg rounded-2xl hover:bg-dark-card/60 hover:border-turbo-purple/30 transition-all duration-300 p-4 h-16 border border-white/10 flex justify-center items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Deck</span>
        </Button>
      </div>

      {decks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-turbo-purple/20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-turbo-purple" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No decks yet
          </h3>
          <p className="text-white/60 mb-6">
            Create your first flashcard deck to start learning
          </p>
          <Button
            onClick={onCreateDeck}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Deck
          </Button>
        </div>
      )}
    </div>
  );
};
