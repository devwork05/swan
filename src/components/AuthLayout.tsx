"use client";

import Link from "next/link";
import { useBrandLogo, usePublicSettings } from "@/lib/usePublicSettings";

const FEATURES = [
  {
    title: "Secure Trading",
    text: "State-of-the-art security features to protect your investments",
  },
  {
    title: "Real-Time Analytics",
    text: "Up-to-the-minute market data to inform your decisions",
  },
  {
    title: "Expert Support",
    text: "24/7 customer support from our team of specialists",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const logo = useBrandLogo();
  const { companyName } = usePublicSettings();
  return (
    <main className="auth-dots relative flex min-h-screen flex-col bg-[#f4f6fb] dark:bg-[#0b0f19] lg:flex-row">
      {/* Mobile-only compact logo bar so the form is the first thing users see. */}
      <div className="flex items-center justify-center border-b border-line/60 bg-white/60 py-4 backdrop-blur dark:bg-[#0b0f19]/60 lg:hidden">
        <Link href="/" aria-label={companyName} className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={companyName} className="h-8 w-auto" />
        </Link>
      </div>

      {/* Left brand panel — desktop only. */}
      <div className="relative hidden w-full flex-col px-6 py-8 sm:px-12 lg:flex lg:w-1/2 lg:justify-center lg:px-16">
        <Link href="/" className="absolute left-6 top-8 sm:left-12 lg:left-16" aria-label="Back to home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={companyName} className="h-10 w-auto" />
        </Link>

        <div className="mx-auto mt-24 flex w-full max-w-[520px] flex-col items-center text-center lg:mt-0">
          {/* CSS dashboard illustration */}
          <div className="relative mb-10 h-[190px] w-full max-w-[420px]" aria-hidden>
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-brand-navy dark:bg-elevated shadow-[0_20px_60px_-10px_rgba(1,24,64,0.5)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5b7cff" strokeWidth="2">
                  <path d="M3 17l5-6 4 4 6-8 3 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute -inset-6 -z-10 rounded-full bg-[#5b7cff]/25 blur-2xl" />
            </div>
            {/* floating chips — swap to lighter shades in dark mode so they don't disappear into the bg */}
            <div className="absolute left-[8%] top-[18%] h-8 w-24 rounded-lg bg-brand-deepnavy/90 shadow-lg blur-[1px] dark:bg-slate-700/70" />
            <div className="absolute right-[6%] top-[26%] h-8 w-28 rounded-lg bg-brand-navy/80 shadow-lg blur-[1.5px] dark:bg-slate-700/60" />
            <div className="absolute bottom-[16%] left-[16%] h-8 w-20 rounded-lg bg-brand-navy/70 shadow-lg blur-[2px] dark:bg-slate-700/50" />
            <div className="absolute bottom-[24%] right-[14%] h-7 w-16 rounded-md bg-[#d4d9e5] shadow blur-[2px] dark:bg-slate-500/60" />
            <div className="absolute left-[36%] top-[6%] h-6 w-14 rounded-md bg-[#d4d9e5] shadow blur-[2px] dark:bg-slate-500/60" />
            {/* avatar dots */}
            <div className="absolute right-[26%] top-[8%] h-8 w-8 rounded-full bg-[#c9d1e0] shadow blur-[1px] dark:bg-slate-500/70" />
            <div className="absolute bottom-[8%] left-[38%] h-7 w-7 rounded-full bg-[#c9d1e0] shadow blur-[1.5px] dark:bg-slate-500/60" />
            <div className="absolute left-[24%] top-[34%] h-6 w-6 rounded-full bg-[#d4d9e5] shadow blur-[2px] dark:bg-slate-500/60" />
          </div>

          <h1 className="font-montserrat text-[28px] font-bold text-brand-navy dark:text-primary dark:text-white sm:text-[34px]">
            {companyName ? `Welcome to ${companyName}` : "Welcome"}
          </h1>
          <p className="mt-4 max-w-[440px] text-[15px] leading-[1.7] text-brand-gray dark:text-muted dark:text-slate-400">
            Our platform offers secure trading, real-time market data, and
            expert insights to help you achieve your financial goals.
          </p>

          <div className="mt-10 w-full max-w-[380px] space-y-5 text-left">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#12a594]/40 bg-[#12a594]/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12a594" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                </span>
                <div>
                  <p className="font-montserrat text-[15px] font-semibold text-brand-navy dark:text-primary dark:text-white">
                    {f.title}
                  </p>
                  <p className="mt-0.5 text-[13.5px] leading-[1.55] text-brand-gray dark:text-muted dark:text-slate-400">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 lg:w-1/2 lg:py-8">
        {children}
      </div>

      {/* Copyright — stays at the bottom on mobile too via normal flow. */}
      <p className="w-full pb-5 text-center text-[12.5px] text-[#99a0ac] lg:absolute lg:bottom-5 lg:left-0 lg:right-0">
        © {new Date().getFullYear()}{companyName ? ` ${companyName}. All rights reserved.` : ""}
      </p>
    </main>
  );
}
