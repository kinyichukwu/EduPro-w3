import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { MessageSquare, Menu, Sparkles } from "lucide-react";
import { ChatList, ChatWindow } from "@/dashboard/components/chats";
import { useState } from "react";

export default function LoggedInChats() {
  const user = useAuthStore((s) => s.user);
  const { chatId } = useParams();
  const [mobileListOpen, setMobileListOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="h-[calc(100dvh-50px)] w-full flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/10 bg-dark-card/30">
        <ChatList selectedChatId={chatId} />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/80">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[85%] sm:w-[400px]">
                  <SheetHeader className="p-4 border-b border-white/10">
                    <SheetTitle className="text-white">Conversations</SheetTitle>
                  </SheetHeader>
                  <div className="h-[calc(100vh-80px)]">
                    <ChatList 
                      selectedChatId={chatId} 
                      onChatSelect={() => setMobileListOpen(false)}
                      className="h-full"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">RAG Chat</h2>
              <p className="text-xs sm:text-sm text-white/60 flex items-center gap-1 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Document-aware AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Chat Window or Empty State */}
        {chatId ? (
          <ChatWindow chatId={chatId} className="flex-1" />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-dark-card/20">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to RAG Chat</h3>
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