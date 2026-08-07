"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function ResetPasswordForm() {
  useAuth({ middleware: "guest" });
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.auth.resetPassword(token, password),
    onSuccess: () => {
      setDone(true);
      toast.success("Password updated. You can sign in with your new password.");
      // Give the user a beat to read the confirmation, then bounce to login.
      setTimeout(() => router.replace("/login"), 2000);
    },
    onError: (err: Error) => {
      const msg = err.message || "Reset failed. Please request a new link.";
      setError(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    mutation.mutate();
  };

  if (!token) {
    return (
      <div className="w-full max-w-[440px]">
        <div className="rounded-[16px] border border-line bg-white p-8 shadow-[0_24px_70px_-30px_rgba(1,24,64,0.25)] dark:border-[#2a314a] dark:bg-[#131827] sm:p-10">
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-[13px] text-red-600 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Missing reset token</p>
              <p className="mt-1">This link is incomplete. Request a new reset email and try again.</p>
            </div>
          </div>
          <Link
            href="/forgot-password"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-red py-3.5 font-montserrat text-[15px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-[16px] border border-line bg-white p-8 shadow-[0_24px_70px_-30px_rgba(1,24,64,0.25)] dark:border-[#2a314a] dark:bg-[#131827] sm:p-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-gray transition-colors hover:text-brand-red dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <h2 className="mt-5 font-montserrat text-[24px] font-bold text-brand-navy dark:text-white">
          Choose a new password
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-brand-gray dark:text-slate-400">
          Pick something at least 8 characters long. All existing sessions will be signed out.
        </p>

        {done ? (
          <div className="mt-8 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[13px] text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Password updated</p>
              <p className="mt-1">Taking you to sign in…</p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <PasswordField
              id="new-password"
              label="New Password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="At least 8 characters"
            />

            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              placeholder="Repeat your new password"
            />

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-[13px] text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-red py-3.5 font-montserrat text-[15px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:opacity-60"
            >
              {mutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13.5px] font-medium text-brand-navy dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
          <Lock className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="auth-input !pr-11"
        />
        <button
          type="button"
          aria-label="Toggle password visibility"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac] transition-colors hover:text-brand-navy dark:hover:text-white"
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
      </div>
    </div>
  );
}
