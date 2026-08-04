"use client";

import { useState } from "react";

const PLATFORMS = {
  mt4: {
    icon: "/assets/mt4.png",
    tab: "METATRADER 4",
    title: "METATRADER 4 (MT4)",
    points: [
      "The world’s most adopted retail platform—battle-tested and extensible.",
      "Huge ecosystem of indicators, EAs, and community resources.",
      "Clean interface for discretionary and systematic styles alike.",
      "Plug in AI-assisted signals and analytics alongside classic tools.",
    ],
    cta: "GET MT4 NOW:",
  },
  mt5: {
    icon: "/assets/mt5.png",
    tab: "METATRADER 5",
    title: "METATRADER 5 (MT5)",
    points: [
      "Everything traders love about MT4—plus multi-asset depth and speed.",
      "Broader instrument coverage for diversified trading and investing.",
      "Advanced orders and depth-of-market where available.",
      "Richer charting—pair with AI overlays and macro context.",
    ],
    cta: "GET MT5 NOW:",
  },
} as const;

type Key = keyof typeof PLATFORMS;

const STORE_ICONS = [
  {
    label: "Windows",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M3 5.5l8-1.1v7.1H3V5.5zm0 13l8 1.1v-7.1H3v6zm9-13.3L21.5 4v7.5H12V5.2zm0 13.6l9.5 1.3v-7.6H12v6.3z" />
      </svg>
    ),
  },
  {
    label: "Google Play",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M4 3.5v17l13-8.5L4 3.5z" />
        <path d="M17 12l3.5-2.3c.8-.5.8-1.7 0-2.2L17 5.5 14.5 12 17 18.5l3.5-2c.8-.5.8-1.7 0-2.2L17 12z" opacity="0.85" />
      </svg>
    ),
  },
  {
    label: "App Store",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M16.7 12.9c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.7-3.6zM14.6 5.6c.7-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5z" />
      </svg>
    ),
  },
  {
    label: "Web",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 9h17M3.5 15h17M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" />
      </svg>
    ),
  },
];

export default function Platforms() {
  const [selected, setSelected] = useState<Key>("mt4");
  const p = PLATFORMS[selected];

  return (
    <section className="border-t border-brand-border/70 bg-white dark:bg-card">
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
        {/* Heading row */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="max-w-[560px]">
            <span className="eyebrow-chip">PROFESSIONAL PLATFORMS</span>
            <h2 className="mt-5 font-montserrat text-[32px] font-bold leading-[1.12] text-brand-maroon sm:text-[42px]">
              MT4, MT5 &amp; AI INSIGHTS
            </h2>
            <p className="mt-5 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
              Use MetaTrader 4 and 5 alongside AI analytics and research tools to
              trade and invest across global markets from one ecosystem.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex h-fit items-center rounded-[40px] border border-brand-border dark:border-line bg-white dark:bg-card p-1.5">
            {(Object.keys(PLATFORMS) as Key[]).map((k) => (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className={`flex items-center gap-2.5 rounded-[32px] px-5 py-3 transition-all ${
                  selected === k ? "bg-[#efefef]" : "opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLATFORMS[k].icon} alt={PLATFORMS[k].tab} className="h-[26px] w-[26px]" />
                <span
                  className={`font-montserrat text-[12px] font-bold tracking-[0.04em] ${
                    selected === k ? "text-brand-red" : "text-brand-deepnavy"
                  }`}
                >
                  {PLATFORMS[k].tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <div key={selected}>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.icon} alt={p.title} className="h-[52px] w-[52px]" />
              <h3 className="font-montserrat text-[22px] font-bold text-brand-maroon">
                {p.title}
              </h3>
            </div>

            <ul className="mt-7 space-y-4">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-start gap-3.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#12a594"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                  <span className="text-[16px] leading-[1.6] text-brand-gray dark:text-muted">{pt}</span>
                </li>
              ))}
            </ul>

            <p className="mt-9 inline-block rounded-[4px] bg-[#efefef] px-3 py-2 font-montserrat text-[12px] font-bold tracking-[0.14em] text-brand-red">
              {p.cta}
            </p>
            <div className="mt-4 flex gap-3">
              {STORE_ICONS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-[6px] bg-brand-red transition-colors hover:bg-brand-darkred"
                >
                  {s.svg}
                </a>
              ))}
            </div>

            <a
              href="#"
              className="mt-7 inline-flex items-center gap-2 font-montserrat text-[15px] font-semibold text-brand-maroon transition-colors hover:text-brand-red"
            >
              Trade Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          {/* Phone mockup visual */}
          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="dotted-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 mx-auto w-[240px] rounded-[36px] border-[10px] border-brand-navy bg-white dark:bg-card shadow-[0_30px_80px_-20px_rgba(0,13,34,0.35)]">
              <div className="overflow-hidden rounded-[26px]">
                {/* Status bar */}
                <div className="flex items-center justify-between bg-brand-navy dark:bg-elevated px-5 py-2.5">
                  <span className="text-[9px] font-semibold text-white">9:41</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  </div>
                </div>
                {/* Chart header */}
                <div className="bg-brand-navy dark:bg-elevated px-5 pb-5 pt-3">
                  <p className="font-montserrat text-[13px] font-bold text-white">EURUSD</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-montserrat text-[22px] font-bold leading-none text-white tick-pulse">
                      1.0864
                    </span>
                    <span className="mb-0.5 text-[10px] font-semibold text-[#f3504b]">-0.12%</span>
                  </div>
                </div>
                {/* Candles */}
                <div className="bg-white dark:bg-card px-4 py-5">
                  <svg viewBox="0 0 200 120" className="w-full">
                    {/* grid */}
                    {[20, 45, 70, 95].map((y) => (
                      <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f0f1f3" strokeWidth="1" />
                    ))}
                    {/* candles */}
                    {[
                      { x: 8, o: 60, c: 45, h: 38, l: 68, up: true },
                      { x: 26, o: 45, c: 55, h: 40, l: 62, up: false },
                      { x: 44, o: 55, c: 40, h: 34, l: 60, up: true },
                      { x: 62, o: 40, c: 48, h: 33, l: 55, up: false },
                      { x: 80, o: 48, c: 32, h: 26, l: 54, up: true },
                      { x: 98, o: 32, c: 42, h: 26, l: 48, up: false },
                      { x: 116, o: 42, c: 28, h: 22, l: 48, up: true },
                      { x: 134, o: 28, c: 36, h: 22, l: 42, up: false },
                      { x: 152, o: 36, c: 22, h: 16, l: 42, up: true },
                      { x: 170, o: 22, c: 30, h: 15, l: 36, up: false },
                    ].map((c, i) => (
                      <g key={i}>
                        <line x1={c.x + 5} y1={c.h} x2={c.x + 5} y2={c.l} stroke={c.up ? "#12a594" : "#f3504b"} strokeWidth="1.6" />
                        <rect x={c.x} y={Math.min(c.o, c.c)} width="10" height={Math.abs(c.c - c.o) || 2} rx="1" fill={c.up ? "#12a594" : "#f3504b"} />
                      </g>
                    ))}
                  </svg>
                  {/* Buy / sell */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button className="rounded-[5px] bg-[#f3504b] py-2.5 font-montserrat text-[11px] font-bold text-white">
                      SELL 1.0864
                    </button>
                    <button className="rounded-[5px] bg-[#12a594] py-2.5 font-montserrat text-[11px] font-bold text-white">
                      BUY 1.0866
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-2 top-10 z-20 rounded-[8px] border border-brand-border dark:border-line bg-white dark:bg-card px-4 py-3 shadow-[0_12px_30px_-10px_rgba(0,13,34,0.25)]">
              <p className="font-montserrat text-[11px] font-bold text-brand-deepnavy">AI SIGNAL</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#12a594]">BUY · 87% confidence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
