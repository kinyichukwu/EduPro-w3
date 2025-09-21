import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/landing";
// import Layout from "./layout";
import Courses from "./landing/features/Features";
import Pricing from "./landing/pricing/Pricing";
import About from "./landing/about/About";
// import SignUp from "./landing/login-register/SignUp";
// import Login from "./landing/login-register/Login";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { DashboardHome } from "./dashboard/home";
import AICreator from "./dashboard/ai-creator";
import CourseDetail from "./dashboard/ai-creator/CourseDetail";
import ModuleEditor from "./dashboard/ai-creator/ModuleEditor";
// import GeneralChats from "./dashboard/general-chats";
import { Flashcards } from "./dashboard/flashcards";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import QuizView from "./dashboard/quizzes";
import DoFlashCards from "./dashboard/flashcards/DoFlashCards";
import LibraryHub from "./dashboard/library";
import PastQuestions from "./dashboard/library/past-questions";
import MyUploads from "./dashboard/library/uploads";
import LibraryAnalytics from "./dashboard/library/analytics";
import UploadNew from "./dashboard/library/upload";
import Explore from "./dashboard/explore/index";
import ExploreCategory from "./dashboard/explore/category";
import ExploreCourseDetail from "./dashboard/explore/course-detail";
import { ProfilePage } from "./dashboard/profile";
import {
  AdminLayout,
  AdminDashboardPage,
  ContentManagementPage,
  QuestionBankPage,
  UserManagementPage,
  AnalyticsPage,
  PaymentsPage,
  SettingsPage,
} from "./admin";
import Quiz from "./dashboard/quizzes/Quiz";
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Courses />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
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

        {/* Dashboard routes - publicly accessible; protect specific routes as needed */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="ai-creator" element={<AICreator />} />
          <Route path="ai-creator/:courseId" element={<CourseDetail />} />
          <Route path="ai-creator/:courseId/modules/:moduleId" element={<ModuleEditor />} />
          <Route path="chats" element={<GeneralChats />} />
          <Route path="chats/:chatId" element={<GeneralChats />} />
          <Route
            path="flashcards"
            element={
              <ErrorBoundary>
                <Flashcards />
              </ErrorBoundary>
            }
          />
          <Route path="flashcards/:id" element={<DoFlashCards />} />
          <Route path="quizzes" element={<QuizView />} />
          <Route path="quizzes/:id" element={<Quiz />} />
          <Route path="library" element={<LibraryHub />} />
          <Route path="library/past-questions" element={<PastQuestions />} />
          <Route path="library/uploads" element={<MyUploads />} />
          <Route path="library/analytics" element={<LibraryAnalytics />} />
          <Route path="library/upload" element={<UploadNew />} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore/:categoryId" element={<ExploreCategory />} />
          <Route path="explore/course/:courseId" element={<ExploreCourseDetail />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin routes - wrapped in AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="content" element={<ContentManagementPage />} />
          <Route path="questions" element={<QuestionBankPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
