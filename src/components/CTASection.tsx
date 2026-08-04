import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-white dark:bg-card px-5 pb-20 lg:px-8">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[16px] bg-brand-navy dark:bg-elevated">
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full border-[26px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-[380px] w-[380px] rounded-full border-[30px] border-brand-red/20" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-brand-red/10 blur-[90px]" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-14 text-center lg:flex-row lg:justify-between lg:px-16 lg:text-left">
          <div>
            <p className="eyebrow-chip eyebrow-chip--on-red">TAKE THE NEXT STEP</p>
            <h2 className="mt-4 font-montserrat text-[28px] font-bold leading-[1.15] text-white sm:text-[36px]">
              Begin trading in just a few minutes!
            </h2>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register" className="btn-primary whitespace-nowrap">
              OPEN ACCOUNT
            </Link>
            <span className="font-montserrat text-[13px] font-semibold uppercase tracking-[0.1em] text-white/60">
              or
            </span>
            <Link
              href="/login"
              className="inline-flex items-center rounded-[5px] border border-white/30 px-6 py-[13px] font-montserrat text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
