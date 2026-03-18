import { createClient } from "@/lib/supabase/server";
import {
  Dumbbell,
  Flame,
  Footprints,
  Clock,
  UtensilsCrossed,
  Bot,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats(userId: string) {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [workoutsRes, mealsRes] = await Promise.all([
    supabase
      .from("workouts")
      .select("id, calories_burned, duration_minutes")
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString()),
    supabase
      .from("meals")
      .select("calories")
      .eq("user_id", userId)
      .gte("created_at", new Date(now.setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const workouts = (workoutsRes.data || []) as { id: string; calories_burned: number | null; duration_minutes: number | null }[];
  const meals = (mealsRes.data || []) as { calories: number | null }[];

  const totalCaloriesBurned = workouts.reduce(
    (sum, w) => sum + (w.calories_burned || 0),
    0
  );
  const totalActiveMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration_minutes || 0),
    0
  );
  const caloriesConsumed = meals.reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );

  return {
    workoutsThisWeek: workouts.length,
    caloriesBurned: totalCaloriesBurned,
    activeMinutes: totalActiveMinutes,
    caloriesConsumed,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const stats = user ? await getStats(user.id) : null;

  // Get time-appropriate greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {greeting},{" "}
          <span className="gradient-text">{userName}</span>
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Let&apos;s crush your goals today!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Dumbbell,
            value: stats?.workoutsThisWeek ?? 0,
            label: "Workouts",
            sublabel: "This week",
            color: "from-brand-400/20 to-brand-600/20",
            iconColor: "text-brand-400",
          },
          {
            icon: Flame,
            value: stats?.caloriesBurned?.toLocaleString() ?? "0",
            label: "Calories",
            sublabel: "Burned today",
            color: "from-orange-400/20 to-red-500/20",
            iconColor: "text-orange-400",
          },
          {
            icon: Footprints,
            value: stats?.caloriesConsumed?.toLocaleString() ?? "0",
            label: "Calories",
            sublabel: "Consumed today",
            color: "from-green-400/20 to-emerald-500/20",
            iconColor: "text-green-400",
          },
          {
            icon: Clock,
            value: `${stats?.activeMinutes ?? 0}m`,
            label: "Active",
            sublabel: "Today",
            color: "from-purple-400/20 to-violet-500/20",
            iconColor: "text-purple-400",
          },
        ].map((stat) => (
          <div
            key={stat.label + stat.sublabel}
            className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5 p-5 
                       hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} 
                          flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {stat.label}
              <br />
              <span className="text-gray-500 dark:text-slate-500">{stat.sublabel}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: UtensilsCrossed,
              title: "Log Meal",
              description: "Track your nutrition",
              href: "/meals",
              gradient: "from-green-400 to-emerald-500",
            },
            {
              icon: Dumbbell,
              title: "Start Workout",
              description: "Begin your training",
              href: "/workouts",
              gradient: "from-brand-400 to-brand-600",
              primary: true,
            },
            {
              icon: Bot,
              title: "AI Fitness Coach",
              description: "Get personalized advice",
              href: "/ai-coach",
              gradient: "from-purple-400 to-violet-500",
            },
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              <div
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                  cursor-pointer group
                  ${
                    action.primary
                      ? "bg-gradient-to-r from-brand-400/10 to-brand-600/10 border-brand-400/20 hover:border-brand-400/40"
                      : "bg-white dark:bg-slate-800/60 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10"
                  }
                  hover:-translate-y-0.5 hover:shadow-lg
                `}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} 
                              flex items-center justify-center flex-shrink-0
                              group-hover:scale-105 transition-transform`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{action.title}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{action.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity / Tip */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Summary */}
        <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm dark:shadow-none">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Overview</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, i) => {
                const heights = [40, 70, 80, 50, 85, 60, 30];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-brand-400 to-brand-300 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heights[i]}%` }}
                    />
                    <span className="text-[10px] text-gray-500 dark:text-slate-500">{day}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Daily Tip */}
        <div className="bg-gradient-to-br from-brand-400/10 to-brand-600/10 backdrop-blur-sm rounded-2xl border border-brand-400/20 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-400/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Daily Tip</h3>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                Consistency is key! Even a 20-minute workout is better than
                skipping. Your body adapts to regular training — keep showing up.
              </p>
              <Link
                href="/ai-coach"
                className="inline-flex items-center gap-1 text-xs text-brand-400 font-medium mt-4 hover:text-brand-300 transition-colors"
              >
                Get more tips from AI Coach
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
