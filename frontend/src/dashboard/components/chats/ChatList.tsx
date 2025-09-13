import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ragService } from "@/services/rag";
import { type Chat } from "@/services/api";
import { cn } from "@/shared/lib/utils";
// import { useToast } from '@/shared/hooks/use-toast';

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  className?: string;
}

export function ChatList({
  selectedChatId,
  onChatSelect,
  className = "",
}: ChatListProps) {
  const navigate = useNavigate();
  // const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const {
    data: chatsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chats", page],
    queryFn: () => ragService.listChats(page),
    staleTime: 30000, // 30 seconds
  });

  // Accumulate chats from all pages (backend returns { chats, page, total, has_more })
  useEffect(() => {
    if (chatsResponse) {
      const newChats = chatsResponse.chats || [];
      if (page === 1) {
        setAllChats(newChats);
      } else {
        setAllChats((prev) => [...prev, ...newChats]);
      }
    }
  }, [chatsResponse, page]);

  const handleChatClick = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    } else {
      navigate(`/dashboard/chats/${chatId}`);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await ragService.createChat();
      setAllChats((prev) => [newChat, ...prev]);
      handleChatClick(newChat.id);

      console.log("New chat created: You can now start a conversation");
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert(
        `Failed to create chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this chat? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await ragService.deleteChat(chatId);
      setAllChats((prev) => prev.filter((chat) => chat.id !== chatId));

      // If this was the selected chat, navigate away
      if (selectedChatId === chatId) {
        const remainingChats = allChats.filter((chat) => chat.id !== chatId);
        if (remainingChats.length > 0) {
          handleChatClick(remainingChats[0].id);
        } else {
          navigate("/dashboard/chats");
        }
      }

      console.log("Chat deleted: The conversation has been removed");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert(
        `Failed to delete chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleEditChat = (
    chatId: string,
    currentTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle || "");
  };

  const handleSaveTitle = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!editingTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      const updatedChat = await ragService.updateChatTitle(
        chatId,
        editingTitle.trim()
      );
      setAllChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, title: updatedChat.title } : chat
        )
      );
      setEditingChatId(null);
      setEditingTitle("");

      console.log("Chat renamed successfully");
    } catch (error) {
      console.error("Failed to rename chat:", error);
      alert(
        `Failed to rename chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle("");
  };

  const loadMore = () => {
    if (chatsResponse?.has_more) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMore = Boolean(chatsResponse?.has_more);

  if (error) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="p-4 border-b border-white/10">
          <Button onClick={handleNewChat} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Failed to load chats</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-white/10 shrink-0">
        <Button onClick={handleNewChat} className="w-full text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : allChats.length === 0 ? (
            <div className="text-center py-8 px-2">
              <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">No conversations yet</p>
              <p className="text-white/40 text-xs mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {allChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group w-full"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-white/5 p-3 hover:bg-white/5 cursor-pointer transition-colors w-full",
                        selectedChatId === chat.id &&
                          "bg-white/10 border-white/10"
                      )}
                      onClick={() => handleChatClick(chat.id)}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {editingChatId === chat.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveTitle(chat.id, e as any);
                              } else if (e.key === "Escape") {
                                handleCancelEdit(e as any);
                              }
                            }}
                            className="text-sm text-white bg-transparent border border-white/20 rounded px-2 py-1 w-full focus:outline-none focus:border-turbo-purple"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="text-sm text-white truncate font-medium">
                            {chat.title || "New Chat"}
                          </div>
                        )}
                        {chat.last_message && (
                          <div className="text-xs text-white/50 truncate mt-0.5">
                            {chat.last_message.length > 25
                              ? `${chat.last_message.substring(0, 25)}...`
                              : chat.last_message}
                          </div>
                        )}
                        <div className="text-xs text-white/40 mt-1 truncate">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {editingChatId === chat.id ? (
                          <>
                            <Button
                              onClick={(e) => handleSaveTitle(chat.id, e)}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-white/60 hover:text-green-400 flex-shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-white/60 hover:text-red-400 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={(e) =>
                                handleEditChat(chat.id, chat.title || "", e)
                              }
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-white/60 hover:text-blue-400 flex-shrink-0"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-white/60 hover:text-red-400 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-2">
                  <Button
                    onClick={loadMore}
                    variant="ghost"
                    size="sm"
                    className="w-full text-white/60 hover:text-white text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
