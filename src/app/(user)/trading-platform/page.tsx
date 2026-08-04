"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bitcoin,
  TrendingUp,
  Star,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api, qk, type Crypto } from "@/lib/api";
import { STOCKS, type Stock } from "@/lib/tradingData";
import { useWatchlist } from "@/lib/useWatchlist";

type FilterKey = "ALL" | "CRYPTO" | "STOCKS" | "WATCHLIST";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "CRYPTO", label: "Crypto" },
  { key: "STOCKS", label: "Stocks" },
  { key: "WATCHLIST", label: "My Watchlist" },
];

function fmtUsd(n: number, opts: Intl.NumberFormatOptions = {}) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", ...opts });
}
function fmtCompact(n: number) {
  return n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
}
function pctColor(pct: number) {
  return pct >= 0 ? "text-emerald-500" : "text-red-500";
}

export default function TradingPlatformPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const { data: cryptos = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: qk.cryptoPrices,
    queryFn: () => api.crypto.prices(),
    refetchInterval: 30_000,
  });

  const cryptoWl = useWatchlist("crypto");
  const stockWl = useWatchlist("stock");

  const listedCryptos = useMemo(() => cryptos.filter((c) => c.is_listed && c.price), [cryptos]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-montserrat text-[28px] font-bold text-primary">Trading Platform</h1>
          <p className="text-[13px] text-muted">Trade cryptocurrencies and stocks in real-time.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border bg-card px-3 py-1.5 text-[12px] font-medium text-secondary hover:border-brand-red hover:text-brand-red disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
              filter === f.key
                ? "bg-brand-red text-white"
                : "border bg-card text-secondary hover:border-brand-red hover:text-brand-red"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FeatureCard
          title="Crypto Trading"
          subtitle="Trade major cryptocurrencies"
          icon={Bitcoin}
          chips={listedCryptos.slice(0, 3).map((c) => ({
            symbol: `${c.symbol}/USDT`,
            logo: c.logo_url,
            href: `/trading-platform/${c.symbol}`,
          }))}
          onCta={() => setFilter("CRYPTO")}
        />
        <FeatureCard
          title="Stock Trading"
          subtitle="Trade major stocks"
          icon={TrendingUp}
          chips={STOCKS.slice(0, 3).map((s) => ({
            symbol: s.symbol,
            href: `/trading-platform/${s.symbol}`,
          }))}
          onCta={() => setFilter("STOCKS")}
        />
      </div>

      {(filter === "ALL" || filter === "CRYPTO" || filter === "STOCKS") && (
        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat text-[18px] font-bold text-primary">Market Overview</h2>
            <span className="text-[11px] text-muted">Last updated {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b text-[11px] uppercase tracking-wider text-muted">
                  <th className="pb-3 font-semibold">Asset</th>
                  <th className="pb-3 text-right font-semibold">Price</th>
                  <th className="pb-3 text-right font-semibold">24h Change</th>
                  <th className="pb-3 text-right font-semibold">Market Cap</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-red" />
                    </td>
                  </tr>
                )}
                {(filter === "ALL" || filter === "CRYPTO") &&
                  listedCryptos.map((c) => (
                    <CryptoRow key={c.id} c={c} watched={cryptoWl.has(c.symbol)} onToggle={() => (cryptoWl.has(c.symbol) ? cryptoWl.remove(c.symbol) : cryptoWl.add(c.symbol))} />
                  ))}
                {(filter === "ALL" || filter === "STOCKS") &&
                  STOCKS.map((s) => (
                    <StockRow key={s.symbol} s={s} watched={stockWl.has(s.symbol)} onToggle={() => (stockWl.has(s.symbol) ? stockWl.remove(s.symbol) : stockWl.add(s.symbol))} />
                  ))}
                {!isLoading && filter === "CRYPTO" && listedCryptos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted">
                      No crypto prices available. Configure <b>CRYPTO_PRICE_API</b> on the backend.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filter === "WATCHLIST" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <WatchlistCard
            title="Crypto Watchlist"
            icon={Bitcoin}
            symbols={cryptoWl.symbols}
            rows={cryptoWl.symbols
              .map((s) => listedCryptos.find((c) => c.symbol === s))
              .filter((v): v is Crypto => Boolean(v))
              .map((c) => ({
                symbol: `${c.symbol}/USDT`,
                sub: c.name,
                logo: c.logo_url,
                price: c.price ? fmtUsd(Number(c.price.current_price)) : "—",
                href: `/trading-platform/${c.symbol}`,
              }))}
          />
          <WatchlistCard
            title="Stock Watchlist"
            icon={TrendingUp}
            symbols={stockWl.symbols}
            rows={stockWl.symbols
              .map((s) => STOCKS.find((x) => x.symbol === s))
              .filter((v): v is Stock => Boolean(v))
              .map((s) => ({
                symbol: s.symbol,
                sub: s.exchange,
                price: fmtUsd(s.price),
                href: `/trading-platform/${s.symbol}`,
              }))}
          />
        </div>
      )}

      {(filter === "ALL" || filter === "CRYPTO" || filter === "STOCKS") && (
        <div className="mt-8">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">Your Watchlists</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <WatchlistCard
              title="Crypto Watchlist"
              icon={Bitcoin}
              symbols={cryptoWl.symbols}
              rows={cryptoWl.symbols
                .map((s) => listedCryptos.find((c) => c.symbol === s))
                .filter((v): v is Crypto => Boolean(v))
                .map((c) => ({
                  symbol: `${c.symbol}/USDT`,
                  sub: c.name,
                  logo: c.logo_url,
                  price: c.price ? fmtUsd(Number(c.price.current_price)) : "—",
                  href: `/trading-platform/${c.symbol}`,
                }))}
            />
            <WatchlistCard
              title="Stock Watchlist"
              icon={TrendingUp}
              symbols={stockWl.symbols}
              rows={stockWl.symbols
                .map((s) => STOCKS.find((x) => x.symbol === s))
                .filter((v): v is Stock => Boolean(v))
                .map((s) => ({
                  symbol: s.symbol,
                  sub: s.exchange,
                  price: fmtUsd(s.price),
                  href: `/trading-platform/${s.symbol}`,
                }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Feature card ---------- */

function FeatureCard({
  title,
  subtitle,
  icon: Icon,
  chips,
  onCta,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  chips: { symbol: string; logo?: string; href: string }[];
  onCta: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-montserrat text-[18px] font-bold text-primary">{title}</h3>
            <p className="text-[12px] text-muted">{subtitle}</p>
          </div>
        </div>
        <button onClick={onCta} className="text-brand-red hover:brightness-110" aria-label={`View ${title}`}>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {chips.map((chip) => (
          <Link
            key={chip.symbol}
            href={chip.href}
            className="flex flex-col items-center gap-2 rounded-xl border bg-elevated py-3 text-[12px] font-semibold text-primary transition-colors hover:border-brand-red hover:text-brand-red"
          >
            {chip.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={chip.logo} alt={chip.symbol} className="h-6 w-6 rounded-full object-contain" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-[10px] font-bold text-brand-red">
                {chip.symbol.slice(0, 3)}
              </div>
            )}
            {chip.symbol}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- Rows ---------- */

function CryptoRow({ c, watched, onToggle }: { c: Crypto; watched: boolean; onToggle: () => void }) {
  const price = c.price ? Number(c.price.current_price) : 0;
  const change = c.price ? Number(c.price.percent_change_24h) : 0;
  const mcap = c.price ? Number(c.price.market_cap) : 0;
  return (
    <tr className="border-b transition-colors hover:bg-elevated/60">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
            className={watched ? "text-amber-400" : "text-subtle hover:text-amber-400"}
          >
            <Star className={`h-4 w-4 ${watched ? "fill-amber-400" : ""}`} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.logo_url} alt={c.symbol} className="h-7 w-7 rounded-full object-contain" />
          <div>
            <p className="font-semibold text-primary">{c.symbol}</p>
            <p className="text-[11px] text-muted">{c.name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-right font-semibold text-primary">{fmtUsd(price)}</td>
      <td className={`py-3 text-right ${pctColor(change)}`}>
        <span className="inline-flex items-center gap-0.5">
          {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change.toFixed(2)}%
        </span>
      </td>
      <td className="py-3 text-right text-secondary">${fmtCompact(mcap)}</td>
      <td className="py-3 text-right">
        <Link
          href={`/trading-platform/${c.symbol}`}
          className="inline-flex items-center gap-1 rounded-md bg-brand-red px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-darkred"
        >
          Trade
        </Link>
      </td>
    </tr>
  );
}

function StockRow({ s, watched, onToggle }: { s: Stock; watched: boolean; onToggle: () => void }) {
  return (
    <tr className="border-b transition-colors hover:bg-elevated/60">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
            className={watched ? "text-amber-400" : "text-subtle hover:text-amber-400"}
          >
            <Star className={`h-4 w-4 ${watched ? "fill-amber-400" : ""}`} />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red/10 text-[10px] font-bold text-brand-red">
            {s.symbol.slice(0, 3)}
          </div>
          <div>
            <p className="font-semibold text-primary">{s.symbol}</p>
            <p className="text-[11px] text-muted">{s.name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-right font-semibold text-primary">{fmtUsd(s.price)}</td>
      <td className={`py-3 text-right ${pctColor(s.changePct)}`}>
        <span className="inline-flex items-center gap-0.5">
          {s.changePct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {s.changePct.toFixed(2)}%
        </span>
      </td>
      <td className="py-3 text-right text-secondary">${fmtCompact(s.marketCap)}</td>
      <td className="py-3 text-right">
        <Link
          href={`/trading-platform/${s.symbol}`}
          className="inline-flex items-center gap-1 rounded-md bg-brand-red px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-darkred"
        >
          Trade
        </Link>
      </td>
    </tr>
  );
}

/* ---------- Watchlist card ---------- */

function WatchlistCard({
  title,
  icon: Icon,
  symbols,
  rows,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  symbols: string[];
  rows: { symbol: string; sub: string; logo?: string; price: string; href: string }[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-red" />
          <h3 className="font-montserrat text-[16px] font-bold text-primary">{title}</h3>
        </div>
        <span className="text-[11px] text-muted">{symbols.length} tracked</span>
      </div>
      <div className="mt-4">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b text-[11px] uppercase text-muted">
              <th className="pb-2 font-semibold">Symbol</th>
              <th className="pb-2 text-right font-semibold">Price</th>
              <th className="pb-2 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted">
                  <Star className="mx-auto h-6 w-6 text-subtle" />
                  <p className="mt-2 text-[12px]">Tap the ★ next to any asset to add it here.</p>
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.symbol} className="border-b last:border-none">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {r.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={r.logo} alt={r.symbol} className="h-6 w-6 rounded-full object-contain" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-[10px] font-bold text-brand-red">
                        {r.symbol.slice(0, 3)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-primary">{r.symbol}</p>
                      <p className="text-[11px] text-muted">{r.sub}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right font-semibold text-primary">{r.price}</td>
                <td className="py-3 text-right">
                  <Link href={r.href} className="text-[12px] font-semibold text-brand-red hover:underline">
                    Trade
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
