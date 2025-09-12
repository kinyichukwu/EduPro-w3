import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ragService, type Chat } from '@/services/rag';
import { cn } from '@/shared/lib/utils';
// import { useToast } from '@/shared/hooks/use-toast';

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  className?: string;
}

export function ChatList({ selectedChatId, onChatSelect, className = "" }: ChatListProps) {
  const navigate = useNavigate();
  // const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [allChats, setAllChats] = useState<Chat[]>([]);

  const { 
    data: chatsResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['chats', page],
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
        setAllChats(prev => [...prev, ...newChats]);
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
      setAllChats(prev => [newChat, ...prev]);
      handleChatClick(newChat.id);
      
      console.log("New chat created: You can now start a conversation");
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await ragService.deleteChat(chatId);
      setAllChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If this was the selected chat, navigate away
      if (selectedChatId === chatId) {
        const remainingChats = allChats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          handleChatClick(remainingChats[0].id);
        } else {
          navigate('/dashboard/chats');
        }
      }
      
      console.log("Chat deleted: The conversation has been removed");
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadMore = () => {
    if (chatsResponse?.has_more) {
      setPage(prev => prev + 1);
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
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button onClick={handleNewChat} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : allChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">No conversations yet</p>
              <p className="text-white/40 text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {allChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border border-white/5 p-3 hover:bg-white/5 cursor-pointer transition-colors",
                        selectedChatId === chat.id && "bg-white/10 border-white/10"
                      )}
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white truncate font-medium">Chat</div>
                          {chat.last_message && (
                            <div className="text-xs text-white/50 truncate mt-0.5">
                              {chat.last_message}
                            </div>
                          )}
                          <div className="text-xs text-white/40 mt-1">
                            {new Date(chat.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-white/60 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                    className="w-full text-white/60 hover:text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
