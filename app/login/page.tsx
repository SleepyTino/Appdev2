"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError("Failed to initiate Google sign in");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding (desktop only) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(31,199,212,0.15),transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-brand">
              <Flame className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            Transform<br />
            Your <span className="gradient-text">Fitness</span><br />
            Journey
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            AI-powered personal training, nutrition tracking, and progress
            analytics — all in one platform.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-slate-500">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-xs text-slate-500">Workouts Logged</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9</p>
              <p className="text-xs text-slate-500">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 lg:max-w-lg xl:max-w-xl flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FitLife</h1>
              <p className="text-xs text-slate-500">Fitness & Wellness</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm">
              Sign in to continue your fitness journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-900 px-4 text-slate-500">
                or continue with
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
