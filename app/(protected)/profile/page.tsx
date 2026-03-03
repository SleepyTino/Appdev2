"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Target,
  Settings,
  Shield,
  ChevronRight,
  LogOut,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

type Tab = "overview" | "personal" | "goals" | "settings" | "privacy";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [fitnessGoal, setFitnessGoal] = useState("weight_loss");
  const [targetWeight, setTargetWeight] = useState("");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState("3");
  const [workoutDuration, setWorkoutDuration] = useState("45");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [isSaving, setIsSaving] = useState(false);
  const [memberSince, setMemberSince] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
    setUserEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || "");
    setMemberSince(
      new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    );

    // Load extended profile from users table
    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as { phone: string | null; date_of_birth: string | null; gender: string | null; fitness_goal: string | null; target_weight: number | null; workouts_per_week: number | null; workout_duration: number | null; difficulty_level: string | null } | null;
    if (profile) {
      setPhone(profile.phone || "");
      setDob(profile.date_of_birth || "");
      setGender(profile.gender || "male");
      setFitnessGoal(profile.fitness_goal || "weight_loss");
      setTargetWeight(profile.target_weight?.toString() || "");
      setWorkoutsPerWeek(profile.workouts_per_week?.toString() || "3");
      setWorkoutDuration(profile.workout_duration?.toString() || "45");
      setDifficulty(profile.difficulty_level || "intermediate");
    }
  };

  const saveProfile = async (data: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await (supabase.from("users") as any).upsert({
        id: user.id,
        email: user.email,
        ...data,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    {
      icon: User,
      label: "Personal Information",
      tab: "personal" as Tab,
    },
    { icon: Target, label: "Fitness Goals", tab: "goals" as Tab },
    {
      icon: Settings,
      label: "Activity Settings",
      tab: "settings" as Tab,
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      tab: "privacy" as Tab,
    },
  ];

  // Overview
  if (activeTab === "overview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
        <h1 className="text-2xl font-bold text-white">Profile</h1>

        {/* Avatar & Name */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
            {userName[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-white">{userName}</h2>
          <p className="text-sm text-slate-400">{userEmail}</p>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.tab)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-white/5
                         hover:border-white/10 hover:bg-slate-800/80 transition-all group text-left"
            >
              <item.icon className="w-5 h-5 text-brand-400" />
              <span className="flex-1 text-sm font-medium text-white">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </button>
          ))}
        </div>

        {/* Member since */}
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Member Since</span>
          </div>
          <p className="font-semibold text-brand-400">{memberSince}</p>
        </Card>

        <Button variant="danger" fullWidth onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    );
  }

  // Personal Information
  if (activeTab === "personal") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("overview")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-white">Personal Information</h1>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
          <Input
            label="Email Address"
            value={userEmail}
            disabled
            placeholder="Email"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>
        <Button
          variant="primary"
          fullWidth
          isLoading={isSaving}
          onClick={() =>
            saveProfile({
              full_name: fullName,
              phone,
              date_of_birth: dob || null,
              gender,
            })
          }
        >
          Save Changes
        </Button>
      </div>
    );
  }

  // Fitness Goals
  if (activeTab === "goals") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("overview")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-white">Fitness Goals</h1>
        <div className="space-y-4">
          <Select
            label="Primary Goal"
            value={fitnessGoal}
            onChange={(e) => setFitnessGoal(e.target.value)}
            options={[
              { value: "weight_loss", label: "Weight Loss" },
              { value: "muscle_gain", label: "Muscle Gain" },
              { value: "endurance", label: "Endurance" },
              { value: "flexibility", label: "Flexibility" },
              { value: "general_fitness", label: "General Fitness" },
            ]}
          />
          <Input
            label="Target Weight (lbs)"
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="180"
          />
          <Select
            label="Workouts Per Week"
            value={workoutsPerWeek}
            onChange={(e) => setWorkoutsPerWeek(e.target.value)}
            options={[
              { value: "2", label: "1-2 times" },
              { value: "3", label: "3-4 times" },
              { value: "5", label: "5-6 times" },
              { value: "7", label: "Every day" },
            ]}
          />
          <Select
            label="Duration Per Workout"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            options={[
              { value: "15", label: "15 minutes" },
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60+ minutes" },
            ]}
          />
        </div>
        <Button
          variant="primary"
          fullWidth
          isLoading={isSaving}
          onClick={() =>
            saveProfile({
              fitness_goal: fitnessGoal,
              target_weight: targetWeight ? parseInt(targetWeight) : null,
              workouts_per_week: parseInt(workoutsPerWeek),
              workout_duration: parseInt(workoutDuration),
            })
          }
        >
          Update Goals
        </Button>
      </div>
    );
  }

  // Activity Settings
  if (activeTab === "settings") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("overview")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-white">Activity Settings</h1>
        <div className="space-y-6">
          <div>
            <label className="label">Default Difficulty Level</label>
            <div className="flex gap-3">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all
                    ${
                      difficulty === level
                        ? "bg-brand-400 text-surface-900"
                        : "bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600"
                    }
                  `}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Default Workout Duration (minutes)"
            type="number"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setActiveTab("overview")}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            isLoading={isSaving}
            onClick={() =>
              saveProfile({
                difficulty_level: difficulty,
                workout_duration: parseInt(workoutDuration),
              })
            }
          >
            Save Settings
          </Button>
        </div>
      </div>
    );
  }

  // Privacy & Security
  if (activeTab === "privacy") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("overview")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-white">Privacy & Security</h1>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Security
          </h3>
          <Button variant="secondary" fullWidth>
            Change Password
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Privacy
          </h3>
          <div className="space-y-2">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <button
                key={item}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-white/5
                           hover:border-white/10 transition-all text-sm text-white"
              >
                {item}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Account
          </h3>
          <Button variant="danger" fullWidth>
            Delete Account
          </Button>
        </div>
      </div>
    );
  }
}
