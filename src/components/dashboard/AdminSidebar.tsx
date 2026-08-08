"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  FolderOpen,
  Settings,
  Shield,
  Wallet,
  MessageSquareQuote,
  CreditCard,
  Bitcoin,
  LineChart,
  Users2,
  Bot,
} from "lucide-react";
import { useBrandLogo, usePublicSettings } from "@/lib/usePublicSettings";

const ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Deposits", href: "/admin/deposits", icon: ArrowDownLeft },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpRight },
  { label: "Transactions", href: "/admin/transactions", icon: Repeat },
  { label: "Plans", href: "/admin/plans", icon: FolderOpen },
  { label: "Gateways", href: "/admin/methods", icon: Wallet },
  { label: "Cards", href: "/admin/cards", icon: CreditCard },
  { label: "Crypto", href: "/admin/crypto", icon: Bitcoin },
  { label: "Orders", href: "/admin/orders", icon: LineChart },
  { label: "Traders", href: "/admin/traders", icon: Users2 },
  { label: "Bots", href: "/admin/bots", icon: Bot },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({
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
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] overflow-y-auto border-r border bg-card px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={companyName} className="h-[28px] w-auto" />
        </Link>

        <div className="mt-6 flex items-center gap-3 rounded-xl border bg-elevated p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-darkred text-[12px] font-bold text-white">
            AD
          </div>
          <div>
            <p className="text-[13px] font-semibold text-primary">Admin User</p>
            <p className="text-[11px] text-emerald-400">Super Admin</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-brand-red/10 text-brand-red"
                    : "text-secondary hover:bg-elevated hover:text-primary"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-xl border bg-elevated p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-red" />
            <h4 className="font-montserrat text-[13px] font-semibold text-primary">Admin Panel</h4>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Manage platform users, deposits, withdrawals and settings.
          </p>
        </div>
      </aside>
    </>
  );
}
