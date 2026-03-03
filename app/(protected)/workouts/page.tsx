"use client";

import { useState } from "react";
import {
  Dumbbell,
  Clock,
  BarChart3,
  Play,
  ChevronRight,
  Plus,
  X,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface WorkoutTemplate {
  id: string;
  title: string;
  duration: string;
  difficulty: string;
  exerciseCount: number;
  category: string;
  exercises: { name: string; sets: string; notes?: string }[];
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "1",
    title: "Full Body Strength",
    duration: "45 min",
    difficulty: "Intermediate",
    exerciseCount: 8,
    category: "Upper & Lower body",
    exercises: [
      { name: "Warm-up", sets: "5 min" },
      { name: "Push-ups", sets: "3×12" },
      { name: "Squats", sets: "3×10" },
      { name: "Deadlifts", sets: "3×6" },
      { name: "Overhead Press", sets: "3×10" },
      { name: "Lunges", sets: "3×12 each" },
      { name: "Plank", sets: "3×45s" },
      { name: "Cool Down", sets: "5 min" },
    ],
  },
  {
    id: "2",
    title: "Cardio Blast",
    duration: "30 min",
    difficulty: "Beginner",
    exerciseCount: 6,
    category: "High intensity",
    exercises: [
      { name: "Jump Rope", sets: "3 min" },
      { name: "Burpees", sets: "3×10" },
      { name: "Mountain Climbers", sets: "3×20" },
      { name: "High Knees", sets: "3×30s" },
      { name: "Box Jumps", sets: "3×8" },
      { name: "Sprint Intervals", sets: "5×30s" },
    ],
  },
  {
    id: "3",
    title: "Yoga Flow",
    duration: "60 min",
    difficulty: "All Levels",
    exerciseCount: 12,
    category: "Flexibility & Balance",
    exercises: [
      { name: "Sun Salutation A", sets: "3 rounds" },
      { name: "Warrior I & II", sets: "Hold 60s" },
      { name: "Triangle Pose", sets: "Hold 45s" },
      { name: "Tree Pose", sets: "Hold 60s" },
      { name: "Downward Dog", sets: "Hold 60s" },
      { name: "Child's Pose", sets: "Hold 2 min" },
    ],
  },
  {
    id: "4",
    title: "HIIT Training",
    duration: "25 min",
    difficulty: "Advanced",
    exerciseCount: 10,
    category: "Maximum burn",
    exercises: [
      { name: "Jump Squats", sets: "4×15" },
      { name: "Plyo Push-ups", sets: "4×10" },
      { name: "Tuck Jumps", sets: "4×12" },
      { name: "Battle Ropes", sets: "4×30s" },
      { name: "Kettlebell Swings", sets: "4×15" },
    ],
  },
];

export default function WorkoutsPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutTemplate | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

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
        const durationNum = parseInt(activeWorkout.duration) || 30;
        await supabase.from("workouts").insert({
          user_id: user.id,
          title: activeWorkout.title,
          description: activeWorkout.category,
          duration_minutes: durationNum,
          difficulty: activeWorkout.difficulty.toLowerCase(),
          exercises: activeWorkout.exercises,
          calories_burned: Math.round(durationNum * 8),
          completed_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to save workout:", err);
    } finally {
      setIsSaving(false);
      setActiveWorkout(null);
      setCompletedExercises(new Set());
    }
  };

  // Active workout view
  if (activeWorkout) {
    const progress =
      activeWorkout.exercises.length > 0
        ? (completedExercises.size / activeWorkout.exercises.length) * 100
        : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeWorkout.title}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeWorkout.duration} · {activeWorkout.difficulty}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveWorkout(null);
              setCompletedExercises(new Set());
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
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
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${
                    completedExercises.has(i) ? "text-brand-400" : "text-white"
                  }`}
                >
                  {ex.name}
                </p>
                <p className="text-xs text-slate-500">{ex.sets}</p>
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
          {progress === 100 ? "Complete Workout" : "Finish Early"}
        </Button>
      </div>
    );
  }

  // Workout detail
  if (selectedWorkout) {
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
            <span className="text-sm text-slate-400">
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
            }}
          >
            <Play className="w-4 h-4" />
            Start Workout
          </Button>
        </div>
      </div>
    );
  }

  // Workout list
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
        {workoutTemplates.map((workout) => (
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
        ))}
      </div>
    </div>
  );
}
