"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = {
  tab: string;
  eyebrow: string;
  title: string;
  sub: string;
  buttons: { label: string; primary: boolean }[];
  media: { type: "video" | "image"; src: string; alt: string };
};

const SLIDES: Slide[] = [
  {
    tab: "LET THE EXPERTS LEAD",
    eyebrow: "YOU JUST EARN",
    title: "LET PROFESSIONAL TRADERS DO THE WORK",
    sub: "Maximize your returns with zero efforts, we connect you to seasoned traders, replicating their strategies in real time.",
    buttons: [{ label: "OPEN ACCOUNT", primary: true }],
    media: { type: "video", src: "/assets/hero-video.mp4", alt: "Let the experts lead" },
  },
  {
    tab: "PLATFORM OVERVIEW",
    eyebrow: "AI-POWERED INVESTING",
    title: "TRADE SMARTER WITH INTELLIGENCE",
    sub: "An AI-assisted trading and investment platform—analytics, execution, and support aligned with serious traders and long-term investors.",
    buttons: [{ label: "OPEN ACCOUNT", primary: true }],
    media: { type: "video", src: "/assets/hero-video.mp4", alt: "Trading platform overview" },
  },
  {
    tab: "50% FIRST DEPOSIT BONUS",
    eyebrow: "START STRONGER",
    title: "50% FIRST DEPOSIT BONUS",
    sub: "Get more capacity to explore AI tools and global markets—see promo terms for eligibility and conditions.",
    buttons: [{ label: "LEARN MORE", primary: true }],
    media: { type: "image", src: "/assets/bonus-slider.png", alt: "First deposit bonus" },
  },
  {
    tab: "IB PROGRAM",
    eyebrow: "PARTNER PROGRAM",
    title: "GROW WITH AI-DRIVEN DEMAND",
    sub: "Introduce clients to an AI-enhanced trading and investing experience—and earn competitive revenue share on their activity.",
    buttons: [{ label: "LEARN MORE", primary: true }],
    media: { type: "image", src: "/assets/ibs-hero.png", alt: "Partner program" },
  },
  {
    tab: "CRYPTO (24/7)",
    eyebrow: "DIGITAL ASSETS",
    title: "CRYPTO MARKETS AROUND THE CLOCK",
    sub: "Access leading cryptocurrencies with flexible hours—use AI context and risk tools to navigate fast-moving markets.",
    buttons: [
      { label: "OPEN ACCOUNT", primary: true },
      { label: "LEARN MORE", primary: false },
    ],
    media: { type: "image", src: "/assets/crypto-slider.png", alt: "Crypto markets" },
  },
  {
    tab: "AI BOTS",
    eyebrow: "AI-POWERED BOTS",
    title: "REAL-TIME DEFENSE FOR YOUR INVESTMENTS",
    sub: "Our AI-powered bots are different from others because they are designed to monitor the market in real time. They can automatically pause a live investment package before a market decline negatively affects the investment, and then reactivate it when market conditions become favorable again, ensuring a smoother and more profitable overall investment process.",
    buttons: [{ label: "OPEN ACCOUNT", primary: true }],
    media: { type: "image", src: "/assets/acuity-hero-bg.png", alt: "AI-powered bots" },
  },
];

const AUTOPLAY_MS = 8000;

export default function Hero() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const goTo = (i: number) => {
    setActive(i);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  };

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-card">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        {/* Slides */}
        <div className="relative">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.tab}
              className={`hero-slide ${i === active ? "active" : ""}`}
              aria-hidden={i !== active}
            >
              <div className="grid min-h-[560px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
                {/* Text */}
                <div className="max-w-[560px]">
                  <span className="eyebrow-chip slide-in-up">{slide.eyebrow}</span>
                  <h1 className="slide-in-up-delay mt-6 font-montserrat text-[28px] font-bold leading-[1.08] tracking-[-0.01em] text-brand-maroon dark:text-white sm:text-[44px] md:text-[52px] lg:text-[58px]">
                    {slide.title}
                  </h1>
                  <p className="slide-in-up-delay mt-6 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
                    {slide.sub}
                  </p>
                  <div className="slide-in-up-delay mt-9 flex flex-wrap gap-4">
                    {slide.buttons.map((b) =>
                      b.primary ? (
                        <Link
                          key={b.label}
                          href={b.label === "OPEN ACCOUNT" ? "/register" : "#"}
                          className="btn-primary"
                        >
                          {b.label}
                        </Link>
                      ) : (
                        <Link key={b.label} href="#" className="btn-outline">
                          {b.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                {/* Media */}
                <div className="slide-in-right relative mx-auto w-full max-w-[520px]">
                  <div className="dotted-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[115%] -translate-x-1/2 -translate-y-1/2" />
                  {slide.media.type === "video" ? (
                    i === active ? (
                      <video
                        key={slide.media.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="relative z-10 mx-auto w-full rounded-[14px]"
                      >
                        <source src={slide.media.src} type="video/mp4" />
                      </video>
                    ) : null
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.media.src}
                      alt={slide.media.alt}
                      className="relative z-10 mx-auto w-full object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="pb-12">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-[40px] border border-brand-border dark:border-line bg-white dark:bg-card p-1.5">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.tab}
                onClick={() => goTo(i)}
                className={`whitespace-nowrap rounded-[32px] px-6 py-3.5 font-montserrat text-[12px] font-bold tracking-[0.05em] transition-all ${i === active
                  ? "bg-[#efefef] text-brand-red dark:bg-elevated"
                  : "text-brand-deepnavy hover:text-brand-red dark:text-slate-200 dark:hover:text-brand-red"
                  }`}
              >
                {slide.tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
