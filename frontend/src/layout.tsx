import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "@/shared/context/ThemeProvider";
import { useEffect } from "react";
import { Toaster } from "./shared/components/ui/sonner";

export default function Layout() {
  const { theme } = useTheme();

  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      className={`mx-auto w-full   transition-all duration-300 ${
        theme === "dark" ? "dark" : ""
      }`}
      style={{ backgroundColor: "var(--dark-background)" }}
    >
      <Outlet />

      <Toaster />
    </div>
  );
}
