export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: string | null;
          phone: string | null;
          fitness_goal: string | null;
          target_weight: number | null;
          workouts_per_week: number | null;
          workout_duration: number | null;
          difficulty_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone?: string | null;
          fitness_goal?: string | null;
          target_weight?: number | null;
          workouts_per_week?: number | null;
          workout_duration?: number | null;
          difficulty_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone?: string | null;
          fitness_goal?: string | null;
          target_weight?: number | null;
          workouts_per_week?: number | null;
          workout_duration?: number | null;
          difficulty_level?: string | null;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          duration_minutes: number;
          difficulty: string;
          exercises: Json;
          calories_burned: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          duration_minutes: number;
          difficulty: string;
          exercises?: Json;
          calories_burned?: number | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          duration_minutes?: number;
          difficulty?: string;
          exercises?: Json;
          calories_burned?: number | null;
          completed_at?: string | null;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: string;
          food_item: string;
          calories: number;
          protein: number | null;
          carbs: number | null;
          fat: number | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: string;
          food_item: string;
          calories: number;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: {
          meal_type?: string;
          food_item?: string;
          calories?: number;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          logged_at?: string;
        };
      };
      progress_logs: {
        Row: {
          id: string;
          user_id: string;
          weight: number | null;
          body_fat_percentage: number | null;
          steps: number | null;
          active_minutes: number | null;
          notes: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight?: number | null;
          body_fat_percentage?: number | null;
          steps?: number | null;
          active_minutes?: number | null;
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: {
          weight?: number | null;
          body_fat_percentage?: number | null;
          steps?: number | null;
          active_minutes?: number | null;
          notes?: string | null;
          logged_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
