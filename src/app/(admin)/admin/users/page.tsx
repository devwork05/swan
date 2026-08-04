"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Loader2, ShieldCheck, ShieldAlert, Ban } from "lucide-react";
import { api, qk } from "@/lib/api";
import { AdminCard, PageHeader, fmt } from "@/components/dashboard/AdminUI";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: qk.admin.users,
    queryFn: () => api.admin.users.list(),
    refetchInterval: 10_000,
  });

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let out = users;
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          (u.phone ?? "").toLowerCase().includes(q) ||
          (u.country ?? "").toLowerCase().includes(q),
      );
    }
    if (from) {
      const t = new Date(from).getTime();
      out = out.filter((u) => new Date(u.createdAt).getTime() >= t);
    }
    if (to) {
      const t = new Date(to).getTime() + 24 * 60 * 60 * 1000;
      out = out.filter((u) => new Date(u.createdAt).getTime() <= t);
    }
    return out;
  }, [users, search, from, to]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader title="Users" icon={Users} subtitle="Manage registered users and their wallet." />

      <AdminCard className="mt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-montserrat text-[16px] font-bold text-primary">All Users ({users.length})</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-subtle">From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-md border bg-page px-2 py-1.5 text-[12px] text-secondary outline-none focus:border-brand-red"
              />
              <span className="text-[11px] text-subtle">To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-md border bg-page px-2 py-1.5 text-[12px] text-secondary outline-none focus:border-brand-red"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / email / phone / country"
                className="w-full rounded-lg border bg-page py-2 pl-9 pr-4 text-[13px] text-secondary outline-none focus:border-brand-red sm:w-[300px]"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Country</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">KYC</th>
                <th className="pb-3 font-medium">Refs</th>
                <th className="pb-3 font-medium text-right">Balance</th>
                <th className="pb-3 font-medium text-right">Profit</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-subtle">No users match.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border">
                  <td className="py-3">
                    <p className="font-semibold text-primary">
                      {u.fullName}
                      {u.suspended && (
                        <span title="Suspended" className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                          <Ban className="h-3 w-3" />
                          Suspended
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-subtle">{u.email}</p>
                  </td>
                  <td className="py-3 text-secondary">{u.phone ?? "—"}</td>
                  <td className="py-3 text-secondary">{u.country ?? "—"}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.role === "ADMIN" ? "bg-brand-red/10 text-brand-red" : "bg-slate-500/10 text-secondary"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    {u.kycStatus === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : u.kycStatus === "PENDING" ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <ShieldAlert className="h-3.5 w-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="text-subtle">None</span>
                    )}
                  </td>
                  <td className="py-3 text-secondary">{u.referralCount}</td>
                  <td className="py-3 text-right font-semibold text-primary">{fmt(u.balance)}</td>
                  <td className="py-3 text-right text-emerald-400">{fmt(u.totalProfit)}</td>
                  <td className="py-3 text-muted text-[12px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="inline-flex rounded-md border px-3 py-1.5 text-[12px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
