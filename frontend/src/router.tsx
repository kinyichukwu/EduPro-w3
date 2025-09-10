import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/landing";
import { ChatPage } from "@/chat";
import Layout from "./layout";
import Courses from "./landing/courses/Courses";
import Pricing from "./landing/pricing/Pricing";
import About from "./landing/about/About";
import SignUp from "./landing/login-register/SignUp";
import Login from "./landing/login-register/Login";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { DashboardHome } from "./dashboard/DashboardHome";
import { ChatView } from "./dashboard/ChatView";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page routes - wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Chat routes */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Dashboard routes - wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="chat" element={<ChatView />} />
          <Route
            path="flashcards"
            element={<PlaceholderView title="Flashcards" />}
          />
          <Route path="quizzes" element={<PlaceholderView title="Quizzes" />} />
          <Route path="library" element={<PlaceholderView title="Library" />} />
          <Route path="profile" element={<PlaceholderView title="Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

// Simple placeholder component for routes that aren't implemented yet
const PlaceholderView = ({ title }: { title: string }) => {
  return (
    <div className="px-4 md:px-6">
      <h1 className="text-2xl font-semibold mb-6 gradient-text">{title}</h1>
      <div className="glass-card rounded-xl p-6 border border-turbo-indigo/40">
        <p className="text-white">This is the {title} page of the dashboard.</p>
        <p className="text-dark-muted mt-2">This feature is coming soon!</p>
      </div>
    </div>
  );
};
