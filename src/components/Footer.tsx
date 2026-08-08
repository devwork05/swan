"use client";

import Link from "next/link";
import { useBrandLogo, usePublicSettings } from "@/lib/usePublicSettings";

const COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "TRADING INSTRUMENTS",
    links: [
      "Instruments Overview",
      "Forex",
      "Metals",
      "Index CFDs & Oil",
      "Cryptocurrencies",
      "Forward Contracts",
    ],
  },
  {
    title: "ACCOUNTS",
    links: ["Accounts Overview", "Pro Account", "Standard Account", "VIP Account"],
  },
  {
    title: "TRADING PLATFORMS",
    links: ["MetaTrader 4", "MetaTrader 5", "WebTrader"],
  },
  {
    title: "SUPPORT",
    links: ["Contact Us", "Funding Methods", "FAQs"],
  },
  {
    title: "LEGAL",
    links: ["Legal Documents", "Privacy Policy", "Risk Disclosure", "Terms & Conditions"],
  },
];

export default function Footer() {
  const logo = useBrandLogo();
  const { companyName, address, contactEmail } = usePublicSettings();
  return (
    <footer className="border-t border-brand-border/70 bg-white dark:bg-card">
      <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.6fr]">
          {/* Brand */}
          <div>
            <Link href="/" aria-label={companyName}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={companyName} className="h-[34px] w-auto" />
            </Link>
            <p className="mt-5 max-w-[300px] text-[13px] leading-[1.7] text-brand-gray dark:text-muted">
              {address}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-3 inline-block text-[14px] font-medium text-brand-red hover:underline"
            >
              {contactEmail}
            </a>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-montserrat text-[13px] font-bold tracking-[0.08em] text-brand-navy dark:text-primary">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-[14px] text-brand-gray dark:text-muted transition-colors hover:text-brand-red"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Risk warning */}
        <div className="mt-14 border-t border-brand-border/70 pt-8">
          <p className="text-[12px] leading-[1.75] text-[#99a0ac]">
            Risk Warning: Trading foreign exchange, contracts for difference
            (CFDs) and other leveraged products carries a high level of risk to
            your capital and may not be suitable for all investors. You should
            not speculate with capital that you cannot afford to lose. Past
            performance is not indicative of future results. Please ensure you
            fully understand the risks involved and seek independent advice if
            necessary.
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[13px] text-brand-gray dark:text-muted">
              © {new Date().getFullYear()}{companyName ? ` ${companyName}. All rights reserved.` : ""}
            </p>
            <p className="text-[12px] text-[#99a0ac]">
              Prices are for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
