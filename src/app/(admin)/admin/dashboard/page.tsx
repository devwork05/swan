"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  Wallet as WalletIcon,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { api, qk } from "@/lib/api";
import { AdminCard, AdminStat, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: qk.admin.stats,
    queryFn: () => api.admin.stats(),
    refetchInterval: 8_000,
  });

  const { data: deposits = [] } = useQuery({
    queryKey: qk.admin.deposits,
    queryFn: () => api.admin.deposits.list(),
    refetchInterval: 8_000,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: qk.admin.withdrawals,
    queryFn: () => api.admin.withdrawals.list(),
    refetchInterval: 8_000,
  });

  const { data: txns = [] } = useQuery({
    queryKey: qk.admin.transactions,
    queryFn: () => api.admin.transactions(),
    refetchInterval: 10_000,
  });

  const pendingDeposits = deposits.filter((d) => d.status === "PENDING").slice(0, 5);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "PENDING").slice(0, 5);
  const recentTxns = txns.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Admin Dashboard" icon={LayoutDashboard} subtitle="Overview of platform activity and pending actions." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="Total Users" value={String(stats?.totalUsers ?? 0)} icon={Users} color="text-blue-400" />
        <AdminStat label="Total Deposits" value={fmt(stats?.totalDeposited ?? 0)} icon={ArrowDownLeft} color="text-emerald-400" />
        <AdminStat label="Total Withdrawals" value={fmt(stats?.totalWithdrawn ?? 0)} icon={ArrowUpRight} color="text-red-400" />
        <AdminStat label="Active Plans" value={String(stats?.activePlans ?? 0)} icon={TrendingUp} color="text-amber-400" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="User Balances" value={fmt(stats?.totalBalance ?? 0)} icon={WalletIcon} color="text-teal-400" />
        <AdminStat label="Total Profit Paid" value={fmt(stats?.totalProfit ?? 0)} icon={DollarSign} color="text-emerald-400" />
        <AdminStat label="Pending Deposits" value={String(stats?.pendingDeposits ?? 0)} icon={Clock} color="text-amber-400" />
        <AdminStat label="Pending Withdrawals" value={String(stats?.pendingWithdrawals ?? 0)} icon={Clock} color="text-red-400" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-center justify-between">
            <h3 className="font-montserrat text-[16px] font-bold text-primary">Pending Deposits</h3>
            <Link href="/admin/deposits" className="text-[12px] font-medium text-brand-red hover:underline">Review all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {pendingDeposits.length === 0 && (
              <p className="py-6 text-center text-[13px] text-subtle">No pending deposits.</p>
            )}
            {pendingDeposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg bg-elevated p-3">
                <div>
                  <p className="text-[13px] font-semibold text-primary">{d.userFullName}</p>
                  <p className="text-[11px] text-muted">{d.userEmail} · {d.methodSymbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-primary">{fmt(d.amount)}</p>
                  <p className="text-[11px] text-subtle">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between">
            <h3 className="font-montserrat text-[16px] font-bold text-primary">Pending Withdrawals</h3>
            <Link href="/admin/withdrawals" className="text-[12px] font-medium text-brand-red hover:underline">Review all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {pendingWithdrawals.length === 0 && (
              <p className="py-6 text-center text-[13px] text-subtle">No pending withdrawals.</p>
            )}
            {pendingWithdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg bg-elevated p-3">
                <div>
                  <p className="text-[13px] font-semibold text-primary">{w.userFullName}</p>
                  <p className="text-[11px] text-muted">
                    {w.methodSymbol} · <span className="font-mono">{w.walletAddress.slice(0, 10)}…</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-primary">{fmt(w.amount)}</p>
                  <p className="text-[11px] text-subtle">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-red" />
            <h3 className="font-montserrat text-[16px] font-bold text-primary">Recent Activity</h3>
          </div>
          <Link href="/admin/transactions" className="text-[12px] font-medium text-brand-red hover:underline">View all</Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-subtle">No activity yet.</td></tr>
              )}
              {recentTxns.map((t) => (
                <tr key={t.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-3 font-semibold text-secondary">{t.type}</td>
                  <td className="py-3 text-muted">{t.description}</td>
                  <td className="py-3"><StatusPill status={t.status} /></td>
                  <td className="py-3 text-right font-semibold text-primary">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
