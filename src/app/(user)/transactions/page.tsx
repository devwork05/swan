"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Repeat, ArrowDownLeft, ArrowUpRight, ChevronRight, Box, Loader2 } from "lucide-react";
import { api, qk, type Transaction } from "@/lib/api";

const TABS = [
  { label: "All", value: "all" },
  { label: "Deposits", value: "DEPOSIT" },
  { label: "Withdrawals", value: "WITHDRAWAL" },
  { label: "Investments", value: "INVESTMENT" },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-400";
    case "PENDING":
      return "bg-amber-500/10 text-amber-400";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-slate-500/10 text-secondary";
  }
}

function typeColor(t: string) {
  switch (t) {
    case "DEPOSIT":
      return "text-emerald-400";
    case "WITHDRAWAL":
      return "text-red-400";
    case "INVESTMENT":
      return "text-blue-400";
    default:
      return "text-secondary";
  }
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading…</div>}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const search = useSearchParams();
  const readTab = () => {
    const raw = (search.get("tab") ?? "").toUpperCase();
    return TABS.some((t) => t.value === raw) ? raw : "all";
  };
  const [activeTab, setActiveTab] = useState(readTab);

  // If the URL changes (e.g. user hits back/forward), keep the tab in sync.
  useEffect(() => {
    setActiveTab(readTab());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data, isLoading: loading } = useQuery({
    queryKey: qk.transactions,
    queryFn: () => api.transactions.list(),
    refetchInterval: 6_000,
  });
  const txns: Transaction[] = data ?? [];

  const filtered = useMemo(
    () => (activeTab === "all" ? txns : txns.filter((t) => t.type === activeTab)),
    [txns, activeTab],
  );

  const totals = useMemo(() => {
    const sum = (type: string, status?: string) =>
      txns
        .filter((t) => t.type === type && (status ? t.status === status : true))
        .reduce((s, t) => s + t.amount, 0);
    return {
      deposits: sum("DEPOSIT", "COMPLETED"),
      withdrawals: sum("WITHDRAWAL", "COMPLETED"),
      investments: sum("INVESTMENT", "COMPLETED"),
      pending: txns.filter((t) => t.status === "PENDING").reduce((s, t) => s + t.amount, 0),
    };
  }, [txns]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
            <Repeat className="h-4 w-4" />
          </div>
          <h1 className="font-montserrat text-[22px] font-bold text-primary">Transactions</h1>
        </div>
        <Link
          href="/deposit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
        >
          New Deposit <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-brand-red text-white"
                  : "border border text-muted hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
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
              {loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Box className="mx-auto h-10 w-10 text-subtle" />
                    <p className="mt-3 font-medium text-primary">No transactions found</p>
                    <p className="text-[12px] text-subtle">Your transaction history will appear here</p>
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className={`py-3 font-semibold ${typeColor(t.type)}`}>{t.type}</td>
                  <td className="py-3 text-muted">{t.description}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-primary">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Deposits", value: fmt(totals.deposits), icon: ArrowDownLeft, color: "text-emerald-400" },
          { label: "Total Withdrawals", value: fmt(totals.withdrawals), icon: ArrowUpRight, color: "text-red-400" },
          { label: "Total Investments", value: fmt(totals.investments), icon: Repeat, color: "text-blue-400" },
          { label: "Pending", value: fmt(totals.pending), icon: Repeat, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted">{s.label}</p>
                <p className="mt-1 font-montserrat text-[18px] font-bold text-primary">{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
