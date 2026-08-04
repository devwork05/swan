import Link from "next/link";
import type { InnerPageData, SplitSection } from "@/data/innerPages";

function Split({ section, flip }: { section: SplitSection; flip?: boolean }) {
  return (
    <section className="border-t border-brand-border/70 bg-white dark:bg-card">
      <div
        className={`mx-auto grid max-w-[1280px] gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24 ${
          flip ? "" : ""
        }`}
      >
        <div className={flip ? "lg:order-2" : ""}>
          <span className="eyebrow-chip">{section.label}</span>
          <h2 className="mt-5 font-montserrat text-[30px] font-bold leading-[1.12] text-brand-maroon sm:text-[40px]">
            {section.heading}
          </h2>
          <p className="mt-5 max-w-[460px] text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
            {section.sub}
          </p>
          {section.learnMore && (
            <Link href="#" className="btn-primary mt-8">
              LEARN MORE
            </Link>
          )}
        </div>
        <div className={`space-y-9 ${flip ? "lg:order-1" : ""}`}>
          {section.items.map((it) => (
            <div key={it.title}>
              <h3 className="font-montserrat text-[20px] font-bold text-brand-maroon">
                {it.title}
              </h3>
              <p className="mt-2.5 max-w-[440px] text-[15px] leading-[1.6] text-brand-gray dark:text-muted">
                {it.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function InnerPage({ data }: { data: InnerPageData }) {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-white dark:bg-card">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-20">
          <div className="max-w-[560px]">
            <span className="eyebrow-chip">{data.heroLabel}</span>
            <h1 className="mt-6 font-montserrat text-[38px] font-bold leading-[1.08] tracking-[-0.01em] text-brand-maroon sm:text-[50px] lg:text-[56px]">
              {data.heroTitle}
            </h1>
            <p className="mt-6 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
              {data.heroSub}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary">
                GET STARTED
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center rounded-[5px] bg-brand-navy dark:bg-elevated px-[26px] py-[14px] font-montserrat text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-deepnavy"
              >
                CONTACT US
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="dotted-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/ibs-hero.png"
              alt={data.heroTitle}
              className="relative z-10 mx-auto w-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      </section>

      <Split section={data.sectionA} />
      <Split section={data.sectionB} flip />

      {/* Process strip */}
      <section className="border-t border-brand-border/70 bg-white dark:bg-card">
        <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-24">
          <div className="max-w-[560px]">
            <span className="eyebrow-chip">{data.processLabel}</span>
            <h2 className="mt-5 font-montserrat text-[30px] font-bold leading-[1.12] text-brand-maroon sm:text-[40px]">
              {data.processHeading}
            </h2>
            <p className="mt-5 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
              {data.processSub}
            </p>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {data.processSteps.map((s, i) => (
              <div key={s.title} className="relative">
                <p className="font-montserrat text-[40px] font-bold leading-none text-brand-red/15">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-montserrat text-[18px] font-bold tracking-[0.06em] text-brand-maroon">
                  {s.title.replace(/^\d+\.\s*/, "")}
                </h3>
                <p className="mt-2.5 max-w-[320px] text-[15px] leading-[1.6] text-brand-gray dark:text-muted">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-white dark:bg-card px-5 pb-20 lg:px-8">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[16px] bg-brand-navy dark:bg-elevated">
          <div className="pointer-events-none absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full border-[26px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-[380px] w-[380px] rounded-full border-[30px] border-brand-red/20" />
          <div className="pointer-events-none absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-brand-red/10 blur-[90px]" />
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-14 text-center lg:flex-row lg:justify-between lg:px-16 lg:text-left">
            <div>
              <p className="eyebrow-chip eyebrow-chip--on-red">TAKE THE NEXT STEP</p>
              <h2 className="mt-4 max-w-[560px] font-montserrat text-[26px] font-bold leading-[1.2] text-white sm:text-[32px]">
                {data.ctaText}
              </h2>
            </div>
            <Link href="/register" className="btn-primary shrink-0 whitespace-nowrap">
              OPEN ACCOUNT
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
