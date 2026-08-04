"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Copy,
  CheckCircle,
  UserPlus,
  Gift,
  Award,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { api, qk, type Referral } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ReferralsPage() {
  const { auth } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: qk.referrals,
    queryFn: () => api.referrals.mine(),
    refetchInterval: 15_000,
  });

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const link = useMemo(
    () => (auth ? `${origin}/register?ref=${encodeURIComponent(auth.user.email)}` : ""),
    [origin, auth],
  );

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const summary = data;

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
          <Users className="h-4 w-4" />
        </div>
        <h1 className="font-montserrat text-[22px] font-bold text-primary">Referrals</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Referrals" value={String(summary?.totalReferrals ?? 0)} icon={UserPlus} color="text-blue-400" />
        <StatCard label="Active Referrals" value={String(summary?.activeReferrals ?? 0)} icon={Users} color="text-emerald-400" />
        <StatCard label="Referral Earnings" value={fmt(summary?.totalReferralBonus ?? 0)} icon={Gift} color="text-amber-400" />
      </div>

      {/* Referral link */}
      <div className="mt-6 rounded-xl border bg-gradient-to-br from-brand-red/10 to-emerald-500/10 p-5">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-brand-red" />
          <h3 className="font-montserrat text-[16px] font-bold text-primary">Your Referral Link</h3>
        </div>
        <p className="mt-1 text-[13px] text-secondary">
          Share this link. When someone signs up through it, they&apos;re tied to you — and any plan
          with a referral bonus will pay out to your wallet on their first investment.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg border bg-page p-3">
          <input
            readOnly
            value={link}
            className="flex-1 bg-transparent text-[12px] text-secondary outline-none"
          />
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded-md bg-brand-red px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {summary?.referrerEmail && (
          <p className="mt-3 text-[12px] text-muted">
            You were referred by <span className="font-semibold text-primary">{summary.referrerEmail}</span>
          </p>
        )}
      </div>

      {/* Referred users table */}
      <div className="mt-6 rounded-xl border bg-card p-5">
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Your Referred Users</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Country</th>
                <th className="pb-3 font-medium">KYC</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!isLoading && (!summary?.referrals || summary.referrals.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <UserPlus className="mx-auto h-10 w-10 text-subtle" />
                    <p className="mt-3 font-medium text-primary">No referrals yet</p>
                    <p className="text-[12px] text-subtle">Share your link to start earning.</p>
                  </td>
                </tr>
              )}
              {summary?.referrals?.map((r: Referral) => (
                <tr key={r.id} className="border-b border">
                  <td className="py-3">
                    <p className="font-semibold text-primary">{r.fullName}</p>
                    <p className="text-[11px] text-subtle">{maskEmail(r.email)}</p>
                  </td>
                  <td className="py-3 text-secondary">{r.country ?? "—"}</td>
                  <td className="py-3">
                    {r.kycStatus === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : r.kycStatus === "PENDING" ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <ShieldAlert className="h-3.5 w-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {r.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                        <Ban className="h-3 w-3" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right text-muted text-[12px]">
                    {new Date(r.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { title: "Share your link", desc: "Send your unique link to friends via email, social, or messaging." },
          { title: "They register", desc: "When someone signs up through your link, they're tied to your account." },
          { title: "You earn", desc: "Plans with a referral bonus pay you the moment your referral invests." },
        ].map((step, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              <span className="text-[13px] font-bold">{i + 1}</span>
            </div>
            <h4 className="mt-3 font-montserrat text-[14px] font-semibold text-primary">{step.title}</h4>
            <p className="mt-1 text-[12px] text-muted">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 font-montserrat text-[20px] font-bold text-primary">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );
}

/** Hide the local-part of the referred user's email — admins see the whole thing, users only see a hint. */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(3, local.length - 2))}${domain}`;
}
