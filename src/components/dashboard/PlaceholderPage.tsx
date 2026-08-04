import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

export default function PlaceholderPage({
  title,
  icon: Icon,
  description,
}: {
  title: string;
  icon: LucideIcon;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-[800px] rounded-xl border bg-card p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
        <Icon className="h-8 w-8 text-brand-red" />
      </div>
      <h1 className="mt-4 font-montserrat text-[22px] font-bold text-primary">{title}</h1>
      <p className="mt-2 text-[14px] text-muted">{description}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
