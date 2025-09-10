import { useState, useEffect } from "react";
import {
  Home,
  Book,
  FileText,
  MessageSquare,
  Flame,
  Mic,
  Send,
  Paperclip,
  Lock,
  BookOpen,
  Star,
  User,
  Menu,
  X,
  Award,
  Zap,
  Infinity,
} from "lucide-react";
import { navItems } from "./DashboardLayout";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";

const contextDocs = [
  { name: "Physics_Lec2.pdf", pinned: true },
  { name: "Chem_notes.docx", pinned: false },
  { name: "Bio_assignment.pdf", pinned: false },
];

// const contextSnippets = ["Equation: F = ma …", "Voltage across RC = Q/C …"];

const recentActivity = [
  { type: "doc", name: "Physics_Lec2.pdf", date: "Today" },
  { type: "quiz", name: "Gen Chem MCQ", date: "Yesterday" },
  { type: "doc", name: "Bio_assignment.pdf", date: "2d ago" },
  { type: "quiz", name: "Physics Ch.2 Quiz", date: "3d ago" },
  { type: "doc", name: "Chem_notes.docx", date: "4d ago" },
];

const headerChips = [
  { label: "Global Knowledge", icon: Home },
  { label: "My Materials", icon: Book },
  { label: "Past Questions", icon: FileText, isPro: true },
];

const chipTemplates = [
  { label: "Explain", icon: MessageSquare },
  { label: "Summarize", icon: FileText },
  { label: "Generate Quiz", icon: BookOpen },
  { label: "Translate", icon: MessageSquare },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

// const xpPercent = (curr: number, max: number) =>
//   Math.min(100, Math.round((curr / max) * 100));

// Polyfill Infinity icon
// function Infinity(props: any) {
//   return (
//     <svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
//       <path
//         d="M4.5 10.5C2.567 10.5 1 8.933 1 7C1 5.067 2.567 3.5 4.5 3.5c2.105 0 3.011 1.535 3.5 3.5.489-1.965 1.395-3.5 3.5-3.5C13.433 3.5 15 5.067 15 7c0 1.933-1.567 3.5-3.5 3.5-2.105 0-3.011-1.535-3.5-3.5-.489 1.965-1.395 3.5-3.5 3.5Z"
//         stroke="currentColor"
//         strokeWidth="2"
//       />
//     </svg>
//   );
// }

export default function ChatView() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    { from: "user", text: "What are Newton's Laws?" },
    {
      from: "ai",
      text: "Newton's Laws describe the relationship between a body and the forces acting upon it. The first law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
      smartReplies: ["Explain further", "Quiz me", "Add to flashcards"],
    },
  ]);
  const [usage, setUsage] = useState({ used: 6, max: 20 });
  const [showUpgradeToast, setShowUpgradeToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Simulated values
  const streak = 6;
  // const streakMax = 20;
  const xp = 720;
  const xpGoal = 1200;

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Upgrade toast logic
  useEffect(() => {
    if (usage.max - usage.used <= 3) setShowUpgradeToast(true);
    else setShowUpgradeToast(false);
  }, [usage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat([...chat, { from: "user", text: input }]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          from: "ai",
          text:
            "I understand your question about " +
            input +
            ". Let me help you with that.",
          smartReplies: ["Continue", "Examples", "Quiz me"],
        },
      ]);
    }, 1000);
  };

  return (
    <>
      <div className="flex flex-col h-screen pt-[58px] bg-gray-900 text-white overflow-hidden">
        {/* Upgrade Toast */}
        {showUpgradeToast && (
          <div className="flex-none bg-red-600 text-white px-4 py-2 text-sm">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <span>
                Only {usage.max - usage.used} prompts left – Get Pro for
                unlimited chats!
              </span>
              <button className="bg-white/20 px-3 py-1 rounded text-xs font-medium hover:bg-white/30">
                Upgrade
              </button>
            </div>
          </div>
        )}

        <header className="fixed top-0 left-0 right-0 z-50 h-[58px] flex gap-4 sm:gap-8 bg-gray-800/80 backdrop-blur-md border-b border-gray-700 px-4 py-2.5">
          <div className="flex items-center">
            <span className="font-bold text-2xl gradient-text truncate line-clamp-1">
              E<span className="max-sm:hidden">duPro AI</span>
            </span>
          </div>
          <div className="w-full flex items-center justify-between max-w-full">
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Zap className="w-4 h-4" />
              <span className="max-sm:hidden">Upgrade</span>
            </button>

            <div className="flex items-center gap-2 overflow-x-auto">
              {headerChips.map(({ label, icon: Icon, isPro }, i) => (
                <button
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      i === 0
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }
                    ${isPro ? "relative" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{label}</span>
                  {isPro && (
                    <span className="ml-1 bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-bold px-2 py-0.5 rounded-full max-sm:hidden">
                      Pro
                    </span>
                  )}
                </button>
              ))}
              <button
                className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Chat Area */}
          <main className="flex-1 flex flex-col max-w-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Greeting */}
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {getGreeting()},{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Isaac!
                    </span>
                  </h1>
                  <p className="text-gray-400">
                    Ready to learn something new today?
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4">
                  {chat.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl
                          ${
                            msg.from === "user"
                              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                              : "bg-gray-800 border border-gray-700 text-gray-100"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {msg.from === "ai" &&
                          !expanded &&
                          msg.text.length > 140
                            ? msg.text.slice(0, 140) + "..."
                            : msg.text}
                        </p>

                        {/* AI Smart Replies */}
                        {msg.from === "ai" && msg.smartReplies && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.smartReplies.map((reply) => (
                              <button
                                key={reply}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                onClick={() => setInput(reply)}
                              >
                                {reply}
                              </button>
                            ))}
                            {msg.text.length > 140 && !expanded && (
                              <button
                                className="bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-lg text-xs font-medium"
                                onClick={() => setExpanded(true)}
                              >
                                Expand (Pro)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-none border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {chipTemplates.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      onClick={() => setInput(label)}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-gray-700 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Mic className="w-4 h-4" />
                        <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button
                    type="submit"
                    className="p-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </main>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-none border-l border-gray-700 bg-gray-800/30 backdrop-blur-sm">
            <div className="h-full overflow-y-auto p-4 space-y-6">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold">Progress</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.round((xp / xpGoal) * 100)}%
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">XP</span>
                    <span className="font-semibold">
                      {xp} / {xpGoal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(xp / xpGoal) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Daily Streak</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold">{streak} days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Card */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Prompts Used</span>
                  <span className="text-sm text-gray-400">
                    {usage.used} / {usage.max}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(usage.used / usage.max) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-block text-xs font-semibold text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                    Free Plan
                  </span>
                  <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                    Upgrade →
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-semibold text-xl mb-3">
                  Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {contextDocs.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-400 flex-none" />
                      <span className="text-sm truncate flex-1">
                        {doc.name}
                      </span>
                      <button className="flex-none">
                        <Star
                          className={`w-4 h-4 ${
                            doc.pinned
                              ? "text-yellow-400 fill-current"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Upsell */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Premium Features</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mic className="w-4 h-4 text-teal-400" />
                    Voice replies
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-purple-400" />
                    Tutor roleplay
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Infinity className="w-4 h-4 text-blue-400" />
                    Unlimited prompts
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Upgrade Now
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-semibold text-xl mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      {activity.type === "doc" ? (
                        <FileText className="w-4 h-4 text-blue-400 flex-none" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-green-400 flex-none" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{activity.name}</div>
                        <div className="text-xs text-gray-400">
                          {activity.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full overflow-y-auto w-80 max-w-full bg-gray-800 border-l border-gray-700">
              <div className="pb-10">
                <div className="flex items-center justify-between h-[57px] px-4 border-b border-gray-700">
                  <span className="font-semibold">Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-full overflow-y-auto p-4 space-y-6">
                  <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Progress</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {Math.round((xp / xpGoal) * 100)}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">XP</span>
                        <span className="font-semibold">
                          {xp} / {xpGoal}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(xp / xpGoal) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Daily Streak
                        </span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="font-semibold">{streak} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Prompts Used</span>
                      <span className="text-sm text-gray-400">
                        {usage.used} / {usage.max}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usage.used / usage.max) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-xs font-semibold text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        Free Plan
                      </span>
                      <button className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                        Upgrade →
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <h3 className="font-semibold mb-3">Documents</h3>
                      <div className="space-y-2">
                        {contextDocs.map((doc) => (
                          <div
                            key={doc.name}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-400 flex-none" />
                            <span className="text-sm truncate flex-1">
                              {doc.name}
                            </span>
                            <Star
                              className={`w-4 h-4 ${
                                doc.pinned
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Premium Features</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mic className="w-4 h-4 text-teal-400" />
                          Voice replies
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-purple-400" />
                          Tutor roleplay
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Infinity className="w-4 h-4 text-blue-400" />
                          Unlimited prompts
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <h2 className="p-4 text-lg text-left font-semibold border-b border-gray-700">
                  Navigation
                </h2>
                <nav className="flex-1 p-1 pb-4 space-y-2 text-white">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-lg transition-all group px-3 py-3 hover:bg-white/5",
                        item.path === "/dashboard/chat" && "hidden"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span
                        className={`ml-3 ${
                          isActive(item.path)
                            ? item.color
                            : "group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
