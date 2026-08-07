"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

/**
 * Route-level error boundary. Catches uncaught errors inside a page/segment
 * and offers the user a way to retry or bail out to home.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for whatever error tracker is wired up (or just the console in dev).
    // eslint-disable-next-line no-console
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f6fb] px-5 py-12 dark:bg-[#0b0f19]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-montserrat text-[24px] font-bold text-brand-navy dark:text-white sm:text-[28px]">
          Something went wrong
        </h1>
        <p className="mt-3 text-[14px] leading-[1.6] text-brand-gray dark:text-slate-400">
          We hit an unexpected error rendering this page. Try again — if the problem persists, contact support.
        </p>
        {error.digest && (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 font-mono text-[11px] text-brand-gray dark:bg-[#131827] dark:text-slate-500">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-red px-5 py-3 font-montserrat text-[13px] font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-brand-darkred"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-brand-border bg-white px-5 py-3 font-montserrat text-[13px] font-bold uppercase tracking-[0.05em] text-brand-navy transition-colors hover:border-brand-red hover:text-brand-red dark:border-[#2a314a] dark:bg-[#131827] dark:text-slate-200"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
