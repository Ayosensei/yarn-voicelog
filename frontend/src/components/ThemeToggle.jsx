"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const isCurrentlyDark =
      root.classList.contains("dark") ||
      localStorage.getItem("yarn_theme") === "dark" ||
      (!localStorage.getItem("yarn_theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isCurrentlyDark);
    if (isCurrentlyDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const root = document.documentElement;

    if (nextDark) {
      root.classList.add("dark");
      localStorage.setItem("yarn_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("yarn_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-surface-muted/60 border border-border flex items-center justify-center ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center gap-2 p-2 rounded-xl bg-surface border border-border hover:bg-surface-muted text-ink-600 hover:text-ink-900 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-600/30 ${className}`}
    >
      {isDark ? (
        <Sun size={18} className="text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={18} className="text-ink-600 transition-transform -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="font-small text-small text-ink-900">
          {isDark ? "Dark theme active" : "Light theme active"}
        </span>
      )}
    </button>
  );
}
