import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoutes } from "./router.tsx";
import { ThemeProvider } from "@/shared/context/ThemeProvider.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from "@/store/useAuthStore";

const queryClient = new QueryClient();

// Initialize auth store on app start to hydrate session state
useAuthStore.getState().initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
