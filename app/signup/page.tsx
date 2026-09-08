"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully. Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070709] text-[#f4f4f7] flex items-center justify-center p-4 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* LOGO */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="IP-SAKTI Logo"
            className="inline-block h-14 w-14 rounded-2xl object-contain shadow-2xl mb-1 border border-[#222232]"
          />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Create IP-SAKTI Account
          </h1>
          <p className="text-xs text-zinc-500 font-sans">
            Source-grounded intellectual property & regulatory RAG intelligence
          </p>
        </div>

        {/* SIGNUP CARD */}
        <div className="rounded-2xl border border-[#1e1e28] bg-[#0e0e14] p-6 sm:p-8 shadow-2xl space-y-5">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Sharma"
                required
                className="mt-1.5 w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Email address</label>
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

            <div>
              <label className="text-xs font-medium text-zinc-300">Password</label>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 font-mono text-[10px]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Confirm Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 pr-12 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 font-mono text-[10px]"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-100 text-black hover:bg-white py-2.5 text-xs font-semibold transition disabled:opacity-50 shadow-md"
            >
              {loading ? "Creating account..." : "Register Account"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Already registered?{" "}
            <Link href="/login" className="text-white font-medium underline underline-offset-4 hover:text-zinc-300">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-zinc-600 font-mono">
          IP-SAKTI Sahayak • Autonomous RAG Knowledge System
        </p>
      </div>
    </main>
  );
}