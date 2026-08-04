"use client";

import type { LucideIcon } from "lucide-react";

export function fmt(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function StatusPill({ status }: { status: string }) {
  const cls =
    status === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-400"
      : status === "PENDING"
        ? "bg-amber-500/10 text-amber-400"
        : status === "REJECTED" || status === "FAILED" || status === "CANCELLED"
          ? "bg-red-500/10 text-red-400"
          : status === "ACTIVE"
            ? "bg-blue-500/10 text-blue-400"
            : "bg-slate-500/10 text-secondary";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

export function PageHeader({
  title,
  icon: Icon,
  subtitle,
  right,
}: {
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-montserrat text-[22px] font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card p-5 ${className}`}>{children}</div>;
}

export function AdminStat({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 font-montserrat text-[20px] font-bold text-primary">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-subtle">{sub}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );
}
