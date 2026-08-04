"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, TrendingUp, Loader2, Box } from "lucide-react";
import { api, qk } from "@/lib/api";
import { useWallet } from "@/lib/useWallet";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProfitHistoryPage() {
  const { wallet } = useWallet();
  const { data: txns, isLoading: loading } = useQuery({
    queryKey: qk.transactions,
    queryFn: () => api.transactions.list(),
    refetchInterval: 6_000,
  });

  const accruals = useMemo(
    () =>
      (txns ?? []).filter(
        (t) => t.type === "INVESTMENT" && t.description?.startsWith("Profit accrual") && t.status === "COMPLETED",
      ),
    [txns],
  );

  const last24h = useMemo(() => {
    const cutoff = Date.now() - 86_400_000;
    return accruals.filter((a) => new Date(a.createdAt).getTime() >= cutoff).reduce((s, a) => s + a.amount, 0);
  }, [accruals]);

  const last7d = useMemo(() => {
    const cutoff = Date.now() - 7 * 86_400_000;
    return accruals.filter((a) => new Date(a.createdAt).getTime() >= cutoff).reduce((s, a) => s + a.amount, 0);
  }, [accruals]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
          <History className="h-4 w-4" />
        </div>
        <h1 className="font-montserrat text-[22px] font-bold text-primary">Profit History</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Profit", value: fmt(wallet.totalProfit), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Last 24 hours", value: fmt(last24h), icon: TrendingUp, color: "text-blue-400" },
          { label: "Last 7 days", value: fmt(last7d), icon: TrendingUp, color: "text-amber-400" },
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

      <div className="mt-6 rounded-xl border bg-card p-5">
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Profit Distributions</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && accruals.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!loading && accruals.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <Box className="mx-auto h-10 w-10 text-subtle" />
                    <p className="mt-3 font-medium text-primary">No profits yet</p>
                    <p className="text-[12px] text-subtle">Profit accruals will show up here as plans run.</p>
                  </td>
                </tr>
              )}
              {accruals.map((a) => (
                <tr key={a.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="py-3 text-muted">{a.description}</td>
                  <td className="py-3 text-right font-semibold text-emerald-400">+{fmt(a.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
