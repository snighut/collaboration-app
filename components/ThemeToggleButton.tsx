"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from 'lucide-react';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={20} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" /> : <Moon size={20} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />}
    </button>
  );
}
