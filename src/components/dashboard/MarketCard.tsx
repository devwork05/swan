"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function MarketCard({
  name,
  symbol,
  price,
  change,
  changeValue,
  color,
  data,
  icon,
}: {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changeValue: number;
  color: string;
  data: { value: number }[];
  icon: React.ReactNode;
}) {
  const positive = changeValue >= 0;

  return (
    <div className="min-w-[220px] flex-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated">{icon}</div>
          <div>
            <h4 className="text-[13px] font-semibold text-primary">{name}</h4>
            <p className="text-[11px] text-muted">{symbol}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-muted">Price</p>
          <p className="font-montserrat text-[15px] font-bold text-primary">{price}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted">24h Change</p>
          <p className={`font-montserrat text-[14px] font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
            {changeValue >= 0 ? "+" : ""}
            {changeValue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </p>
        </div>
      </div>

      <div className="mt-3 h-[50px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
