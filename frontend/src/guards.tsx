import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);

  return user ? <Navigate to="/dashboard" replace /> : children;
};
