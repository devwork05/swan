"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { api, qk, type WithdrawRequest } from "@/lib/api";
import { useWallet } from "@/lib/useWallet";

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

export default function WithdrawPage() {
  const qc = useQueryClient();
  const { wallet } = useWallet();

  const { data: withdrawals } = useQuery({
    queryKey: qk.withdrawals,
    queryFn: () => api.withdrawals.list(),
    refetchInterval: 6_000,
  });

  const { data: methods = [] } = useQuery({
    queryKey: qk.depositMethods,
    queryFn: () => api.depositMethods.list(),
    staleTime: 60_000,
  });

  const [methodId, setMethodId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!methodId && methods[0]) setMethodId(String(methods[0].id));
  }, [methods, methodId]);

  const selected = methods.find((m) => String(m.id) === methodId);
  const numericAmount = Number(amount);
  const overBalance = numericAmount > wallet.balance;
  const belowMin = selected && numericAmount > 0 && numericAmount < selected.minAmount;

  const pendingSum = useMemo(
    () => (withdrawals ?? []).filter((w) => w.status === "PENDING").reduce((s, w) => s + w.amount, 0),
    [withdrawals],
  );

  const createWithdraw = useMutation({
    mutationFn: (data: WithdrawRequest) => api.withdrawals.create(data),
    onSuccess: () => {
      setAmount("");
      setWalletAddress("");
      setSuccess("Withdrawal request submitted. Balance debited; awaiting block confirmation.");
      qc.invalidateQueries({ queryKey: qk.withdrawals });
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
    onError: (e: Error) => setError(e.message),
  });

  const submit = () => {
    setError(null);
    setSuccess(null);
    if (!selected) return setError("Choose a method");
    if (!walletAddress.trim()) return setError("Enter your wallet address");
    if (!numericAmount || numericAmount <= 0) return setError("Enter a valid amount");
    if (belowMin) return setError(`Minimum for ${selected.symbol} is ${fmt(selected.minAmount)}`);
    if (overBalance) return setError("Amount exceeds available balance");
    createWithdraw.mutate({
      methodId: String(selected.id),
      amount: numericAmount,
      walletAddress: walletAddress.trim(),
    });
  };
  const submitting = createWithdraw.isPending;

  const stats = [
    { label: "Available Balance", value: fmt(wallet.balance), icon: Wallet, color: "text-red-400" },
    { label: "Total Withdrawn", value: fmt(wallet.totalWithdrawn), icon: ArrowUpRight, color: "text-emerald-400" },
    { label: "Pending Withdrawals", value: fmt(pendingSum), icon: Clock, color: "text-amber-400" },
    { label: "Total Profit", value: fmt(wallet.totalProfit), icon: CheckCircle, color: "text-blue-400" },
  ];

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <h1 className="font-montserrat text-[22px] font-bold text-white">Withdraw</h1>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-lg border border bg-card px-4 py-2 text-[13px] font-semibold text-slate-300 transition-colors hover:border-brand-red hover:text-brand-red"
        >
          Withdrawal History
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-xl border border bg-card p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className="mt-1 font-montserrat text-[18px] font-bold text-white">{s.value}</p>
            </div>
            <s.icon className={`h-8 w-8 ${s.color}`} />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 rounded-xl border border bg-card p-5">
          <h3 className="font-montserrat text-[16px] font-bold text-white">New Withdrawal</h3>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-slate-300">Method</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethodId(String(m.id))}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-[13px] transition-colors ${methodId === String(m.id)
                        ? "border-brand-red bg-brand-red/10 text-white"
                        : "border bg-page text-slate-300 hover:border-brand-red/50"
                      }`}
                  >
                    <div>
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-[11px] text-slate-500">{m.symbol}</p>
                    </div>
                    <p className="text-[11px] text-slate-400">Min {fmt(m.minAmount)}</p>
                  </button>
                ))}
                {methods.length === 0 && (
                  <p className="col-span-full text-[12px] text-slate-500">No methods configured.</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-300">Wallet address</label>
              <input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Recipient wallet address"
                className="mt-2 w-full rounded-lg border border bg-page px-4 py-3 text-[14px] text-white outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-slate-300">Amount</label>
                <button
                  type="button"
                  onClick={() => setAmount(String(wallet.balance))}
                  className="text-[12px] font-semibold text-brand-red hover:underline"
                >
                  Max ({fmt(wallet.balance)})
                </button>
              </div>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-slate-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full rounded-lg border bg-page py-3 pl-10 pr-4 text-[15px] text-white outline-none focus:border-brand-red ${overBalance || belowMin ? "border-red-500/60" : "border"
                    }`}
                />
              </div>
              {overBalance && (
                <p className="mt-1 text-[11px] text-red-400">Amount exceeds available balance</p>
              )}
              {belowMin && selected && (
                <p className="mt-1 text-[11px] text-red-400">
                  Minimum for {selected.symbol} is {fmt(selected.minAmount)}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[13px] text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-[13px] text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            <button
              onClick={submit}
              disabled={submitting || !selected || !amount || overBalance || !!belowMin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
              Request Withdrawal
            </button>
            <p className="text-center text-[11px] text-slate-500">
              Balance is reserved immediately; funds are released to the destination address once approved.
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border bg-card p-5">
          <h3 className="font-montserrat text-[16px] font-bold text-white">How it works</h3>
          <ol className="mt-4 space-y-3 text-[13px]">
            {[
              "Pick a method and enter your destination wallet address.",
              "Enter the amount — your balance is debited when the request is queued.",
              "Admin verifies and approves the transaction within processing time.",
              "If rejected, your balance is refunded automatically.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
                  {i + 1}
                </span>
                <p className="text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[16px] font-bold text-white">Recent Withdrawals</h3>
          <Link href="/transactions" className="flex items-center gap-1 text-[13px] font-medium text-brand-red hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-slate-400">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Address</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {(withdrawals ?? []).slice(0, 10).map((w) => (
                <tr key={w.id} className="border-b border">
                  <td className="py-3 text-slate-300">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="py-3 text-slate-300">{w.methodSymbol}</td>
                  <td className="py-3 text-slate-500">
                    <span className="font-mono text-[11px]">
                      {w.walletAddress.slice(0, 8)}…{w.walletAddress.slice(-6)}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-white">{fmt(w.amount)}</td>
                  <td className="py-3 text-right"><StatusPill status={w.status} /></td>
                </tr>
              ))}
              {(!withdrawals || withdrawals.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">No withdrawals yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
