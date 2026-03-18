"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Target,
  Shield,
  ChevronRight,
  LogOut,
  Calendar,
  Lock,
  FileText,
  Scale,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Calculator,
  Ruler,
  Sun,
  Moon,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

type Tab = "overview" | "personal" | "goals" | "privacy" | "change-password" | "privacy-policy" | "terms" | "delete-account" | "bmi-calculator";

type BMICategory = "underweight" | "normal" | "overweight" | "obese";
type ThemeMode = "light" | "dark";

interface BMIResult {
  value: number;
  category: BMICategory;
}

const bmiCategoryInfo: Record<BMICategory, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  underweight: { 
    label: "Underweight", 
    color: "text-blue-500", 
    bgColor: "bg-blue-100",
    darkBgColor: "bg-blue-900/30"
  },
  normal: { 
    label: "Normal", 
    color: "text-green-500", 
    bgColor: "bg-green-100",
    darkBgColor: "bg-green-900/30"
  },
  overweight: { 
    label: "Overweight", 
    color: "text-yellow-500", 
    bgColor: "bg-yellow-100",
    darkBgColor: "bg-yellow-900/30"
  },
  obese: { 
    label: "Obese", 
    color: "text-red-500", 
    bgColor: "bg-red-100",
    darkBgColor: "bg-red-900/30"
  },
};

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("bmi-calculator");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("weight_loss");
  const [targetWeight, setTargetWeight] = useState("");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState("3");
  const [workoutDuration, setWorkoutDuration] = useState("45");
  const [isSaving, setIsSaving] = useState(false);
  const [memberSince, setMemberSince] = useState("");
  const [goalNotification, setGoalNotification] = useState<string | null>(null);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // BMI Calculator state
  const [bmiTheme, setBmiTheme] = useState<ThemeMode>("dark");
  const [bmiHeightUnit, setBmiHeightUnit] = useState<"cm" | "m">("cm");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiErrors, setBmiErrors] = useState<{ height?: string; weight?: string }>({});
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

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

    const profile = profileData as {
      phone: string | null;
      date_of_birth: string | null;
      gender: string | null;
      weight: number | null;
      fitness_goal: string | null;
      target_weight: number | null;
      workouts_per_week: number | null;
      workout_duration: number | null;
    } | null;

    if (profile) {
      setPhone(profile.phone || "");
      setDob(profile.date_of_birth || "");
      setGender(profile.gender || "male");
      setWeight((profile.weight as number)?.toString() || "");
      setFitnessGoal(profile.fitness_goal || "weight_loss");
      setTargetWeight(profile.target_weight?.toString() || "");
      setWorkoutsPerWeek(profile.workouts_per_week?.toString() || "3");
      setWorkoutDuration(profile.workout_duration?.toString() || "45");

      // Check if user reached their target weight
      if (profile.target_weight && profile.weight) {
        const diff = Math.abs(profile.weight - profile.target_weight);
        if (diff <= 0.5) {
          setGoalNotification("Congratulations! You've reached your target weight goal!");
        }
      }
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

      // Check goal after saving weight
      const currentWeight = data.weight ? Number(data.weight) : weight ? Number(weight) : null;
      const target = data.target_weight ? Number(data.target_weight) : targetWeight ? Number(targetWeight) : null;
      if (currentWeight && target) {
        const diff = Math.abs(currentWeight - target);
        if (diff <= 0.5) {
          setGoalNotification("Congratulations! You've reached your target weight goal!");
        } else {
          setGoalNotification(null);
        }
      }
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

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in both fields");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all user data from tables (cascade should handle it, but be explicit)
      await Promise.all([
        (supabase.from("progress_logs") as any).delete().eq("user_id", user.id),
        (supabase.from("meals") as any).delete().eq("user_id", user.id),
        (supabase.from("workouts") as any).delete().eq("user_id", user.id),
      ]);

      // Delete from users table
      await (supabase.from("users") as any).delete().eq("id", user.id);

      // Delete the auth user via API route
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        console.warn("Delete auth user API returned error, signing out anyway");
      }

      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "Personal Information",
      tab: "personal" as Tab,
    },
    { icon: Target, label: "Fitness Goals", tab: "goals" as Tab },
    { icon: Calculator, label: "BMI Calculator", tab: "bmi-calculator" as Tab },
    {
      icon: Shield,
      label: "Privacy & Security",
      tab: "privacy" as Tab,
    },
  ];

  // Overview
  if (activeTab === "overview") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Profile</h1>

        {/* Goal notification */}
        {goalNotification && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{goalNotification}</p>
              <button
                onClick={() => setGoalNotification(null)}
                className="text-xs text-green-500/60 hover:text-green-400 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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
      <div className="space-y-6 max-w-2xl mx-auto">
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
          <Input
            label="Current Weight (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70"
            icon={<Scale className="w-4 h-4" />}
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
              weight: weight ? parseFloat(weight) : null,
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
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-white">Fitness Goals</h1>

        {/* Goal notification */}
        {goalNotification && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold">{goalNotification}</p>
          </div>
        )}

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
            label="Target Weight (kg)"
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="65"
            icon={<Target className="w-4 h-4" />}
          />
          {weight && targetWeight && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5">
              <p className="text-xs text-slate-400">
                Current: <span className="text-white font-medium">{weight} kg</span>
                {" → "}Target: <span className="text-brand-400 font-medium">{targetWeight} kg</span>
                {" · "}Difference:{" "}
                <span className={`font-medium ${Math.abs(parseFloat(weight) - parseFloat(targetWeight)) <= 0.5 ? "text-green-400" : "text-yellow-400"}`}>
                  {Math.abs(parseFloat(weight) - parseFloat(targetWeight)).toFixed(1)} kg
                </span>
              </p>
            </div>
          )}
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
              target_weight: targetWeight ? parseFloat(targetWeight) : null,
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

  // Change Password
  if (activeTab === "change-password") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("privacy")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Privacy & Security
        </button>
        <h1 className="text-2xl font-bold text-white">Change Password</h1>

        {passwordError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Password updated successfully!
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              icon={<Lock className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              icon={<Lock className="w-4 h-4" />}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button
          variant="primary"
          fullWidth
          isLoading={isChangingPassword}
          onClick={handleChangePassword}
        >
          Update Password
        </Button>
      </div>
    );
  }

  // Privacy Policy
  if (activeTab === "privacy-policy") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("privacy")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Privacy & Security
        </button>
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        <Card padding="lg">
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Last updated:</strong> March 2026
            </p>

            <h3 className="text-white text-base font-semibold">1. Information We Collect</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We collect information you provide directly, including your name, email address, fitness data,
              workout history, meal logs, and body measurements. This data is used solely to provide and
              improve the FitLife service.
            </p>

            <h3 className="text-white text-base font-semibold">2. How We Use Your Information</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your data is used to personalize your fitness experience, track your progress, provide AI
              coaching recommendations, and improve our services. We do not sell your personal information
              to third parties.
            </p>

            <h3 className="text-white text-base font-semibold">3. Data Storage & Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              All data is stored securely using Supabase with row-level security policies. Your data is
              encrypted in transit and at rest. Only you can access your personal data through authenticated
              sessions.
            </p>

            <h3 className="text-white text-base font-semibold">4. Data Deletion</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You may delete your account and all associated data at any time through the Privacy & Security
              settings. Once deleted, your data cannot be recovered.
            </p>

            <h3 className="text-white text-base font-semibold">5. Contact</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              If you have questions about this privacy policy, please contact us through the app.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Terms of Service
  if (activeTab === "terms") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("privacy")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Privacy & Security
        </button>
        <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
        <Card padding="lg">
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Last updated:</strong> March 2026
            </p>

            <h3 className="text-white text-base font-semibold">1. Acceptance of Terms</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              By using FitLife, you agree to these Terms of Service. If you do not agree, please do not use the service.
            </p>

            <h3 className="text-white text-base font-semibold">2. Use of Service</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              FitLife provides fitness tracking, meal logging, workout planning, and AI coaching features.
              The service is intended for personal, non-commercial use. You are responsible for maintaining
              the confidentiality of your account.
            </p>

            <h3 className="text-white text-base font-semibold">3. Health Disclaimer</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              FitLife is not a substitute for professional medical advice. Always consult with a healthcare
              provider before starting any fitness program. The AI coach provides general fitness guidance
              and should not be treated as medical advice.
            </p>

            <h3 className="text-white text-base font-semibold">4. Account Termination</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You may terminate your account at any time by using the Delete Account feature. We reserve
              the right to suspend or terminate accounts that violate these terms.
            </p>

            <h3 className="text-white text-base font-semibold">5. Limitation of Liability</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              FitLife is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              injuries, health issues, or damages arising from the use of this service.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Delete Account
  if (activeTab === "delete-account") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("privacy")}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Privacy & Security
        </button>
        <h1 className="text-2xl font-bold text-red-400">Delete Account</h1>

        <Card padding="lg" className="border-red-500/20">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold">This action is permanent</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-slate-400 text-sm mt-2 space-y-1">
                  <li>• Your profile and personal information</li>
                  <li>• All workout history and records</li>
                  <li>• All meal logs and nutrition data</li>
                  <li>• All progress logs and measurements</li>
                  <li>• Your authentication account</li>
                </ul>
                <p className="text-red-400/80 text-sm mt-3 font-medium">
                  This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {deleteError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {deleteError}
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Type <span className="text-red-400 font-bold">DELETE</span> to confirm
          </label>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE here"
          />
        </div>

        <Button
          variant="danger"
          fullWidth
          isLoading={isDeleting}
          onClick={handleDeleteAccount}
          disabled={deleteConfirmText !== "DELETE"}
        >
          <Trash2 className="w-4 h-4" />
          Permanently Delete My Account
        </Button>
      </div>
    );
  }

  // BMI Calculator
  if (activeTab === "bmi-calculator") {
    const isLight = bmiTheme === "light";
    const containerBg = isLight ? "bg-gray-50 rounded-2xl p-4" : "bg-transparent";
    const cardBg = isLight 
      ? "bg-white border-gray-200 shadow-lg" 
      : "bg-slate-800/60 border-white/5 shadow-card backdrop-blur-sm";
    const inputBg = isLight 
      ? "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400" 
      : "bg-slate-900/60 border-slate-700/50 text-white placeholder-slate-500";
    const labelColor = isLight ? "text-gray-700" : "text-slate-300";
    const textPrimary = isLight ? "text-gray-900" : "text-white";
    const textSecondary = isLight ? "text-gray-500" : "text-slate-400";
    const buttonSecondaryBg = isLight 
      ? "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200" 
      : "bg-slate-700 border-slate-600/50 text-white hover:bg-slate-600";

    const validateBmiInputs = (): boolean => {
      const newErrors: { height?: string; weight?: string } = {};
      
      if (!bmiHeight.trim()) {
        newErrors.height = "Height is required";
      } else {
        const heightNum = parseFloat(bmiHeight);
        if (isNaN(heightNum) || heightNum <= 0) {
          newErrors.height = "Height must be a positive number";
        } else if (bmiHeightUnit === "cm" && (heightNum < 50 || heightNum > 300)) {
          newErrors.height = "Height must be between 50-300 cm";
        } else if (bmiHeightUnit === "m" && (heightNum < 0.5 || heightNum > 3)) {
          newErrors.height = "Height must be between 0.5-3 m";
        }
      }

      if (!bmiWeight.trim()) {
        newErrors.weight = "Weight is required";
      } else {
        const weightNum = parseFloat(bmiWeight);
        if (isNaN(weightNum) || weightNum <= 0) {
          newErrors.weight = "Weight must be a positive number";
        } else if (weightNum < 10 || weightNum > 500) {
          newErrors.weight = "Weight must be between 10-500 kg";
        }
      }

      setBmiErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const calculateBMI = () => {
      if (!validateBmiInputs()) return;

      const weightKg = parseFloat(bmiWeight);
      let heightM = parseFloat(bmiHeight);
      
      if (bmiHeightUnit === "cm") {
        heightM = heightM / 100;
      }

      const bmi = weightKg / (heightM * heightM);
      const category = getBMICategory(bmi);

      setBmiResult({ value: Math.round(bmi * 10) / 10, category });
    };

    const resetBmiForm = () => {
      setBmiHeight("");
      setBmiWeight("");
      setBmiErrors({});
      setBmiResult(null);
    };

    return (
      <div className={`space-y-6 max-w-2xl mx-auto ${containerBg} transition-colors duration-300`}>
        {/* Header with Back and Theme Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-sm ${isLight ? "text-gray-500 hover:text-gray-900" : "text-slate-400 hover:text-white"} transition-colors`}
          >
            ← Back to Profile
          </button>
          <button
            onClick={() => setBmiTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className={`p-2.5 rounded-xl border transition-all duration-200 
                       ${isLight 
                         ? "bg-white border-gray-200 text-gray-600 hover:text-brand-500 shadow-sm hover:shadow-md" 
                         : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-brand-400"}`}
            aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 
                          flex items-center justify-center shadow-brand">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>BMI Calculator</h1>
            <p className={textSecondary}>Calculate your Body Mass Index</p>
          </div>
        </div>

        {/* Calculator Card */}
        <div className={`${cardBg} rounded-2xl border p-6 transition-colors duration-300`}>
          {/* Height Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Height
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}>
                  <Ruler className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  value={bmiHeight}
                  onChange={(e) => {
                    setBmiHeight(e.target.value);
                    if (bmiErrors.height) setBmiErrors((prev) => ({ ...prev, height: undefined }));
                  }}
                  placeholder={bmiHeightUnit === "cm" ? "e.g., 175" : "e.g., 1.75"}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none
                              ${inputBg} border
                              ${bmiErrors.height 
                                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                                : "focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"}`}
                />
              </div>
              <select
                value={bmiHeightUnit}
                onChange={(e) => setBmiHeightUnit(e.target.value as "cm" | "m")}
                className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none cursor-pointer
                           ${inputBg} border focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20`}
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>
            {bmiErrors.height && (
              <p className="mt-1.5 text-xs text-red-500">{bmiErrors.height}</p>
            )}
          </div>

          {/* Weight Input */}
          <div className="mb-8">
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Weight (kg)
            </label>
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}>
                <Scale className="w-5 h-5" />
              </div>
              <input
                type="number"
                value={bmiWeight}
                onChange={(e) => {
                  setBmiWeight(e.target.value);
                  if (bmiErrors.weight) setBmiErrors((prev) => ({ ...prev, weight: undefined }));
                }}
                placeholder="e.g., 70"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none
                            ${inputBg} border
                            ${bmiErrors.weight 
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                              : "focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"}`}
              />
            </div>
            {bmiErrors.weight && (
              <p className="mt-1.5 text-xs text-red-500">{bmiErrors.weight}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={resetBmiForm}
              className={`flex-1 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                         border ${buttonSecondaryBg}`}
            >
              Reset
            </button>
            <button
              onClick={calculateBMI}
              className="flex-1 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                         bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-brand
                         hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              Calculate BMI
            </button>
          </div>
        </div>

        {/* Result Card */}
        {bmiResult && (
          <div className={`${cardBg} rounded-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 
                              flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`font-semibold ${textPrimary}`}>Your BMI Result</h2>
                <p className={`text-sm ${textSecondary}`}>Based on your measurements</p>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${textPrimary} mb-3`}>
                {bmiResult.value}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold 
                              ${bmiCategoryInfo[bmiResult.category].color} 
                              ${isLight ? bmiCategoryInfo[bmiResult.category].bgColor : bmiCategoryInfo[bmiResult.category].darkBgColor}`}>
                {bmiCategoryInfo[bmiResult.category].label}
              </div>
            </div>

            {/* BMI Scale */}
            <div className="mt-6">
              <div className="flex rounded-full overflow-hidden h-3 mb-2">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-green-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              <div className={`flex justify-between text-xs ${textSecondary}`}>
                <span>Under 18.5</span>
                <span>18.5-24.9</span>
                <span>25-29.9</span>
                <span>30+</span>
              </div>
            </div>

            {/* BMI Categories Reference */}
            <div className={`mt-6 pt-6 border-t ${isLight ? "border-gray-100" : "border-slate-700/50"}`}>
              <h3 className={`text-sm font-medium ${labelColor} mb-3`}>
                BMI Categories
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(Object.entries(bmiCategoryInfo) as [BMICategory, typeof bmiCategoryInfo[BMICategory]][]).map(([key, info]) => (
                  <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg 
                                             ${bmiResult.category === key 
                                               ? (isLight ? info.bgColor : info.darkBgColor)
                                               : (isLight ? "bg-gray-50" : "bg-slate-900/40")}`}>
                    <span className={`w-2 h-2 rounded-full ${info.color.replace("text-", "bg-")}`} />
                    <span className={`${bmiResult.category === key ? info.color : textSecondary}`}>
                      {info.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Health Disclaimer */}
        <p className={`text-center text-xs ${textSecondary} px-4`}>
          BMI is a general indicator and may not accurately reflect body composition for athletes, 
          elderly, or pregnant individuals. Consult a healthcare professional for personalized advice.
        </p>
      </div>
    );
  }

  // Privacy & Security
  if (activeTab === "privacy") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
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
          <button
            onClick={() => {
              setPasswordError(null);
              setPasswordSuccess(false);
              setNewPassword("");
              setConfirmPassword("");
              setActiveTab("change-password");
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-white/5
                       hover:border-white/10 transition-all text-sm text-white"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-brand-400" />
              Change Password
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Legal
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("privacy-policy")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-white/5
                         hover:border-white/10 transition-all text-sm text-white"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand-400" />
                Privacy Policy
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-white/5
                         hover:border-white/10 transition-all text-sm text-white"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand-400" />
                Terms of Service
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Account
          </h3>
          <button
            onClick={() => {
              setDeleteConfirmText("");
              setDeleteError(null);
              setActiveTab("delete-account");
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20
                       hover:border-red-500/30 hover:bg-red-500/10 transition-all text-sm text-red-400"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
}
