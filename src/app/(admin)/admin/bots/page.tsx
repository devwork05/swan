"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Plus, Loader2, X, Pencil, Trash2, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { api, qk, type TradingBot, type BotAllocation, type BotTradeRecord, type TraderTradeDirection, type TraderTradeResult } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";

type BotForm = {
  name: string;
  strategy: string;
  description: string;
  winRate: number;
  minInvestment: number;
  performance30d: number;
  pairs: string;
  spark: string;
  published: boolean;
  sortOrder: number;
};

const emptyBot = (): BotForm => ({
  name: "", strategy: "", description: "", winRate: 70,
  minInvestment: 100, performance30d: 10,
  pairs: "BTC/USDT,ETH/USDT", spark: "100,105,110,108,112,116,120",
  published: true, sortOrder: 0,
});

function botToForm(b: TradingBot): BotForm {
  return {
    name: b.name, strategy: b.strategy ?? "", description: b.description ?? "",
    winRate: b.winRate, minInvestment: Number(b.minInvestment), performance30d: Number(b.performance30d),
    pairs: b.pairs.join(","), spark: b.spark.join(","),
    published: b.published, sortOrder: b.sortOrder,
  };
}

export default function AdminBotsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TradingBot | null>(null);
  const [creating, setCreating] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);

  const { data: bots = [], isLoading } = useQuery({
    queryKey: qk.admin.bots,
    queryFn: () => api.admin.bots.list(),
    refetchInterval: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.bots });
    qc.invalidateQueries({ queryKey: qk.bots });
  };

  const toggle = useMutation({
    mutationFn: (b: TradingBot) => api.admin.bots.update(b.id, { published: !b.published }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.admin.bots.remove(id),
    onSuccess: () => { invalidate(); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Trading Bots"
        icon={Bot}
        subtitle="Configure bots users can allocate funds to and post their trade outcomes."
        right={
          <div className="flex gap-2">
            <button
              onClick={() => setAllocOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border bg-page px-3 py-2 text-[13px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
            >
              View Allocations
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred"
            >
              <Plus className="h-4 w-4" /> New Bot
            </button>
          </div>
        }
      />

      <AdminCard className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">Bot</th>
                <th className="pb-3 font-medium">Strategy</th>
                <th className="pb-3 text-right font-medium">Win Rate</th>
                <th className="pb-3 text-right font-medium">30D %</th>
                <th className="pb-3 text-right font-medium">Min Invest</th>
                <th className="pb-3 font-medium">Pairs</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && bots.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-subtle">No trading bots yet.</td></tr>
              )}
              {bots.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-3 font-semibold text-primary">{b.name}</td>
                  <td className="py-3 text-secondary">{b.strategy}</td>
                  <td className="py-3 text-right text-emerald-500 font-semibold">{b.winRate}%</td>
                  <td className="py-3 text-right text-emerald-500">+{Number(b.performance30d)}%</td>
                  <td className="py-3 text-right text-secondary">${Number(b.minInvestment).toLocaleString()}</td>
                  <td className="py-3 text-secondary text-[11px]">{b.pairs.slice(0, 3).join(", ")}{b.pairs.length > 3 ? "…" : ""}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggle.mutate(b)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        b.published ? "bg-emerald-500/10 text-emerald-500" : "bg-subtle/20 text-subtle"
                      }`}
                    >
                      {b.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {b.published ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(b)}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${b.name}?`)) remove.mutate(b.id); }}
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
        <BotEditor
          initial={editing ? botToForm(editing) : emptyBot()}
          editingId={editing?.id}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
      {allocOpen && <AllocationsDrawer onClose={() => setAllocOpen(false)} />}
    </div>
  );
}

function BotEditor({ initial, editingId, onClose }: { initial: BotForm; editingId?: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<BotForm>(initial);
  const setField = <K extends keyof BotForm>(k: K, v: BotForm[K]) => setF((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: f.name,
        strategy: f.strategy,
        description: f.description,
        winRate: f.winRate,
        minInvestment: String(f.minInvestment) as unknown as string,
        performance30d: String(f.performance30d) as unknown as string,
        pairs: f.pairs.split(",").map((s) => s.trim()).filter(Boolean),
        spark: f.spark.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
        published: f.published,
        sortOrder: f.sortOrder,
      };
      return editingId ? api.admin.bots.update(editingId, payload) : api.admin.bots.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.bots });
      qc.invalidateQueries({ queryKey: qk.bots });
      toast.success(editingId ? "Updated" : "Created");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">{editingId ? "Edit Bot" : "New Bot"}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <TxtField label="Name" value={f.name} onChange={(v) => setField("name", v)} />
          <TxtField label="Strategy" value={f.strategy} onChange={(v) => setField("strategy", v)} placeholder="Trend-following" />
          <NumField label="Win Rate %" value={f.winRate} onChange={(v) => setField("winRate", v)} />
          <NumField label="Min Investment ($)" value={f.minInvestment} onChange={(v) => setField("minInvestment", v)} step="0.01" />
          <NumField label="30D Performance %" value={f.performance30d} onChange={(v) => setField("performance30d", v)} step="0.01" />
          <NumField label="Sort order" value={f.sortOrder} onChange={(v) => setField("sortOrder", v)} />
          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Pairs (comma-separated)</label>
            <input value={f.pairs} onChange={(e) => setField("pairs", e.target.value)} placeholder="BTC/USDT,ETH/USDT" className="mt-1 w-full rounded-md border bg-page px-3 py-2 font-mono text-[12px] text-primary outline-none focus:border-brand-red" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Sparkline (comma-separated integers)</label>
            <input value={f.spark} onChange={(e) => setField("spark", e.target.value)} placeholder="100,105,110" className="mt-1 w-full rounded-md border bg-page px-3 py-2 font-mono text-[12px] text-primary outline-none focus:border-brand-red" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Description</label>
            <textarea value={f.description} onChange={(e) => setField("description", e.target.value)} rows={3}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
          </div>
          <label className="mt-6 flex items-center gap-2 text-[13px] text-secondary">
            <input type="checkbox" checked={f.published} onChange={(e) => setField("published", e.target.checked)} className="h-4 w-4 accent-brand-red" />
            Published on public site
          </label>
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !f.name}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-red py-2.5 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {editingId ? "Save changes" : "Create bot"}
        </button>
      </div>
    </div>
  );
}

function AllocationsDrawer({ onClose }: { onClose: () => void }) {
  const { data: allocs = [], isLoading } = useQuery({
    queryKey: qk.admin.botAllocations,
    queryFn: () => api.admin.bots.allocations(),
  });
  const [selected, setSelected] = useState<BotAllocation | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-montserrat text-[18px] font-bold text-primary">Bot Allocations</h2>
            <p className="text-[12px] text-muted">All funded user allocations across every bot.</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Bot</th>
                <th className="pb-3 font-medium">Pair</th>
                <th className="pb-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">P&L</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (<tr><td colSpan={7} className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>)}
              {!isLoading && allocs.length === 0 && (<tr><td colSpan={7} className="py-8 text-center text-subtle">No allocations yet.</td></tr>)}
              {allocs.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-3">
                    <p className="font-semibold text-primary">{a.userName}</p>
                    <p className="text-[11px] text-muted">{a.userEmail}</p>
                  </td>
                  <td className="py-3 text-secondary">{a.botName}</td>
                  <td className="py-3 text-secondary">{a.pair}</td>
                  <td className="py-3 text-right font-mono">${Number(a.amount).toLocaleString()}</td>
                  <td className={`py-3 text-right font-semibold ${Number(a.seedPnl) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {Number(a.seedPnl) >= 0 ? "+" : ""}${Number(a.seedPnl).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-subtle/20 text-subtle"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelected(a)}
                      className="rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                    >
                      Trades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && <AllocationTrades allocation={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}

function AllocationTrades({ allocation, onClose }: { allocation: BotAllocation; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: trades = [], isLoading } = useQuery({
    queryKey: qk.admin.botTrades(allocation.id),
    queryFn: () => api.admin.bots.trades(allocation.id),
  });
  const [direction, setDirection] = useState<TraderTradeDirection>("RISE");
  const [result, setResult] = useState<TraderTradeResult>("WIN");
  const [profit, setProfit] = useState<string>("50");

  const add = useMutation({
    mutationFn: () => api.admin.bots.addTrade(allocation.id, {
      pair: allocation.pair, direction, result, profit: Number(profit) || 0, amount: Number(allocation.amount),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.botTrades(allocation.id) });
      qc.invalidateQueries({ queryKey: qk.admin.botAllocations });
      toast.success("Trade recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: number) => api.admin.bots.removeTrade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.botTrades(allocation.id) });
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-montserrat text-[18px] font-bold text-primary">Trades for {allocation.userName}</h2>
            <p className="text-[12px] text-muted">{allocation.botName} · {allocation.pair}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-2 rounded-lg border bg-elevated p-3 sm:grid-cols-4">
          <select value={direction} onChange={(e) => setDirection(e.target.value as TraderTradeDirection)} className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary">
            <option>RISE</option><option>FALL</option>
          </select>
          <select value={result} onChange={(e) => setResult(e.target.value as TraderTradeResult)} className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary">
            <option>WIN</option><option>LOSS</option>
          </select>
          <input value={profit} onChange={(e) => setProfit(e.target.value)} placeholder="Profit" inputMode="decimal" className="rounded-md border bg-page px-3 py-2 text-[13px] text-primary" />
          <button
            onClick={() => add.mutate()}
            disabled={add.isPending}
            className="rounded-md bg-brand-red px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {add.isPending ? "Adding…" : "Add trade"}
          </button>
        </div>

        <div className="mt-4 divide-y border-t">
          {isLoading && <div className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></div>}
          {!isLoading && trades.length === 0 && <p className="py-6 text-center text-[13px] text-subtle">No trades recorded.</p>}
          {trades.map((t: BotTradeRecord) => (
            <div key={t.id} className="flex items-center justify-between py-3 text-[13px]">
              <div>
                <p className={`inline-flex items-center gap-1 font-semibold ${t.direction === "RISE" ? "text-emerald-500" : "text-red-500"}`}>
                  {t.direction === "RISE" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {t.direction} · {t.result}
                </p>
                <p className="text-[11px] text-muted">{new Date(t.tradedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${Number(t.profit) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {Number(t.profit) >= 0 ? "+" : ""}${Number(t.profit).toLocaleString()}
                </span>
                <button onClick={() => del.mutate(t.id)} className="text-muted hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TxtField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
    </div>
  );
}
function NumField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red" />
    </div>
  );
}
