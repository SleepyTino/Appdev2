"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSent(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FitLife</h1>
            <p className="text-xs text-slate-500">Fitness & Wellness</p>
          </div>
        </div>

        {!isSent ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Forgot password?
              </h2>
              <p className="text-slate-400 text-sm">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Check your email
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              We&apos;ve sent a password reset link to{" "}
              <span className="text-white font-medium">{email}</span>. Click the
              link in the email to reset your password.
            </p>
            <p className="text-slate-500 text-xs">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSent(false)}
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                try again
              </button>
              .
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
