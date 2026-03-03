// Shared application types

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  fitnessGoal: string | null;
  targetWeight: number | null;
  workoutsPerWeek: number | null;
  workoutDuration: number | null;
  difficultyLevel: string | null;
  createdAt: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  exercises: Exercise[];
  caloriesBurned: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  notes?: string;
}

export interface Meal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodItem: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  loggedAt: string;
}

export interface ProgressLog {
  id: string;
  weight: number | null;
  bodyFatPercentage: number | null;
  steps: number | null;
  activeMinutes: number | null;
  notes: string | null;
  loggedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StatsCard {
  icon: string;
  value: string | number;
  label: string;
  sublabel?: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};
