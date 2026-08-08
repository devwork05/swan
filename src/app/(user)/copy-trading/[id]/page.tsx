"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  X,
  Loader2,
} from "lucide-react";
import { api, qk, type Trader, type CopyFollow } from "@/lib/api";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function TraderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const qc = useQueryClient();
  const { id } = use(params);
  const traderId = Number(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: qk.trader(traderId),
    queryFn: () => api.traders.get(traderId),
    enabled: Number.isFinite(traderId),
  });
  const { data: wallet } = useQuery({ queryKey: qk.wallet, queryFn: () => api.wallet.summary() });
  const { data: follows = [] } = useQuery({ queryKey: qk.myFollows, queryFn: () => api.copyTrading.myFollows() });

  const [showSettings, setShowSettings] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.trader(traderId) });
    qc.invalidateQueries({ queryKey: qk.myFollows });
    qc.invalidateQueries({ queryKey: qk.traders });
  };

  const followMut = useMutation({
    mutationFn: () => api.copyTrading.follow(traderId),
    onSuccess: () => {
      invalidate();
      toast.success("Now following");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unfollowMut = useMutation({
    mutationFn: () => api.copyTrading.unfollow(traderId),
    onSuccess: () => {
      invalidate();
      toast.success("Unfollowed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (data: { copyPercent: number; maxPerTrade: number; dailyLimit: number }) =>
      api.copyTrading.update(traderId, data),
    onSuccess: () => {
      invalidate();
      setShowSettings(false);
      toast.success("Copy settings updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (isError || !data) {
    notFound();
  }
  const trader: Trader = data.trader;
  const recentTrades = data.recentTrades;
  const follow = follows.find((f) => f.traderId === trader.id) ?? null;
  const following = Boolean(follow);

  return (
    <div className="mx-auto max-w-[1200px]">
      <Link href="/copy-trading" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-brand-red">
        <ArrowLeft className="h-4 w-4" /> Back to Copy Trading
      </Link>

      <div className="mt-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          {trader.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={trader.avatarUrl} alt={trader.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-red/10 text-[24px] font-bold text-brand-red">
              {trader.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-montserrat text-[24px] font-bold text-primary">{trader.name}</h1>
            <p className="text-[13px] text-muted">@{trader.username}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-secondary">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {trader.followers.toLocaleString()} followers</span>
              <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> {trader.winRate}% win rate</span>
              <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Min entry {fmtUsd(Number(trader.minEntry))}</span>
            </div>
            {trader.bio && <p className="mt-3 text-[13px] text-secondary">{trader.bio}</p>}
          </div>
          <div className="flex gap-2">
            {following ? (
              <>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
                >
                  <Settings className="h-4 w-4" /> Copy Settings
                </button>
                <button
                  onClick={() => unfollowMut.mutate()}
                  className="rounded-lg border px-3 py-2 text-[13px] font-semibold text-secondary hover:border-red-500 hover:text-red-500"
                >
                  Unfollow
                </button>
              </>
            ) : (
              <button
                onClick={() => followMut.mutate()}
                className="rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred"
              >
                Follow Trader
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-montserrat text-[16px] font-bold text-primary">Performance</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Total Trades" value={trader.totalTrades.toLocaleString()} />
              <Stat label="Wins" value={trader.wins.toLocaleString()} accent="text-emerald-500" />
              <Stat label="Losses" value={trader.losses.toLocaleString()} accent="text-red-500" />
              <Stat label="Win Rate" value={`${trader.winRate}%`} accent="text-emerald-500" />
              <Stat label="Followers" value={trader.followers.toLocaleString()} />
              <Stat label="Total Profit" value={`+${fmtUsd(Number(trader.totalProfit))}`} accent="text-emerald-500" />
            </div>
          </div>

          {follow && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="font-montserrat text-[16px] font-bold text-primary">Your Copy Settings</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                <Stat label="Copy %" value={`${follow.copyPercent}%`} />
                <Stat label="Funded" value={fmtUsd(Number(follow.fundedAmount))} />
                <Stat label="Max/Trade" value={fmtUsd(Number(follow.maxPerTrade))} />
                <Stat label="Daily Limit" value={fmtUsd(Number(follow.dailyLimit))} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Recent Trades</h3>
          <div className="mt-3 divide-y">
            {recentTrades.length === 0 && (
              <p className="py-6 text-center text-[13px] text-muted">No trades recorded yet.</p>
            )}
            {recentTrades.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 text-[13px]">
                <div>
                  <p className="font-semibold text-primary">{t.pair}</p>
                  <p className={`inline-flex items-center gap-1 text-[11px] font-semibold ${t.direction === "RISE" ? "text-emerald-500" : "text-red-500"}`}>
                    {t.direction === "RISE" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {t.direction}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${t.result === "WIN" ? "text-emerald-500" : "text-red-500"}`}>{t.result}</p>
                  <p className={`text-[12px] font-semibold ${Number(t.profit) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {Number(t.profit) >= 0 ? "+" : ""}{fmtUsd(Math.round(Number(t.profit)))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSettings && follow && (
        <SettingsModal
          initial={follow}
          available={wallet?.balance ?? 0}
          pending={updateMut.isPending}
          onClose={() => setShowSettings(false)}
          onSave={(next) => updateMut.mutate(next)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-elevated p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-montserrat text-[16px] font-bold ${accent ?? "text-primary"}`}>{value}</p>
    </div>
  );
}

function SettingsModal({
  initial,
  available,
  onClose,
  onSave,
  pending,
}: {
  initial: CopyFollow;
  available: number;
  onClose: () => void;
  onSave: (next: { copyPercent: number; maxPerTrade: number; dailyLimit: number }) => void;
  pending: boolean;
}) {
  const [copyPercent, setCopyPercent] = useState(initial.copyPercent);
  const [maxPerTrade, setMaxPerTrade] = useState(Number(initial.maxPerTrade));
  const [dailyLimit, setDailyLimit] = useState(Number(initial.dailyLimit));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[18px] font-bold text-primary">Edit Copy Settings</h3>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-elevated p-3 text-[12px]">
            <div className="flex justify-between text-muted"><span>Available Balance</span><span className="font-semibold text-primary">{fmtUsd(available)}</span></div>
          </div>
          <NumField label="Copy %" value={copyPercent} onChange={setCopyPercent} />
          <NumField label="Max per Trade (USD)" value={maxPerTrade} onChange={setMaxPerTrade} />
          <NumField label="Daily Limit (USD)" value={dailyLimit} onChange={setDailyLimit} />
          <button
            onClick={() => onSave({ copyPercent, maxPerTrade, dailyLimit })}
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2.5 text-[14px] font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        inputMode="decimal"
        className="w-full rounded-lg border bg-elevated px-3 py-2 text-[14px] text-primary focus:border-brand-red focus:outline-none"
      />
    </div>
  );
}
