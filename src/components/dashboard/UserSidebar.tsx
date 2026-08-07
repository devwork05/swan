"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Send,
  TrendingUp,
  FolderOpen,
  History,
  BarChart3,
  Copy,
  Bot,
  Users,
  Headphones,
  CreditCard,
} from "lucide-react";
import { useBrandLogo, usePublicSettings } from "@/lib/usePublicSettings";

const SECTIONS = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { label: "Deposit", href: "/deposit", icon: ArrowDownLeft },
      { label: "Withdraw", href: "/withdraw", icon: ArrowUpRight },
      { label: "Transactions", href: "/transactions", icon: Repeat },
      { label: "Transfer Funds", href: "/transfer", icon: Send },
      { label: "Cards", href: "/cards", icon: CreditCard },
    ],
  },
  {
    title: "INVESTMENTS",
    items: [
      { label: "Trading Plans", href: "/plans", icon: TrendingUp },
      { label: "My Plans", href: "/my-plans", icon: FolderOpen },
      { label: "Profit History", href: "/profit-history", icon: History },
    ],
  },
  {
    title: "SERVICES",
    items: [
      { label: "Trading Platform", href: "/trading-platform", icon: BarChart3 },
      { label: "Copy Trading", href: "/copy-trading", icon: Copy },
      { label: "Bot Trading", href: "/bot-trading", icon: Bot },
      { label: "Referrals", href: "/referrals", icon: Users },
    ],
  },
];

export default function UserSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const logo = useBrandLogo();
  const { companyName } = usePublicSettings();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] overflow-y-auto border-r border bg-card px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={companyName} className="h-[28px] w-auto" />
        </Link>

        {/* User card */}
        <div className="mt-6 rounded-xl border bg-elevated p-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-darkred text-lg font-bold text-white">
                ed
              </div>
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-subtle bg-emerald-500" />
            </div>
            <h3 className="mt-3 font-montserrat text-[15px] font-semibold text-primary">ede dede</h3>
            <p className="text-[12px] text-muted">online</p>
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-card py-2 text-[13px] text-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M2 10h20" />
              </svg>
              Balance
              <span className="font-semibold text-primary">$0.00</span>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="mt-6 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-subtle">
                {section.title}
              </p>
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                          active
                            ? "bg-brand-red/10 text-brand-red"
                            : "text-secondary hover:bg-elevated hover:text-primary"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Need help card */}
        <div className="mt-8 rounded-xl border bg-elevated p-4">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-brand-red" />
            <h4 className="font-montserrat text-[14px] font-semibold text-primary">Need Help?</h4>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Our support team is available 24/7
          </p>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border bg-card py-2 text-[12px] font-medium text-secondary transition-colors hover:border-brand-red hover:text-brand-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Contact Support
          </button>
        </div>
      </aside>
    </>
  );
}
