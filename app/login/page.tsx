"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-5 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-180px] left-[-150px] w-[400px] h-[400px] bg-violet-600/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-180px] right-[-150px] w-[400px] h-[400px] bg-cyan-500/15 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

        {/* Left */}
        <div className="hidden lg:block px-8">

          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/20">
              IP
            </div>

            <div>
              <h1 className="font-bold text-xl">IP-SAKTI</h1>
              <p className="text-xs text-slate-500">
                Sahayak
              </p>
            </div>
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Intelligent guidance for
            <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Ayurveda & IP.
            </span>
          </h2>

          <p className="mt-6 text-slate-400 text-lg leading-8 max-w-lg">
            Explore intellectual property and regulatory guidance with
            source-cited AI assistance designed specifically for Ayurveda.
          </p>

          <div className="mt-8 space-y-4">

            {[
              "Source-cited RAG responses",
              "Indian & international IP guidance",
              "Multilingual AI assistance",
              "Secure research workspace",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <div className="h-6 w-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  ✓
                </div>
                {item}
              </div>
            ))}

          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">

            {/* Logo mobile */}
            <div className="lg:hidden flex justify-center mb-7">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
                IP
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Sign in to your IP-SAKTI workspace
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="text-sm text-slate-300">
                  Email address
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    @
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-violet-400 hover:text-violet-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/10"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-600">
                SECURE WORKSPACE
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                Create account
              </Link>
            </p>

          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            IP-SAKTI Sahayak • AI-assisted research platform
          </p>

        </div>
      </div>
    </main>
  );
}