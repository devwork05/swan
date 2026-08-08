"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users2, Plus, Loader2, X, Pencil, Trash2, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { api, qk, type Trader, type TraderTrade, type TraderTradeDirection, type TraderTradeResult } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";
import { FileUploader } from "@/components/FileUploader";

type TraderForm = {
  name: string;
  username: string;
  avatarUrl: string;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  followers: number;
  totalProfit: number;
  minEntry: number;
  bio: string;
  published: boolean;
  sortOrder: number;
};

const emptyTrader = (): TraderForm => ({
  name: "", username: "", avatarUrl: "", winRate: 70, totalTrades: 0,
  wins: 0, losses: 0, followers: 0, totalProfit: 0, minEntry: 50,
  bio: "", published: true, sortOrder: 0,
});

function traderToForm(t: Trader): TraderForm {
  return {
    name: t.name, username: t.username, avatarUrl: t.avatarUrl ?? "",
    winRate: t.winRate, totalTrades: t.totalTrades, wins: t.wins, losses: t.losses,
    followers: t.followers, totalProfit: Number(t.totalProfit), minEntry: Number(t.minEntry),
    bio: t.bio ?? "", published: t.published, sortOrder: t.sortOrder,
  };
}

export default function AdminTradersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Trader | null>(null);
  const [creating, setCreating] = useState(false);
  const [tradesFor, setTradesFor] = useState<Trader | null>(null);

  const { data: traders = [], isLoading } = useQuery({
    queryKey: qk.admin.traders,
    queryFn: () => api.admin.traders.list(),
    refetchInterval: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.traders });
    qc.invalidateQueries({ queryKey: qk.traders });
  };

  const toggle = useMutation({
    mutationFn: (t: Trader) => api.admin.traders.update(t.id, { published: !t.published }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.admin.traders.remove(id),
    onSuccess: () => { invalidate(); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Traders"
        icon={Users2}
        subtitle="Manage the public trader roster shown on the copy-trading page."
        right={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred"
          >
            <Plus className="h-4 w-4" /> New Trader
          </button>
        }
      />

      <AdminCard className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">Trader</th>
                <th className="pb-3 text-right font-medium">Win Rate</th>
                <th className="pb-3 text-right font-medium">Followers</th>
                <th className="pb-3 text-right font-medium">Total Profit</th>
                <th className="pb-3 text-right font-medium">Min Entry</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && traders.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-subtle">No traders yet.</td></tr>
              )}
              {traders.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {t.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={t.avatarUrl} alt={t.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-primary">{t.name}</p>
                        <p className="text-[11px] text-muted">@{t.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-emerald-500 font-semibold">{t.winRate}%</td>
                  <td className="py-3 text-right text-secondary">{t.followers.toLocaleString()}</td>
                  <td className={`py-3 text-right font-semibold ${Number(t.totalProfit) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {Number(t.totalProfit) >= 0 ? "+" : "-"}${Math.abs(Number(t.totalProfit)).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-secondary">${Number(t.minEntry).toLocaleString()}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggle.mutate(t)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        t.published ? "bg-emerald-500/10 text-emerald-500" : "bg-subtle/20 text-subtle"
                      }`}
                    >
                      {t.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {t.published ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setTradesFor(t)}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                      >
                        Trades
                      </button>
                      <button
                        onClick={() => setEditing(t)}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${t.name}?`)) remove.mutate(t.id); }}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {(creating || editing) && (
        <TraderEditor
          initial={editing ? traderToForm(editing) : emptyTrader()}
          editingId={editing?.id}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
      {tradesFor && <TradesDrawer trader={tradesFor} onClose={() => setTradesFor(null)} />}
    </div>
  );
}

function TraderEditor({ initial, editingId, onClose }: { initial: TraderForm; editingId?: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<TraderForm>(initial);
  const setField = <K extends keyof TraderForm>(k: K, v: TraderForm[K]) => setF((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? api.admin.traders.update(editingId, { ...f, totalProfit: String(f.totalProfit) as unknown as string, minEntry: String(f.minEntry) as unknown as string })
        : api.admin.traders.create({ ...f, totalProfit: String(f.totalProfit) as unknown as string, minEntry: String(f.minEntry) as unknown as string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.traders });
      qc.invalidateQueries({ queryKey: qk.traders });
      toast.success(editingId ? "Updated" : "Created");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">{editingId ? "Edit Trader" : "New Trader"}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <TxtField label="Name" value={f.name} onChange={(v) => setField("name", v)} />
          <TxtField label="Username" value={f.username} onChange={(v) => setField("username", v)} />
          <NumField label="Win Rate %" value={f.winRate} onChange={(v) => setField("winRate", v)} />
          <NumField label="Followers" value={f.followers} onChange={(v) => setField("followers", v)} />
          <NumField label="Total Trades" value={f.totalTrades} onChange={(v) => setField("totalTrades", v)} />
          <NumField label="Wins" value={f.wins} onChange={(v) => setField("wins", v)} />
          <NumField label="Losses" value={f.losses} onChange={(v) => setField("losses", v)} />
          <NumField label="Total Profit ($)" value={f.totalProfit} onChange={(v) => setField("totalProfit", v)} step="0.01" />
          <NumField label="Min Entry ($)" value={f.minEntry} onChange={(v) => setField("minEntry", v)} step="0.01" />
          <NumField label="Sort order" value={f.sortOrder} onChange={(v) => setField("sortOrder", v)} />
          <div className="sm:col-span-2">
            <FileUploader label="Avatar" value={f.avatarUrl} onChange={(u) => setField("avatarUrl", u)} folder="traders" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Bio</label>
            <textarea value={f.bio} onChange={(e) => setField("bio", e.target.value)} rows={2}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
          </div>
          <label className="mt-6 flex items-center gap-2 text-[13px] text-secondary">
            <input type="checkbox" checked={f.published} onChange={(e) => setField("published", e.target.checked)} className="h-4 w-4 accent-brand-red" />
            Published on public site
          </label>
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !f.name || !f.username}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-red py-2.5 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {editingId ? "Save changes" : "Create trader"}
        </button>
      </div>
    </div>
  );
}

function TradesDrawer({ trader, onClose }: { trader: Trader; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: trades = [], isLoading } = useQuery({
    queryKey: qk.admin.traderTrades(trader.id),
    queryFn: () => api.admin.traders.trades(trader.id),
  });
  const [pair, setPair] = useState("BTC/USDT");
  const [direction, setDirection] = useState<TraderTradeDirection>("RISE");
  const [result, setResult] = useState<TraderTradeResult>("WIN");
  const [profit, setProfit] = useState<string>("100");

  const add = useMutation({
    mutationFn: () => api.admin.traders.addTrade(trader.id, {
      pair, direction, result, profit: Number(profit) || 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.traderTrades(trader.id) });
      qc.invalidateQueries({ queryKey: qk.trader(trader.id) });
      toast.success("Trade added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: number) => api.admin.traders.removeTrade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.traderTrades(trader.id) });
      qc.invalidateQueries({ queryKey: qk.trader(trader.id) });
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-montserrat text-[18px] font-bold text-primary">{trader.name} — Trades</h2>
            <p className="text-[12px] text-muted">Trades shown on the trader profile.</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-2 rounded-lg border bg-elevated p-3 sm:grid-cols-5">
          <input value={pair} onChange={(e) => setPair(e.target.value)} placeholder="Pair" className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary" />
          <select value={direction} onChange={(e) => setDirection(e.target.value as TraderTradeDirection)} className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary">
            <option>RISE</option><option>FALL</option>
          </select>
          <select value={result} onChange={(e) => setResult(e.target.value as TraderTradeResult)} className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary">
            <option>WIN</option><option>LOSS</option>
          </select>
          <input value={profit} onChange={(e) => setProfit(e.target.value)} placeholder="Profit" inputMode="decimal" className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary" />
          <button
            onClick={() => add.mutate()}
            disabled={add.isPending || !pair}
            className="rounded-md bg-brand-red px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {add.isPending ? "Adding…" : "Add"}
          </button>
        </div>

        <div className="mt-4 divide-y border-t">
          {isLoading && <div className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></div>}
          {!isLoading && trades.length === 0 && <p className="py-6 text-center text-[13px] text-subtle">No trades yet.</p>}
          {trades.map((t: TraderTrade) => {
            // Derive sign from `result` so old rows saved before the signed-profit
            // fix still display correctly (LOSS as -$X in red, WIN as +$X in green).
            const magnitude = Math.abs(Number(t.profit));
            const isWin = t.result === "WIN";
            return (
            <div key={t.id} className="flex items-center justify-between py-3 text-[13px]">
              <div>
                <p className="font-semibold text-primary">{t.pair}</p>
                <p className={`inline-flex items-center gap-1 text-[11px] font-semibold ${t.direction === "RISE" ? "text-emerald-500" : "text-red-500"}`}>
                  {t.direction === "RISE" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {t.direction} · {t.result}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${isWin ? "text-emerald-500" : "text-red-500"}`}>
                  {isWin ? "+" : "-"}${magnitude.toLocaleString()}
                </span>
                <button onClick={() => del.mutate(t.id)} className="text-muted hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TxtField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
    </div>
  );
}
function NumField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
    </div>
  );
}
