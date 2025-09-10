import { motion } from 'framer-motion';
import { Bot, User, FileText, ExternalLink } from 'lucide-react';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';
import { Button } from '@/shared/components/ui/button';
import { type ChatMessage } from '@/services/rag';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isAI = message.role === 'assistant';
  const isFile = message.role === 'file';

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="max-w-[80%]">
          <div className="bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-turbo-purple/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-turbo-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">
                  {message.metadata?.filename || 'Uploaded File'}
                </p>
                <p className="text-white/60 text-xs">
                  {message.metadata?.mime_type || 'Unknown type'}
                </p>
              </div>
              {message.metadata?.source_url && (
                <Button
                  onClick={() => window.open(message.metadata?.source_url, '_blank')}
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
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`max-w-[85%] ${isAI ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? 'bg-dark-card/80 backdrop-blur-lg border border-white/10 text-white'
              : 'bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white'
          }`}
        >
          <MarkdownRenderer content={message.content} />
          
          {/* Sources for AI messages */}
          {isAI && message.metadata?.sources && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/60 mb-2">Sources:</p>
              <div className="space-y-1">
                {message.metadata.sources.map((source: any, idx: number) => (
                  <div key={idx} className="text-xs bg-white/5 rounded p-2">
                    <p className="text-white/80 font-medium">{source.title}</p>
                    <p className="text-white/60 mt-1">{source.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-white/40 ${
            isAI ? '' : 'justify-end'
          }`}
        >
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
