import { Button } from "@/shared/components/ui";
import { useSEO } from "@/shared/hooks";
import { logSEOData } from "@/shared/utils/seoUtils";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "react-router-dom";
import { ChatList, ChatWindow } from "@/dashboard/components/chats";
import LoggedInChats from "./LoggedInChats";

export default function GeneralChats() {
  const user = useAuthStore((s) => s.user);
  const { chatId } = useParams();

  // SEO Configuration
  useSEO({
    title: "AI Chat Assistant - EduPro AI | Interactive Learning & Study Help",
    description:
      "Chat with our AI assistant for personalized learning support. Get detailed explanations, practice questions, and study help across all subjects. Transform your learning experience with EduPro AI.",
    keywords:
      "AI chat, study assistant, learning help, educational AI, practice questions, explanations, tutoring, online learning, EduPro AI, study support",
    image: `${window.location.origin}/Edupro.svg`,
    url: `${window.location.origin}/dashboard/chats`,
    type: "educational",
    siteName: "EduPro AI",
    author: "EduPro AI Team",
    twitterCard: "summary_large_image",
    twitterSite: "@eduproai",
    canonical: `${window.location.origin}/dashboard/chats`,
    locale: "en_US",
  });

  // If logged in, render the new RAG-enabled chat experience
  if (user) {
    return (
      <div className="max-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar - Chat List */}
        <aside className={`${chatId ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0 flex-col border-r border-white/10 bg-dark-card/30 max-h-full`}>
          <ChatList selectedChatId={chatId} className="max-h-full" />
        </aside>

        {/* Main Chat Area */}
        <div className={`${chatId ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col max-h-full overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Let's learn</h2>
                <p className="text-sm text-white/60 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Study Assistant
                </p>
              </div>
            </div>
            {/* Mobile back button */}
            {chatId && (
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                size="sm"
                className="md:hidden text-white/60 hover:text-white"
              >
                ← Back
              </Button>
            )}
          </div>

          {/* Chat Window or Empty State */}
          {chatId ? (
            <ChatWindow chatId={chatId} className="flex-1 overflow-hidden" />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-dark-card/20 p-4 overflow-y-auto">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Let's learn together</h3>
                <p className="text-white/60 mb-4">
                  Select a conversation from the sidebar or start a new chat to begin.
                  You can upload documents and ask questions about them.
                </p>
                <div className="space-y-2 text-sm text-white/50">
                  <p>• Upload PDFs, DOCX, or TXT files</p>
                  <p>• Ask questions about your documents</p>
                  <p>• Get AI-powered insights and summaries</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For non-logged-in users, show a simple welcome message
  useEffect(() => {
    // Log SEO data in development
    setTimeout(() => {
      logSEOData();
    }, 1000);
  }, []);

  // For non-logged-in users, show a simple welcome message
  return (
      <div className="max-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full flex flex-col overflow-hidden">
        {/* Header */}
      <div className="flex items-center justify-between p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">General Chat</h2>
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="flex-1 flex items-center justify-center bg-dark-card/20 overflow-y-auto">
        <div className="text-center max-w-md p-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Welcome to EduPro Chat</h3>
          <p className="text-white/60 mb-4">
            Please log in to access the full chat experience with document upload and RAG capabilities.
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
