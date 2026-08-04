"use client";

import { useState } from "react";

type Instrument = {
  icon: string;
  symbol: string;
  bid: string;
  ask: string;
  spread: string;
  change: string;
  changeUp: boolean;
  leverage: string;
};

const TABS: { label: string; rows: Instrument[] }[] = [
  {
    label: "MOST POPULAR",
    rows: [
      { icon: "/assets/BTCUSDxx.svg", symbol: "BTCUSDxx", bid: "65124.00", ask: "65125.20", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "1:20 (fixed)" },
      { icon: "/assets/EURUSDxx.svg", symbol: "EURUSDxx", bid: "1.0864", ask: "1.0866", spread: "0.0002", change: "-0.12%", changeUp: false, leverage: "up to 1:500" },
      { icon: "/assets/XAUUSDxx.svg", symbol: "XAUUSDxx", bid: "2168.40", ask: "2169.60", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "up to 1:500" },
      { icon: "/assets/US100xx.svg", symbol: "US100xx", bid: "18246.00", ask: "18247.20", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "1:200 (fixed)" },
      { icon: "/assets/WTIxx.svg", symbol: "WTIxx", bid: "78.440", ask: "78.440", spread: "0.000", change: "0.18%", changeUp: true, leverage: "1:200 (fixed)" },
    ],
  },
  {
    label: "FOREX",
    rows: [
      { icon: "/assets/EURUSDxx.svg", symbol: "EURUSDxx", bid: "1.0864", ask: "1.0866", spread: "0.0002", change: "-0.12%", changeUp: false, leverage: "up to 1:500" },
      { icon: "/assets/USDJPYxx.svg", symbol: "USDJPYxx", bid: "156.32", ask: "156.34", spread: "0.02", change: "0.24%", changeUp: true, leverage: "up to 1:500" },
      { icon: "/assets/GBPUSDxx.svg", symbol: "GBPUSDxx", bid: "1.2702", ask: "1.2704", spread: "0.0002", change: "0.08%", changeUp: true, leverage: "up to 1:500" },
      { icon: "/assets/USDCADxx.svg", symbol: "USDCADxx", bid: "1.3689", ask: "1.3691", spread: "0.0002", change: "-0.05%", changeUp: false, leverage: "up to 1:500" },
      { icon: "/assets/NZDUSDxx.svg", symbol: "NZDUSDxx", bid: "0.6102", ask: "0.6104", spread: "0.0002", change: "0.11%", changeUp: true, leverage: "up to 1:500" },
    ],
  },
  {
    label: "METALS",
    rows: [
      { icon: "/assets/XAUUSDxx.svg", symbol: "XAUUSDxx", bid: "2168.40", ask: "2169.60", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "up to 1:500" },
      { icon: "/assets/XAGUSDxx.svg", symbol: "XAGUSDxx", bid: "28.140", ask: "28.175", spread: "0.035", change: "0.42%", changeUp: true, leverage: "up to 1:500" },
    ],
  },
  {
    label: "INDEX CFDS & OIL",
    rows: [
      { icon: "/assets/WTIxx.svg", symbol: "WTIxx", bid: "78.440", ask: "78.440", spread: "0.000", change: "0.18%", changeUp: true, leverage: "1:200 (fixed)" },
      { icon: "/assets/US30xx.svg", symbol: "US30xx", bid: "39112.00", ask: "39114.00", spread: "2.00", change: "0.32%", changeUp: true, leverage: "1:200 (fixed)" },
      { icon: "/assets/US100xx.svg", symbol: "US100xx", bid: "18246.00", ask: "18247.20", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "1:200 (fixed)" },
      { icon: "/assets/US500xx.svg", symbol: "US500xx", bid: "5321.40", ask: "5322.10", spread: "0.70", change: "0.09%", changeUp: true, leverage: "1:200 (fixed)" },
      { icon: "/assets/DE40xx.svg", symbol: "DE40xx", bid: "18402.00", ask: "18403.50", spread: "1.50", change: "-0.21%", changeUp: false, leverage: "1:200 (fixed)" },
    ],
  },
  {
    label: "CRYPTOCURRENCIES",
    rows: [
      { icon: "/assets/BTCUSDxx.svg", symbol: "BTCUSDxx", bid: "65124.00", ask: "65125.20", spread: "1.20", change: "-0.12%", changeUp: false, leverage: "1:20 (fixed)" },
      { icon: "/assets/ETHUSDxx.svg", symbol: "ETHUSDxx", bid: "3412.60", ask: "3413.40", spread: "0.80", change: "0.65%", changeUp: true, leverage: "1:20 (fixed)" },
      { icon: "/assets/LTCUSDxx.svg", symbol: "LTCUSDxx", bid: "78.42", ask: "78.52", spread: "0.10", change: "-0.44%", changeUp: false, leverage: "1:20 (fixed)" },
      { icon: "/assets/BCHUSDxx.svg", symbol: "BCHUSDxx", bid: "452.10", ask: "452.60", spread: "0.50", change: "1.02%", changeUp: true, leverage: "1:20 (fixed)" },
      { icon: "/assets/RPLUSDxx.svg", symbol: "RPLUSDxx", bid: "24.86", ask: "24.94", spread: "0.08", change: "-1.15%", changeUp: false, leverage: "1:20 (fixed)" },
    ],
  },
  {
    label: "FORWARD CONTRACTS",
    rows: [
      { icon: "/assets/WDOxx.svg", symbol: "WDOJ26xx", bid: "5412.00", ask: "5413.00", spread: "1.00", change: "0.22%", changeUp: true, leverage: "1:100 (fixed)" },
      { icon: "/assets/WINxx.svg", symbol: "WINJ26xx", bid: "128440.00", ask: "128450.00", spread: "10.00", change: "-0.34%", changeUp: false, leverage: "1:200 (fixed)" },
    ],
  },
];

export default function Markets() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section className="border-t border-brand-border/70 bg-white dark:bg-card">
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="eyebrow-chip">MARKETS &amp; INSTRUMENTS</span>
          <h2 className="mt-5 font-montserrat text-[32px] font-bold leading-[1.12] text-brand-maroon sm:text-[42px]">
            BUILD A BALANCED BOOK
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
            Forex, metals, indices, energies, crypto, and more—with AI context
            and professional tools to support your research and execution.
          </p>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mx-auto mt-10 flex max-w-[900px] items-center gap-1 overflow-x-auto rounded-[40px] border border-brand-border dark:border-line bg-white dark:bg-card p-1.5">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`flex-1 whitespace-nowrap rounded-[32px] px-5 py-3.5 font-montserrat text-[12px] font-bold tracking-[0.05em] transition-all ${
                i === active
                  ? "bg-[#efefef] text-brand-red"
                  : "text-brand-deepnavy hover:text-brand-red"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 overflow-x-auto rounded-[12px] border border-brand-border dark:border-line">
          <table className="w-full min-w-[860px] border-collapse bg-white dark:bg-card text-left">
            <thead>
              <tr className="border-b border-brand-border dark:border-line">
                {["Asset", "Bid", "Ask", "Spread", "Daily Change", "Leverage", "Platform"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-montserrat text-[12px] font-semibold uppercase tracking-[0.08em] text-[#99a0ac]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody key={active}>
              {tab.rows.map((r) => (
                <tr key={r.symbol} className="market-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.icon} alt={r.symbol} className="h-[30px] w-[30px]" />
                      <span className="font-montserrat text-[14px] font-bold text-brand-navy dark:text-primary">
                        {r.symbol}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-[14px] font-medium ${r.changeUp ? "text-[#12a594]" : "text-[#f3504b]"}`}>
                    {r.bid}
                  </td>
                  <td className={`px-6 py-4 text-[14px] font-medium ${r.changeUp ? "text-[#12a594]" : "text-[#f3504b]"}`}>
                    {r.ask}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-brand-gray dark:text-muted">{r.spread}</td>
                  <td className={`px-6 py-4 text-[14px] font-semibold ${r.changeUp ? "text-[#12a594]" : "text-[#f3504b]"}`}>
                    {r.change}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-brand-navy dark:text-primary">{r.leverage}</td>
                  <td className="px-6 py-4 font-montserrat text-[13px] font-bold text-brand-navy dark:text-primary">
                    MT4/ MT5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-montserrat text-[15px] font-semibold text-brand-maroon transition-colors hover:text-brand-red"
          >
            See Instruments Overview
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </a>
          <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#99a0ac]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" strokeLinecap="round" />
            </svg>
            Real-time information. Prices are for demonstration purposes only.
          </p>
        </div>
      </div>
    </section>
  );
}
