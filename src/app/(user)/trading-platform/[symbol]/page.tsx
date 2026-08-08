"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Loader2,
  Star,
} from "lucide-react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { api, qk, type Crypto, type TradeOrder, type TradeOrderSide, type TradeOrderType } from "@/lib/api";
import { STOCKS } from "@/lib/tradingData";
import { useWatchlist } from "@/lib/useWatchlist";

type OrderSide = TradeOrderSide;
type OrderType = TradeOrderType;

type IntervalKey = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
const INTERVALS: IntervalKey[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
const ORDER_TYPES: OrderType[] = ["MARKET", "LIMIT", "STOP_LIMIT"];
const DURATIONS = ["Good Till Cancelled", "1 Day", "1 Week", "1 Month"];

function fmtUsd(n: number, opts: Intl.NumberFormatOptions = {}) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", ...opts });
}
function fmtCompact(n: number) {
  return n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
}

export default function SymbolDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = use(params);
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  const { data: cryptos = [] } = useQuery({
    queryKey: qk.cryptoPrices,
    queryFn: () => api.crypto.prices(),
    refetchInterval: 30_000,
  });

  const crypto = useMemo(
    () => cryptos.find((c) => c.symbol.toUpperCase() === symbol) ?? null,
    [cryptos, symbol],
  );
  const stock = useMemo(() => STOCKS.find((s) => s.symbol === symbol) ?? null, [symbol]);
  const isCrypto = Boolean(crypto);

  const displayName = crypto?.name ?? stock?.name ?? symbol;
  const pairLabel = isCrypto ? `${symbol}/USDT` : symbol;
  const price = crypto?.price ? Number(crypto.price.current_price) : stock?.price ?? 0;
  const change24 = crypto?.price ? Number(crypto.price.percent_change_24h) : stock?.changePct ?? 0;
  const volume24 = crypto?.price ? Number(crypto.price.volume_24h) : 0;
  const logo = crypto?.logo_url;

  const { data: wallet } = useQuery({
    queryKey: qk.wallet,
    queryFn: () => api.wallet.summary(),
  });
  const availableBalance = wallet?.balance ?? 0;

  const cryptoWl = useWatchlist("crypto");
  const stockWl = useWatchlist("stock");
  const watched = isCrypto ? cryptoWl.has(symbol) : stockWl.has(symbol);
  const toggleWatch = () => {
    if (isCrypto) {
      if (watched) cryptoWl.remove(symbol);
      else cryptoWl.add(symbol);
    } else {
      if (watched) stockWl.remove(symbol);
      else stockWl.add(symbol);
    }
  };

  const otherCryptos = useMemo(
    () => cryptos.filter((c) => c.is_listed && c.symbol.toUpperCase() !== symbol),
    [cryptos, symbol],
  );
  const otherStocks = useMemo(() => STOCKS.filter((s) => s.symbol !== symbol), [symbol]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/trading-platform"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-brand-red"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Markets
        </Link>
        <SymbolSwitcher
          open={switcherOpen}
          onOpen={setSwitcherOpen}
          current={pairLabel}
          logo={logo}
          cryptos={otherCryptos}
          stocks={otherStocks}
        />
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={toggleWatch}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              watched
                ? "border-amber-400 text-amber-500"
                : "bg-card text-secondary hover:border-brand-red hover:text-brand-red"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${watched ? "fill-amber-400" : ""}`} />
            {watched ? "Watching" : "Watch"}
          </button>
          <div className="text-right">
            <p className="font-montserrat text-[22px] font-bold text-primary">{fmtUsd(price)}</p>
            <p
              className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${
                change24 >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {change24 >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {change24.toFixed(2)}% (24h)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <ChartCard
            symbol={symbol}
            isCrypto={isCrypto}
            fallbackPrice={price}
            logo={logo}
            displayName={displayName}
          />
          <StatsGrid price={price} change24={change24} volume24={volume24} isCrypto={isCrypto} />
        </div>
        <OrderPanel
          symbol={symbol}
          pairLabel={pairLabel}
          isCrypto={isCrypto}
          price={price}
          availableBalance={availableBalance}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <OrderBookCard price={price} />
        <RecentTradesCard price={price} />
        <OpenOrdersCard symbol={symbol} />
      </div>
    </div>
  );
}

/* ---------- Symbol switcher ---------- */

function SymbolSwitcher({
  open,
  onOpen,
  current,
  logo,
  cryptos,
  stocks,
}: {
  open: boolean;
  onOpen: (v: boolean) => void;
  current: string;
  logo?: string;
  cryptos: Crypto[];
  stocks: typeof STOCKS;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => onOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-[13px] font-semibold text-primary hover:border-brand-red"
      >
        {logo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logo} alt={current} className="h-5 w-5 rounded-full object-contain" />
        )}
        {current}
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 max-h-[420px] overflow-y-auto rounded-xl border bg-card p-2 shadow-lg">
          <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Crypto</p>
          {cryptos.length === 0 && <p className="px-2 py-2 text-[12px] text-muted">No crypto listed.</p>}
          {cryptos.map((c) => (
            <Link
              key={c.id}
              href={`/trading-platform/${c.symbol}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-primary hover:bg-elevated"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.logo_url} alt={c.symbol} className="h-5 w-5 rounded-full object-contain" />
              <span className="font-semibold">{c.symbol}/USDT</span>
              <span className="ml-auto text-[11px] text-muted">
                {c.price ? fmtUsd(Number(c.price.current_price)) : "—"}
              </span>
            </Link>
          ))}
          <p className="mt-2 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Stocks</p>
          {stocks.map((s) => (
            <Link
              key={s.symbol}
              href={`/trading-platform/${s.symbol}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-primary hover:bg-elevated"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-red/10 text-[9px] font-bold text-brand-red">
                {s.symbol.slice(0, 2)}
              </div>
              <span className="font-semibold">{s.symbol}</span>
              <span className="ml-auto text-[11px] text-muted">{fmtUsd(s.price)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Chart ---------- */

function ChartCard({
  symbol,
  isCrypto,
  fallbackPrice,
  logo,
  displayName,
}: {
  symbol: string;
  isCrypto: boolean;
  fallbackPrice: number;
  logo?: string;
  displayName: string;
}) {
  const [interval, setInterval] = useState<IntervalKey>("1h");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const {
    data: klines,
    isLoading,
    isError,
  } = useQuery({
    queryKey: qk.cryptoKlines(symbol, interval),
    queryFn: () => api.crypto.klines(symbol, interval, 200),
    enabled: isCrypto,
    refetchInterval: 30_000,
  });

  // Initialize chart once.
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: getComputedStyle(document.documentElement).getPropertyValue("--text-secondary") || "#6b7280",
      },
      grid: {
        vertLines: { color: "rgba(120,120,120,0.08)" },
        horzLines: { color: "rgba(120,120,120,0.08)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Feed candles when data arrives, or fabricate a flat series when there's no crypto backend.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (isCrypto && klines && klines.length > 0) {
      const rows = klines.map((k) => ({
        time: Math.floor(k[0] / 1000) as Time,
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
      }));
      series.setData(rows);
      chartRef.current?.timeScale().fitContent();
    } else if (!isCrypto && fallbackPrice > 0) {
      const now = Math.floor(Date.now() / 1000);
      const step = 3600;
      const rows = Array.from({ length: 80 }, (_, i) => {
        const t = now - (80 - i) * step;
        const jitter = (Math.sin(i / 3.1) + Math.cos(i / 5.7) * 0.5) * (fallbackPrice * 0.01);
        const open = fallbackPrice + jitter;
        const close = fallbackPrice + jitter * 0.7 + (i % 4 === 0 ? fallbackPrice * 0.003 : -fallbackPrice * 0.002);
        const high = Math.max(open, close) + Math.abs(jitter) * 0.3;
        const low = Math.min(open, close) - Math.abs(jitter) * 0.3;
        return { time: t as Time, open, high, low, close };
      });
      series.setData(rows);
      chartRef.current?.timeScale().fitContent();
    }
  }, [klines, isCrypto, fallbackPrice]);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo} alt={symbol} className="h-8 w-8 rounded-full object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
              {symbol.slice(0, 3)}
            </div>
          )}
          <div>
            <h2 className="font-montserrat text-[18px] font-bold text-primary">Price Chart</h2>
            <p className="text-[11px] text-muted">{displayName}{!isCrypto && " · mock data"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {INTERVALS.map((k) => (
            <button
              key={k}
              onClick={() => setInterval(k)}
              disabled={!isCrypto}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40 ${
                interval === k
                  ? "bg-brand-red text-white"
                  : "border bg-elevated text-secondary hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-4 h-[420px] w-full">
        <div ref={containerRef} className="absolute inset-0" />
        {isCrypto && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/70">
            <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          </div>
        )}
        {isCrypto && isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/70 text-[13px] text-muted">
            Failed to load candles.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Stats ---------- */

function StatsGrid({
  price,
  change24,
  volume24,
  isCrypto,
}: {
  price: number;
  change24: number;
  volume24: number;
  isCrypto: boolean;
}) {
  const high = price * (1 + Math.abs(change24) / 100);
  const low = price * (1 - Math.abs(change24) / 100);
  const changeAbs = (price * change24) / 100;
  const stats = [
    { label: "24H High", value: fmtUsd(high) },
    { label: "24H Low", value: fmtUsd(low) },
    {
      label: "24H Volume",
      value: isCrypto && volume24 > 0 ? `$${fmtCompact(volume24)}` : "—",
    },
    {
      label: "24H Change",
      value: `${change24 >= 0 ? "+" : ""}${fmtUsd(changeAbs, { maximumFractionDigits: 2 })}`,
      accent: change24 >= 0 ? "text-emerald-500" : "text-red-500",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider text-muted">{s.label}</p>
          <p className={`mt-1 font-montserrat text-[16px] font-bold ${s.accent ?? "text-primary"}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Order panel ---------- */

function OrderPanel({
  symbol,
  pairLabel,
  isCrypto,
  price,
  availableBalance,
}: {
  symbol: string;
  pairLabel: string;
  isCrypto: boolean;
  price: number;
  availableBalance: number;
}) {
  const qc = useQueryClient();
  const [side, setSide] = useState<OrderSide>("BUY");
  const [type, setType] = useState<OrderType>("MARKET");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [amount, setAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [stopPrice, setStopPrice] = useState<string>("");

  const placeMut = useMutation({
    mutationFn: () =>
      api.orders.place({
        symbol: pairLabel,
        side,
        type,
        amount: amountNum,
        price: type === "MARKET" ? undefined : Number(limitPrice),
        stopPrice: type === "STOP_LIMIT" ? Number(stopPrice) : undefined,
        duration,
      }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["orders", "mine"] });
      toast.success(
        order.status === "FILLED"
          ? `${side} ${amountNum} ${symbol} filled at ${fmtUsd(Number(order.price ?? price))}`
          : `${side} ${type.replace("_", " ")} order placed`,
      );
      setAmount("");
      setLimitPrice("");
      setStopPrice("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const amountNum = Number(amount) || 0;
  const priceNum =
    type === "MARKET" ? price : Number(limitPrice) || price;
  const total = amountNum * priceNum;

  const quickPercent = (pct: number) => {
    if (side === "BUY") {
      const usd = availableBalance * (pct / 100);
      if (priceNum > 0) setAmount(String((usd / priceNum).toFixed(6)));
    } else {
      // For SELL we don't know the user's holdings, so % is applied to a nominal 1-unit.
      setAmount(String((1 * (pct / 100)).toFixed(6)));
    }
  };

  const submit = () => {
    if (amountNum <= 0) return toast.error("Enter an amount");
    if (type !== "MARKET" && !limitPrice) return toast.error("Enter a limit price");
    if (type === "STOP_LIMIT" && !stopPrice) return toast.error("Enter a stop price");
    if (side === "BUY" && total > availableBalance)
      return toast.error("Insufficient balance");
    placeMut.mutate();
  };

  const base = isCrypto ? symbol : symbol;
  const buyCta = `Buy ${base}`;
  const sellCta = `Sell ${base}`;

  return (
    <div className="h-fit rounded-2xl border bg-card p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("BUY")}
          className={`rounded-lg py-2 text-[13px] font-semibold transition-colors ${
            side === "BUY" ? "bg-emerald-500 text-white" : "border bg-elevated text-secondary hover:text-emerald-500"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("SELL")}
          className={`rounded-lg py-2 text-[13px] font-semibold transition-colors ${
            side === "SELL" ? "bg-red-500 text-white" : "border bg-elevated text-secondary hover:text-red-500"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Order Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as OrderType)}
            className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
          >
            {ORDER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "MARKET" ? "Market" : t === "LIMIT" ? "Limit" : "Stop Limit"}
              </option>
            ))}
          </select>
        </Field>

        {type === "STOP_LIMIT" && (
          <Field label="Stop Price (USD)">
            <input
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
            />
          </Field>
        )}

        {type !== "MARKET" && (
          <Field label="Limit Price (USD)">
            <input
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              inputMode="decimal"
              placeholder={price ? price.toFixed(2) : "0.00"}
              className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
            />
          </Field>
        )}

        <Field label={`Amount (${symbol})`}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => quickPercent(p)}
              className="rounded-md border bg-elevated py-1.5 text-[11px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
            >
              {p}%
            </button>
          ))}
        </div>

        <Field label="Duration">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border bg-elevated px-3 py-2 text-[13px] text-primary focus:border-brand-red focus:outline-none"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <div className="space-y-1 rounded-lg bg-elevated px-3 py-2 text-[12px]">
          <div className="flex justify-between text-muted">
            <span>Total</span>
            <span className="font-semibold text-primary">{fmtUsd(total)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Available Balance</span>
            <span>{fmtUsd(availableBalance)}</span>
          </div>
        </div>

        <button
          onClick={submit}
          className={`w-full rounded-lg py-2.5 text-[14px] font-bold text-white shadow-sm transition-transform hover:scale-[1.01] ${
            side === "BUY"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          }`}
        >
          {side === "BUY" ? buyCta : sellCta}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</label>
      {children}
    </div>
  );
}

/* ---------- Bottom row ---------- */

function OrderBookCard({ price }: { price: number }) {
  const asks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const p = price * (1 + (i + 1) * 0.0005);
        const size = Math.random() * 2 + 0.05;
        return { price: p, size, total: p * size };
      }),
    [price],
  );
  const bids = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const p = price * (1 - (i + 1) * 0.0005);
        const size = Math.random() * 2 + 0.05;
        return { price: p, size, total: p * size };
      }),
    [price],
  );

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-montserrat text-[15px] font-bold text-primary">Order Book</h3>
      <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] font-semibold uppercase text-muted">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="mt-1 space-y-0.5">
        {asks.slice().reverse().map((r, i) => (
          <div key={`a${i}`} className="grid grid-cols-3 gap-1 text-[12px]">
            <span className="text-red-500">{r.price.toFixed(2)}</span>
            <span className="text-right text-secondary">{r.size.toFixed(4)}</span>
            <span className="text-right text-muted">{r.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="my-2 rounded-md bg-elevated px-2 py-1 text-center text-[13px] font-bold text-primary">
        {fmtUsd(price)}
      </div>
      <div className="space-y-0.5">
        {bids.map((r, i) => (
          <div key={`b${i}`} className="grid grid-cols-3 gap-1 text-[12px]">
            <span className="text-emerald-500">{r.price.toFixed(2)}</span>
            <span className="text-right text-secondary">{r.size.toFixed(4)}</span>
            <span className="text-right text-muted">{r.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTradesCard({ price }: { price: number }) {
  const trades = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const side: OrderSide = i % 2 === 0 ? "BUY" : "SELL";
        const p = price * (1 + (Math.random() - 0.5) * 0.002);
        const size = Math.random() * 1.2 + 0.02;
        const t = new Date(Date.now() - i * 15_000);
        return { side, price: p, size, time: t };
      }),
    [price],
  );
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-montserrat text-[15px] font-bold text-primary">Recent Trades</h3>
      <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] font-semibold uppercase text-muted">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="mt-1 space-y-1">
        {trades.map((t, i) => (
          <div key={i} className="grid grid-cols-3 gap-1 text-[12px]">
            <span className={t.side === "BUY" ? "text-emerald-500" : "text-red-500"}>
              {t.price.toFixed(2)}
            </span>
            <span className="text-right text-secondary">{t.size.toFixed(4)}</span>
            <span className="text-right text-muted">{t.time.toLocaleTimeString().slice(0, 8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenOrdersCard({ symbol }: { symbol: string }) {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: qk.myOrders(),
    queryFn: () => api.orders.list(),
    refetchInterval: 30_000,
  });
  const cancelMut = useMutation({
    mutationFn: (id: number) => api.orders.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", "mine"] });
      toast.success("Order cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const open = orders.filter(
    (o: TradeOrder) => o.status === "OPEN" && o.symbol.toUpperCase().startsWith(symbol.toUpperCase()),
  );

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-montserrat text-[15px] font-bold text-primary">Open Orders</h3>
      {open.length === 0 ? (
        <div className="mt-6 text-center text-[12px] text-muted">
          <p>No open orders.</p>
          <p className="mt-1 text-subtle">Limit/Stop-limit orders you place will appear here.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {open.map((o) => (
            <div key={o.id} className="rounded-lg border bg-elevated px-3 py-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${o.side === "BUY" ? "text-emerald-500" : "text-red-500"}`}>
                  {o.side} · {o.type.replace("_", " ")}
                </span>
                <button
                  onClick={() => cancelMut.mutate(o.id)}
                  disabled={cancelMut.isPending}
                  className="text-[11px] text-muted hover:text-brand-red disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-1 flex justify-between text-muted">
                <span>Amount</span>
                <span className="text-primary">{o.amount}</span>
              </div>
              {o.price != null && (
                <div className="flex justify-between text-muted">
                  <span>Price</span>
                  <span className="text-primary">{fmtUsd(Number(o.price))}</span>
                </div>
              )}
              {o.stopPrice != null && (
                <div className="flex justify-between text-muted">
                  <span>Stop</span>
                  <span className="text-primary">{fmtUsd(Number(o.stopPrice))}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
