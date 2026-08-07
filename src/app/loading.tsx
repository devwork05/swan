import { Loader2 } from "lucide-react";

/**
 * Root loading fallback — shown by Next.js during the initial route load and
 * any suspense boundary that isn't overridden by a nested loading.tsx. Kept
 * intentionally minimal (just a spinner) so it flashes as briefly as possible.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-brand-red dark:bg-[#0b0f19]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
