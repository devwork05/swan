"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { api, qk, type Withdraw } from "@/lib/api";
import { AdminCard, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

const TABS = ["ALL", "PENDING", "COMPLETED", "REJECTED"] as const;
type Tab = (typeof TABS)[number];

export default function AdminWithdrawalsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("PENDING");
  const [rejecting, setRejecting] = useState<Withdraw | null>(null);

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: qk.admin.withdrawals,
    queryFn: () => api.admin.withdrawals.list(),
    refetchInterval: 6_000,
  });

  const filtered = useMemo(
    () => (tab === "ALL" ? withdrawals : withdrawals.filter((w) => w.status === tab)),
    [withdrawals, tab],
  );

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.withdrawals });
    qc.invalidateQueries({ queryKey: qk.admin.stats });
    qc.invalidateQueries({ queryKey: qk.admin.users });
    qc.invalidateQueries({ queryKey: qk.admin.transactions });
  };

  const approve = useMutation({
    mutationFn: (id: string) => api.admin.withdrawals.approve(id),
    onSuccess: invalidate,
  });

  const isBusy = (id: string) => approve.isPending && approve.variables === id;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Withdrawals" icon={ArrowUpRight} subtitle="Review, approve or reject withdrawal requests." />

      <AdminCard className="mt-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = t === "ALL" ? withdrawals.length : withdrawals.filter((w) => w.status === t).length;
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
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-subtle">No withdrawals in this view.</td></tr>
              )}
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="py-3">
                    <p className="font-semibold text-primary">{w.userFullName}</p>
                    <p className="text-[11px] text-subtle">{w.userEmail}</p>
                  </td>
                  <td className="py-3 text-secondary">{w.methodSymbol}</td>
                  <td className="py-3 font-mono text-[11px] text-muted">
                    {w.walletAddress.slice(0, 10)}…{w.walletAddress.slice(-6)}
                  </td>
                  <td className="py-3 text-right font-semibold text-primary">{fmt(w.amount)}</td>
                  <td className="py-3">
                    <StatusPill status={w.status} />
                    {w.status === "REJECTED" && w.rejectionReason && (
                      <p className="mt-1 text-[10px] italic text-red-400">{w.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {w.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => approve.mutate(w.id)}
                          disabled={isBusy(w.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejecting(w)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
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

      {rejecting && (
        <RejectModal
          withdraw={rejecting}
          onClose={() => setRejecting(null)}
          onDone={() => {
            setRejecting(null);
            invalidate();
          }}
        />
      )}
    </div>
  );
}

function RejectModal({ withdraw, onClose, onDone }: { withdraw: Withdraw; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: () => api.admin.withdrawals.reject(withdraw.id, reason),
    onSuccess: onDone,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted">Reject withdrawal</p>
            <h2 className="font-montserrat text-[18px] font-bold text-primary">
              {fmt(withdraw.amount)} · {withdraw.userFullName}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <p className="mt-3 text-[13px] text-muted">
          Balance will be refunded to the user. Optionally add a reason they can see.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="mt-3 w-full rounded-md border bg-page p-3 text-[13px] text-primary outline-none focus:border-brand-red"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border py-2 text-[13px] font-semibold text-secondary hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-500/80 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm reject
          </button>
        </div>
      </div>
    </div>
  );
}
