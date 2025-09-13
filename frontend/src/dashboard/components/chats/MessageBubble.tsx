import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { MarkdownRenderer } from "@/shared/components/MarkdownRenderer";
import { Button } from "@/shared/components/ui/button";
import { type ChatMessage } from "@/services/api";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const isAI = message.role === "assistant";
  const isFile = message.role === "file";
  const hasCitations =
    isAI && message.citations && message.citations.length > 0;

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // File message rendering
  if (isFile) {
    return (
      <motion.div
        className="flex justify-start mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="max-w-[80%] sm:max-w-[70%] md:max-w-[65%]">
          <div className="bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-turbo-purple/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-turbo-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">
                  {message.metadata?.filename || "Uploaded File"}
                </p>
                <p className="text-white/60 text-xs">
                  {message.metadata?.mime_type || "Unknown type"}
                </p>
              </div>
              {message.metadata?.source_url && (
                <Button
                  onClick={() =>
                    window.open(message.metadata?.source_url, "_blank")
                  }
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
            <span>{formatTime(message.created_at)}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular message rendering
  return (
    <motion.div
      className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] md:max-w-[65%] ${
          isAI ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 break-words overflow-hidden ${
            isAI
              ? "bg-dark-card/80 backdrop-blur-lg border border-white/10 text-white"
              : "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white"
          }`}
        >
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Citations for AI messages */}
        {hasCitations && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <Button
              onClick={() => setIsSourcesOpen(!isSourcesOpen)}
              variant="ghost"
              size="sm"
              className="w-full justify-between text-white/70 hover:text-white hover:bg-white/5 p-2 h-auto"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">
                  {message.citations!.length} source
                  {message.citations!.length !== 1 ? "s" : ""}
                </span>
              </div>
              {isSourcesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            <AnimatePresence>
              {isSourcesOpen && (
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2">
                    {message.citations!.map((citation, idx) => (
                      <motion.div
                        key={`${citation.document_id}-${citation.ordinal}`}
                        className="bg-white/5 rounded-lg p-3 border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {citation.document_title}
                            </h4>
                            <p className="text-xs text-white/60 mt-1 line-clamp-2">
                              {citation.snippet}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-white/40">
                                Section {citation.ordinal + 1}
                              </span>
                            </div>
                          </div>
                          {citation.source_url && (
                            <Button
                              onClick={() =>
                                window.open(citation.source_url, "_blank")
                              }
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/60 hover:text-white flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div
          className={`flex items-center gap-2 mt-2 text-xs text-white/40 ${
            isAI ? "" : "justify-end"
          }`}
        >
          {hasCitations && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {message.citations!.length}
            </span>
          )}
          <span>{formatTime(message.created_at)}</span>
        </div>
      </div>

      {/* Avatar for AI messages */}
      {isAI && (
        <motion.div
          className="order-1 mr-3 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}

      {/* Avatar for user messages */}
      {!isAI && (
        <motion.div
          className="order-2 ml-3 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
