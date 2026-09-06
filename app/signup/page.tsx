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
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setError("");

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
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
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

        {/* LEFT SIDE */}
        <div className="hidden lg:block px-8">

          <div className="flex items-center gap-3 mb-8">

            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
              IP
            </div>

            <div>
              <h1 className="font-bold text-xl">
                IP-SAKTI
              </h1>

              <p className="text-xs text-slate-500">
                Sahayak
              </p>
            </div>

          </div>

          <h2 className="text-5xl font-bold leading-tight">

            Build your
            <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              IP research workspace.
            </span>

          </h2>

          <p className="mt-6 text-lg text-slate-400 leading-8 max-w-lg">
            Create your account and access AI-powered,
            source-cited intellectual property and regulatory
            guidance for Ayurveda.
          </p>

          <div className="mt-8 space-y-4">

            {[
              "AI-powered RAG research",
              "Authoritative source citations",
              "Multilingual assistance",
              "Secure personal workspace",
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

        {/* SIGNUP CARD */}
        <div className="w-full max-w-md mx-auto">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-7">

              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
                IP
              </div>

            </div>

            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold">
                Create account
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Start your IP-SAKTI research workspace
              </p>

            </div>

            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* NAME */}
              <div>

                <label className="text-sm text-slate-300">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />

              </div>

              {/* EMAIL */}
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="text-sm text-slate-300">
                  Password
                </label>

                <div className="relative mt-2">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-16 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="text-sm text-slate-300">
                  Confirm password
                </label>

                <div className="relative mt-2">

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Re-enter your password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-16 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/10"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
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

              Already have an account?{" "}

              <Link
                href="/login"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                Sign in
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