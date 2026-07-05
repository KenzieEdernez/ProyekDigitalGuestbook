"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, ready } = useAdminTheme();

  if (!ready) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-navy dark:border-stone-700 dark:bg-navy-800 dark:text-stone-300 dark:hover:bg-navy-700 dark:hover:text-stone-100 ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
