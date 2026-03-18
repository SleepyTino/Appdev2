"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  User,
  Bot,
  UtensilsCrossed,
  LogOut,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Meals", href: "/meals", icon: UtensilsCrossed },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "AI Coach", href: "/ai-coach", icon: Bot },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 min-h-screen 
                      bg-slate-900/80 dark:bg-slate-900/80 
                      light:bg-white/80
                      backdrop-blur-xl border-r 
                      border-white/5 dark:border-white/5 
                      light:border-gray-200 
                      p-6 transition-colors duration-300">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white dark:text-white tracking-tight">
            FitLife
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest">
            Fitness & Wellness
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "text-brand-400 bg-brand-400/10 border border-brand-400/20"
                    : "text-slate-400 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/5 border border-transparent"
                }
              `}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/5 dark:border-white/5 pt-4 mt-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                     text-slate-400 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/5
                     transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
