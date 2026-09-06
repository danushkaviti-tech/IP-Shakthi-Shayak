"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch {
      setError("Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] flex items-center justify-center px-5 text-white relative overflow-hidden">

      <div className="absolute top-[-150px] left-[-100px] w-[350px] h-[350px] bg-violet-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-bold text-xl">
            IP
          </div>

          <h1 className="text-3xl font-bold">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we'll send you a secure reset link.
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-sm text-slate-300">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

          </form>

          <div className="mt-7 text-center">
            <Link
              href="/login"
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              ← Back to Sign In
            </Link>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your account security is important to us.
        </p>

      </div>
    </main>
  );
}