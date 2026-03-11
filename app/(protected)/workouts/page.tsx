"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dumbbell,
  Clock,
  BarChart3,
  Play,
  Pause,
  ChevronRight,
  Plus,
  X,
  Check,
  Flame,
  Trophy,
  Timer,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface WorkoutTemplate {
  id: string;
  title: string;
  duration: string;
  durationMinutes: number;
  difficulty: string;
  exerciseCount: number;
  category: string;
  caloriesPerMin: number;
  exercises: { name: string; sets: string; calories: number; notes?: string }[];
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "1",
    title: "Full Body Strength",
    duration: "45 min",
    durationMinutes: 45,
    difficulty: "Intermediate",
    exerciseCount: 8,
    category: "Upper & Lower body",
    caloriesPerMin: 9,
    exercises: [
      { name: "Warm-up", sets: "5 min", calories: 25 },
      { name: "Push-ups", sets: "3×12", calories: 50 },
      { name: "Squats", sets: "3×10", calories: 65 },
      { name: "Deadlifts", sets: "3×6", calories: 80 },
      { name: "Overhead Press", sets: "3×10", calories: 55 },
      { name: "Lunges", sets: "3×12 each", calories: 60 },
      { name: "Plank", sets: "3×45s", calories: 30 },
      { name: "Cool Down", sets: "5 min", calories: 15 },
    ],
  },
  {
    id: "2",
    title: "Cardio Blast",
    duration: "30 min",
    durationMinutes: 30,
    difficulty: "Beginner",
    exerciseCount: 6,
    category: "High intensity",
    caloriesPerMin: 12,
    exercises: [
      { name: "Jump Rope", sets: "3 min", calories: 45 },
      { name: "Burpees", sets: "3×10", calories: 60 },
      { name: "Mountain Climbers", sets: "3×20", calories: 50 },
      { name: "High Knees", sets: "3×30s", calories: 40 },
      { name: "Box Jumps", sets: "3×8", calories: 55 },
      { name: "Sprint Intervals", sets: "5×30s", calories: 70 },
    ],
  },
  {
    id: "3",
    title: "Yoga Flow",
    duration: "60 min",
    durationMinutes: 60,
    difficulty: "All Levels",
    exerciseCount: 6,
    category: "Flexibility & Balance",
    caloriesPerMin: 4,
    exercises: [
      { name: "Sun Salutation A", sets: "3 rounds", calories: 35 },
      { name: "Warrior I & II", sets: "Hold 60s", calories: 30 },
      { name: "Triangle Pose", sets: "Hold 45s", calories: 25 },
      { name: "Tree Pose", sets: "Hold 60s", calories: 20 },
      { name: "Downward Dog", sets: "Hold 60s", calories: 25 },
      { name: "Child's Pose", sets: "Hold 2 min", calories: 10 },
    ],
  },
  {
    id: "4",
    title: "HIIT Training",
    duration: "25 min",
    durationMinutes: 25,
    difficulty: "Advanced",
    exerciseCount: 5,
    category: "Maximum burn",
    caloriesPerMin: 15,
    exercises: [
      { name: "Jump Squats", sets: "4×15", calories: 75 },
      { name: "Plyo Push-ups", sets: "4×10", calories: 65 },
      { name: "Tuck Jumps", sets: "4×12", calories: 70 },
      { name: "Battle Ropes", sets: "4×30s", calories: 60 },
      { name: "Kettlebell Swings", sets: "4×15", calories: 80 },
    ],
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function WorkoutsPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutTemplate | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerAlarmPlaying, setTimerAlarmPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  // Play alarm sound using Web Audio API
  const playAlarm = useCallback(() => {
    if (alarmIntervalRef.current) return;
    setTimerAlarmPlaying(true);

    const playBeep = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        audioContextRef.current = ctx;

        // Three-tone alarm beep
        const times = [0, 0.15, 0.3];
        const freqs = [830, 1000, 830];
        times.forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freqs[i];
          osc.type = "square";
          gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.12);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.12);
        });
      } catch {
        // Audio not supported
      }
    };

    playBeep();
    alarmIntervalRef.current = setInterval(playBeep, 2000);

    // Also show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("FitLife - Timer Complete!", {
        body: "Your workout timer has finished! Great job! 💪",
        icon: "/favicon.ico",
      });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("FitLife - Timer Complete!", {
            body: "Your workout timer has finished! Great job! 💪",
            icon: "/favicon.ico",
          });
        }
      });
    }
  }, []);

  const stopAlarm = useCallback(() => {
    setTimerAlarmPlaying(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Calories calculation
  const totalCalories = activeWorkout
    ? activeWorkout.exercises.reduce((sum, ex) => sum + ex.calories, 0)
    : 0;
  const burnedCalories = activeWorkout
    ? activeWorkout.exercises.reduce(
        (sum, ex, i) => (completedExercises.has(i) ? sum + ex.calories : sum),
        0
      )
    : 0;

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining, playAlarm]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const startTimer = useCallback((minutes: number) => {
    setTimeRemaining(minutes * 60);
    setElapsedTime(0);
    setIsTimerRunning(true);
  }, []);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);

  const difficultyColor = (d: string) => {
    switch (d.toLowerCase()) {
      case "beginner":
        return "text-green-400 bg-green-400/10";
      case "intermediate":
        return "text-yellow-400 bg-yellow-400/10";
      case "advanced":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-brand-400 bg-brand-400/10";
    }
  };

  const toggleExercise = (index: number) => {
    const next = new Set(completedExercises);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedExercises(next);
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const actualMinutes = Math.max(1, Math.round(elapsedTime / 60));
        await (supabase.from("workouts") as any).insert({
          user_id: user.id,
          title: activeWorkout.title,
          description: activeWorkout.category,
          duration_minutes: actualMinutes,
          difficulty: activeWorkout.difficulty.toLowerCase(),
          exercises: activeWorkout.exercises,
          calories_burned: burnedCalories,
          completed_at: new Date().toISOString(),
        });
      }

      setShowComplete(true);
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetWorkout = () => {
    setActiveWorkout(null);
    setCompletedExercises(new Set());
    setShowComplete(false);
    setTimeRemaining(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    stopAlarm();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ==========================================
  // Completion summary screen
  // ==========================================
  if (showComplete && activeWorkout) {
    const exercisesDone = completedExercises.size;
    const totalExercises = activeWorkout.exercises.length;
    const actualMinutes = Math.max(1, Math.round(elapsedTime / 60));
    const completionPct = Math.round((exercisesDone / totalExercises) * 100);

    return (
      <div className="space-y-6 text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400/30 to-green-400/30 flex items-center justify-center mx-auto animate-pulse">
          <Trophy className="w-10 h-10 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Complete!</h1>
          <p className="text-slate-400 text-sm mt-1">{activeWorkout.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="text-center py-2">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{burnedCalories}</p>
              <p className="text-xs text-slate-400">Calories Burned</p>
            </div>
          </Card>
          <Card>
            <div className="text-center py-2">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{actualMinutes}</p>
              <p className="text-xs text-slate-400">Minutes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center py-2">
              <Check className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">
                {exercisesDone}/{totalExercises}
              </p>
              <p className="text-xs text-slate-400">Exercises Done</p>
            </div>
          </Card>
          <Card>
            <div className="text-center py-2">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{completionPct}%</p>
              <p className="text-xs text-slate-400">Completion</p>
            </div>
          </Card>
        </div>

        {/* Per-exercise breakdown */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3">Exercise Breakdown</h3>
          <div className="space-y-2">
            {activeWorkout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {completedExercises.has(i) ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className={completedExercises.has(i) ? "text-white" : "text-slate-500 line-through"}>
                    {ex.name}
                  </span>
                </div>
                <span className={completedExercises.has(i) ? "text-orange-400 font-medium" : "text-slate-600"}>
                  {completedExercises.has(i) ? `+${ex.calories} cal` : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 mt-3 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-white">Total Burned</span>
            <span className="text-orange-400">{burnedCalories} cal</span>
          </div>
        </Card>

        <Button variant="primary" fullWidth size="lg" onClick={resetWorkout}>
          Back to Workouts
        </Button>
      </div>
    );
  }

  // ==========================================
  // Active workout view with timer
  // ==========================================
  if (activeWorkout) {
    const progress =
      activeWorkout.exercises.length > 0
        ? (completedExercises.size / activeWorkout.exercises.length) * 100
        : 0;
    const timerPct =
      activeWorkout.durationMinutes > 0
        ? Math.min(100, (elapsedTime / (activeWorkout.durationMinutes * 60)) * 100)
        : 0;

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeWorkout.title}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeWorkout.difficulty} · {activeWorkout.category}
            </p>
          </div>
          <button
            onClick={resetWorkout}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                timeRemaining === 0
                  ? "bg-red-400/10"
                  : isTimerRunning
                  ? "bg-brand-400/10"
                  : "bg-yellow-400/10"
              }`}>
                <Timer className={`w-6 h-6 ${
                  timeRemaining === 0
                    ? "text-red-400"
                    : isTimerRunning
                    ? "text-brand-400 animate-pulse"
                    : "text-yellow-400"
                }`} />
              </div>
              <div>
                <p className="text-3xl font-mono font-bold text-white tracking-wider">
                  {formatTime(timeRemaining)}
                </p>
                <p className="text-xs text-slate-400">
                  {timeRemaining === 0
                    ? "Time's up!"
                    : isTimerRunning
                    ? "Workout in progress..."
                    : "Paused"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTimer}
              disabled={timeRemaining === 0}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isTimerRunning
                  ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                  : "bg-brand-400/20 text-brand-400 hover:bg-brand-400/30"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isTimerRunning ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
          </div>
          {/* Timer progress bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>
          {timerAlarmPlaying && (
            <button
              onClick={stopAlarm}
              className="mt-3 w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold
                         hover:bg-red-500/30 transition-all animate-pulse"
            >
              🔔 Dismiss Alarm
            </button>
          )}
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/60 rounded-xl border border-white/5 p-3 text-center">
            <BarChart3 className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{Math.round(progress)}%</p>
            <p className="text-[10px] text-slate-400">Progress</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-white/5 p-3 text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{burnedCalories}</p>
            <p className="text-[10px] text-slate-400">Calories</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-white/5 p-3 text-center">
            <Check className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">
              {completedExercises.size}/{activeWorkout.exercises.length}
            </p>
            <p className="text-[10px] text-slate-400">Done</p>
          </div>
        </div>

        {/* Calories progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Calories Burned
            </span>
            <span className="text-orange-400 font-medium">{burnedCalories} / {totalCalories} cal</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${totalCalories > 0 ? (burnedCalories / totalCalories) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-2.5">
          {activeWorkout.exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => toggleExercise(i)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                ${
                  completedExercises.has(i)
                    ? "bg-brand-400/10 border-brand-400/30"
                    : "bg-slate-800/60 border-white/5 hover:border-white/10"
                }
              `}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                  ${
                    completedExercises.has(i)
                      ? "bg-brand-400 text-white"
                      : "bg-slate-700/50 text-slate-400"
                  }
                `}
              >
                {completedExercises.has(i) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    completedExercises.has(i) ? "text-brand-400" : "text-white"
                  }`}
                >
                  {ex.name}
                </p>
                <p className="text-xs text-slate-500">{ex.sets}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-medium ${
                  completedExercises.has(i) ? "text-orange-400" : "text-slate-500"
                }`}>
                  {completedExercises.has(i) ? `+${ex.calories}` : ex.calories} cal
                </p>
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={finishWorkout}
          isLoading={isSaving}
          disabled={completedExercises.size === 0}
        >
          <Trophy className="w-4 h-4" />
          {progress === 100 ? "Complete Workout" : "Finish Early"}
        </Button>
      </div>
    );
  }

  // ==========================================
  // Workout detail / preview
  // ==========================================
  if (selectedWorkout) {
    const totalCal = selectedWorkout.exercises.reduce((s, e) => s + e.calories, 0);
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedWorkout(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Workouts
        </button>

        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-9 h-9 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {selectedWorkout.title}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedWorkout.duration}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${difficultyColor(
                selectedWorkout.difficulty
              )}`}
            >
              {selectedWorkout.difficulty}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-sm text-orange-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              ~{totalCal} cal
            </span>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            {selectedWorkout.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-xs font-bold text-slate-500 w-6">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{ex.name}</p>
                </div>
                <span className="text-xs text-slate-500 mr-2">{ex.calories} cal</span>
                <span className="text-xs text-brand-400 font-medium">
                  {ex.sets}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setSelectedWorkout(null)}
          >
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setActiveWorkout(selectedWorkout);
              setSelectedWorkout(null);
              setCompletedExercises(new Set());
              startTimer(selectedWorkout.durationMinutes);
            }}
          >
            <Play className="w-4 h-4" />
            Start Workout
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Workout list
  // ==========================================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workouts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Choose a workout or create your own
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {workoutTemplates.map((workout) => {
          const totalCal = workout.exercises.reduce((s, e) => s + e.calories, 0);
          return (
            <div
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5
                         hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg
                         transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                  {workout.title}
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {workout.duration}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-orange-400">
                  <Flame className="w-3 h-3" />
                  ~{totalCal} cal
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor(
                    workout.difficulty
                  )}`}
                >
                  {workout.difficulty}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {workout.exerciseCount} exercises · {workout.category}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
