"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repeat, Loader2, Search } from "lucide-react";
import { api, qk } from "@/lib/api";
import { AdminCard, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

const TYPE_TABS = ["ALL", "DEPOSIT", "WITHDRAWAL", "INVESTMENT"] as const;
const STATUS_TABS = ["ALL", "PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;

type TypeTab = (typeof TYPE_TABS)[number];
type StatusTab = (typeof STATUS_TABS)[number];

export default function AdminTransactionsPage() {
  const [type, setType] = useState<TypeTab>("ALL");
  const [status, setStatus] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");

  const { data: txns = [], isLoading } = useQuery({
    queryKey: qk.admin.transactions,
    queryFn: () => api.admin.transactions(),
    refetchInterval: 6_000,
  });

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (type !== "ALL" && t.type !== type) return false;
      if (status !== "ALL" && t.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.description?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [txns, type, status, search]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Transactions" icon={Repeat} subtitle="Global ledger of every wallet movement." />

      <AdminCard className="mt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  type === t ? "bg-brand-red text-white" : "border border text-muted hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusTab)}
              className="rounded-lg border bg-page px-3 py-1.5 text-[12px] text-secondary outline-none focus:border-brand-red"
            >
              {STATUS_TABS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description"
                className="rounded-lg border bg-page py-1.5 pl-9 pr-3 text-[12px] text-secondary outline-none focus:border-brand-red"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
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
              {isLoading && (
                <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-subtle">No transactions match.</td></tr>
              )}
              {filtered.map((t) => (
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

        <p className="mt-3 text-[11px] text-subtle">
          Showing {filtered.length} of {txns.length}
        </p>
      </AdminCard>
    </div>
  );
}
