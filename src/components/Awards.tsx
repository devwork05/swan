"use client";

import { useEffect, useRef, useState } from "react";
import { usePublicSettings } from "@/lib/usePublicSettings";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function CountUp({ target, start, duration = 1600 }: { target: number; start: boolean; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return <>{value}</>;
}

export default function Awards() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { companyName } = usePublicSettings();

  return (
    <section className="bg-brand-red">
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Awards image */}
          <div className="fade-x mx-auto w-full max-w-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/awards-list.png"
              alt={`${companyName} awards`}
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Text */}
          <div>
            <span className="eyebrow-chip eyebrow-chip--on-red">AWARDED BROKER</span>
            <h2 className="mt-5 font-montserrat text-[32px] font-bold leading-[1.12] text-white sm:text-[42px]">
              ACHIEVEMENTS IN NUMBERS
            </h2>
            <p className="mt-5 max-w-[460px] text-[17px] leading-[1.65] text-white/85">
              With dozens of accolades and awards won over the years, discover
              for yourself why many traders choose {companyName}.
            </p>
            <a
              href="#"
              className="mt-7 inline-flex items-center gap-2 font-montserrat text-[15px] font-semibold text-white transition-opacity hover:opacity-80"
            >
              SEE ALL AWARDS
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={ref}
          className="mt-16 grid gap-10 border-t border-white/20 pt-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <p className="font-montserrat text-[13px] font-bold uppercase tracking-[0.14em] text-white/70">
              Providing Excellence
            </p>
            <p className="mt-3 font-montserrat text-[17px] font-bold text-white">
              Excellent
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[14px] font-semibold text-white/85">4.6 out of 5</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#00b67a">
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <span className="text-[14px] font-bold text-[#00b67a]">Trustpilot</span>
            </div>
          </div>

          <div className="lg:border-l lg:border-white/20 lg:pl-10">
            <p className="stat-digit text-[34px] leading-none text-white">
              <CountUp target={6} start={inView} />+
            </p>
            <p className="mt-2.5 font-montserrat text-[14px] font-bold text-white">Years</p>
            <p className="mt-1 text-[13px] text-white/75">Active in the Markets</p>
          </div>

          <div className="lg:border-l lg:border-white/20 lg:pl-10">
            <p className="stat-digit text-[34px] leading-none text-white">
              $<CountUp target={15} start={inView} /> MILLION+
            </p>
            <p className="mt-2.5 text-[13px] text-white/75">Paid out to partners</p>
          </div>

          <div className="lg:border-l lg:border-white/20 lg:pl-10">
            <p className="stat-digit text-[34px] leading-none text-white">
              <CountUp target={30} start={inView} />K+
            </p>
            <p className="mt-2.5 text-[13px] text-white/75">Social Trading users</p>
          </div>
        </div>
      </div>
    </section>
  );
}
