import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  MessageSquare,
  SquareStack,
  BookOpen,
  FileQuestion,
  Upload,
  Library,
  CreditCard,
  Share2,
  User,
  Menu,
  X,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { icon: BarChart3, name: "Dashboard", path: "/dashboard" },
    { icon: MessageSquare, name: "Chatbot", path: "/dashboard/chat" },
    { icon: SquareStack, name: "Flashcards", path: "/dashboard/flashcards" },
    { icon: BookOpen, name: "Quizzes", path: "/dashboard/quizzes" },
    {
      icon: FileQuestion,
      name: "Past Questions",
      path: "/dashboard/past-questions",
    },
    { icon: Upload, name: "Upload Materials", path: "/dashboard/upload" },
    { icon: Library, name: "Material Library", path: "/dashboard/library" },
    { icon: CreditCard, name: "Subscription", path: "/dashboard/subscription" },
    { icon: Share2, name: "Referrals", path: "/dashboard/referrals" },
    { icon: User, name: "User Profile", path: "/dashboard/profile" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarVariants = {
    open: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: "80px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const mainContentVariants = {
    open: {
      marginLeft: "280px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      marginLeft: "80px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex h-screen bg-dark-background text-dark-text">
      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 z-40 h-screen glass-card border-r border-white/10"
        initial={isSidebarOpen ? "open" : "closed"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex h-full flex-col">
          {/* Logo area */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              {isSidebarOpen ? (
                <span className="text-xl font-extrabold gradient-text">
                  EduPro AI
                </span>
              ) : (
                <span className="text-xl font-extrabold gradient-text">EP</span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 hover:bg-dark-accent/50 text-dark-muted hover:text-white transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center rounded-lg p-2 transition-all ${
                      window.location.pathname === item.path
                        ? "bg-gradient-to-r from-purple-700/20 to-indigo-700/20 text-white"
                        : "text-dark-muted hover:bg-dark-accent/30 hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        window.location.pathname === item.path
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      <item.icon size={20} />
                    </div>
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          className="ml-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {window.location.pathname === item.path &&
                      isSidebarOpen && (
                        <motion.div
                          className="ml-auto"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <ArrowRight size={16} className="text-primary" />
                        </motion.div>
                      )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button at bottom */}
          <div className="mt-auto border-t border-white/10 p-4">
            <button className="flex w-full items-center rounded-lg p-2 text-dark-muted hover:bg-dark-accent/30 hover:text-white transition-colors">
              <LogOut size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        className="flex flex-col flex-1"
        initial={isSidebarOpen ? "open" : "closed"}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={mainContentVariants}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-dark-card/80 backdrop-blur-lg px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 rounded-full bg-dark-accent/50 p-1 hover:bg-dark-accent/80 transition-colors">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-purple-700 to-indigo-700">
                  <img
                    src="https://ui.shadcn.com/avatars/01.png"
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </motion.div>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-mesh-gradient opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
};
