"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, saveAuth } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  // Bounce already-authenticated users straight to their dashboard.
  useAuth({ middleware: "guest" });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => api.auth.login({ email, password }),
    onSuccess: (response) => {
      saveAuth(response);
      router.push(response.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    },
    onError: (err: Error) => setError(err.message || "Login failed. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate();
  };
  const loading = loginMutation.isPending;

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-[16px] border border-line bg-white dark:bg-card p-8 shadow-[0_24px_70px_-30px_rgba(1,24,64,0.25)] dark:border-[#2a314a] dark:bg-[#131827] sm:p-10">
        <h2 className="font-montserrat text-[24px] font-bold text-brand-navy dark:text-primary dark:text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-[14px] text-brand-gray dark:text-muted dark:text-slate-400">
          Sign in to your account to continue
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-[13.5px] font-medium text-brand-navy dark:text-primary dark:text-slate-200">
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6.5l8.5 6 8.5-6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-[13.5px] font-medium text-brand-navy dark:text-primary dark:text-slate-200">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input !pr-11"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac] transition-colors hover:text-brand-navy dark:text-primary dark:hover:text-white"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18" strokeLinecap="round" />
                    <path d="M10.6 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.7 3.7M6.6 6.6C4 8 2.5 10.4 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.4 4.2-1" />
                    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7s-9-4.5-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-brand-gray dark:text-muted dark:text-slate-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#d0d5dd] accent-brand-red"
              />
              Remember me
            </label>
            <Link href="#" className="text-[13.5px] font-medium text-brand-red hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-red py-3.5 font-montserrat text-[15px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:opacity-60"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-7 text-center text-[14px] text-brand-gray dark:text-muted dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-red hover:underline">
            Sign up now
          </Link>
        </p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] text-[#99a0ac]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
        </svg>
        Secure login - Your data is protected
      </p>
    </div>
  );
}
