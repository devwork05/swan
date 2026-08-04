"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Signal,
  Users,
  Bot,
  Info,
  X,
  Wallet,
  Percent,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { api, qk, type InvestmentPlan } from "@/lib/api";
import { useWallet } from "@/lib/useWallet";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* --- Parsing helpers (mirror the backend so projections match) ------- */

/** "1 Day", "3 Weeks", "6 Months", "48 Hours", "1 Year" → total days. */
function parseDurationToDays(duration: string): number {
  const m = duration.trim().match(/^(\d+)\s+(minute|hour|day|week|month|year)s?$/i);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  switch (unit) {
    case "minute": return n / (60 * 24);
    case "hour":   return n / 24;
    case "day":    return n;
    case "week":   return n * 7;
    case "month":  return n * 30;
    case "year":   return n * 365;
    default:       return n;
  }
}

/** How many ticks fit inside a day for a given interval label. */
function ticksPerDay(interval: string): number {
  switch (interval) {
    case "Every 10 Minutes": return 24 * 6;
    case "Every 15 Minutes": return 24 * 4;
    case "Every 30 Minutes": return 24 * 2;
    case "Hourly":           return 24;
    case "Every 2 Hours":    return 12;
    case "Every 4 Hours":    return 6;
    case "Every 6 Hours":    return 4;
    case "Twice Daily":      return 2;
    case "Daily":            return 1;
    case "Weekly":
    case "Weekly on Monday at 8:00":
      return 1 / 7;
    case "Twice Monthly":    return 2 / 30;
    case "Monthly":
    case "Last Day of the Month":
      return 1 / 30;
    case "Every 6 Months":
    case "Every 6 Months on January 1st and July 1st":
      return 1 / 182;
    case "Quarterly":
    case "Quarterly on 4th at 14:00":
      return 1 / 91;
    case "Yearly":
    case "Yearly on June 1st at 17:00":
      return 1 / 365;
    default:                 return 1;
  }
}

function humanInterval(interval: string): string {
  const map: Record<string, string> = {
    Hourly: "Hourly return",
    Daily: "Daily return",
    "Twice Daily": "Twice-daily return",
    Weekly: "Weekly return",
    Monthly: "Monthly return",
    Yearly: "Yearly return",
    Quarterly: "Quarterly return",
    "Every 30 Minutes": "Every 30 minutes",
    "Every 15 Minutes": "Every 15 minutes",
    "Every 10 Minutes": "Every 10 minutes",
    "Every 2 Hours": "Every 2 hours",
    "Every 4 Hours": "Every 4 hours",
    "Every 6 Hours": "Every 6 hours",
  };
  return map[interval] ?? `${interval} return`;
}

/* --- Page --------------------------------------------------------------- */

export default function PlansPage() {
  const { data: plans, error, isLoading } = useQuery({
    queryKey: qk.plans,
    queryFn: () => api.plans.list(),
    staleTime: 30_000,
  });
  const [selected, setSelected] = useState<InvestmentPlan | null>(null);

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header + breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-montserrat text-[26px] font-bold text-primary">Investment Plans</h1>
          <nav className="mt-1 flex items-center text-[13px] text-muted">
            <Link href="/dashboard" className="hover:text-brand-red">Dashboard</Link>
            <span className="mx-2">/</span>
            <span>Investment Plans</span>
          </nav>
        </div>
        <Link
          href="/my-plans"
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-[13px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
        >
          My Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Info card */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border bg-card p-5 shadow-sm">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
        <div>
          <h2 className="font-montserrat text-[16px] font-semibold text-primary">Grow Your Wealth with Our Plans</h2>
          <p className="mt-1 text-[13px] text-muted">
            Pick a plan and start earning profit that ticks in on the schedule you choose — daily, hourly, or anything in between.
            Every plan protects your principal and returns it at maturity.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[13px] text-red-500">
          <AlertTriangle className="h-4 w-4" />
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="mt-10 rounded-xl border bg-card p-12 text-center">
          <Bot className="mx-auto h-12 w-12 text-muted" />
          <h3 className="mt-3 font-montserrat text-[18px] font-bold text-primary">No investment plans available</h3>
          <p className="mt-1 text-[13px] text-muted">Please check back later or contact support.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} popular={i === 1} onInvest={() => setSelected(p)} />
          ))}
        </div>
      )}

      {selected && <InvestModal plan={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* --- Plan card ---------------------------------------------------------- */

function PlanCard({
  plan,
  popular,
  onInvest,
}: {
  plan: InvestmentPlan;
  popular?: boolean;
  onInvest: () => void;
}) {
  // Position the plan's "price" within the min/max range for the progress bar.
  const priceProgress = plan.maxAmount > 0 ? Math.min(100, (plan.price / plan.maxAmount) * 100) : 0;

  // Per-tick payout string
  const tick =
    plan.incrementType === "PERCENTAGE" ? `${plan.incrementAmount}%` : `$${plan.incrementAmount}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg transition-transform hover:-translate-y-1">
      {/* Header strip */}
      <div className="bg-gradient-to-br from-brand-red to-brand-darkred p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-montserrat text-[20px] font-bold text-white">{plan.name}</h3>
          {popular && (
            <span className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              Popular
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] text-white/85">
          {plan.description || "Managed investment plan with steady returns."}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Investment range with progress */}
        <div>
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="text-muted">Investment range</span>
            <span className="font-semibold text-primary">
              {fmt(plan.minAmount)} – {fmt(plan.maxAmount)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-darkred"
              style={{ width: `${priceProgress}%` }}
            />
          </div>
        </div>

        {/* Per-tick return highlight */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="block text-[12px] text-muted">{humanInterval(plan.incrementInterval)}</span>
            <span className="font-montserrat text-[32px] font-bold text-brand-red">{tick}</span>
          </div>
          <div className="rounded-lg bg-brand-red/10 p-3 text-brand-red">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Features */}
        <ul className="mt-5 space-y-2 text-[13px] text-secondary">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {plan.returnCapital ? "Principal returned at maturity" : "Profit-only payout"}
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            {humanInterval(plan.incrementInterval)}
          </li>
          <li className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-blue-500" />
            ROI range: {plan.minReturn}% – {plan.maxReturn}%
          </li>
          {plan.referralBonus > 0 && (
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-red" />
              Referral bonus: {fmt(plan.referralBonus)}
            </li>
          )}
        </ul>

        {/* Duration + bonus footer */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-elevated p-4 text-[13px]">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-muted">Duration</span>
            <span className="font-semibold text-primary">{plan.duration}</span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] uppercase tracking-wide text-muted">Gift bonus</span>
            <span className="font-semibold text-primary">{fmt(plan.bonus)}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onInvest}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-darkred"
        >
          Invest Now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

/* --- Invest modal ------------------------------------------------------- */

function InvestModal({ plan, onClose }: { plan: InvestmentPlan; onClose: () => void }) {
  const qc = useQueryClient();
  const { wallet } = useWallet();
  const [amount, setAmount] = useState<number>(plan.minAmount);
  const [attempted, setAttempted] = useState(false);

  const durationDays = useMemo(() => parseDurationToDays(plan.duration), [plan.duration]);

  // Projection driven by the same math the backend uses.
  const projection = useMemo(() => {
    const perTick =
      plan.incrementType === "PERCENTAGE"
        ? amount * (plan.incrementAmount === undefined ? 0 : parseFloat(String(plan.incrementAmount)) / 100)
        : parseFloat(String(plan.incrementAmount));
    const tickCount = Math.max(1, Math.round(durationDays * ticksPerDay(plan.incrementInterval)));
    const netProfit = Math.max(0, perTick * tickCount);
    const total = amount + netProfit;
    // Bounds using the informational min/max return (percentage of principal).
    const minProfit = amount * (plan.minReturn / 100);
    const maxProfit = amount * (plan.maxReturn / 100);
    return {
      perTick,
      tickCount,
      netProfit,
      total,
      minTotal: amount + minProfit,
      maxTotal: amount + maxProfit,
    };
  }, [amount, plan, durationDays]);

  const belowMin = amount > 0 && amount < plan.minAmount;
  const aboveMax = amount > plan.maxAmount;
  const overBalance = amount > wallet.balance;
  const errorMessage = attempted
    ? amount <= 0
      ? "Enter an amount."
      : belowMin
        ? `Minimum for this plan is ${fmt(plan.minAmount)}.`
        : aboveMax
          ? `Maximum for this plan is ${fmt(plan.maxAmount)}.`
          : overBalance
            ? "Amount exceeds your wallet balance."
            : null
    : null;

  const invest = useMutation({
    mutationFn: () => api.plans.invest(plan.id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.myPlans });
      qc.invalidateQueries({ queryKey: qk.transactions });
      toast.success(`Invested ${fmt(amount)} in ${plan.name}`);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    setAttempted(true);
    if (belowMin || aboveMax || overBalance || amount <= 0) return;
    invest.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-montserrat text-[20px] font-bold text-primary">
            <TrendingUp className="h-5 w-5 text-brand-red" />
            {plan.name} Investment
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="mt-5 rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand-red" />
            <label className="text-[13px] font-medium text-primary">Investment amount</label>
          </div>
          <div className="flex">
            <span className="rounded-l-lg border border-r-0 bg-elevated px-4 py-3 text-primary">$</span>
            <input
              type="number"
              value={amount === 0 ? "" : amount}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAmount(Number.isNaN(v) ? 0 : v);
                if (attempted) setAttempted(false);
              }}
              className={`w-full rounded-r-lg border bg-page px-4 py-3 text-primary outline-none focus:border-brand-red ${
                errorMessage ? "border-red-500/60" : ""
              }`}
              min={0}
              max={plan.maxAmount}
            />
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-muted">
            <span>Min {fmt(plan.minAmount)}</span>
            <span>Max {fmt(plan.maxAmount)}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-brand-red">
            <Info className="h-3.5 w-3.5" />
            Available: <span className="font-semibold">{fmt(wallet.balance)}</span>
            <button
              type="button"
              onClick={() => setAmount(Math.min(wallet.balance, plan.maxAmount))}
              className="ml-auto rounded-md border px-2 py-0.5 text-[11px] font-semibold hover:border-brand-red"
            >
              Use max
            </button>
          </div>
        </div>

        {/* Projection */}
        <div className="mt-4 rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Percent className="h-4 w-4 text-brand-red" />
            <h3 className="text-[13px] font-medium text-primary">Profit projection</h3>
          </div>

          <div className="flex items-center justify-between border-b border-line pb-3 text-[13px]">
            <span className="text-muted">{humanInterval(plan.incrementInterval)}</span>
            <span className="font-semibold text-primary">{fmt(projection.perTick)}</span>
          </div>

          <div className="flex items-center gap-2 py-3 text-[13px]">
            <Calendar className="h-4 w-4 text-muted" />
            <span className="text-muted">Duration</span>
            <span className="font-semibold text-primary">{plan.duration}</span>
            <span className="ml-auto text-[11px] text-muted">
              {projection.tickCount.toLocaleString()} tick{projection.tickCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-elevated p-3">
              <div className="text-[11px] text-muted">Min total return</div>
              <div className="font-montserrat text-[16px] font-bold text-primary">{fmt(projection.minTotal)}</div>
            </div>
            <div className="rounded-lg bg-elevated p-3">
              <div className="text-[11px] text-muted">Max total return</div>
              <div className="font-montserrat text-[16px] font-bold text-primary">{fmt(projection.maxTotal)}</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-l-4 border-brand-red bg-gradient-to-r from-brand-red/10 to-brand-red/0 p-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-primary">Net profit</span>
              <span className="font-montserrat text-[16px] font-bold text-brand-red">
                {fmt(projection.netProfit)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">Estimated — actual payouts are randomised per tick.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[12px] text-red-500">
            <AlertTriangle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        <button
          onClick={submit}
          disabled={invest.isPending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-darkred py-4 text-[14px] font-bold text-white transition-opacity hover:brightness-110 disabled:opacity-60"
        >
          {invest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          Confirm Investment
        </button>
      </div>
    </div>
  );
}
