"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, qk } from "@/lib/api";
import { AdminCard, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

const TABS = ["ALL", "PENDING", "COMPLETED", "REJECTED"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDepositsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("PENDING");

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: qk.admin.deposits,
    queryFn: () => api.admin.deposits.list(),
    refetchInterval: 6_000,
  });

  const filtered = useMemo(() => (tab === "ALL" ? deposits : deposits.filter((d) => d.status === tab)), [deposits, tab]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.deposits });
    qc.invalidateQueries({ queryKey: qk.admin.stats });
    qc.invalidateQueries({ queryKey: qk.admin.users });
    qc.invalidateQueries({ queryKey: qk.admin.transactions });
  };

  const approve = useMutation({
    mutationFn: (id: string) => api.admin.deposits.approve(id),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (id: string) => api.admin.deposits.reject(id),
    onSuccess: invalidate,
  });

  const isBusy = (id: string) =>
    (approve.isPending && approve.variables === id) || (reject.isPending && reject.variables === id);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Deposits" icon={ArrowDownLeft} subtitle="Review and approve user deposits." />

      <AdminCard className="mt-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = t === "ALL" ? deposits.length : deposits.filter((d) => d.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
                  tab === t ? "bg-brand-red text-white" : "border border text-muted hover:text-primary"
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-subtle">No deposits in this view.</td></tr>
              )}
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="py-3">
                    <p className="font-semibold text-primary">{d.userFullName}</p>
                    <p className="text-[11px] text-subtle">{d.userEmail}</p>
                  </td>
                  <td className="py-3 text-secondary">{d.methodSymbol}</td>
                  <td className="py-3 text-right font-semibold text-primary">{fmt(d.amount)}</td>
                  <td className="py-3"><StatusPill status={d.status} /></td>
                  <td className="py-3 text-right">
                    {d.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => approve.mutate(d.id)}
                          disabled={isBusy(d.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => reject.mutate(d.id)}
                          disabled={isBusy(d.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
