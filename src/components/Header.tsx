"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useBrandLogo, usePublicSettings } from "@/lib/usePublicSettings";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "TRADING", href: "/trading" },
  { label: "RESOURCES", href: "/resources" },
  { label: "PARTNERSHIP", href: "/partnership" },
  { label: "ABOUT US", href: "/about-us" },
];

const LANGUAGES = [
  "English",
  "Français",
  "Español",
  "日本語",
  "简体中文",
  "繁體中文",
  "Português",
  "Deutsch",
  "Italiano",
  "Русский",
  "العربية",
  "हिन्दी",
  "한국어",
  "Türkçe",
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logo = useBrandLogo();
  const { companyName } = usePublicSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/60 bg-white dark:bg-card dark:bg-[#0b0f19] dark:border-[#2a314a]">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-6 px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={companyName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={companyName} className="h-[31px] w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`font-montserrat text-[13px] font-semibold tracking-[0.06em] transition-colors hover:text-brand-red ${
                i === 0 ? "text-brand-red" : "text-brand-deepnavy dark:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <select
            aria-label="Language"
            className="hidden h-[42px] rounded-[5px] border border-brand-border dark:border-line bg-white dark:bg-card px-3 text-[13px] font-medium text-brand-navy dark:text-primary outline-none md:block dark:bg-[#131827] dark:border-[#2a314a] dark:text-slate-200"
            defaultValue="English"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <ThemeToggle />

          <Link
            href="/register"
            className="btn-primary hidden !px-5 !py-[11px] !text-[13px] sm:inline-flex"
          >
            GET STARTED
          </Link>

          <Link
            href="/login"
            className="btn-outline hidden !px-4 !py-[10px] !text-[13px] sm:inline-flex"
          >
            LOG IN
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>

          <button className="hidden items-center gap-1.5 text-brand-navy dark:text-primary dark:text-slate-200 md:flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.5 9h17M3.5 15h17M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" />
            </svg>
            <span className="font-montserrat text-[13px] font-semibold">EN</span>
            <svg width="9" height="5" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[5px] border border-brand-border dark:border-line lg:hidden dark:border-[#2a314a]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-navy dark:text-primary dark:text-slate-200">
              {mobileOpen ? (
                <>
                  <path d="M2 2l16 10M18 2L2 12" />
                </>
              ) : (
                <>
                  <path d="M0 1h20M0 7h20M0 13h20" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-brand-border dark:border-line bg-white dark:bg-card px-5 py-4 lg:hidden dark:bg-[#0b0f19] dark:border-[#2a314a]">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded px-2 py-3 font-montserrat text-[14px] font-semibold tracking-[0.05em] ${
                  i === 0 ? "text-brand-red" : "text-brand-deepnavy dark:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-3">
              <Link href="/register" className="btn-primary flex-1 !py-3 !text-[13px]">
                GET STARTED
              </Link>
              <Link href="/login" className="btn-outline flex-1 !py-3 !text-[13px]">
                LOG IN
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
