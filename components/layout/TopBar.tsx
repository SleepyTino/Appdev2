"use client";

import { Search, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function TopBar({ userName }: { userName?: string | null }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">FitLife</span>
          </Link>
        </div>

        {/* Search (desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search workouts, meals..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/30 rounded-xl text-sm
                         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none
                         focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/20 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/30
                       text-gray-600 dark:text-slate-400 hover:text-brand-400 dark:hover:text-brand-400
                       transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700/50"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white">
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden md:block">
              {userName || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
