import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { LandingPage } from "@/landing";
// import Layout from "./layout";
// import Courses from "./landing/features/Features";
// import Pricing from "./landing/pricing/Pricing";
// import About from "./landing/about/About";
// import SignUp from "./landing/login-register/SignUp";
// import Login from "./landing/login-register/Login";
import { DashboardLayout } from "./dashboard/DashboardLayout";
// import { DashboardHome } from "./dashboard/home";
// import ChatView from "./dashboard/chat";
// import GeneralChats from "./dashboard/general-chats";
// import { Flashcards } from "./dashboard/flashcards";
// import QuizView from "./dashboard/quizzes";
// import DoFlashCards from "./dashboard/flashcards/DoFlashCards";
// import LibraryHub from "./dashboard/library";
// import PastQuestions from "./dashboard/library/past-questions";
// import MyUploads from "./dashboard/library/uploads";
// import LibraryAnalytics from "./dashboard/library/analytics";
// import UploadNew from "./dashboard/library/upload";
import { ProfilePage } from "./dashboard/profile";
// import {
//   AdminLayout,
//   AdminDashboardPage,
//   ContentManagementPage,
//   QuestionBankPage,
//   UserManagementPage,
//   AnalyticsPage,
//   PaymentsPage,
//   SettingsPage,
// } from "./admin";
// import Tutor from "./dashboard/chat/Tutor";
// import Topic from "./dashboard/chat/Topics";
// import Quiz from "./dashboard/quizzes/Quiz";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import GeneralChats from "./dashboard/general-chats";
import Layout from "./layout";
import SignUp from "./landing/login-register/SignUp";
import LoginPage from "./landing/login-register/Login";
import Callback from "./landing/Callback.tsx";
import { ProtectedRoute, PublicOnlyRoute } from "./guards.tsx";

export const AppRoutes = () => {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    void fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page routes - wrapped in Layout */}
        <Route element={<Layout />}>
          {/* <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Courses />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} /> */}
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />
          <Route path="/callback" element={<Callback />} />
        </Route>

        {/* Dashboard routes - wrapped in DashboardLayout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* <Route index element={<DashboardHome />} />
          <Route path="ai-tutor" element={<ChatView />} />
          <Route path="ai-tutor/:id" element={<Topic />} />
          <Route path="ai-tutor/:id/:id" element={<Tutor />} /> */}
          <Route path="chats" element={<GeneralChats />} />
          {/* <Route path="flashcards" element={<Flashcards />} />
          <Route path="flashcards/:id" element={<DoFlashCards />} />
          <Route path="quizzes" element={<QuizView />} />
          <Route path="quizzes/:id" element={<Quiz />} />
          <Route path="library" element={<LibraryHub />} />
          <Route path="library/past-questions" element={<PastQuestions />} />
          <Route path="library/uploads" element={<MyUploads />} />
          <Route path="library/analytics" element={<LibraryAnalytics />} />
          <Route path="library/upload" element={<UploadNew />} /> */}
          <Route path="profile" element={<ProfilePage />}/> 
        </Route>

        {/* Admin routes - wrapped in AdminLayout */}
        {/* <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="content" element={<ContentManagementPage />} />
          <Route path="questions" element={<QuestionBankPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
};
