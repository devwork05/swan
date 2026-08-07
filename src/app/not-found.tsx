import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f6fb] px-5 py-12 dark:bg-[#0b0f19]">
      <div className="w-full max-w-md text-center">
        <p className="font-montserrat text-[120px] font-black leading-none text-brand-red/15 sm:text-[160px]">
          404
        </p>
        <h1 className="mt-4 font-montserrat text-[26px] font-bold text-brand-navy dark:text-white sm:text-[32px]">
          Page not found
        </h1>
        <p className="mt-3 text-[14px] leading-[1.6] text-brand-gray dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Check the URL, or head back home.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-red px-5 py-3 font-montserrat text-[13px] font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-brand-darkred"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-brand-border bg-white px-5 py-3 font-montserrat text-[13px] font-bold uppercase tracking-[0.05em] text-brand-navy transition-colors hover:border-brand-red hover:text-brand-red dark:border-[#2a314a] dark:bg-[#131827] dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
