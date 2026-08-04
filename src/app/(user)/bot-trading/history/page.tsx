"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
} from "lucide-react";
import { BOTS } from "@/lib/tradingData";
import { useBotTrading } from "@/lib/useBotTrading";

type ResultFilter = "ALL" | "WIN" | "LOSS";
const PAGE_SIZE = 10;

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function BotHistoryPage() {
  const { history } = useBotTrading();
  const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");
  const [botFilter, setBotFilter] = useState<string>("ALL");
  const [pairFilter, setPairFilter] = useState<string>("ALL");
  const [advOpen, setAdvOpen] = useState(false);
  const [page, setPage] = useState(1);

  const allPairs = useMemo(() => {
    const s = new Set<string>();
    history.forEach((h) => s.add(h.pair));
    return ["ALL", ...Array.from(s)];
  }, [history]);

  const filtered = useMemo(
    () =>
      history.filter((h) => {
        if (resultFilter !== "ALL" && h.result !== resultFilter) return false;
        if (botFilter !== "ALL" && h.botId !== botFilter) return false;
        if (pairFilter !== "ALL" && h.pair !== pairFilter) return false;
        return true;
      }),
    [history, resultFilter, botFilter, pairFilter],
  );

  const totalTrades = filtered.length;
  const wins = filtered.filter((t) => t.result === "WIN").length;
  const losses = totalTrades - wins;
  const totalPnl = filtered.reduce((s, t) => s + t.profit, 0);
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const totalPages = Math.max(1, Math.ceil(totalTrades / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const paged = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link href="/bot-trading" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-brand-red">
        <ArrowLeft className="h-4 w-4" />
        Back to Bot Trading
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-[28px] font-bold text-primary">Trading History</h1>
          <p className="text-[13px] text-muted">Complete log of trades placed by your bots.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Trades" value={String(totalTrades)} icon={Activity} />
        <StatCard label="Wins" value={String(wins)} icon={TrendingUp} accent="text-emerald-500" />
        <StatCard label="Losses" value={String(losses)} icon={TrendingDown} accent="text-red-500" />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          icon={Percent}
          accent={winRate >= 50 ? "text-emerald-500" : "text-red-500"}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["ALL", "WIN", "LOSS"] as const).map((r) => (
          <button
            key={r}
            onClick={() => {
              setResultFilter(r);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors ${
              resultFilter === r
                ? "bg-brand-red text-white"
                : "border bg-card text-secondary hover:border-brand-red hover:text-brand-red"
            }`}
          >
            {r === "ALL" ? "All" : r === "WIN" ? "Wins" : "Losses"}
          </button>
        ))}
        <button
          onClick={() => setAdvOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-[12px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
        >
          <Filter className="h-3.5 w-3.5" />
          Advanced Filters
        </button>
      </div>

      {advOpen && (
        <div className="mt-3 grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Bot</label>
            <select
              value={botFilter}
              onChange={(e) => {
                setBotFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
            >
              <option value="ALL">All Bots</option>
              {BOTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Pair</label>
            <select
              value={pairFilter}
              onChange={(e) => {
                setPairFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
            >
              {allPairs.map((p) => (
                <option key={p} value={p}>
                  {p === "ALL" ? "All Pairs" : p}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-elevated px-4 py-3">
          <h2 className="font-montserrat text-[16px] font-bold text-primary">
            Trading History <span className="text-[12px] font-normal text-muted">({totalTrades} trades)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Bot</th>
                <th className="px-4 py-3 font-semibold">Pair</th>
                <th className="px-4 py-3 text-right font-semibold">Direction</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Result</th>
                <th className="px-4 py-3 text-right font-semibold">Profit</th>
                <th className="px-4 py-3 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Activity className="mx-auto h-8 w-8 text-subtle" />
                    <p className="mt-2 text-[13px] text-muted">No trades match your filters.</p>
                  </td>
                </tr>
              )}
              {paged.map((t) => (
                <tr key={t.id} className="border-b last:border-none hover:bg-elevated/60">
                  <td className="px-4 py-3 font-semibold text-primary">{t.botName}</td>
                  <td className="px-4 py-3 text-secondary">{t.pair}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[12px] font-semibold ${
                        t.direction === "RISE" ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {t.direction === "RISE" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-secondary">{fmtUsd(t.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.result === "WIN" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.result}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {t.profit >= 0 ? "+" : ""}
                    {fmtUsd(Math.round(t.profit))}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{new Date(t.at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalTrades > 0 && (
          <div className="flex items-center justify-between border-t bg-elevated px-4 py-3 text-[12px]">
            <p className="text-muted">
              Page {clampedPage} of {totalPages} · Net P&L{" "}
              <span className={totalPnl >= 0 ? "font-semibold text-emerald-500" : "font-semibold text-red-500"}>
                {totalPnl >= 0 ? "+" : ""}
                {fmtUsd(Math.round(totalPnl))}
              </span>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, clampedPage - 1))}
                disabled={clampedPage <= 1}
                className="rounded-md border bg-card p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, clampedPage + 1))}
                disabled={clampedPage >= totalPages}
                className="rounded-md border bg-card p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
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
