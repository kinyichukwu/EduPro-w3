import { Button } from "@/shared/components/ui"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Bot, Brain, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Question {
  text: string;
  options: string[];
  correct: number;
}

export default function Tutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const topic = location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ")

  const sampleQuiz: Question = {
    text: "What is the derivative of x²?",
    options: ["2x", "x²", "2", "x"],
    correct: 0,
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Great question! Let me break that down for you with a detailed explanation and some examples...",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1500);
  };

  const handleQuizAnswer = (answer: number) => {
    console.log("Quiz answer:", answer);
  };

  const handleReturn = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/chat");
    }
  }

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Welcome! Let's dive into ${topic}. I'm your AI tutor and I'll guide you through the concepts step by step with interactive exercises. Are you ready to begin?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
    ])
  })

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-dark-card/40 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleReturn()}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-bold text-white text-lg">
              {topic}
            </h2>
            <p className="text-sm text-white/60 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Tutor Session
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {["Explain Again", "Give Hint", "Practice Quiz"].map((action) => (
            <Button
              key={action}
              variant="ghost"
              size="sm"
              className="hover:bg-white/10 text-white/60 hover:text-white"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-dark-card/20">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} index={index} />
            ))}
          </AnimatePresence>

          {isTyping && (
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

          {messages.length > 2 && !isTyping && (
            <QuizBlock question={sampleQuiz} onAnswer={handleQuizAnswer} />
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-card/40 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything about the topic..."
                className="w-full px-4 py-3 bg-dark-card/60 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20 transition-all duration-200"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 disabled:opacity-50 text-white p-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
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
          <p className="text-sm leading-relaxed">{message.content}</p>
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
}> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected !== null) {
      setSubmitted(true);
      onAnswer(selected);
    }
  };

  return (
    <motion.div
      className="my-6 p-6 bg-dark-card/80 backdrop-blur-lg rounded-xl border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-semibold text-white">Quick Knowledge Check</h4>
      </div>

      <p className="text-white mb-4">{question.text}</p>

      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !submitted && setSelected(index)}
            disabled={submitted}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
              submitted
                ? index === question.correct
                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                  : index === selected && index !== question.correct
                  ? "bg-red-500/20 border-red-500/50 text-red-300"
                  : "bg-dark-card/40 border-white/10 text-white/60"
                : selected === index
                ? "bg-turbo-purple/20 border-turbo-purple/50 text-turbo-purple"
                : "bg-dark-card/40 border-white/10 text-white hover:bg-dark-card/60 hover:border-white/20"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </span>
          </button>
        ))}
      </div>

      {!submitted && selected !== null && (
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
        >
          Submit Answer
        </Button>
      )}
    </motion.div>
  );
};