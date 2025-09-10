import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (location.pathname === "/dashboard/chats") {
    return children;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);

  return user ? <Navigate to="/dashboard" replace /> : children;
};
