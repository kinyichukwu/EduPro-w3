import { Button, TooltipContent, TooltipTrigger, Tooltip } from "@/shared/components/ui";
import { MarkdownRenderer } from "@/shared/components";
import { useSEO } from "@/shared/hooks";
import { logSEOData } from "@/shared/utils/seoUtils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Brain,
  Send,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FileQuestion,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Plus,
  Upload,
  Lock,
  User,
  FileText,
  X,
  // ChevronUp,
  // AlertCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useGeneralChat } from "./hooks/useGeneralChat";
import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "@/store/useAuthStore";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "question";
  questionData?: Question;
}

interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function GeneralChats() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatContext, setChatContext] = useState<string>("");
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    type: string;
    size: string;
  }[] | null>(null);
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    generateQuiz,
    generateExplanation,
    isLoading,
    sleepTimer,
    // error: apiError,
    clearError,
  } = useGeneralChat();

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

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${remainingSeconds}s`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || sleepTimer.isWaiting) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentQuery = inputText;
    setMessages((prev) => [...prev, userMessage]);
    setChatContext((prev) => prev + " " + inputText);
    setInputText("");
    setIsTyping(true);
    clearError();

    try {
      // Generate explanation for the user's query
      const explanationData = await generateExplanation(currentQuery);

      if (explanationData) {
        const assistantMessage: Message = {
          role: "assistant",
          content: explanationData.explanation,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Add key points if available
        if (
          explanationData.key_points &&
          explanationData.key_points.length > 0
        ) {
          const keyPointsMessage: Message = {
            role: "assistant",
            content:
              "## Key Points:\n\n" +
              explanationData.key_points
                .map((point) => `• ${point}`)
                .join("\n"),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setTimeout(() => {
            setMessages((prev) => [...prev, keyPointsMessage]);
          }, 1000);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content:
          "🚦 I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExplainMore = async () => {
    if (isLoading || sleepTimer.isWaiting || !chatContext.trim()) return;

    setIsTyping(true);
    clearError();

    try {
      const explanationData = await generateExplanation(
        `Please provide more detailed explanation about: ${chatContext}`
      );

      if (explanationData) {
        const moreExplanationMessage: Message = {
          role: "assistant",
          content: explanationData.explanation,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, moreExplanationMessage]);

        // Add examples if available
        if (explanationData.examples && explanationData.examples.length > 0) {
          const examplesMessage: Message = {
            role: "assistant",
            content:
              "## Examples:\n\n" +
              explanationData.examples
                .map((example, index) => `${index + 1}. ${example}`)
                .join("\n\n"),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setTimeout(() => {
            setMessages((prev) => [...prev, examplesMessage]);
          }, 1500);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content:
          "🚦 I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (isLoading || sleepTimer.isWaiting || !chatContext.trim()) return;

    setIsTyping(true);
    clearError();

    try {
      const quizData = await generateQuiz(chatContext);

      if (quizData && quizData.questions && quizData.questions.length > 0) {
        const introMessage: Message = {
          role: "assistant",
          content: `## Practice Questions: ${quizData.topic}\n\nI've generated some questions to help you test your understanding:`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, introMessage]);

        // Add each question as a separate message
        quizData.questions.forEach((apiQuestion, index) => {
          // Convert API question format to our component format
          const question: Question = {
            text: apiQuestion.question,
            options: apiQuestion.options,
            correct: apiQuestion.options.findIndex((option) =>
              option
                .toLowerCase()
                .startsWith(apiQuestion.correct_answer.toLowerCase())
            ),
            explanation: apiQuestion.explanation,
          };

          setTimeout(() => {
            const questionMessage: Message = {
              role: "assistant",
              content: `Question ${index + 1}:`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "question",
              questionData: question,
            };

            setMessages((prev) => [...prev, questionMessage]);
          }, (index + 1) * 1000);
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content:
          "🚦 I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: number) => {
    // Individual questions now handle their own answers inline
    // This callback is maintained for potential future analytics
    console.log(`Question ${questionIndex} answered with option ${answer}`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddFile = () => {
    if (!user) {
      setIsFileDialogOpen(true);
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (!validTypes.includes(file.type)) {
      alert("Only PDF or DOCX files are allowed.");
      return;
    }

    setFileInfo((prev) => [...(prev ?? []), {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    }]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "# Welcome to General Chat! 🎓\n\nHello! I'm your **AI assistant**. I'm here to help you with:\n\n• **Detailed explanations** on any topic\n• **Practice questions** to test your knowledge\n• **Examples and clarifications** when you need more help\n\n## We'd Love Your Feedback! 💌\nHave ideas for new features? Want to suggest improvements? \n**Contact us:** officialeduproglobal@gmail.com\n\n*What would you like to learn about today?*",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    // Log SEO data in development
    setTimeout(() => {
      logSEOData();
    }, 1000);
  }, []);

  return (
    <>
      <div className="h-[calc(100dvh-50px)] w-full flex flex-col">
        {/* Header */}
        <div className="flex max-md:hidden items-center justify-between p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">General Chat</h2>
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Assistant
                {sleepTimer.isWaiting && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Retrying in {formatTimeRemaining(sleepTimer.timeRemaining)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              onClick={handleExplainMore}
              variant="ghost"
              size="sm"
              className="hover:bg-white/10 text-white/60 hover:text-white"
              disabled={isLoading || sleepTimer.isWaiting || !chatContext.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <HelpCircle className="w-4 h-4 mr-2" />
              )}
              Explain More
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              variant="ghost"
              size="sm"
              className="hover:bg-white/10 text-white/60 hover:text-white"
              disabled={isLoading || sleepTimer.isWaiting || !chatContext.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileQuestion className="w-4 h-4 mr-2" />
              )}
              Generate Questions
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-dark-card/20">
          <div className="max-w-4xl mx-auto max-sm:px-3 p-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <div key={index}>
                  <MessageBubble message={message} index={index} />
                  {message.type === "question" && message.questionData && (
                    <QuizBlock
                      question={message.questionData}
                      onAnswer={(answer) => handleQuizAnswer(index, answer)}
                      questionIndex={index}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>

            {/* Sleep Timer UI */}
            {sleepTimer.isWaiting && (
              <motion.div
                className="flex justify-start mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="text-amber-200 font-medium text-sm">
                          {sleepTimer.currentMessage}
                        </div>
                        <div className="text-amber-400/60 text-xs mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Retry attempt {sleepTimer.retryAttempt} •{" "}
                          {formatTimeRemaining(sleepTimer.timeRemaining)}{" "}
                          remaining
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Regular typing indicator */}
            {isTyping && !sleepTimer.isWaiting && (
              <motion.div
                className="flex justify-start mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-dark-card/80 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-turbo-purple rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="h-max bg-dark-card/40 backdrop-blur-lg border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Action Buttons */}
            <div className="sm:hidden flex items-center gap-2 p-4 pb-2 border-b border-white/10">
              <Button
                onClick={handleExplainMore}
                variant="ghost"
                size="sm"
                className="flex-1 hover:bg-white/10 text-white/60 hover:text-white bg-dark-card/70 sm:bg-dark-card/40"
                disabled={
                  isLoading || sleepTimer.isWaiting || !chatContext.trim()
                }
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <HelpCircle className="w-4 h-4 mr-2" />
                )}
                Explain More
              </Button>
              <Button
                onClick={handleGenerateQuestions}
                variant="ghost"
                size="sm"
                className="flex-1 hover:bg-white/10 text-white/60 hover:text-white bg-dark-card/70 sm:bg-dark-card/40"
                disabled={
                  isLoading || sleepTimer.isWaiting || !chatContext.trim()
                }
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileQuestion className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Generate</span> Questions
              </Button>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-3 p-4">
              <div className={cn("w-full relative h-max p-0 mb-0 rounded-xl", fileInfo && "border  border-white/10")}>
                {fileInfo && (
                  <div className="w-full h-max px-3 py-3">
                    {fileInfo.map((file) => (
                      <div className="w-max p-2 pr-7 text-[13px] text-white/60 flex items-center gap-2 bg-white/10 rounded-xl relative" key={file.name}>
                        <FileText className="w-9 h-9 p-2 bg-turbo-purple text-white rounded-md" />
                        <div className="min-w-max space-y-0.5">
                          <p>{file.name}</p>
                          <div className="flex items-center gap-2">
                            <p>{file.size}</p>
                            <p className="w-max text-[11px] border border-white/10 rounded-[5px] px-2 py-1">{file.name.split(".").pop()?.toUpperCase()}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setFileInfo(fileInfo.filter((f) => f.name !== file.name))}
                          variant="ghost" 
                          className="absolute -right-1 -top-1 w-max h-max p-0.5 text-black cursor-pointer bg-white hover:bg-white/80"
                          size="icon"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <TextareaAutosize
                    value={inputText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInputText(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    maxRows={3}
                    placeholder={
                      sleepTimer.isWaiting
                        ? "Please wait while I prepare your response..."
                        : "Ask me anything..."
                    }
                    className="z-10 w-full flex-1 px-4 py-3 bg-dark-card/60 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20 transition-all duration-200 resize-none disabled:opacity-50"
                    disabled={sleepTimer.isWaiting}
                  />
                  <div className="absolute z-20 right-2 top-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            onClick={handleAddFile}
                            variant="outline"
                            className="!w-9 !h-9 p-0 text-white cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Add Files</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading || sleepTimer.isWaiting}
                className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 disabled:opacity-50 text-white p-3"
              >
                {isLoading || sleepTimer.isWaiting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isFileDialogOpen && <FileDialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen} />}
    </>
  );
}

const MessageBubble: React.FC<{ message: Message; index: number }> = ({
  message,
  index,
}) => {
  const isAI = message.role === "assistant";

  return (
    <motion.div
      className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={`max-w-[80%] ${isAI ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? "bg-dark-card/80 backdrop-blur-lg border border-white/10 text-white"
              : "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white"
          }`}
        >
          <MarkdownRenderer content={message.content} />
        </div>
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-white/40 ${
            isAI ? "" : "justify-end"
          }`}
        >
          <span>{message.timestamp}</span>
        </div>
      </div>

      {isAI && (
        <motion.div
          className="order-1 mr-3 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const QuizBlock: React.FC<{
  question: Question;
  onAnswer: (answer: number) => void;
  questionIndex: number;
}> = ({ question, onAnswer, questionIndex }) => {
  console.log(questionIndex);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      const correct = selected === question.correct;
      setSubmitted(true);
      setIsCorrect(correct);
      setShowExplanation(true);
      onAnswer(selected);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  return (
    <motion.div
      className="my-6 p-6 bg-dark-card/80 backdrop-blur-lg rounded-xl border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold text-white">Practice Question</h4>
        </div>

        {/* Result Indicator */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Incorrect
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Question Text */}
      <div className="text-white mb-4">
        <MarkdownRenderer content={question.text} />
      </div>

      {/* Answer Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          const isSelectedOption = index === selected;
          const isCorrectOption = index === question.correct;
          const isWrongSelection =
            submitted && isSelectedOption && !isCorrectOption;

          return (
            <motion.button
              key={index}
              onClick={() => !submitted && setSelected(index)}
              disabled={submitted}
              whileHover={!submitted ? { scale: 1.01 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                submitted
                  ? isCorrectOption
                    ? "bg-green-500/20 border-green-500/50 text-green-300 shadow-green-500/20 shadow-lg"
                    : isWrongSelection
                    ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-red-500/20 shadow-lg"
                    : "bg-dark-card/40 border-white/10 text-white/60"
                  : isSelectedOption
                  ? "bg-turbo-purple/20 border-turbo-purple/50 text-turbo-purple shadow-turbo-purple/20 shadow-lg"
                  : "bg-dark-card/40 border-white/10 text-white hover:bg-dark-card/60 hover:border-white/20 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    submitted
                      ? isCorrectOption
                        ? "border-green-500 bg-green-500"
                        : isWrongSelection
                        ? "border-red-500 bg-red-500"
                        : "border-white/30"
                      : isSelectedOption
                      ? "border-turbo-purple bg-turbo-purple"
                      : "border-white/30"
                  }`}
                >
                  {submitted && isCorrectOption && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                  {submitted && isWrongSelection && (
                    <XCircle className="w-4 h-4 text-white" />
                  )}
                  {!submitted && isSelectedOption && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white w-full sm:w-auto"
          >
            Submit Answer
          </Button>
        </motion.div>
      )}

      {/* Explanation Section */}
      {submitted && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-6 border-t border-white/10 pt-4"
        >
          {/* Explanation Toggle */}
          <button
            type="button"
            onClick={toggleExplanation}
            className="flex items-center justify-between w-full p-3 bg-dark-card/60 hover:bg-dark-card/80 rounded-lg border border-white/10 transition-all duration-200 mb-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-medium">
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
              </span>
            </div>
            <motion.div
              animate={{ rotate: showExplanation ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-white/60" />
            </motion.div>
          </button>

          {/* Explanation Content */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? "bg-green-500/10 border-green-500/30 text-green-100"
                      : "bg-blue-500/10 border-blue-500/30 text-blue-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? "bg-green-500/20" : "bg-blue-500/20"
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium mb-2">Explanation</h5>
                      <div className="text-sm leading-relaxed">
                        <MarkdownRenderer content={question.explanation} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

const FileDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-card">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
            <div className="relative">
              <Upload className="h-6 w-6 text-turbo-purple" />
              <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full p-0.5" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-white/90">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-white/60 mt-2">
            You need to be logged in to upload files. Please sign in to your account to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="order-2 sm:order-1 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="order-1 sm:order-2 text-sm"
          >
            <User className="h-4 w-4 mr-2" />
            Login Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};