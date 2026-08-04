"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowRightLeft,
  Search,
  DollarSign,
  CheckCircle,
  ShieldCheck,
  FileText,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { api, qk } from "@/lib/api";
import { useWallet } from "@/lib/useWallet";

const METHOD_ICON: Record<string, { color: string; svg: React.ReactNode }> = {
  BTC: {
    color: "#f59e0b",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  ETH: {
    color: "#8b5cf6",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#8b5cf6">
        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35z" />
      </svg>
    ),
  },
  USDT: {
    color: "#10b981",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#10b981">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  ADA: {
    color: "#2563eb",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563eb">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-400"
      : status === "REJECTED"
        ? "bg-red-500/10 text-red-400"
        : "bg-amber-500/10 text-amber-400";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

export default function DepositPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [attempted, setAttempted] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const chooseMethod = (id: string) => {
    setSelectedMethodId(id);
    // Scroll the details block into view + focus the amount input.
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      amountRef.current?.focus({ preventScroll: true });
    }, 30);
  };

  const { data: methods = [] } = useQuery({
    queryKey: qk.depositMethods,
    queryFn: () => api.depositMethods.list(),
    staleTime: 60_000,
  });

  const { wallet } = useWallet();
  const { data: deposits } = useQuery({
    queryKey: qk.deposits,
    queryFn: () => api.deposits.list(),
    refetchInterval: 6_000,
  });

  useEffect(() => {
    if (!selectedMethodId && methods[0]) setSelectedMethodId(String(methods[0].id));
  }, [methods, selectedMethodId]);

  const filtered = methods.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const selected = methods.find((m) => String(m.id) === selectedMethodId);

  const pendingSum = useMemo(
    () => (deposits ?? []).filter((d) => d.status === "PENDING").reduce((s, d) => s + d.amount, 0),
    [deposits],
  );
  const lastDeposit = useMemo(
    () => (deposits ?? []).find((d) => d.status === "COMPLETED"),
    [deposits],
  );

  const stats = [
    { label: "Available Balance", value: fmt(wallet.balance), icon: Wallet, color: "text-red-400" },
    { label: "Total Deposited", value: fmt(wallet.totalDeposited), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Pending Deposits", value: fmt(pendingSum), icon: Clock, color: "text-blue-400" },
    { label: "Last Deposit", value: lastDeposit ? fmt(lastDeposit.amount) : "$0.00", icon: ArrowRightLeft, color: "text-amber-400" },
  ];

  const numericAmount = Number(amount || 0);
  const belowMin = !!selected && numericAmount > 0 && numericAmount < selected.minAmount;
  const overMax = !!selected && selected.maxAmount != null && numericAmount > selected.maxAmount;
  const missing = !selected || !amount || numericAmount <= 0;
  const errorMessage = attempted
    ? !selected
      ? "Pick a deposit method above."
      : !amount || numericAmount <= 0
        ? "Enter an amount to deposit."
        : belowMin
          ? `Minimum for ${selected.symbol} is ${fmt(selected.minAmount)}.`
          : overMax
            ? `Maximum for ${selected.symbol} is ${fmt(selected.maxAmount!)}.`
            : null
    : null;

  const handleDeposit = () => {
    setAttempted(true);
    if (missing || belowMin || overMax) return;
    router.push(`/deposit/payment?methodId=${selected!.id}&amount=${amount}`);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
            <DollarSign className="h-4 w-4" />
          </div>
          <h1 className="font-montserrat text-[22px] font-bold text-primary">Deposits</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-[13px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
          >
            Deposit History
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{s.label}</p>
              <p className="mt-1 font-montserrat text-[18px] font-bold text-primary">{s.value}</p>
            </div>
            <s.icon className={`h-8 w-8 ${s.color}`} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Select Deposit Method</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search methods..."
              className="w-full rounded-lg border bg-page py-2 pl-9 pr-4 text-[13px] text-secondary outline-none focus:border-brand-red sm:w-[260px]"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Limits</th>
                <th className="pb-3 font-medium">Fee</th>
                <th className="pb-3 font-medium">Processing Time</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const icon = METHOD_ICON[m.symbol];
                const isSelected = selectedMethodId === String(m.id);
                return (
                  <tr
                    key={m.id}
                    onClick={() => chooseMethod(String(m.id))}
                    className={`cursor-pointer border-b border transition-colors hover:bg-elevated ${
                      isSelected ? "bg-elevated" : ""
                    }`}
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {m.logoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={m.logoUrl} alt={m.symbol} className="h-5 w-5 rounded-full object-contain" />
                        ) : (
                          icon?.svg ?? <div className="h-5 w-5 rounded-full bg-slate-600" />
                        )}
                        <span className="font-medium text-primary">{m.name}</span>
                        <span className="text-[11px] text-subtle">{m.symbol}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted">Min: {fmt(m.minAmount)}</td>
                    <td className="py-4 text-muted">{m.feePercent}%</td>
                    <td className="py-4 text-muted">{m.processingTime}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          chooseMethod(String(m.id));
                        }}
                        className={`rounded-md px-4 py-1.5 text-[12px] font-semibold text-primary transition-colors ${
                          isSelected ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-red hover:bg-brand-darkred"
                        }`}
                      >
                        {isSelected ? "Selected" : "Choose"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-subtle">
                    No deposit methods available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={detailsRef} className="mt-6 scroll-mt-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-brand-red" />
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Deposit Details</h3>
        </div>

        {selected && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-3">
              {selected.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selected.logoUrl} alt={selected.symbol} className="h-9 w-9 rounded-full bg-page p-1 object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-page">
                  {METHOD_ICON[selected.symbol]?.svg ?? <DollarSign className="h-4 w-4 text-muted" />}
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-400">Paying with</p>
                <p className="text-[14px] font-semibold text-primary">
                  {selected.name} <span className="text-[11px] font-normal text-muted">· {selected.symbol}{selected.network ? ` (${selected.network})` : ""}</span>
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-muted">
              <p>Min <span className="font-semibold text-primary">{fmt(selected.minAmount)}</span></p>
              {selected.maxAmount != null && <p>Max <span className="font-semibold text-primary">{fmt(selected.maxAmount)}</span></p>}
              <p>Fee <span className="font-semibold text-primary">{selected.feePercent}%</span></p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-secondary">Amount to deposit</label>
            <span className="text-[12px] text-muted">
              Min: <span className="font-semibold text-primary">{fmt(selected?.minAmount ?? 50)}</span>
            </span>
          </div>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted">$</span>
            <input
              ref={amountRef}
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (attempted) setAttempted(false);
              }}
              placeholder="0.00"
              className={`w-full rounded-lg border bg-page py-3 pl-10 pr-4 text-[15px] text-primary outline-none focus:border-brand-red ${
                errorMessage ? "border-red-500/60" : "border"
              }`}
            />
          </div>
          {errorMessage && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {errorMessage}
            </p>
          )}
        </div>

        <button
          onClick={handleDeposit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-red/80 to-emerald-600/80 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <DollarSign className="h-4 w-4" />
          Continue to Payment
        </button>
      </div>

      {/* Recent deposits */}
      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Recent Deposits</h3>
          <Link href="/transactions" className="flex items-center gap-1 text-[13px] font-medium text-brand-red hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {(deposits ?? []).slice(0, 8).map((d) => (
                <tr key={d.id} className="border-b border">
                  <td className="py-3 text-secondary">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="py-3 text-secondary">{d.methodSymbol}</td>
                  <td className="py-3 font-semibold text-primary">{fmt(d.amount)}</td>
                  <td className="py-3 text-right"><StatusPill status={d.status} /></td>
                </tr>
              ))}
              {(!deposits || deposits.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-subtle">No deposits yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-red" />
            <h3 className="font-montserrat text-[15px] font-bold text-primary">Deposit Process</h3>
          </div>
          <ol className="mt-4 space-y-3 text-[13px]">
            {[
              { title: "Select Method", desc: "Choose your preferred crypto deposit method." },
              { title: "Enter Amount", desc: "Specify the amount you wish to deposit." },
              { title: "Complete Payment", desc: "Send to the shown address and upload proof." },
              { title: "Confirmation", desc: "Balance credits once admin approves the deposit." },
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-primary">{step.title}</p>
                  <p className="text-[12px] text-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-red" />
            <h3 className="font-montserrat text-[15px] font-bold text-primary">Security Tips</h3>
          </div>
          <ul className="mt-4 space-y-3 text-[13px] text-secondary">
            {[
              "Always verify payment details before confirming transactions.",
              "For crypto deposits, double-check the network type to avoid loss of funds.",
              "Never share your payment credentials with anyone.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-red" />
            <h3 className="font-montserrat text-[15px] font-bold text-primary">Deposit Policy</h3>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { label: "Processing Time", value: "Instant", sub: "After admin review" },
              { label: "Minimum Deposit", value: "$50.00", sub: "Platform requirement" },
              { label: "Deposit Methods", value: `${methods.length}`, sub: "Available options" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-primary">{item.label}</p>
                  <p className="text-[11px] text-subtle">{item.sub}</p>
                </div>
                <span className="text-[13px] font-semibold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
