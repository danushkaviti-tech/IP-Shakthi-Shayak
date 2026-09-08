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
        setError("Invalid email or password. Please verify credentials.");
        setLoading(false);
        return;
      }

      const isAdmin =
        userEmail.toLowerCase() === "admin@ipsakti.gov.in" ||
        userEmail.toLowerCase().startsWith("admin@");

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

  function handleDemoUser() {
    setEmail("user@ipsakti.gov.in");
    setPassword("user123");
    executeLogin("user@ipsakti.gov.in", "user123");
  }

  function handleDemoAdmin() {
    setEmail("admin@ipsakti.gov.in");
    setPassword("admin123");
    executeLogin("admin@ipsakti.gov.in", "admin123");
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
        <div className="rounded-2xl border border-[#1e1e28] bg-[#0e0e14] p-4 sm:p-7 shadow-2xl space-y-5">
          {/* QUICK DEMO BUTTONS */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleDemoUser}
                disabled={loading}
                className="p-2.5 sm:p-3 rounded-xl border border-[#222230] bg-[#14141c] hover:bg-[#1a1a24] text-left transition flex flex-col justify-between group disabled:opacity-50 active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white truncate">Researcher</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Demo</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 truncate block w-full">
                  user@ipsakti.gov.in
                </span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="p-2.5 sm:p-3 rounded-xl border border-[#222230] bg-[#14141c] hover:bg-[#1a1a24] text-left transition flex flex-col justify-between group disabled:opacity-50 active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white flex items-center gap-1 truncate">
                    <IconShield className="w-3 h-3 text-zinc-300 shrink-0" />
                    <span className="truncate">Admin</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">Control</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 truncate block w-full">
                  admin@ipsakti.gov.in
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1e1e28]" />
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
              Or with credentials
            </span>
            <div className="h-px flex-1 bg-[#1e1e28]" />
          </div>

          {/* CREDENTIALS FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
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
