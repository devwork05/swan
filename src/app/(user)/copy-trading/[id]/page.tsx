"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  X,
} from "lucide-react";
import { api, qk } from "@/lib/api";
import { TRADERS } from "@/lib/tradingData";
import { useCopyTrading } from "@/lib/useCopyTrading";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function TraderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const trader = useMemo(() => TRADERS.find((t) => t.id === id), [id]);
  if (!trader) notFound();

  const { data: wallet } = useQuery({ queryKey: qk.wallet, queryFn: () => api.wallet.summary() });
  const { state, follow, unfollow, update } = useCopyTrading();
  const cfg = state[trader.id];
  const following = Boolean(cfg);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px]">
      <Link href="/copy-trading" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-brand-red">
        <ArrowLeft className="h-4 w-4" />
        Back to Copy Trading
      </Link>

      <div className="mt-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trader.avatar} alt={trader.name} className="h-20 w-20 rounded-full object-cover" />
          <div className="flex-1">
            <h1 className="font-montserrat text-[24px] font-bold text-primary">{trader.name}</h1>
            <p className="text-[13px] text-muted">@{trader.username}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-secondary">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {trader.followers.toLocaleString()} followers
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> {trader.winRate}% win rate
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Min entry {fmtUsd(trader.minEntry)}
              </span>
            </div>
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
                  onClick={() => {
                    unfollow(trader.id);
                    toast.success(`Unfollowed ${trader.name}`);
                  }}
                  className="rounded-lg border px-3 py-2 text-[13px] font-semibold text-secondary hover:border-red-500 hover:text-red-500"
                >
                  Unfollow
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  follow(trader.id);
                  toast.success(`Now copying ${trader.name}`);
                }}
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
          <StatsCard trader={trader} />
          {cfg && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="font-montserrat text-[16px] font-bold text-primary">Your Copy Settings</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                <SettingRow label="Copy %" value={`${cfg.copyPercent}%`} />
                <SettingRow label="Funded" value={fmtUsd(cfg.fundedAmount)} />
                <SettingRow label="Max/Trade" value={fmtUsd(cfg.maxPerTrade)} />
                <SettingRow label="Daily Limit" value={fmtUsd(cfg.dailyLimit)} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Recent Trades</h3>
          <div className="mt-3 divide-y">
            {trader.recentTrades.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-[13px]">
                <div>
                  <p className="font-semibold text-primary">{t.pair}</p>
                  <p
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      t.direction === "RISE" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {t.direction === "RISE" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {t.direction}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${t.result === "WIN" ? "text-emerald-500" : "text-red-500"}`}>
                    {t.result}
                  </p>
                  <p
                    className={`text-[12px] font-semibold ${
                      t.profit >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {t.profit >= 0 ? "+" : ""}
                    {fmtUsd(Math.round(t.profit))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSettings && cfg && (
        <SettingsModal
          initial={cfg}
          available={wallet?.balance ?? 0}
          onClose={() => setShowSettings(false)}
          onSave={(next) => {
            update(trader.id, next);
            setShowSettings(false);
            toast.success("Copy settings updated");
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ trader }: { trader: (typeof TRADERS)[number] }) {
  const rows = [
    { label: "Total Trades", value: trader.totalTrades.toLocaleString() },
    { label: "Wins", value: trader.wins.toLocaleString(), accent: "text-emerald-500" },
    { label: "Losses", value: trader.losses.toLocaleString(), accent: "text-red-500" },
    { label: "Win Rate", value: `${trader.winRate}%`, accent: "text-emerald-500" },
    { label: "Followers", value: trader.followers.toLocaleString() },
    { label: "Total Profit", value: `+${fmtUsd(trader.totalProfit)}`, accent: "text-emerald-500" },
  ];
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-montserrat text-[16px] font-bold text-primary">Performance</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-lg bg-elevated p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted">{r.label}</p>
            <p className={`mt-1 font-montserrat text-[16px] font-bold ${r.accent ?? "text-primary"}`}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-elevated p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-semibold text-primary">{value}</p>
    </div>
  );
}

function SettingsModal({
  initial,
  available,
  onClose,
  onSave,
}: {
  initial: { copyPercent: number; maxPerTrade: number; dailyLimit: number; fundedAmount: number };
  available: number;
  onClose: () => void;
  onSave: (next: { copyPercent: number; maxPerTrade: number; dailyLimit: number }) => void;
}) {
  const [copyPercent, setCopyPercent] = useState(initial.copyPercent);
  const [maxPerTrade, setMaxPerTrade] = useState(initial.maxPerTrade);
  const [dailyLimit, setDailyLimit] = useState(initial.dailyLimit);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[18px] font-bold text-primary">Edit Copy Settings</h3>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-elevated p-3 text-[12px]">
            <div className="flex justify-between text-muted">
              <span>Available Balance</span>
              <span className="font-semibold text-primary">{fmtUsd(available)}</span>
            </div>
          </div>
          <NumField label="Copy %" value={copyPercent} onChange={setCopyPercent} />
          <NumField label="Max per Trade (USD)" value={maxPerTrade} onChange={setMaxPerTrade} />
          <NumField label="Daily Limit (USD)" value={dailyLimit} onChange={setDailyLimit} />
          <button
            onClick={() => onSave({ copyPercent, maxPerTrade, dailyLimit })}
            className="w-full rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2.5 text-[14px] font-bold text-white shadow-sm hover:brightness-110"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
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
