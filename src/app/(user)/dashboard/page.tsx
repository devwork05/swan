"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Gift,
  Eye,
  Box,
  Copy,
  Users,
  Activity,
  Server,
  ChevronRight,
  Plus,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import MarketCard from "@/components/dashboard/MarketCard";
import { useWallet } from "@/lib/useWallet";
import { useAuth } from "@/lib/AuthContext";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const MARKETS = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$63,009.00",
    change: "0.00%",
    changeValue: 0,
    color: "#f59e0b",
    data: [
      { value: 62800 }, { value: 62950 }, { value: 62850 }, { value: 63050 }, { value: 62900 }, { value: 63000 }, { value: 63009 },
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
        <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.52 2.1c-.347-.087-.7-.167-1.053-.25l.53-2.12-1.32-.33-.54 2.15c-.285-.065-.566-.13-.837-.2l-1.815-.45-.35 1.4s.974.22.956.235c.534.134.63.486.615.766l-.617 2.473c.037.01.085.024.138.047l-.14-.035-.865 3.47c-.066.164-.234.41-.612.317.014.02-.956-.238-.956-.238L8.1 17.58l1.714.428c.32.08.63.164.936.243l-.544 2.19 1.32.33.54-2.16c.36.1.71.19 1.054.27l-.537 2.14 1.32.33.544-2.18c2.24.424 3.926.253 4.634-1.77.57-1.63-.027-2.567-1.21-3.177.86-.2 1.508-.77 1.68-1.948zm-3.02 4.25c-.404 1.63-3.14.75-4.03.53l.72-2.88c.89.22 3.74.66 3.31 2.35zm.404-4.26c-.37 1.47-2.63.72-3.37.54l.65-2.6c.74.18 3.12.53 2.72 2.06z" />
      </svg>
    ),
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: "$1,853.22",
    change: "0.60%",
    changeValue: -16.6,
    color: "#8b5cf6",
    data: [
      { value: 1870 }, { value: 1865 }, { value: 1860 }, { value: 1858 }, { value: 1855 }, { value: 1853 }, { value: 1853 },
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#8b5cf6">
        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
      </svg>
    ),
  },
  {
    name: "Tether",
    symbol: "USDT",
    price: "$1.00",
    change: "0.00%",
    changeValue: 0,
    color: "#10b981",
    data: [
      { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 },
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.388 13.08H12.84v3.276c0 .252-.204.456-.456.456h-1.368a.456.456 0 01-.456-.456V13.08H8.592a.456.456 0 01-.456-.456v-1.368c0-.252.204-.456.456-.456h1.968V7.524c0-.252.204-.456.456-.456h1.368c.252 0 .456.204.456.456v3.276h3.048c.252 0 .456.204.456.456v1.368a.456.456 0 01-.456.456z" />
      </svg>
    ),
  },
  {
    name: "BNB",
    symbol: "BNB",
    price: "$581.13",
    change: "0.30%",
    changeValue: 1.74,
    color: "#f0b90b",
    data: [
      { value: 579 }, { value: 580 }, { value: 579.5 }, { value: 580.5 }, { value: 581 }, { value: 581.5 }, { value: 581 },
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#f0b90b">
        <path d="M12 2L9.42 4.58 12 7.17l2.58-2.59L12 2zM5.17 8.83L2.58 11.42 5.17 14l2.59-2.58-2.59-2.59zM18.83 8.83l-2.59 2.59 2.59 2.59L21.42 11.42l-2.59-2.59zM12 10.83L9.42 13.42 12 16l2.58-2.58L12 10.83zM7.17 15.58L4.58 18.17 7.17 20.75 9.75 18.17 7.17 15.58zM16.83 15.58l-2.58 2.59 2.58 2.58 2.59-2.58-2.59-2.59zM12 16.83L9.42 19.42 12 22l2.58-2.58L12 16.83z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { wallet } = useWallet();
  const { user } = useAuth();
  const referralLink = typeof window !== "undefined" && user
    ? `${window.location.origin}/register?ref=${encodeURIComponent(user.email)}`
    : "";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-montserrat text-[22px] font-bold text-primary">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-[13px] text-muted">{today}</p>
        </div>
        <Link
          href="/deposit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Quick Deposit
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Balance / stats */}
          <div className="rounded-xl border bg-card p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-brand-red" />
                  <span className="text-[13px] font-semibold text-primary">Account Balance</span>
                </div>
                <p className="text-[11px] text-muted">Your current available balance</p>
                <div className="mt-2 flex items-center gap-2">
                  <h2 className="font-montserrat text-[28px] font-bold text-primary">{fmt(wallet.balance)}</h2>
                  <Eye className="h-4 w-4 text-muted" />
                </div>
                <p className="mt-1 text-[12px] text-emerald-400">Available for Withdrawal</p>
                <p className="mt-2 text-[12px] text-secondary">
                  Locked balance: <span className="font-semibold text-primary">{fmt(wallet.lockedBalance)}</span>
                </p>
                <p className="text-[11px] text-subtle">Last updated: Aug 02, 2026 01:21 PM</p>

                <div className="mt-4 flex gap-3">
                  <Link
                    href="/deposit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-elevated py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-hover"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit
                  </Link>
                  <Link
                    href="/withdraw"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-transparent py-2.5 text-[13px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Link>
                </div>
              </div>

              <StatCard
                label="Total Profit"
                value={fmt(wallet.totalProfit)}
                icon={<TrendingUp className="h-5 w-5" />}
                trend={{ value: "+2.5% Last period", positive: true }}
              />
              <StatCard
                label="Bonus"
                value={fmt(wallet.bonus)}
                icon={<Gift className="h-5 w-5" />}
                subtext="Rewards & Promotions"
              />
              <StatCard
                label="Total Deposit"
                value={fmt(wallet.totalDeposited)}
                icon={<ArrowDownLeft className="h-5 w-5" />}
                subtext="All time"
              />
              <StatCard
                label="Total Withdrawal"
                value={fmt(wallet.totalWithdrawn)}
                icon={<ArrowUpRight className="h-5 w-5" />}
                subtext="All time"
              />
            </div>
          </div>

          {/* Market Overview */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat text-[16px] font-bold text-primary">Market Overview</h3>
              <div className="flex gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted hover:text-primary">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted hover:text-primary">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {MARKETS.map((m) => (
                <MarketCard key={m.symbol} {...m} />
              ))}
            </div>
          </div>

          {/* Active Plans */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-montserrat text-[16px] font-bold text-primary">
              Active Plans <span className="text-[13px] font-normal text-muted">(0)</span>
            </h3>
            <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated">
                <Box className="h-7 w-7 text-muted" />
              </div>
              <h4 className="mt-4 font-montserrat text-[16px] font-semibold text-primary">No Active Plans</h4>
              <p className="mt-1 max-w-[300px] text-[13px] text-muted">
                You don&apos;t have any active investment plans at the moment. Start growing your wealth today!
              </p>
              <Link
                href="/plans"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
              >
                <Plus className="h-4 w-4" />
                Buy a Plan
              </Link>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat text-[16px] font-bold text-primary">Recent Transactions</h3>
              <Link href="/transactions" className="flex items-center gap-1 text-[13px] font-medium text-brand-red hover:underline">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border text-muted">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Box className="h-8 w-8 text-subtle" />
                        <p className="mt-2 text-muted">No transactions found</p>
                        <p className="text-[12px] text-subtle">Your transaction history will appear here</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Profile card */}
          <div className="rounded-xl border bg-elevated p-5 text-center dark:bg-gradient-to-br dark:from-[#1a2035] dark:to-[#131827]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-darkred text-xl font-bold uppercase text-white">
              {(user?.fullName ?? "")
                .split(" ")
                .map((s) => s[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("") || "•"}
            </div>
            <h3 className="mt-3 font-montserrat text-[16px] font-semibold text-primary">{user?.fullName ?? ""}</h3>
            <p className="text-[12px] text-muted">
              {user?.createdAt
                ? `Member since ${new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                : ""}
            </p>

            <div className="mt-5 space-y-2 text-[13px]">
              <div className="flex justify-between text-muted">
                <span>Account Balance</span>
                <span className="font-semibold text-primary">{fmt(wallet.balance)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Bonus</span>
                <span className="font-semibold text-primary">{fmt(wallet.bonus)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Referral Bonus</span>
                <span className="font-semibold text-primary">{fmt(wallet.referralBonus)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href="/deposit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-elevated py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-hover"
              >
                <ArrowDownLeft className="h-4 w-4" />
                Deposit
              </Link>
              <Link
                href="/withdraw"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-transparent py-2.5 text-[13px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg bg-card p-3">
              <span className="text-[13px] text-muted">Account Status</span>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-red-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                Unverified
              </span>
            </div>
          </div>

          {/* Refer & Earn */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat text-[15px] font-bold text-primary">Refer & Earn</h3>
              <Link href="/referrals" className="flex items-center gap-1 text-[12px] font-medium text-brand-red hover:underline">
                Details <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated">
                <Users className="h-5 w-5 text-brand-red" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-primary">Earn Through Referrals</h4>
                <p className="text-[12px] text-muted">Earn commission when someone signs up using your link</p>
              </div>
            </div>

            <p className="mt-4 text-[12px] text-muted">Your Referral Link</p>
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-elevated p-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent text-[11px] text-secondary outline-none"
              />
              <button
                onClick={() => {
                  if (referralLink) navigator.clipboard.writeText(referralLink);
                }}
                className="flex items-center gap-1 rounded-md bg-brand-red px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-darkred"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-elevated p-3">
                <p className="text-[11px] text-muted">Total Referrals</p>
                <p className="font-montserrat text-[18px] font-bold text-primary">0</p>
              </div>
              <div className="rounded-lg bg-elevated p-3">
                <p className="text-[11px] text-muted">Earnings</p>
                <p className="font-montserrat text-[18px] font-bold text-primary">{fmt(wallet.referralBonus)}</p>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-montserrat text-[15px] font-bold text-primary">Platform Stats</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Platform Activity</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Active</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-elevated">
                <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-brand-red" />
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted">
                  <Users className="h-4 w-4" />
                  <span className="text-[13px]">Total Users</span>
                </div>
                <span className="font-semibold text-primary">12,458+</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted">
                  <Activity className="h-4 w-4" />
                  <span className="text-[13px]">Total Investments</span>
                </div>
                <span className="font-semibold text-primary">$35.1B+</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted">
                  <Server className="h-4 w-4" />
                  <span className="text-[13px]">Server Uptime</span>
                </div>
                <span className="font-semibold text-primary">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
