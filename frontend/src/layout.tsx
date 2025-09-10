import { Outlet } from "react-router-dom";
import { useTheme } from "@/shared/context/ThemeProvider";

export default function Layout() {
  const { theme } = useTheme();

  return (
    <div
      className={`mx-auto w-full max-w-[80rem] transition-all duration-300 ${
        theme === "dark" ? "dark" : ""
      }`}
      style={{ backgroundColor: "var(--dark-background)" }}
    >
      <Outlet />
    </div>
  );
}
