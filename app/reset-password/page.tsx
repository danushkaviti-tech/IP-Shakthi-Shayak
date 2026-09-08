"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { IconShield, IconSparkles, IconCheck } from "@/src/components/Icons";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing password reset link token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to reset password. Link may have expired.");
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* LOGO & BRANDING */}
      <div className="text-center space-y-2">
        <img
          src="/logo.png"
          alt="IP-SAKTI Logo"
          className="inline-block h-14 w-14 rounded-2xl object-contain shadow-2xl mb-1 border border-[#222232]"
        />
        <h1 className="text-xl font-bold tracking-tight text-white">
          Create New Password
        </h1>
        <p className="text-xs text-zinc-400 font-sans">
          {emailParam ? `Resetting password for ${emailParam}` : "Choose a strong password for your account."}
        </p>
      </div>

      {/* FORM CARD */}
      <div className="rounded-2xl border border-[#1e1e28] bg-[#0e0e14] p-6 sm:p-8 shadow-2xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">New Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 pr-12 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              required
              className="mt-1.5 w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-sans">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-sans flex items-start gap-2">
              <IconCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || password.length < 6}
            className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save & Update Password</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#1a1a24] text-center">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-white transition font-medium inline-flex items-center gap-1"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-zinc-600 font-mono">
        <IconShield className="w-3.5 h-3.5 text-zinc-500" />
        <span>256-Bit TLS Grounded Verification</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#070709] text-[#f4f4f7] flex items-center justify-center p-4 font-sans selection:bg-zinc-800 selection:text-white">
      <Suspense fallback={<div className="text-zinc-500 text-xs font-mono">Loading security token...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}