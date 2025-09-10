import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { ragService, type ChatMessage } from '@/services/rag';
import { MessageBubble } from './MessageBubble';
import { FileUpload } from './FileUpload';
import { ProgressBar } from './ProgressBar';
// import { useToast } from '@/shared/hooks/use-toast';

interface ChatWindowProps {
  chatId: string;
  className?: string;
}

export function ChatWindow({ chatId, className = "" }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  const {
    data: messagesResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['chat', chatId, page],
    queryFn: () => ragService.getChatMessages(chatId, page),
    enabled: !!chatId,
    staleTime: 10000, // 10 seconds
  });

  // Accumulate messages from all pages
  useEffect(() => {
    if (messagesResponse?.data) {
      if (page === 1) {
        setAllMessages(messagesResponse.data.reverse()); // Reverse to show oldest first
      } else {
        setAllMessages(prev => [...messagesResponse.data.reverse(), ...prev]);
      }
    }
  }, [messagesResponse, page]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [allMessages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isAsking) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: inputText,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message
    setAllMessages(prev => [...prev, userMessage]);
    
    const query = inputText;
    setInputText('');
    setIsAsking(true);

    try {
      const response = await ragService.ask(chatId, query);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `response-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        metadata: response.sources ? {
          sources: response.sources
        } : undefined
      };

      // Add assistant message
      setAllMessages(prev => [...prev, assistantMessage]);

      // Invalidate chat list to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the optimistic user message and show error
      setAllMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAsking(false);
    }
  };

  const handleFileUploaded = (document: any) => {
    // Create a file message
    const fileMessage: ChatMessage = {
      id: `file-${Date.now()}`,
      role: 'file',
      content: `Uploaded: ${document.title}`,
      created_at: document.created_at,
      metadata: {
        source_url: document.source_url,
        filename: document.title,
        mime_type: document.mime_type
      }
    };

    // Add file message to chat
    setAllMessages(prev => [...prev, fileMessage]);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    queryClient.invalidateQueries({ queryKey: ['chats'] });

    console.log(`File uploaded: ${document.title} has been added to this chat`);
  };

  const loadMoreMessages = () => {
    if (messagesResponse?.pagination && page < messagesResponse.pagination.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  const hasMoreMessages = messagesResponse?.pagination && page < messagesResponse.pagination.total_pages;

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-4">Failed to load messages</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-4">
          {/* Load More Messages Button */}
          {hasMoreMessages && (
            <div className="text-center mb-4">
              <Button
                onClick={loadMoreMessages}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-white/60 hover:text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Load Earlier Messages
              </Button>
            </div>
          )}

          {/* Messages */}
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : allMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
              <p className="text-white/60 text-sm">Ask a question or upload a document to begin</p>
            </div>
          ) : (
            <AnimatePresence>
              {allMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          {isAsking && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                </div>
                <div className="bg-dark-card/80 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/10">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-dark-card/40 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto p-4">
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <ProgressBar 
                value={uploadProgress} 
                label="Uploading file..."
                className="mb-2"
              />
            </div>
          )}

          {/* File Upload */}
          <div className="mb-4">
            <FileUpload
              chatId={chatId}
              onUploaded={handleFileUploaded}
              onProgress={setUploadProgress}
              disabled={isAsking}
            />
          </div>

          {/* Message Input */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextareaAutosize
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                maxRows={4}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 bg-dark-card/60 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20 transition-all duration-200 resize-none"
                disabled={isAsking}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isAsking}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 disabled:opacity-50 text-white p-3"
            >
              {isAsking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
