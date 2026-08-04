"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { Bell, ChevronDown, Menu, Shield } from "lucide-react";

const TICKER = [
  { symbol: "META", price: 298.76, change: +2.64 },
  { symbol: "NVDA", price: 413.02, change: +2.7 },
  { symbol: "TSLA", price: 254.93, change: -1.95 },
  { symbol: "SPY", price: 100.0, change: -1.16 },
  { symbol: "AAPL", price: 148.56, change: +2.49 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toLowerCase();
}

export default function UserTopbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { auth, logout } = useAuth();

  const displayName = auth?.user.fullName ?? "Guest";
  const username = auth?.user.email.split("@")[0] ?? "user";

  return (
    <header className="sticky top-0 z-30 border-b border bg-page">
      {/* Ticker */}
      <div className="hidden overflow-hidden border-b border bg-card py-1.5 md:block">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap px-4">
          {[...TICKER, ...TICKER].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[12px]">
              <span className="font-semibold text-secondary">{item.symbol}</span>
              <span className="text-secondary">${item.price.toFixed(2)}</span>
              <span className={item.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                {item.change >= 0 ? "+" : ""}
                {item.change.toFixed(2)} ({((item.change / item.price) * 100).toFixed(2)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top bar */}
      <div className="flex h-[64px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-secondary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.5 9h17M3.5 15h17M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" />
            </svg>
            <select className="bg-transparent text-[13px] text-secondary outline-none">
              <option>English</option>
              <option>Français</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button className="flex h-10 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium text-secondary hover:text-primary">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border text-secondary hover:text-primary">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-red" />
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-darkred text-[11px] font-bold text-white">
                {initials(displayName)}
              </div>
              <span className="hidden text-[13px] font-medium text-secondary sm:inline">
                {username}
              </span>
              <ChevronDown className="h-4 w-4 text-muted" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-card py-1 shadow-xl">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-[13px] text-secondary hover:bg-elevated hover:text-primary"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-[13px] text-secondary hover:bg-elevated hover:text-primary"
                >
                  Settings
                </Link>
                <hr className="my-1 border" />
                <button
                  onClick={logout}
                  className="block w-full px-4 py-2 text-left text-[13px] text-red-400 hover:bg-elevated"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </header>
  );
}
