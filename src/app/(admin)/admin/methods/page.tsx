"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, Loader2, X, Pencil, Trash2, EyeOff, Eye } from "lucide-react";
import { api, qk, type DepositMethod, type GatewayCategory } from "@/lib/api";
import { AdminCard, PageHeader, fmt } from "@/components/dashboard/AdminUI";
import { FileUploader } from "@/components/FileUploader";

const empty = (): Omit<DepositMethod, "id"> => ({
  name: "",
  symbol: "",
  category: "CRYPTO",
  network: "",
  address: "",
  logoUrl: "",
  minAmount: 50,
  maxAmount: 50000,
  feePercent: 0,
  processingTime: "Instant",
  bankName: "",
  accountName: "",
  accountNumber: "",
  code: "",
  description: "",
  listed: true,
});

export default function AdminMethodsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<DepositMethod | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: qk.admin.methods,
    queryFn: () => api.admin.methods.list(),
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.methods });
    qc.invalidateQueries({ queryKey: qk.depositMethods });
  };

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.admin.methods.remove(id),
    onSuccess: invalidate,
  });

  const toggleListed = useMutation({
    mutationFn: ({ id, listed }: { id: string; listed: boolean }) =>
      api.admin.methods.update(id, { listed }),
    onSuccess: invalidate,
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Payment Gateways"
        icon={Wallet}
        subtitle="Manage crypto wallets and bank accounts users can send funds to."
        right={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            <Plus className="h-4 w-4" />
            New Gateway
          </button>
        }
      />

      <AdminCard className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Network</th>
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium text-right">Min / Max</th>
                <th className="pb-3 font-medium text-right">Fee</th>
                <th className="pb-3 font-medium">Listed</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && methods.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-subtle">No gateways configured.</td></tr>
              )}
              {methods.map((m) => (
                <tr key={m.id} className="border-b border">
                  <td className="py-3">
                    <p className="font-semibold text-primary">{m.name}</p>
                    <p className="text-[11px] text-subtle">{m.symbol}</p>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.category === "CRYPTO" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3 text-secondary">{m.network ?? "—"}</td>
                  <td className="py-3">
                    {m.category === "CRYPTO" ? (
                      <span className="font-mono text-[11px] text-muted">
                        {m.address ? `${m.address.slice(0, 10)}…${m.address.slice(-6)}` : "—"}
                      </span>
                    ) : (
                      <span className="text-secondary">
                        {m.bankName} · {m.accountNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right text-secondary">
                    {fmt(m.minAmount)}{m.maxAmount ? ` / ${fmt(m.maxAmount)}` : ""}
                  </td>
                  <td className="py-3 text-right text-secondary">{m.feePercent}%</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleListed.mutate({ id: m.id, listed: !m.listed })}
                      className={`inline-flex items-center gap-1 text-[12px] ${m.listed ? "text-emerald-400" : "text-subtle"}`}
                    >
                      {m.listed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {m.listed ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(m)}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[12px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete gateway "${m.name}"?`)) removeMutation.mutate(m.id);
                        }}
                        disabled={removeMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {(editing || creating) && (
        <MethodModal
          initial={editing ?? empty()}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function MethodModal({
  initial,
  onClose,
}: {
  initial: DepositMethod | Omit<DepositMethod, "id">;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = "id" in initial;
  const [form, setForm] = useState(initial);
  const patch = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit
        ? api.admin.methods.update((initial as DepositMethod).id, form as Partial<DepositMethod>)
        : api.admin.methods.create(form as Omit<DepositMethod, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.methods });
      qc.invalidateQueries({ queryKey: qk.depositMethods });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">
            {isEdit ? "Edit Gateway" : "New Gateway"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[12px] text-muted">Category</label>
            <select
              value={form.category}
              onChange={(e) => patch("category", e.target.value as GatewayCategory)}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            >
              <option value="CRYPTO">Crypto</option>
              <option value="BANK">Bank</option>
            </select>
          </div>
          <label className="mt-6 flex items-center gap-2 text-[13px] text-secondary">
            <input
              type="checkbox"
              checked={form.listed}
              onChange={(e) => patch("listed", e.target.checked)}
              className="h-4 w-4 accent-brand-red"
            />
            Show this gateway to users
          </label>

          <div>
            <label className="text-[12px] text-muted">Name</label>
            <input
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Symbol</label>
            <input
              value={form.symbol}
              onChange={(e) => patch("symbol", e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>

          {form.category === "CRYPTO" ? (
            <>
              <div>
                <label className="text-[12px] text-muted">Network (TRC20, ERC20, …)</label>
                <input
                  value={form.network ?? ""}
                  onChange={(e) => patch("network", e.target.value)}
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <FileUploader
                  label="Logo (optional)"
                  value={form.logoUrl}
                  onChange={(url) => patch("logoUrl", url)}
                  folder="gateways"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[12px] text-muted">Deposit wallet address</label>
                <input
                  value={form.address ?? ""}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder="Users send funds to this address"
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 font-mono text-[12px] text-primary outline-none focus:border-brand-red"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[12px] text-muted">Bank name</label>
                <input
                  value={form.bankName ?? ""}
                  onChange={(e) => patch("bankName", e.target.value)}
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted">Account name</label>
                <input
                  value={form.accountName ?? ""}
                  onChange={(e) => patch("accountName", e.target.value)}
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted">Account number</label>
                <input
                  value={form.accountNumber ?? ""}
                  onChange={(e) => patch("accountNumber", e.target.value)}
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted">Routing / IBAN code</label>
                <input
                  value={form.code ?? ""}
                  onChange={(e) => patch("code", e.target.value)}
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[12px] text-muted">Min amount</label>
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => patch("minAmount", Number(e.target.value))}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Max amount</label>
            <input
              type="number"
              value={form.maxAmount ?? 0}
              onChange={(e) => patch("maxAmount", Number(e.target.value))}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Fee %</label>
            <input
              type="number"
              step="0.01"
              value={form.feePercent}
              onChange={(e) => patch("feePercent", Number(e.target.value))}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Processing time</label>
            <input
              value={form.processingTime}
              onChange={(e) => patch("processingTime", e.target.value)}
              placeholder="Instant, 1-2h, etc."
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Description (optional)</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => patch("description", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !form.name || !form.symbol}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-red py-2.5 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create gateway"}
        </button>
      </div>
    </div>
  );
}
