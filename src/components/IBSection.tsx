const STEPS = [
  {
    n: "1.",
    title: "Sign Up",
    text: "Sign up and join our IB program through registration.",
  },
  {
    n: "2.",
    title: "Expand",
    text: "Introduce clients and track daily IB Commissions in your IB portal.",
  },
  {
    n: "3.",
    title: "Earn",
    text: "Earn revenue and passive income from the multi-level IB system.",
  },
];

export default function IBSection() {
  return (
    <section className="bg-white dark:bg-card">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1fr_0.9fr] lg:px-8 lg:py-24">
        {/* Text */}
        <div>
          <span className="eyebrow-chip">PARTNER WITH US</span>
          <h2 className="mt-5 font-montserrat text-[24px] font-bold leading-[1.12] text-brand-maroon dark:text-white sm:text-[32px] md:text-[40px]">
            BECOME AN INTRODUCING BROKER
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] text-brand-gray dark:text-muted">
            Gain a competitive edge and maximise your earnings with a 50/50
            split on spread markup and trade commission.
          </p>
          <a href="#" className="btn-primary mt-8">
            LEARN MORE
          </a>
        </div>

        {/* Steps */}
        <div className="space-y-9">
          {STEPS.map((s) => (
            <div key={s.n}>
              <h3 className="font-montserrat text-[20px] font-bold text-brand-maroon dark:text-white">
                {s.n} {s.title}
              </h3>
              <p className="mt-2.5 max-w-[380px] text-[15px] leading-[1.6] text-brand-gray dark:text-muted">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        {/* Collage image */}
        <div className="relative mx-auto w-full max-w-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ibs-section.png"
            alt="Introducing broker dashboard"
            className="w-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
