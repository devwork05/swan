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

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logo = useBrandLogo();
  const { companyName } = usePublicSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/60 bg-white dark:bg-card dark:bg-[#0b0f19] dark:border-[#2a314a]">
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center gap-2 px-3 sm:h-[76px] sm:gap-4 sm:px-5 lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={companyName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={companyName}
            className="h-9 w-auto drop-shadow-sm sm:h-11 lg:h-12"
          />
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
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* CTAs — visible from 500px up (also mirrored in the mobile menu). */}
          <Link
            href="/register"
            className="btn-primary hidden !px-4 !py-[10px] !text-[12px] xs:inline-flex lg:!px-5 lg:!py-[11px] lg:!text-[13px]"
          >
            GET STARTED
          </Link>
          <Link
            href="/login"
            className="btn-outline hidden !px-3 !py-[9px] !text-[12px] xs:inline-flex lg:!px-4 lg:!py-[10px] lg:!text-[13px]"
          >
            LOG IN
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-brand-border dark:border-line sm:h-[42px] sm:w-[42px] lg:hidden dark:border-[#2a314a]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-navy dark:text-primary dark:text-slate-200">
              {mobileOpen ? (
                <path d="M2 2l16 10M18 2L2 12" />
              ) : (
                <path d="M0 1h20M0 7h20M0 13h20" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — nav links + Login/Register buttons live in here. */}
      {mobileOpen && (
        <div className="border-t border-brand-border dark:border-line bg-white dark:bg-card px-5 py-4 lg:hidden dark:bg-[#0b0f19] dark:border-[#2a314a]">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded px-2 py-3 font-montserrat text-[14px] font-semibold tracking-[0.05em] ${
                  i === 0 ? "text-brand-red" : "text-brand-deepnavy dark:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Auth CTAs — stacked full-width so they never overflow, even at 320px. */}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center !py-3 !text-[13px]"
              >
                GET STARTED
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-outline w-full justify-center !py-3 !text-[13px]"
              >
                LOG IN
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
