"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Users as UsersIcon,
  User as UserIcon,
  Shield,
  Monitor,
  Settings as SettingsIcon,
  LayoutDashboard,
  Loader2,
  Trash2,
  KeyRound,
  UserCog,
  Eraser,
  Ban,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  api,
  qk,
  ApiError,
  saveAuth,
  type AdminUser,
  type KycStatus,
  type Session,
  type UpdateUserRequest,
} from "@/lib/api";
import { AdminCard, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

type TabKey = "overview" | "profile" | "security" | "sessions" | "referrals" | "account";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "security", label: "Security", icon: Shield },
  { key: "sessions", label: "Sessions", icon: Monitor },
  { key: "referrals", label: "Referrals", icon: UsersIcon },
  { key: "account", label: "Account", icon: SettingsIcon },
];

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [tab, setTab] = useState<TabKey>("overview");

  const { data: user, isLoading } = useQuery({
    queryKey: qk.admin.user(id),
    queryFn: () => api.admin.users.get(id),
    refetchInterval: 10_000,
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to users
      </Link>
      <div className="mt-2">
        <PageHeader title={user.fullName} icon={UserIcon} subtitle={user.email} />
      </div>

      <SummaryCard user={user} />

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${
              tab === t.key ? "bg-brand-red text-white" : "border border text-muted hover:text-primary"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "overview" && <OverviewTab user={user} />}
        {tab === "profile" && <ProfileTab user={user} />}
        {tab === "security" && <SecurityTab user={user} />}
        {tab === "sessions" && <SessionsTab userId={user.id} />}
        {tab === "referrals" && <ReferralsTab userId={user.id} />}
        {tab === "account" && <AccountTab user={user} />}
      </div>
    </div>
  );
}

/* ---------- Summary ---------- */

function SummaryCard({ user }: { user: AdminUser }) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-4">
      <StatBlock label="Balance" value={fmt(user.balance)} color="text-primary" />
      <StatBlock label="Total profit" value={fmt(user.totalProfit)} color="text-emerald-400" />
      <StatBlock label="Referral bonus" value={fmt(user.referralBonus)} color="text-blue-400" />
      <StatBlock label="Referrals" value={String(user.referralCount)} color="text-amber-400" sub={user.referrerEmail ? `Referred by ${user.referrerEmail}` : "No referrer"} />
    </div>
  );
}

function StatBlock({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-montserrat text-[20px] font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-subtle">{sub}</p>}
    </div>
  );
}

/* ---------- Overview tab ---------- */

function OverviewTab({ user }: { user: AdminUser }) {
  return (
    <AdminCard>
      <h3 className="font-montserrat text-[16px] font-bold text-primary">Account overview</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="Full name" value={user.fullName} />
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role} />
        <Row
          label="KYC"
          value={
            user.kycStatus === "VERIFIED" ? "Verified" : user.kycStatus === "PENDING" ? "Pending" : "None"
          }
          hint={user.kycVerifiedAt ? `on ${new Date(user.kycVerifiedAt).toLocaleDateString()}` : undefined}
        />
        <Row label="Phone" value={user.phone ?? "—"} />
        <Row label="Country" value={user.country ?? "—"} />
        <Row label="Joined" value={new Date(user.createdAt).toLocaleString()} />
        <Row label="Last updated" value={new Date(user.updatedAt).toLocaleString()} />
        <Row label="Total deposited" value={fmt(user.totalDeposited)} />
        <Row label="Total withdrawn" value={fmt(user.totalWithdrawn)} />
        <Row label="Withdrawals" value={user.withdrawStatus ? "Enabled" : "Blocked"} />
        <Row label="Suspended" value={user.suspended ? "Yes" : "No"} />
      </dl>
    </AdminCard>
  );
}

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border/60 pb-2">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-right text-[13px] font-semibold text-primary">
        {value}
        {hint && <span className="ml-2 text-[11px] font-normal text-subtle">{hint}</span>}
      </span>
    </div>
  );
}

/* ---------- Profile tab ---------- */

const profileSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  country: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileTab({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileForm>,
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      country: user.country ?? "",
      dob: user.dob ?? "",
      address: user.address ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      api.admin.users.update(user.id, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        country: data.country || undefined,
        dob: data.dob || undefined,
        address: data.address || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.user(user.id) });
      qc.invalidateQueries({ queryKey: qk.admin.users });
      toast.success("Profile saved");
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
      for (const [field, msgs] of Object.entries(err.fieldErrors ?? {})) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          setError(field as keyof ProfileForm, { type: "server", message: msgs[0] });
        }
      }
    },
  });

  const onSubmit: SubmitHandler<ProfileForm> = (data) => mutation.mutate(data);

  return (
    <AdminCard>
      <h3 className="font-montserrat text-[16px] font-bold text-primary">Profile settings</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls(!!errors.fullName)} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register("email")} className={inputCls(!!errors.email)} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls(!!errors.phone)} />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <input {...register("country")} className={inputCls(!!errors.country)} />
        </Field>
        <Field label="Date of birth" error={errors.dob?.message}>
          <input type="date" {...register("dob")} className={inputCls(!!errors.dob)} />
        </Field>
        <Field label="Address" error={errors.address?.message} className="sm:col-span-2">
          <textarea {...register("address")} rows={2} className={inputCls(!!errors.address)} />
        </Field>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="inline-flex items-center gap-2 rounded-md bg-brand-red px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </button>
        </div>
      </form>
    </AdminCard>
  );
}

/* ---------- Security tab ---------- */

const passwordSchema = z
  .object({
    password: z.string().min(6, "Min 6 characters"),
    confirm: z.string().min(6, "Confirm password"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords must match" });
type PasswordForm = z.infer<typeof passwordSchema>;

function SecurityTab({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema) as Resolver<PasswordForm>,
    defaultValues: { password: "", confirm: "" },
  });

  const pwMutation = useMutation({
    mutationFn: (data: PasswordForm) => api.admin.users.resetPassword(user.id, data.password),
    onSuccess: () => {
      toast.success("Password reset. All the user's sessions were revoked.");
      qc.invalidateQueries({ queryKey: qk.admin.userSessions(user.id) });
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const twoFaMutation = useMutation({
    mutationFn: (enabled: boolean) => api.admin.users.update(user.id, { twoFaEnabled: enabled }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.user(user.id) });
      toast.success("2FA updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminCard>
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Reset password</h3>
        <p className="mt-1 text-[12px] text-subtle">All the user&apos;s sessions will be revoked on save.</p>
        <form onSubmit={handleSubmit((d) => pwMutation.mutate(d))} className="mt-4 space-y-3">
          <Field label="New password" error={errors.password?.message}>
            <input type="password" {...register("password")} className={inputCls(!!errors.password)} />
          </Field>
          <Field label="Confirm password" error={errors.confirm?.message}>
            <input type="password" {...register("confirm")} className={inputCls(!!errors.confirm)} />
          </Field>
          <button
            type="submit"
            disabled={pwMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {pwMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <KeyRound className="h-4 w-4" />
            Set new password
          </button>
        </form>
      </AdminCard>

      <AdminCard>
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Two-factor authentication</h3>
        <p className="mt-1 text-[12px] text-subtle">
          Toggling here only reflects the flag on the account — user still needs to configure their authenticator app.
        </p>
        <button
          onClick={() => twoFaMutation.mutate(!user.twoFaEnabled)}
          disabled={twoFaMutation.isPending}
          className={`mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold text-primary disabled:opacity-60 ${
            user.twoFaEnabled ? "bg-slate-700 hover:bg-slate-600" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {twoFaMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {user.twoFaEnabled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {user.twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </AdminCard>
    </div>
  );
}

/* ---------- Sessions tab ---------- */

function SessionsTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: qk.admin.userSessions(userId),
    queryFn: () => api.admin.users.sessions(userId),
    refetchInterval: 15_000,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => api.admin.users.revokeSession(userId, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.userSessions(userId) });
      toast.success("Session revoked");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminCard>
      <h3 className="font-montserrat text-[16px] font-bold text-primary">Active sessions ({sessions.length})</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border text-muted">
              <th className="pb-3 font-medium">Device</th>
              <th className="pb-3 font-medium">IP</th>
              <th className="pb-3 font-medium">Started</th>
              <th className="pb-3 font-medium">Last active</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
            )}
            {!isLoading && sessions.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-subtle">No active sessions.</td></tr>
            )}
            {sessions.map((s: Session) => (
              <tr key={s.id} className="border-b border">
                <td className="py-3 text-secondary">
                  <span title={s.userAgent ?? ""}>{shortenUA(s.userAgent)}</span>
                </td>
                <td className="py-3 font-mono text-[12px] text-muted">{s.ipAddress ?? "—"}</td>
                <td className="py-3 text-muted text-[12px]">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="py-3 text-muted text-[12px]">{new Date(s.lastActive).toLocaleString()}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => revokeMutation.mutate(s.id)}
                    disabled={revokeMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

function shortenUA(ua: string | null | undefined): string {
  if (!ua) return "Unknown";
  const m = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  const os = ua.match(/(Mac OS X|Windows NT [\d.]+|Linux|iPhone OS|Android [\d.]+)/);
  return `${m?.[1] ?? "Browser"} · ${os?.[1] ?? "Unknown OS"}`;
}

/* ---------- Referrals tab ---------- */

function ReferralsTab({ userId }: { userId: string }) {
  const { data: refs = [], isLoading } = useQuery({
    queryKey: qk.admin.userReferrals(userId),
    queryFn: () => api.admin.users.referrals(userId),
    refetchInterval: 30_000,
  });

  return (
    <AdminCard>
      <h3 className="font-montserrat text-[16px] font-bold text-primary">Referred users ({refs.length})</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border text-muted">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Country</th>
              <th className="pb-3 font-medium text-right">Balance</th>
              <th className="pb-3 font-medium text-right">Deposited</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" /></td></tr>
            )}
            {!isLoading && refs.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-subtle">No referrals yet.</td></tr>
            )}
            {refs.map((r) => (
              <tr key={r.id} className="border-b border">
                <td className="py-3">
                  <Link href={`/admin/users/${r.id}`} className="font-semibold text-primary hover:text-brand-red">{r.fullName}</Link>
                  <p className="text-[11px] text-subtle">{r.email}</p>
                </td>
                <td className="py-3 text-secondary">{r.country ?? "—"}</td>
                <td className="py-3 text-right font-semibold text-primary">{fmt(r.balance)}</td>
                <td className="py-3 text-right text-secondary">{fmt(r.totalDeposited)}</td>
                <td className="py-3 text-muted text-[12px]">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

/* ---------- Account tab ---------- */

const CLEAR_TARGETS = [
  { key: "BALANCE", label: "Balance" },
  { key: "BONUS", label: "Bonus" },
  { key: "REFERRAL", label: "Referral bonus" },
  { key: "PROFIT", label: "Total profit" },
  { key: "HISTORY", label: "Transaction history" },
] as const;

function AccountTab({ user }: { user: AdminUser }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [showClear, setShowClear] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (patch: UpdateUserRequest) => api.admin.users.update(user.id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.user(user.id) });
      qc.invalidateQueries({ queryKey: qk.admin.users });
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kycMutation = useMutation({
    mutationFn: (status: KycStatus) => api.admin.users.update(user.id, { kycStatus: status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.user(user.id) });
      qc.invalidateQueries({ queryKey: qk.admin.users });
      toast.success("KYC status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const impersonateMutation = useMutation({
    mutationFn: () => api.admin.users.impersonate(user.id),
    onSuccess: (auth) => {
      const currentToken = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");
      if (currentToken && currentUser) {
        localStorage.setItem("adminAuthBackup", JSON.stringify({ token: currentToken, user: JSON.parse(currentUser) }));
      }
      saveAuth(auth);
      toast.success(`Impersonating ${user.email}`);
      router.push("/dashboard");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.users.remove(user.id),
    onSuccess: () => {
      toast.success("User deleted");
      router.push("/admin/users");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminCard>
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Account controls</h3>
        <div className="mt-4 space-y-2">
          <ToggleRow
            label="Active (not suspended)"
            checked={!user.suspended}
            onChange={(v) => toggleMutation.mutate({ suspended: !v })}
          />
          <ToggleRow
            label="Can withdraw"
            checked={user.withdrawStatus}
            onChange={(v) => toggleMutation.mutate({ withdrawStatus: v })}
          />
          <ToggleRow
            label="Hide balance in UI"
            checked={user.hideBalance}
            onChange={(v) => toggleMutation.mutate({ hideBalance: v })}
          />
          <ToggleRow
            label="Two-factor enabled"
            checked={user.twoFaEnabled}
            onChange={(v) => toggleMutation.mutate({ twoFaEnabled: v })}
          />
        </div>

        <div className="mt-6">
          <p className="text-[12px] font-semibold text-muted uppercase tracking-wide">KYC status</p>
          <div className="mt-2 flex gap-2">
            {(["NONE", "PENDING", "VERIFIED"] as KycStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => kycMutation.mutate(s)}
                disabled={kycMutation.isPending}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                  user.kycStatus === s
                    ? s === "VERIFIED"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : s === "PENDING"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-500/20 text-secondary"
                    : "border border text-muted hover:border-brand-red hover:text-brand-red"
                }`}
              >
                {s === "VERIFIED" ? <ShieldCheck className="h-3.5 w-3.5" /> : s === "PENDING" ? <ShieldAlert className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                {s}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="font-montserrat text-[16px] font-bold text-primary">Sensitive actions</h3>
        <p className="mt-1 text-[12px] text-subtle">Nothing here can be undone.</p>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => impersonateMutation.mutate()}
            disabled={impersonateMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-[13px] font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-60"
          >
            {impersonateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <UserCog className="h-4 w-4" />
            Get access (impersonate)
          </button>

          <button
            onClick={() => setShowClear(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-[13px] font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <Eraser className="h-4 w-4" />
            Clear account…
          </button>

          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete account…
          </button>
        </div>
      </AdminCard>

      {showClear && <ClearDialog user={user} onClose={() => setShowClear(false)} />}
      {showDelete && (
        <DeleteDialog
          user={user}
          onClose={() => setShowDelete(false)}
          onConfirm={() => deleteMutation.mutate()}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border bg-page px-3 py-3">
      <span className="text-[13px] text-secondary">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-red"
      />
    </label>
  );
}

function ClearDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);

  const clearMutation = useMutation({
    mutationFn: () => api.admin.users.clear(user.id, selected),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.user(user.id) });
      qc.invalidateQueries({ queryKey: qk.admin.userTransactions(user.id) });
      toast.success("Account cleared");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (k: string) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Eraser className="h-5 w-5" />
            <h3 className="font-montserrat text-[16px] font-bold">Clear account</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-[13px] text-secondary">
          Pick what to reset on <b>{user.fullName}</b>. This can&apos;t be undone.
        </p>
        <div className="mt-4 space-y-2">
          {CLEAR_TARGETS.map((t) => (
            <label key={t.key} className="flex cursor-pointer items-center gap-2 rounded-md bg-page p-3">
              <input
                type="checkbox"
                checked={selected.includes(t.key)}
                onChange={() => toggle(t.key)}
                className="h-4 w-4 accent-brand-red"
              />
              <span className="text-[13px] text-secondary">{t.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] font-semibold text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={selected.length === 0 || clearMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-amber-500/80 px-4 py-2 text-[13px] font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {clearMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Eraser className="h-3.5 w-3.5" />
            Clear selected
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({
  user,
  onClose,
  onConfirm,
  isDeleting,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const matches = confirmText === user.email;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-red-500/40 bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-montserrat text-[16px] font-bold">Delete account</h3>
        </div>
        <p className="mt-3 text-[13px] text-secondary">
          This deletes <b>{user.fullName}</b>&apos;s account, wallet, sessions and every transaction. Type the user&apos;s email to confirm.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={user.email}
          className="mt-4 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-red-500"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] font-semibold text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches || isDeleting}
            className="inline-flex items-center gap-2 rounded-md bg-red-500/80 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trash2 className="h-3.5 w-3.5" />
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared field helpers ---------- */

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className="text-[12px] font-medium text-secondary">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red ${
    hasError ? "border-red-500/60" : "border"
  }`;
}
