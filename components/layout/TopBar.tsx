"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { Flame } from "lucide-react";

export default function TopBar({ userName }: { userName?: string | null }) {

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">FitLife</span>
          </Link>
        </div>

        {/* Search (desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search workouts, meals..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/30 rounded-xl text-sm
                         text-white placeholder-slate-500 outline-none
                         focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/20 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white">
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-slate-300 hidden md:block">
              {userName || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
