"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bitcoin, Plus, Loader2, X, Pencil, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { api, qk, type Crypto } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";
import { FileUploader } from "@/components/FileUploader";

type FormState = {
  name: string;
  symbol: string;
  network: string;
  logoUrl: string;
  listed: boolean;
  sortOrder: number;
  currentPrice: string;
  percentChange24h: string;
  marketCap: string;
  volume24h: string;
  percentChange30d: string;
};

const empty = (): FormState => ({
  name: "",
  symbol: "",
  network: "",
  logoUrl: "",
  listed: true,
  sortOrder: 0,
  currentPrice: "",
  percentChange24h: "",
  marketCap: "",
  volume24h: "",
  percentChange30d: "",
});

function fromCrypto(c: Crypto): FormState {
  return {
    name: c.name ?? "",
    symbol: c.symbol ?? "",
    network: c.network ?? "",
    logoUrl: c.logo_url ?? "",
    listed: c.is_listed !== 0,
    sortOrder: 0,
    currentPrice: c.price?.current_price ?? "",
    percentChange24h: c.price?.percent_change_24h ?? "",
    marketCap: c.price?.market_cap ?? "",
    volume24h: c.price?.volume_24h ?? "",
    percentChange30d: c.price?.percent_change_30d ?? "",
  };
}

function toPayload(f: FormState) {
  const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
  return {
    name: f.name,
    symbol: f.symbol,
    network: f.network,
    logoUrl: f.logoUrl,
    listed: f.listed,
    sortOrder: f.sortOrder,
    currentPrice: num(f.currentPrice),
    percentChange24h: num(f.percentChange24h),
    marketCap: num(f.marketCap),
    volume24h: num(f.volume24h),
    percentChange30d: num(f.percentChange30d),
  };
}

export default function AdminCryptoPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Crypto | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: qk.admin.crypto,
    queryFn: () => api.admin.crypto.list(),
    refetchInterval: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.crypto });
    qc.invalidateQueries({ queryKey: qk.cryptoPrices });
  };

  const toggleListed = useMutation({
    mutationFn: ({ id, listed }: { id: number; listed: boolean }) =>
      api.admin.crypto.update(id, { is_listed: listed ? 1 : 0 }),
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.admin.crypto.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const refreshMut = useMutation({
    mutationFn: () => api.admin.crypto.refresh(),
    onSuccess: (r) => {
      invalidate();
      // Backend now returns { message, inserted, updated, skipped }.
      // Show inserted/updated in green, but surface an error toast when nothing lands.
      const msg = r?.message ?? "Refresh triggered";
      const anyProgress = (r as { inserted?: number; updated?: number })?.inserted
        || (r as { inserted?: number; updated?: number })?.updated;
      if (anyProgress) toast.success(msg);
      else toast.error(msg);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Crypto Assets"
        icon={Bitcoin}
        subtitle="Prices refresh from CRYPTO_PRICE_API every 20 minutes. Edit any row to hand-tune."
        right={
          <div className="flex gap-2">
            <button
              onClick={() => refreshMut.mutate()}
              disabled={refreshMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg border bg-page px-3 py-2 text-[13px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshMut.isPending ? "animate-spin" : ""}`} />
              Refresh Now
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred"
            >
              <Plus className="h-4 w-4" /> New Asset
            </button>
          </div>
        }
      />

      <AdminCard className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Network</th>
                <th className="pb-3 text-right font-medium">Price</th>
                <th className="pb-3 text-right font-medium">24h %</th>
                <th className="pb-3 text-right font-medium">Market Cap</th>
                <th className="pb-3 font-medium">Listed</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-subtle">
                    No crypto assets. Set <code>CRYPTO_PRICE_API</code> and click Refresh Now, or add one manually.
                  </td>
                </tr>
              )}
              {items.map((c) => {
                const change = Number(c.price?.percent_change_24h ?? 0);
                return (
                  <tr key={c.id} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {c.logo_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={c.logo_url} alt={c.symbol} className="h-8 w-8 rounded-full object-contain" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
                            {c.symbol.slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-primary">{c.symbol}</p>
                          <p className="text-[11px] text-muted">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-secondary">{c.network || "—"}</td>
                    <td className="py-3 text-right font-semibold text-primary">
                      {c.price?.current_price ? Number(c.price.current_price).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"}
                    </td>
                    <td className={`py-3 text-right ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {c.price ? `${change.toFixed(2)}%` : "—"}
                    </td>
                    <td className="py-3 text-right text-secondary">
                      {c.price?.market_cap ? `$${Number(c.price.market_cap).toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleListed.mutate({ id: c.id, listed: c.is_listed === 0 })}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          c.is_listed !== 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-subtle/20 text-subtle"
                        }`}
                      >
                        {c.is_listed !== 0 ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {c.is_listed !== 0 ? "Listed" : "Hidden"}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(c)}
                          className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${c.symbol}?`)) deleteMut.mutate(c.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
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

      {(creating || editing) && (
        <Editor
          initial={editing ? fromCrypto(editing) : empty()}
          editingId={editing?.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Editor({
  initial,
  editingId,
  onClose,
}: {
  initial: FormState;
  editingId?: number;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(initial);
  const patchField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? api.admin.crypto.update(editingId, toPayload(form))
        : api.admin.crypto.create({ ...toPayload(form), name: form.name, symbol: form.symbol }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.crypto });
      qc.invalidateQueries({ queryKey: qk.cryptoPrices });
      toast.success(editingId ? "Updated" : "Created");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">
            {editingId ? "Edit Crypto Asset" : "New Crypto Asset"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input value={form.name} onChange={(e) => patchField("name", e.target.value)} className="fld" />
          </Field>
          <Field label="Symbol">
            <input value={form.symbol} onChange={(e) => patchField("symbol", e.target.value.toUpperCase())} className="fld" />
          </Field>
          <Field label="Network">
            <input value={form.network} onChange={(e) => patchField("network", e.target.value)} placeholder="e.g. Ethereum" className="fld" />
          </Field>
          <Field label="Sort order">
            <input type="number" value={form.sortOrder} onChange={(e) => patchField("sortOrder", Number(e.target.value) || 0)} className="fld" />
          </Field>
          <div className="sm:col-span-2">
            <FileUploader label="Logo" value={form.logoUrl} onChange={(u) => patchField("logoUrl", u)} folder="crypto" />
          </div>

          <Field label="Current Price (USD)">
            <input value={form.currentPrice} onChange={(e) => patchField("currentPrice", e.target.value)} inputMode="decimal" className="fld" />
          </Field>
          <Field label="24h Change %">
            <input value={form.percentChange24h} onChange={(e) => patchField("percentChange24h", e.target.value)} inputMode="decimal" className="fld" />
          </Field>
          <Field label="Market Cap (USD)">
            <input value={form.marketCap} onChange={(e) => patchField("marketCap", e.target.value)} inputMode="decimal" className="fld" />
          </Field>
          <Field label="24h Volume (USD)">
            <input value={form.volume24h} onChange={(e) => patchField("volume24h", e.target.value)} inputMode="decimal" className="fld" />
          </Field>
          <Field label="30d Change %">
            <input value={form.percentChange30d} onChange={(e) => patchField("percentChange30d", e.target.value)} inputMode="decimal" className="fld" />
          </Field>

          <label className="mt-6 flex items-center gap-2 text-[13px] text-secondary">
            <input type="checkbox" checked={form.listed} onChange={(e) => patchField("listed", e.target.checked)} className="h-4 w-4 accent-brand-red" />
            Listed on public site
          </label>
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !form.name || !form.symbol}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-red py-2.5 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {editingId ? "Save changes" : "Create asset"}
        </button>

        <style jsx>{`
          .fld {
            width: 100%;
            border-radius: 6px;
            border: 1px solid var(--border-default);
            background: var(--surface-page);
            padding: 8px 12px;
            font-size: 13px;
            color: var(--text-primary);
            outline: none;
          }
          .fld:focus {
            border-color: #c1121f;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] text-muted">{label}</label>
      {children}
    </div>
  );
}
