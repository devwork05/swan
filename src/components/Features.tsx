const FEATURES = [
  {
    title: "Flexible leverage",
    text: "Choose sizing that fits your strategy while you manage risk responsibly.",
    /** currentColor so the icon inherits `text-*` from its container in both themes. */
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7" />
        <path d="M9 7h8v8" />
      </svg>
    ),
    tint: "text-brand-navy dark:text-slate-200",
  },
  {
    title: "Transparent pricing",
    text: "Competitive spreads and clear costs—focus on strategy, not hidden fees.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 7L7 17" />
        <path d="M15 17H7V9" />
      </svg>
    ),
    tint: "text-brand-red",
  },
  {
    title: "Low-latency execution",
    text: "Infrastructure tuned for responsive fills when markets move quickly.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2z" />
      </svg>
    ),
    tint: "text-brand-navy dark:text-slate-200",
  },
  {
    title: "Expert support",
    text: "Human specialists when you need help—plus in-platform guidance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13a8 8 0 0116 0" />
        <rect x="2" y="13" width="4" height="6" rx="1.5" />
        <rect x="18" y="13" width="4" height="6" rx="1.5" />
      </svg>
    ),
    tint: "text-brand-navy dark:text-slate-200",
  },
];

export default function Features() {
  return (
    <section className="border-t border-brand-border/70 bg-white dark:bg-card">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:py-20">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <div
              className={`flex h-[46px] w-[46px] items-center justify-center rounded-[6px] border border-brand-border bg-white dark:border-line dark:bg-elevated ${f.tint}`}
            >
              {f.icon}
            </div>
            <h3 className="mt-5 font-montserrat text-[17px] font-bold text-brand-maroon dark:text-white">
              {f.title}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.6] text-brand-gray dark:text-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
