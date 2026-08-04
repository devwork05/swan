"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import COUNTRIES from "@/data/countries";
import { api, saveAuth } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13.5px] font-medium text-brand-navy dark:text-primary dark:text-slate-200">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputIcon = (
  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  </span>
);

export default function RegisterForm() {
  const router = useRouter();
  const qc = useQueryClient();
  // Bounce already-authenticated users straight to their dashboard.
  useAuth({ middleware: "guest" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferredBy(ref);
  }, []);

  const registerMutation = useMutation({
    mutationFn: () =>
      api.auth.register({
        fullName: `${firstName} ${lastName}`,
        email,
        password,
        referredBy: referredBy || undefined,
      }),
    onSuccess: (response) => {
      saveAuth(response);
      // Seed the /auth/me cache so the dashboard layout sees the new user
      // immediately instead of bouncing back to /login.
      qc.setQueryData(["auth", "me"], response.user);
      toast.success(`Account created — welcome, ${firstName || response.user.fullName}!`);
      router.replace(response.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    },
    onError: (err: Error) => {
      const msg = err.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    },
  });
  const loading = registerMutation.isPending;

  const eye = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      aria-label="Toggle password visibility"
      onClick={toggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac] transition-colors hover:text-brand-navy dark:text-primary dark:hover:text-white"
    >
      {show ? (
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
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-[16px] border border-line bg-white dark:bg-card p-8 shadow-[0_24px_70px_-30px_rgba(1,24,64,0.25)] dark:border-[#2a314a] dark:bg-[#131827] sm:p-10">
        <h2 className="font-montserrat text-[24px] font-bold text-brand-navy dark:text-primary dark:text-white">
          Create an Account
        </h2>
        <p className="mt-2 text-[14px] text-brand-gray dark:text-muted dark:text-slate-400">
          Complete the details below to sign up
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Field id="account-type" label="Account Type">
            <select id="account-type" className="auth-input auth-input--plain" defaultValue="">
              <option value="" disabled>
                Select account type
              </option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="first-name" label="First Name">
              <input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="auth-input auth-input--plain"
              />
            </Field>
            <Field id="last-name" label="Last Name">
              <input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="auth-input auth-input--plain"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="dob" label="Date of Birth">
              <input id="dob" type="date" required className="auth-input auth-input--plain" />
            </Field>
            <Field id="phone" label="Phone Number">
              <input id="phone" type="tel" required placeholder="Phone number" className="auth-input auth-input--plain" />
            </Field>
          </div>

          <Field id="country" label="Country">
            <select id="country" required className="auth-input auth-input--plain" defaultValue="">
              <option value="" disabled>
                Select your country
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field id="reg-email" label="Email Address">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3.5 6.5l8.5 6 8.5-6" />
                </svg>
              </span>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="auth-input"
              />
            </div>
          </Field>

          <Field id="username" label="Username">
            <div className="relative">
              {inputIcon}
              <input id="username" type="text" required placeholder="Choose a username" className="auth-input" />
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="reg-password" label="Password">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="auth-input !pr-11"
                />
                {eye(showPassword, () => setShowPassword((v) => !v))}
              </div>
            </Field>
            <Field id="confirm-password" label="Confirm Password">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="auth-input !pr-11"
                />
                {eye(showConfirm, () => setShowConfirm((v) => !v))}
              </div>
            </Field>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-red py-3.5 font-montserrat text-[15px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:opacity-60"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
              <path d="M18 8v6M21 11h-6" />
            </svg>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-7 text-center text-[14px] text-brand-gray dark:text-muted dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-red hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] text-[#99a0ac]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
        </svg>
        Secure registration - Your data is protected
      </p>
    </div>
  );
}
