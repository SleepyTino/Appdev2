"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  User,
  Bot,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "AI Coach", href: "/ai-coach", icon: Bot },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1
                transition-all duration-200
                ${isActive ? "text-brand-400" : "text-slate-500 hover:text-slate-300"}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-brand-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
