"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Wallet,
  Clock,
  History as HistoryIcon,
  Coins,
  BarChart3,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api, qk, type UserPlan } from "@/lib/api";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function progressPct(p: UserPlan): number {
  if (p.status !== "ACTIVE") return 100;
  const total = new Date(p.endsAt).getTime() - new Date(p.startedAt).getTime();
  const elapsed = Date.now() - new Date(p.startedAt).getTime();
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function humanRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ready to complete";
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function labelFor(pct: number, status: UserPlan["status"]): string {
  if (status !== "ACTIVE" || pct >= 100) return "Completed";
  if (pct >= 75) return "Finalizing";
  return "Active";
}

function statusPillColor(pct: number, status: UserPlan["status"]): string {
  if (status !== "ACTIVE" || pct >= 100) return "bg-emerald-500/10 text-emerald-500";
  if (pct >= 75) return "bg-amber-500/10 text-amber-500";
  return "bg-brand-red/10 text-brand-red";
}

function progressBarColor(pct: number, status: UserPlan["status"]): string {
  if (status !== "ACTIVE" || pct >= 100) return "bg-emerald-500";
  if (pct >= 75) return "bg-amber-500";
  return "bg-brand-red";
}

/** Per-tick payout for this plan/investment — used in the details grid. */
function perTickPayout(p: UserPlan): number {
  if (p.incrementType === "PERCENTAGE") {
    // Frontend has no incrementAmount on UserPlanDto; approximate as accruedProfit / ticksElapsed.
    // Fall back to expectedReturn / totalTicks when nothing has accrued yet.
    const total = new Date(p.endsAt).getTime() - new Date(p.startedAt).getTime();
    const now = Math.min(Date.now(), new Date(p.endsAt).getTime());
    const elapsed = Math.max(1, now - new Date(p.startedAt).getTime());
    const ratio = elapsed / total;
    return ratio > 0.02 ? p.accruedProfit / (ratio * 100) : p.expectedReturn / 100;
  }
  return p.expectedReturn / 30; // Fallback for FIXED — coarse estimate.
}

export default function MyPlansPage() {
  const { data, isLoading: loading } = useQuery({
    queryKey: qk.myPlans,
    queryFn: () => api.plans.mine(),
    refetchInterval: 5_000,
  });
  const plans = data ?? [];

  // Filters
  const [status, setStatus] = useState<"" | "ACTIVE" | "COMPLETED">("");
  const [dateFrom, setDateFrom] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    let out = plans;
    if (status) out = out.filter((p) => p.status === status);
    if (dateFrom) {
      const t = new Date(dateFrom).getTime();
      out = out.filter((p) => new Date(p.createdAt).getTime() >= t);
    }
    return out;
  }, [plans, status, dateFrom]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Big centered header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-red to-brand-darkred">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="font-montserrat text-[32px] font-bold text-primary sm:text-[36px]">
              My Investments
            </h1>
            <p className="mt-1 text-[14px] text-muted sm:text-[16px]">
              Track and manage your investment portfolio
            </p>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1.5 block text-[12px] font-medium text-primary">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as typeof status);
                  setPage(1);
                }}
                className="w-full rounded-xl border bg-card px-4 py-3 text-[13px] text-primary outline-none focus:border-brand-red"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[12px] font-medium text-primary">Started on or after</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border bg-card px-4 py-3 text-[13px] text-primary outline-none focus:border-brand-red"
              />
            </div>
          </div>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-red to-brand-darkred px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-brand-red/20 transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            New Investment
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading && plans.length === 0 && (
        <div className="mt-10 flex items-center justify-center text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="mt-8 rounded-2xl border bg-card py-16 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-red/10">
            <TrendingUp className="h-10 w-10 text-brand-red" />
          </div>
          <h2 className="mt-6 font-montserrat text-[22px] font-semibold text-primary">
            {plans.length === 0 ? "No investments found" : "No investments match your filters"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
            {plans.length === 0
              ? "Start your investment journey by exploring our available plans and opportunities."
              : "Try loosening the status or date filters."}
          </p>
          <Link
            href="/plans"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            <Plus className="h-4 w-4" />
            Explore investment plans
          </Link>
        </div>
      )}

      {/* Cards grid */}
      {paged.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {paged.map((p) => (
            <InvestmentCard key={p.id} plan={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-xl border bg-card px-4 py-2 text-[13px] text-primary transition-colors hover:bg-elevated disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-[13px] text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border bg-card px-4 py-2 text-[13px] text-primary transition-colors hover:bg-elevated disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-xl border bg-card px-4 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/* ---------- Investment card ---------- */

function InvestmentCard({ plan }: { plan: UserPlan }) {
  const pct = progressPct(plan);
  const status = labelFor(pct, plan.status);
  const perTick = perTickPayout(plan);

  return (
    <div className="group overflow-hidden rounded-2xl border bg-card shadow-lg transition-transform hover:-translate-y-1">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-card to-elevated p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-montserrat text-[20px] font-semibold text-primary transition-colors group-hover:text-brand-red">
            {plan.planName}
          </h3>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold ${statusPillColor(pct, plan.status)}`}>
            {status === "Completed" ? <Sparkles className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10">
            <Wallet className="h-6 w-6 text-brand-red" />
          </div>
          <div>
            <div className="font-montserrat text-[26px] font-bold text-brand-red">
              {fmt(plan.amount)}
            </div>
            <div className="text-[13px] text-muted">Invested amount</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b p-6">
        <div className="mb-3 flex items-center justify-between text-[13px]">
          <span className="text-muted">
            <b className="text-primary">{pct}%</b> completed
          </span>
          <span className="text-muted">{plan.duration}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className={`h-full rounded-full ${progressBarColor(pct, plan.status)} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-subtle">
          {plan.status === "ACTIVE" ? humanRemaining(plan.endsAt) : "Cycle complete"}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <DetailCell
          icon={<Clock className="h-4 w-4 text-brand-red" />}
          label="Start date"
          value={formatDateTime(plan.startedAt)}
        />
        <DetailCell
          icon={<HistoryIcon className="h-4 w-4 text-brand-red" />}
          label="End date"
          value={formatDateTime(plan.endsAt)}
        />
        <DetailCell
          icon={<TrendingUp className="h-4 w-4 text-brand-red" />}
          label={`Per ${plan.incrementInterval.toLowerCase()}`}
          value={fmt(perTick)}
        />
        <DetailCell
          icon={<Coins className="h-4 w-4 text-brand-red" />}
          label="Profit earned"
          value={fmt(plan.accruedProfit)}
          highlight
        />
      </div>

      {/* Footer: expected + return-capital + link */}
      <div className="flex items-center justify-between border-t bg-elevated/50 p-4">
        <div className="text-[12px] text-muted">
          Expected return{" "}
          <span className="font-semibold text-primary">{fmt(plan.expectedReturn)}</span>
          {plan.returnCapital && <span className="ml-2 text-emerald-500">· principal returned</span>}
        </div>
        <Link
          href="/profit-history"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-red transition-transform hover:translate-x-0.5"
        >
          Profit history
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function DetailCell({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-page/50 p-4 transition-transform hover:-translate-y-0.5">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-medium ${highlight ? "text-brand-red" : "text-primary"}`}>{value}</div>
    </div>
  );
}
