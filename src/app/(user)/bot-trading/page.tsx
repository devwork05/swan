"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  X,
  ArrowRight,
  History,
  Play,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { api, qk, type TradingBot, type BotTradeRecord } from "@/lib/api";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function BotTradingPage() {
  const qc = useQueryClient();
  const { data: wallet } = useQuery({ queryKey: qk.wallet, queryFn: () => api.wallet.summary() });
  const { data: bots = [], isLoading: loadingBots } = useQuery({ queryKey: qk.bots, queryFn: () => api.bots.list() });
  const { data: allocations = [] } = useQuery({
    queryKey: qk.myBotAllocations,
    queryFn: () => api.botTrading.myAllocations(),
  });
  const { data: history = [] } = useQuery({
    queryKey: qk.myBotHistory,
    queryFn: () => api.botTrading.history(),
  });

  const [starting, setStarting] = useState<TradingBot | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.myBotAllocations });
    qc.invalidateQueries({ queryKey: qk.myBotHistory });
  };

  const startMut = useMutation({
    mutationFn: (input: { botId: number; amount: number; pair: string }) => api.botTrading.start(input),
    onSuccess: () => {
      invalidate();
      setStarting(null);
      toast.success("Bot started");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stopMut = useMutation({
    mutationFn: (allocationId: number) => api.botTrading.stop(allocationId),
    onSuccess: () => {
      invalidate();
      toast.success("Bot stopped");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = allocations.filter((a) => a.status === "ACTIVE");
  const totalInvested = active.reduce((s, a) => s + Number(a.amount), 0);
  const totalPnl = history.reduce((s, t) => s + Number(t.profit), 0);
  const wins = history.filter((t) => t.result === "WIN").length;
  const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-[28px] font-bold text-primary">Bot Trading</h1>
          <p className="text-[13px] text-muted">Automated strategies running 24/7 on curated pairs.</p>
        </div>
        <Link
          href="/bot-trading/history"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-[13px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
        >
          <History className="h-4 w-4" /> Full History
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Available Balance" value={fmtUsd(wallet?.balance ?? 0)} icon={DollarSign} />
        <StatCard label="Active Bots" value={String(active.length)} icon={Bot} />
        <StatCard label="Total Invested" value={fmtUsd(totalInvested)} icon={Activity} />
        <StatCard
          label="Total P&L"
          value={`${totalPnl >= 0 ? "+" : ""}${fmtUsd(Math.round(totalPnl))}`}
          icon={TrendingUp}
          accent={totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}
        />
      </div>

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">Active Bot Trades</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b bg-elevated text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Bot</th>
                  <th className="px-4 py-3 font-semibold">Pair</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Runtime</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {active.map((a) => (
                  <tr key={a.id} className="border-b last:border-none">
                    <td className="px-4 py-3 font-semibold text-primary">{a.botName}</td>
                    <td className="px-4 py-3 text-secondary">{a.pair}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{fmtUsd(Number(a.amount))}</td>
                    <td className="px-4 py-3 text-right text-muted">
                      {Math.max(1, Math.round((Date.now() - new Date(a.createdAt).getTime()) / 60_000))}m
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => stopMut.mutate(a.id)}
                        disabled={stopMut.isPending}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[12px] font-semibold text-secondary hover:border-red-500 hover:text-red-500 disabled:opacity-60"
                      >
                        <Square className="h-3 w-3" /> Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">Recent Trades</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b bg-elevated text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Bot</th>
                  <th className="px-4 py-3 font-semibold">Pair</th>
                  <th className="px-4 py-3 text-right font-semibold">Direction</th>
                  <th className="px-4 py-3 text-right font-semibold">Result</th>
                  <th className="px-4 py-3 text-right font-semibold">Profit</th>
                  <th className="px-4 py-3 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((t) => (
                  <TradeRow key={t.id} row={t} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">Available Trading Bots</h2>
          <span className="text-[12px] text-muted">
            {wins} wins · {history.length - wins} losses · {winRate}% win rate
          </span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loadingBots && (
            <div className="col-span-full flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          )}
          {!loadingBots && bots.length === 0 && (
            <p className="col-span-full py-8 text-center text-subtle">No trading bots configured yet.</p>
          )}
          {bots.map((b) => (
            <BotCard key={b.id} bot={b} onStart={() => setStarting(b)} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-montserrat text-[16px] font-bold text-primary">How Bot Trading Works</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Step n={1} icon={Bot} title="Pick a Bot" body="Each bot follows a different strategy. Pick one that matches your risk appetite." />
          <Step n={2} icon={Zap} title="Fund It" body="Allocate an amount above the minimum and choose one of the bot's supported pairs to trade." />
          <Step n={3} icon={TrendingUp} title="Let it Run" body="The bot trades 24/7. You can stop it any time, and full history is one click away." />
        </div>
      </section>

      {starting && (
        <StartModal
          bot={starting}
          available={wallet?.balance ?? 0}
          pending={startMut.isPending}
          onClose={() => setStarting(null)}
          onConfirm={({ amount, pair }) => startMut.mutate({ botId: starting.id, amount, pair })}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={`mt-2 font-montserrat text-[22px] font-bold ${accent ?? "text-primary"}`}>{value}</p>
    </div>
  );
}

function BotCard({ bot, onStart }: { bot: TradingBot; onStart: () => void }) {
  const points = useMemo(() => (bot.spark && bot.spark.length > 1 ? bot.spark : [100, 105, 108, 106, 111, 115, 118]), [bot.spark]);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const w = 200;
  const h = 60;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-montserrat text-[16px] font-bold text-primary">{bot.name}</h3>
            <p className="text-[11px] text-muted">{bot.strategy}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">{bot.winRate}%</span>
      </div>

      {bot.description && <p className="mt-3 text-[12px] text-secondary">{bot.description}</p>}

      <div className="mt-3 h-[60px] w-full">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-lg bg-elevated p-2">
          <p className="text-muted">30D Perf</p>
          <p className="font-semibold text-emerald-500">+{Number(bot.performance30d)}%</p>
        </div>
        <div className="rounded-lg bg-elevated p-2">
          <p className="text-muted">Min Invest</p>
          <p className="font-semibold text-primary">{fmtUsd(Number(bot.minInvestment))}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {bot.pairs.slice(0, 4).map((p) => (
          <span key={p} className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-semibold text-secondary">{p}</span>
        ))}
        {bot.pairs.length > 4 && (
          <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-semibold text-muted">+{bot.pairs.length - 4}</span>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={bot.pairs.length === 0}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2 text-[13px] font-bold text-white hover:brightness-110 disabled:opacity-50"
      >
        <Play className="h-4 w-4" /> Start Bot
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Step({ n, icon: Icon, title, body }: { n: number; icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-elevated p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-white text-[13px] font-bold">{n}</div>
        <Icon className="h-4 w-4 text-brand-red" />
        <p className="font-semibold text-primary">{title}</p>
      </div>
      <p className="mt-2 text-[12px] text-secondary">{body}</p>
    </div>
  );
}

function TradeRow({ row }: { row: BotTradeRecord }) {
  const profit = Number(row.profit);
  return (
    <tr className="border-b last:border-none">
      <td className="px-4 py-3 font-semibold text-primary">{row.botName}</td>
      <td className="px-4 py-3 text-secondary">{row.pair}</td>
      <td className="px-4 py-3 text-right">
        <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${row.direction === "RISE" ? "text-emerald-500" : "text-red-500"}`}>
          {row.direction === "RISE" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {row.direction}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.result === "WIN" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          {row.result}
        </span>
      </td>
      <td className={`px-4 py-3 text-right font-semibold ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
        {profit >= 0 ? "+" : ""}{fmtUsd(Math.round(profit))}
      </td>
      <td className="px-4 py-3 text-right text-muted">{new Date(row.tradedAt).toLocaleTimeString().slice(0, 8)}</td>
    </tr>
  );
}

function StartModal({ bot, available, onClose, onConfirm, pending }: {
  bot: TradingBot; available: number; onClose: () => void;
  onConfirm: (v: { amount: number; pair: string }) => void; pending: boolean;
}) {
  const [amount, setAmount] = useState<string>(String(bot.minInvestment));
  const [pair, setPair] = useState<string>(bot.pairs[0] ?? "");
  const num = Number(amount) || 0;
  const invalid = num < Number(bot.minInvestment) || num > available;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-montserrat text-[18px] font-bold text-primary">Start {bot.name}</h3>
            {bot.strategy && <p className="text-[12px] text-muted">{bot.strategy}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-elevated p-3 text-[12px]">
            <div className="flex justify-between text-muted"><span>Available Balance</span><span className="font-semibold text-primary">{fmtUsd(available)}</span></div>
            <div className="flex justify-between text-muted"><span>Min Investment</span><span className="font-semibold text-primary">{fmtUsd(Number(bot.minInvestment))}</span></div>
            <div className="flex justify-between text-muted"><span>Win Rate</span><span className="font-semibold text-emerald-500">{bot.winRate}%</span></div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Trading Pair</label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
            >
              {bot.pairs.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Amount (USD)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[14px] text-primary focus:border-brand-red focus:outline-none"
            />
          </div>
          <button
            onClick={() => onConfirm({ amount: num, pair })}
            disabled={pending || invalid || !pair}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2.5 text-[14px] font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Start Bot
          </button>
        </div>
      </div>
    </div>
  );
}

