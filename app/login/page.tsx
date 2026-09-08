"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { IconShield, IconSparkles } from "@/src/components/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await executeLogin(email.toLowerCase().trim(), password);
  }

  async function executeLogin(userEmail: string, userPass: string) {
    setError("");
    setLoading(true);

    try {
      try {
        await signOut({ redirect: false });
      } catch {
        // Ignore signout errors
      }

      const result = await signIn("credentials", {
        email: userEmail,
        password: userPass,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid credentials. Please verify your username/email and password.");
        setLoading(false);
        return;
      }

      const isAdmin =
        userEmail.toLowerCase().includes("danush") ||
        userEmail.toLowerCase() === "danush@ipsakti.gov.in";

      if (isAdmin) {
        window.location.href = "/admin/analytics";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Authentication error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070709] text-[#f4f4f7] flex items-center justify-center p-4 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* LOGO */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-zinc-100 text-black font-bold items-center justify-center text-lg shadow-xl mb-1">
            IP
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            IP-SAKTI Regulatory Intelligence
          </h1>
          <p className="text-xs text-zinc-500 font-sans">
            Enterprise RAG Platform for Intellectual Property & Traditional Knowledge
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-2xl border border-[#1e1e28] bg-[#0e0e14] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* CREDENTIALS INFO BADGE */}
          <div className="p-3.5 rounded-xl border border-[#222230] bg-[#12121a] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <IconShield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Authentication Required</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Admin Login ID: <span className="text-white font-semibold">danush</span>
              <br />
              Admin Password: <span className="text-white font-semibold">Danush@2026</span> (or <span className="text-white">danush123</span>)
            </p>
          </div>

          {/* CREDENTIALS FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Username or Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="danush or researcher@ipsakti.gov.in"
                required
                autoComplete="username"
                className="mt-1.5 w-full rounded-xl border border-[#1e1e28] bg-[#070709] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-zinc-500 hover:text-white transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            {error && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-100 text-black hover:bg-white py-2.5 text-xs font-semibold transition disabled:opacity-50 shadow-md"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white font-medium underline underline-offset-4 hover:text-zinc-300">
              Create account
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
