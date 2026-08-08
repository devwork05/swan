"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LineChart, Search, Loader2, CheckCircle, XCircle, Trash2, X } from "lucide-react";
import { api, qk, type TradeOrder, type TradeOrderStatus } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";

const STATUS_STYLE: Record<TradeOrderStatus, { label: string; badge: string }> = {
  OPEN: { label: "Open", badge: "bg-amber-500/15 text-amber-500" },
  FILLED: { label: "Filled", badge: "bg-emerald-500/15 text-emerald-500" },
  CANCELLED: { label: "Cancelled", badge: "bg-slate-500/15 text-slate-500" },
  REJECTED: { label: "Rejected", badge: "bg-red-500/15 text-red-500" },
};

const FILTERS: { key: "all" | TradeOrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "FILLED", label: "Filled" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REJECTED", label: "Rejected" },
];

function fmtUsd(v?: string | null) {
  if (v == null) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 });
}
function fmtDate(v: string) {
  return new Date(v).toLocaleString();
}

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TradeOrderStatus>("all");
  const [fillOpen, setFillOpen] = useState<TradeOrder | null>(null);
  const [rejectOpen, setRejectOpen] = useState<TradeOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: qk.admin.orders(search, status),
    queryFn: () => api.admin.orders.list(search, status),
    refetchInterval: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "orders"] });

  const fillMut = useMutation({
    mutationFn: ({ id, fillPrice }: { id: number; fillPrice?: number }) =>
      api.admin.orders.fill(id, fillPrice),
    onSuccess: () => {
      invalidate();
      setFillOpen(null);
      toast.success("Order filled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.admin.orders.reject(id, reason),
    onSuccess: () => {
      invalidate();
      setRejectOpen(null);
      toast.success("Order rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.admin.orders.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Order deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Trade Orders"
        icon={LineChart}
        subtitle="Fill or reject user-submitted trade orders. Market orders fill on submit."
      />

      <AdminCard className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or symbol…"
              className="w-full rounded-md border bg-page py-2 pl-9 pr-3 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                  status === f.key
                    ? "bg-brand-red text-white"
                    : "border bg-page text-secondary hover:border-brand-red hover:text-brand-red"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Side</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Price</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Placed</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-subtle">No orders found.</td></tr>
              )}
              {orders.map((o) => {
                const st = STATUS_STYLE[o.status];
                return (
                  <tr key={o.id} className="border-b">
                    <td className="py-3">
                      <p className="font-semibold text-primary">{o.userName}</p>
                      <p className="text-[11px] text-muted">{o.userEmail}</p>
                    </td>
                    <td className="py-3 font-semibold text-primary">{o.symbol}</td>
                    <td className={`py-3 font-semibold ${o.side === "BUY" ? "text-emerald-500" : "text-red-500"}`}>
                      {o.side}
                    </td>
                    <td className="py-3 text-secondary">{o.type.replace("_", " ")}</td>
                    <td className="py-3 text-right font-mono text-secondary">{o.amount}</td>
                    <td className="py-3 text-right font-mono text-secondary">{fmtUsd(o.price)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.badge}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-muted">{fmtDate(o.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        {o.status === "OPEN" && (
                          <>
                            <button
                              onClick={() => setFillOpen(o)}
                              className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-emerald-500 hover:text-emerald-500"
                            >
                              <CheckCircle className="h-3 w-3" /> Fill
                            </button>
                            <button
                              onClick={() => setRejectOpen(o)}
                              className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-red-500 hover:text-red-500"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete order for ${o.symbol}?`)) deleteMut.mutate(o.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {fillOpen && (
        <FillModal
          order={fillOpen}
          onClose={() => setFillOpen(null)}
          onConfirm={(fillPrice) => fillMut.mutate({ id: fillOpen.id, fillPrice })}
          pending={fillMut.isPending}
        />
      )}
      {rejectOpen && (
        <RejectModal
          order={rejectOpen}
          onClose={() => setRejectOpen(null)}
          onConfirm={(reason) => rejectMut.mutate({ id: rejectOpen.id, reason })}
          pending={rejectMut.isPending}
        />
      )}
    </div>
  );
}

function FillModal({
  order,
  onClose,
  onConfirm,
  pending,
}: {
  order: TradeOrder;
  onClose: () => void;
  onConfirm: (fillPrice?: number) => void;
  pending: boolean;
}) {
  const [price, setPrice] = useState<string>(order.price ?? "");
  return (
    <Modal title="Fill Order" subtitle={`${order.side} ${order.amount} ${order.symbol}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[13px] text-secondary">
          Set the fill price (defaults to the limit price the user submitted).
        </p>
        <div>
          <label className="text-[12px] text-muted">Fill price (USD)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(price ? Number(price) : undefined)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Fill Order
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RejectModal({
  order,
  onClose,
  onConfirm,
  pending,
}: {
  order: TradeOrder;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Modal title="Reject Order" subtitle={`${order.side} ${order.amount} ${order.symbol}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-[12px] text-muted">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason shown on the order…"
            className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-red-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject Order
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-montserrat text-[18px] font-bold text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
