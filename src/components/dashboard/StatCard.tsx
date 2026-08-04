import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{label}</p>
          <h3 className="mt-1 font-montserrat text-[22px] font-bold text-primary">{value}</h3>
          {subtext && <p className="mt-1 text-[12px] text-muted">{subtext}</p>}
          {trend && (
            <p className={`mt-1 text-[12px] ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-secondary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
