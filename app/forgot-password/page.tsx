"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconShield, IconSparkles, IconCheck, IconArrowUp } from "@/src/components/Icons";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: "email" | Step 2: "otp_reset"
  const [step, setStep] = useState<"email" | "otp_reset">("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to send verification code. Please check your email.");
        setLoading(false);
        return;
      }

      setMessage("A 6-digit verification code has been dispatched to your email.");
      setStep("otp_reset");
    } catch {
      setError("Network error. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
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
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to reset password. Please verify your code.");
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage("A fresh 6-digit code has been sent to your inbox.");
      } else {
        setError(data.error || "Unable to resend code.");
      }
    } catch {
      setError("Network error while resending code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070709] text-[#f4f4f7] flex items-center justify-center p-4 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* LOGO & BRANDING */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="IP-SAKTI Logo"
            className="inline-block h-14 w-14 rounded-2xl object-contain shadow-2xl mb-1 border border-[#222232]"
          />
          <h1 className="text-xl font-bold tracking-tight text-white">
            {step === "email" ? "Reset Your Password" : "Enter Verification Code"}
          </h1>
          <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto">
            {step === "email"
              ? "Enter your registered email address and we'll send you a 6-digit verification code."
              : `We've sent a 6-digit OTP code to ${email}.`}
          </p>
        </div>

        {/* RECOVERY CARD */}
        <div className="rounded-2xl border border-[#1e1e28] bg-[#0e0e14] p-6 sm:p-8 shadow-2xl space-y-5">
          {message && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-sans flex items-start gap-2">
              <IconCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-sans">
              {error}
            </div>
          )}

          {step === "email" ? (
            /* STEP 1: REQUEST OTP */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Registered Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@ipsakti.gov.in"
                  required
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Dispatching Code...</span>
                  </>
                ) : (
                  <span>Send 6-Digit OTP</span>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: VERIFY OTP & SET NEW PASSWORD */
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-300">6-Digit OTP Code</label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-center font-mono text-base tracking-widest text-emerald-400 placeholder:text-zinc-700 outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">New Password</label>
                <div className="relative mt-1">
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
                  className="mt-1 w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !password}
                className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Verifying & Updating...</span>
                  </>
                ) : (
                  <span>Verify OTP & Update Password</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {/* BACK TO LOGIN */}
          <div className="pt-2 border-t border-[#1a1a24] text-center">
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-white transition font-medium inline-flex items-center gap-1"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>

        {/* FOOTER BADGE */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-zinc-600 font-mono">
          <IconShield className="w-3.5 h-3.5 text-zinc-500" />
          <span>256-Bit TLS Grounded Verification</span>
        </div>
      </div>
    </main>
  );
}