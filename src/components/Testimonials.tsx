"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { api, qk, type Testimonial } from "@/lib/api";

/**
 * "What Our Investors Say" — a horizontal carousel of published testimonials.
 * Data comes from the admin-managed backend; nothing is hardcoded so admins
 * can add/edit/remove without a code deploy. If the backend has none, the
 * section quietly hides itself.
 */
export default function Testimonials() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: qk.testimonials,
    queryFn: () => api.testimonials.list(),
    staleTime: 5 * 60_000,
  });

  const scroller = useRef<HTMLDivElement | null>(null);

  if (!isLoading && items.length === 0) return null;

  const nudge = (dir: "prev" | "next") => {
    const el = scroller.current;
    if (!el) return;
    const step = Math.min(360, el.clientWidth * 0.85);
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  return (
    <section className="bg-[#f6f8fc] dark:bg-[#0b0f19]">
      <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="font-montserrat text-[28px] font-bold text-brand-navy dark:text-primary sm:text-[36px] lg:text-[44px]">
            What Our <span className="text-brand-red">Investors Say</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.65] text-brand-gray dark:text-muted sm:text-[16px]">
            Join thousands of satisfied investors who trust us with their financial future.
          </p>
        </div>

        <div className="relative mt-10">
          {/* Prev / next arrows — hidden on tiny screens, users can swipe. */}
          <button
            aria-label="Previous"
            onClick={() => nudge("prev")}
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-navy shadow-md ring-1 ring-brand-border/60 transition-colors hover:text-brand-red dark:bg-card dark:text-primary dark:ring-line md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next"
            onClick={() => nudge("next")}
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-navy shadow-md ring-1 ring-brand-border/60 transition-colors hover:text-brand-red dark:bg-card dark:text-primary dark:ring-line md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scroller}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2"
          >
            {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            {!isLoading && items.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const rating = Math.min(5, Math.max(1, t.rating || 5));
  return (
    <article className="relative w-[86%] shrink-0 snap-start rounded-2xl border border-brand-border/70 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(1,24,64,0.25)] dark:border-line dark:bg-card sm:w-[420px] sm:p-7">
      <Quote className="absolute right-5 top-5 h-5 w-5 text-brand-red/30" aria-hidden />
      <div className="flex items-center gap-3">
        {t.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-red/20" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-red/10 text-[14px] font-bold text-brand-red">
            {t.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-montserrat text-[15px] font-semibold text-brand-navy dark:text-primary">{t.name}</p>
          {t.role && <p className="text-[12px] text-brand-gray dark:text-muted">{t.role}</p>}
          <div className="mt-0.5 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < rating ? "fill-amber-400 text-amber-400" : "text-brand-border dark:text-line"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <blockquote className="mt-5 text-[14px] italic leading-[1.7] text-brand-gray dark:text-muted">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      {t.username && (
        <p className="mt-5 inline-flex items-center gap-1 rounded-full bg-brand-red/5 px-3 py-1 text-[12px] font-semibold text-brand-red">
          {t.username.startsWith("@") ? t.username : `@${t.username}`}
        </p>
      )}
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="w-[86%] shrink-0 snap-start rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm dark:border-line dark:bg-card sm:w-[420px]">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-brand-border/50 dark:bg-line" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-brand-border/50 dark:bg-line" />
          <div className="h-2 w-1/4 animate-pulse rounded bg-brand-border/40 dark:bg-line/70" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-brand-border/40 dark:bg-line/70" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-brand-border/40 dark:bg-line/70" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-brand-border/40 dark:bg-line/70" />
      </div>
    </div>
  );
}
