import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Flame, TrendingUp, Target } from "lucide-react";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

async function getProgressData(userId: string) {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [workoutsRes, progressRes] = await Promise.all([
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("progress_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(7),
  ]);

  const workouts = (workoutsRes.data || []) as { id: string; created_at: string; calories_burned: number | null; duration_minutes: number | null; title: string | null }[];
  const progressLogs = (progressRes.data || []) as { id: string; logged_at: string; weight: number | null; body_fat_percentage: number | null; steps: number | null; active_minutes: number | null; notes: string | null }[];

  // Aggregate weekly data
  const dailyCalories: Record<string, number> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (const w of workouts) {
    const dayName = days[new Date(w.created_at).getDay()];
    dailyCalories[dayName] = (dailyCalories[dayName] || 0) + (w.calories_burned || 0);
  }

  const totalCalories = workouts.reduce(
    (sum, w) => sum + (w.calories_burned || 0),
    0
  );
  const totalMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration_minutes || 0),
    0
  );

  return {
    workoutsThisWeek: workouts.length,
    totalCalories,
    totalMinutes,
    dailyCalories,
    latestWeight: progressLogs[0]?.weight ?? null,
  };
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = user
    ? await getProgressData(user.id)
    : {
        workoutsThisWeek: 0,
        totalCalories: 0,
        totalMinutes: 0,
        dailyCalories: {},
        latestWeight: null,
      };

  const weeklyGoalWorkouts = 5;
  const weeklyGoalCalories = 2000;
  const workoutProgress = Math.min(
    (data.workoutsThisWeek / weeklyGoalWorkouts) * 100,
    100
  );
  const caloriesProgress = Math.min(
    (data.totalCalories / weeklyGoalCalories) * 100,
    100
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxCal = Math.max(...days.map((d) => data.dailyCalories[d] || 0), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your weekly performance and goals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Dumbbell,
            value: data.workoutsThisWeek,
            label: "Workouts",
            sub: "This Week",
            iconColor: "text-brand-400",
            bgColor: "from-brand-400/20 to-brand-600/20",
          },
          {
            icon: Flame,
            value: data.totalCalories.toLocaleString(),
            label: "Calories",
            sub: "Burned",
            iconColor: "text-orange-400",
            bgColor: "from-orange-400/20 to-red-500/20",
          },
          {
            icon: TrendingUp,
            value: `${data.totalMinutes}m`,
            label: "Active",
            sub: "Time",
            iconColor: "text-purple-400",
            bgColor: "from-purple-400/20 to-violet-500/20",
          },
          {
            icon: Target,
            value: data.latestWeight ? `${data.latestWeight} lbs` : "—",
            label: "Weight",
            sub: "Current",
            iconColor: "text-green-400",
            bgColor: "from-green-400/20 to-emerald-500/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">
              {stat.label}
              <br />
              <span className="text-slate-500">{stat.sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card padding="lg">
        <h3 className="font-semibold text-white mb-6">Weekly Activity</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {days.map((day) => {
            const val = data.dailyCalories[day] || 0;
            const pct = maxCal > 0 ? (val / maxCal) * 100 : 5;
            return (
              <div
                key={day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] text-slate-500 font-medium">
                  {val > 0 ? val : ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-400 to-brand-300 transition-all duration-700"
                  style={{ height: `${Math.max(pct, 5)}%` }}
                />
                <span className="text-[10px] text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Goals */}
      <Card padding="lg">
        <h3 className="font-semibold text-white mb-6">Weekly Goals</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Workouts</span>
              <span className="text-slate-400">
                {data.workoutsThisWeek} / {weeklyGoalWorkouts}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${workoutProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Calories Burned</span>
              <span className="text-slate-400">
                {data.totalCalories.toLocaleString()} /{" "}
                {weeklyGoalCalories.toLocaleString()}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${caloriesProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
