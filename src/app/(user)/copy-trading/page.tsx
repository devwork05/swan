"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, DollarSign, TrendingUp, Users, X } from "lucide-react";
import { api, qk } from "@/lib/api";
import { TRADERS, type CopyTrader } from "@/lib/tradingData";
import { useCopyTrading, type CopyConfig } from "@/lib/useCopyTrading";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CopyTradingPage() {
  const { data: wallet } = useQuery({ queryKey: qk.wallet, queryFn: () => api.wallet.summary() });
  const { state, follow, unfollow, update } = useCopyTrading();
  const [modal, setModal] = useState<{ kind: "follow" | "edit" | "fund"; trader: CopyTrader } | null>(null);

  const followingIds = Object.keys(state);
  const followedTraders = useMemo(
    () => TRADERS.filter((t) => followingIds.includes(t.id)),
    [followingIds],
  );

  const totalCopyProfit = followedTraders.reduce((acc, t) => {
    const cfg = state[t.id];
    return acc + Math.round(((cfg?.copyPercent ?? 0) / 100) * (t.totalProfit * 0.15));
  }, 0);
  const totalFunded = followedTraders.reduce((acc, t) => acc + (state[t.id]?.fundedAmount ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div>
        <h1 className="font-montserrat text-[28px] font-bold text-primary">Copy Trading</h1>
        <p className="text-[13px] text-muted">Follow top traders and automatically mirror their trades.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Available Balance" value={fmtUsd(wallet?.balance ?? 0)} icon={DollarSign} />
        <StatCard label="Traders Following" value={String(followedTraders.length)} icon={Users} />
        <StatCard label="Total Funded" value={fmtUsd(totalFunded)} icon={Copy} />
        <StatCard label="Copy Profit (est.)" value={fmtUsd(totalCopyProfit)} icon={TrendingUp} accent="text-emerald-500" />
      </div>

      {followedTraders.length > 0 && (
        <section className="mt-8">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">Traders You're Following</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {followedTraders.map((t) => (
              <FollowingCard
                key={t.id}
                trader={t}
                cfg={state[t.id]}
                onEdit={() => setModal({ kind: "edit", trader: t })}
                onFund={() => setModal({ kind: "fund", trader: t })}
                onUnfollow={() => {
                  unfollow(t.id);
                  toast.success(`Unfollowed ${t.name}`);
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-montserrat text-[18px] font-bold text-primary">Top Traders</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b bg-elevated text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Trader</th>
                  <th className="px-4 py-3 text-right font-semibold">Win Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Trades</th>
                  <th className="px-4 py-3 text-right font-semibold">Followers</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Profit</th>
                  <th className="px-4 py-3 text-right font-semibold">Min Entry</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {TRADERS.map((t) => {
                  const following = Boolean(state[t.id]);
                  return (
                    <tr key={t.id} className="border-b last:border-none transition-colors hover:bg-elevated/60">
                      <td className="px-4 py-3">
                        <Link href={`/copy-trading/${t.id}`} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-primary hover:text-brand-red">{t.name}</p>
                            <p className="text-[11px] text-muted">@{t.username}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[12px] font-semibold text-emerald-500">
                          {t.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-secondary">{t.totalTrades.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-secondary">{t.followers.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                        +{fmtUsd(t.totalProfit)}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary">{fmtUsd(t.minEntry)}</td>
                      <td className="px-4 py-3 text-right">
                        {following ? (
                          <button
                            onClick={() => {
                              unfollow(t.id);
                              toast.success(`Unfollowed ${t.name}`);
                            }}
                            className="rounded-md border px-3 py-1.5 text-[12px] font-semibold text-secondary hover:border-red-500 hover:text-red-500"
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => setModal({ kind: "follow", trader: t })}
                            className="rounded-md bg-brand-red px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-darkred"
                          >
                            Follow
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modal && modal.kind === "follow" && (
        <FollowModal
          trader={modal.trader}
          available={wallet?.balance ?? 0}
          onClose={() => setModal(null)}
          onConfirm={(cfg) => {
            follow(modal.trader.id, cfg);
            setModal(null);
            toast.success(`Now copying ${modal.trader.name}`);
          }}
        />
      )}
      {modal && modal.kind === "edit" && (
        <FollowModal
          trader={modal.trader}
          initial={state[modal.trader.id]}
          available={wallet?.balance ?? 0}
          onClose={() => setModal(null)}
          isEdit
          onConfirm={(cfg) => {
            update(modal.trader.id, cfg);
            setModal(null);
            toast.success("Copy settings updated");
          }}
        />
      )}
      {modal && modal.kind === "fund" && (
        <FundModal
          trader={modal.trader}
          current={state[modal.trader.id]?.fundedAmount ?? 0}
          available={wallet?.balance ?? 0}
          onClose={() => setModal(null)}
          onConfirm={(amount) => {
            update(modal.trader.id, { fundedAmount: (state[modal.trader.id]?.fundedAmount ?? 0) + amount });
            setModal(null);
            toast.success(`Added ${fmtUsd(amount)} to copy of ${modal.trader.name}`);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Stat card ---------- */

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

/* ---------- Following card ---------- */

function FollowingCard({
  trader,
  cfg,
  onEdit,
  onFund,
  onUnfollow,
}: {
  trader: CopyTrader;
  cfg: CopyConfig;
  onEdit: () => void;
  onFund: () => void;
  onUnfollow: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trader.avatar} alt={trader.name} className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <Link href={`/copy-trading/${trader.id}`} className="font-semibold text-primary hover:text-brand-red">
            {trader.name}
          </Link>
          <p className="text-[11px] text-muted">@{trader.username}</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
          {trader.winRate}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-elevated p-3 text-[12px]">
        <div>
          <p className="text-muted">Copy %</p>
          <p className="font-semibold text-primary">{cfg.copyPercent}%</p>
        </div>
        <div>
          <p className="text-muted">Funded</p>
          <p className="font-semibold text-primary">{fmtUsd(cfg.fundedAmount)}</p>
        </div>
        <div>
          <p className="text-muted">Max/Trade</p>
          <p className="font-semibold text-primary">{fmtUsd(cfg.maxPerTrade)}</p>
        </div>
        <div>
          <p className="text-muted">Daily Limit</p>
          <p className="font-semibold text-primary">{fmtUsd(cfg.dailyLimit)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={onFund} className="rounded-md bg-brand-red py-1.5 text-[12px] font-semibold text-white hover:bg-brand-darkred">
          Fund
        </button>
        <button onClick={onEdit} className="rounded-md border py-1.5 text-[12px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red">
          Edit
        </button>
        <button onClick={onUnfollow} className="rounded-md border py-1.5 text-[12px] font-semibold text-secondary hover:border-red-500 hover:text-red-500">
          Stop
        </button>
      </div>
    </div>
  );
}

/* ---------- Modals ---------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[18px] font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function FollowModal({
  trader,
  initial,
  available,
  onClose,
  onConfirm,
  isEdit,
}: {
  trader: CopyTrader;
  initial?: CopyConfig;
  available: number;
  onClose: () => void;
  onConfirm: (cfg: Partial<CopyConfig>) => void;
  isEdit?: boolean;
}) {
  const [copyPercent, setCopyPercent] = useState(initial?.copyPercent ?? 25);
  const [maxPerTrade, setMaxPerTrade] = useState(initial?.maxPerTrade ?? 250);
  const [dailyLimit, setDailyLimit] = useState(initial?.dailyLimit ?? 1_500);
  return (
    <Modal title={isEdit ? `Edit copy of ${trader.name}` : `Follow ${trader.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-lg bg-elevated p-3 text-[12px]">
          <div className="flex justify-between text-muted">
            <span>Available Balance</span>
            <span className="font-semibold text-primary">{fmtUsd(available)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Min Entry</span>
            <span className="font-semibold text-primary">{fmtUsd(trader.minEntry)}</span>
          </div>
        </div>
        <NumField
          label="Copy %"
          value={copyPercent}
          onChange={setCopyPercent}
          hint="Percentage of your balance mirrored on each trade."
        />
        <NumField label="Max per Trade (USD)" value={maxPerTrade} onChange={setMaxPerTrade} />
        <NumField label="Daily Limit (USD)" value={dailyLimit} onChange={setDailyLimit} />
        <button
          onClick={() => onConfirm({ copyPercent, maxPerTrade, dailyLimit })}
          className="w-full rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2.5 text-[14px] font-bold text-white shadow-sm hover:brightness-110"
        >
          {isEdit ? "Save Changes" : "Start Copying"}
        </button>
      </div>
    </Modal>
  );
}

function FundModal({
  trader,
  current,
  available,
  onClose,
  onConfirm,
}: {
  trader: CopyTrader;
  current: number;
  available: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const num = Number(amount) || 0;
  return (
    <Modal title={`Fund copy of ${trader.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-lg bg-elevated p-3 text-[12px]">
          <div className="flex justify-between text-muted">
            <span>Currently Funded</span>
            <span className="font-semibold text-primary">{fmtUsd(current)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Available Balance</span>
            <span className="font-semibold text-primary">{fmtUsd(available)}</span>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="w-full rounded-lg border bg-elevated px-3 py-2 text-[14px] text-primary focus:border-brand-red focus:outline-none"
          />
        </div>
        <button
          disabled={num <= 0 || num > available}
          onClick={() => onConfirm(num)}
          className="w-full rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-2.5 text-[14px] font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-50"
        >
          Confirm Fund
        </button>
      </div>
    </Modal>
  );
}

function NumField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
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
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

