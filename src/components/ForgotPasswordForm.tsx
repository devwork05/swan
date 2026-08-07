"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function ForgotPasswordForm() {
  // If the user is already signed in, bounce them into the app.
  useAuth({ middleware: "guest" });

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.auth.forgotPassword(email.trim()),
    onSuccess: () => {
      setSent(true);
      toast.success("If that email exists, a reset link is on its way.");
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong. Try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate();
  };

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
          Forgot your password?
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-brand-gray dark:text-slate-400">
          Enter the email tied to your account and we&apos;ll send you a link to reset it.
        </p>

        {sent ? (
          <div className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[13px] leading-[1.6] text-emerald-600 dark:text-emerald-400">
            <p className="font-semibold">Check your inbox.</p>
            <p className="mt-1">
              If <span className="font-medium">{email}</span> is registered, a reset link has been sent. The link expires in 30 minutes.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-3 text-[12px] font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
            >
              Send to a different email
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-[13.5px] font-medium text-brand-navy dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a0ac]">
                  <Mail className="h-4 w-4" />
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

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-red py-3.5 font-montserrat text-[15px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:opacity-60"
            >
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-[14px] text-brand-gray dark:text-slate-400">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-brand-red hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
