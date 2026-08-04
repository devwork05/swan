"use client";

import { useState } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User as UserIcon,
  Lock,
  Shield,
  Monitor,
  IdCard,
  Camera,
  Loader2,
  Ban,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Info,
} from "lucide-react";
import COUNTRIES from "@/data/countries";
import { api, qk, ApiError, type Profile, type Session } from "@/lib/api";

type TabKey = "profile" | "security" | "sessions" | "kyc";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "security", label: "Security", icon: Lock },
  { key: "sessions", label: "Sessions", icon: Monitor },
  { key: "kyc", label: "KYC", icon: IdCard },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<TabKey>("profile");

  const { data: profile, isLoading } = useQuery({
    queryKey: qk.profile,
    queryFn: () => api.profile.get(),
  });

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[300px_1fr]">
      <ProfileSidebar profile={profile} tab={tab} setTab={setTab} />
      <div>
        {tab === "profile" && <ProfileTab profile={profile} />}
        {tab === "security" && <SecurityTab profile={profile} />}
        {tab === "sessions" && <SessionsTab />}
        {tab === "kyc" && <KycTab profile={profile} />}
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */

function ProfileSidebar({
  profile,
  tab,
  setTab,
}: {
  profile: Profile;
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  const qc = useQueryClient();
  const avatarMutation = useMutation({
    mutationFn: (url: string) => api.profile.update({ avatarUrl: url }),
    onSuccess: (p) => {
      qc.setQueryData(qk.profile, p);
      toast.success("Avatar updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const initials = profile.fullName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-brand-red/30 bg-elevated">
            {profile.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-montserrat text-[36px] font-bold text-brand-red">{initials}</span>
            )}
          </div>
          {/* Camera overlay — opens native file picker and uploads to Cloudinary. */}
          <label
            className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-brand-red text-white shadow-lg transition-colors hover:bg-brand-darkred"
            title="Upload avatar"
          >
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const { url } = await api.uploads.file(file, "avatars");
                  avatarMutation.mutate(url);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
        <h2 className="mt-4 text-center font-montserrat text-[16px] font-semibold text-primary">
          {profile.fullName}
        </h2>
        <p className="text-[12px] text-muted">{profile.email}</p>
        <div className="mt-2 flex gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              profile.role === "ADMIN" ? "bg-brand-red/10 text-brand-red" : "bg-slate-500/10 text-secondary"
            }`}
          >
            {profile.role}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              profile.kycStatus === "VERIFIED"
                ? "bg-emerald-500/10 text-emerald-500"
                : profile.kycStatus === "PENDING"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-slate-500/10 text-secondary"
            }`}
          >
            KYC: {profile.kycStatus}
          </span>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[13.5px] font-medium transition-colors ${
              tab === t.key
                ? "bg-brand-red text-white shadow-md"
                : "text-secondary hover:bg-elevated hover:text-primary"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ---------- Profile tab ---------- */

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  phone: z.string().optional(),
  country: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileTab({ profile }: { profile: Profile }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileForm>,
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone ?? "",
      country: profile.country ?? "",
      dob: profile.dob ?? "",
      address: profile.address ?? "",
    },
  });

  const save = useMutation({
    mutationFn: (data: ProfileForm) =>
      api.profile.update({
        fullName: data.fullName,
        phone: data.phone || undefined,
        country: data.country || undefined,
        dob: data.dob || undefined,
        address: data.address || undefined,
      }),
    onSuccess: (p) => {
      qc.setQueryData(qk.profile, p);
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

  const onSubmit: SubmitHandler<ProfileForm> = (d) => save.mutate(d);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-montserrat text-[20px] font-bold text-primary">Personal information</h2>
      <p className="mt-1 text-[13px] text-muted">
        Your email and role are managed by support — reach out if either needs to change.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls(!!errors.fullName)} />
        </Field>

        <Field label="Phone">
          <input {...register("phone")} placeholder="+1 555 123 4567" className={inputCls(false)} />
        </Field>

        <Field label="Country">
          <select {...register("country")} className={inputCls(false)}>
            <option value="">Choose your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date of birth">
          <input type="date" {...register("dob")} className={inputCls(false)} />
        </Field>

        <Field label="Address" className="sm:col-span-2">
          <textarea {...register("address")} rows={2} className={inputCls(false)} />
        </Field>

        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Member since" value={new Date(profile.createdAt).toLocaleDateString()} />
        </div>

        <div className="sm:col-span-2 mt-2 flex justify-end">
          <button
            type="submit"
            disabled={save.isPending || !isDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-darkred px-6 py-3 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Security tab ---------- */

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });
type PasswordForm = z.infer<typeof passwordSchema>;

function SecurityTab({ profile }: { profile: Profile }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema) as Resolver<PasswordForm>,
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const changePassword = useMutation({
    mutationFn: (d: PasswordForm) =>
      api.profile.changePassword({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
    onSuccess: () => {
      toast.success("Password changed");
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle2fa = useMutation({
    mutationFn: (enabled: boolean) => api.profile.update({ twoFaEnabled: enabled }),
    onSuccess: (p) => {
      qc.setQueryData(qk.profile, p);
      toast.success(p.twoFaEnabled ? "Two-factor enabled" : "Two-factor disabled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-montserrat text-[20px] font-bold text-primary">Change password</h2>
        <p className="mt-1 text-[13px] text-muted">
          Must be at least 8 characters, include an uppercase letter and a number.
        </p>
        <form onSubmit={handleSubmit((d) => changePassword.mutate(d))} className="mt-6 grid gap-4">
          <Field label="Current password" error={errors.currentPassword?.message}>
            <input type="password" {...register("currentPassword")} className={inputCls(!!errors.currentPassword)} />
          </Field>
          <Field label="New password" error={errors.newPassword?.message}>
            <input type="password" {...register("newPassword")} className={inputCls(!!errors.newPassword)} />
          </Field>
          <Field label="Confirm new password" error={errors.confirm?.message}>
            <input type="password" {...register("confirm")} className={inputCls(!!errors.confirm)} />
          </Field>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred disabled:opacity-60"
            >
              {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Change password
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-montserrat text-[20px] font-bold text-primary">
              <Shield className="h-5 w-5 text-brand-red" />
              Two-factor authentication
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Add an extra layer of security. This flags 2FA on your account — configure your authenticator app separately.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
              profile.twoFaEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-secondary"
            }`}
          >
            {profile.twoFaEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {profile.twoFaEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <button
          onClick={() => toggle2fa.mutate(!profile.twoFaEnabled)}
          disabled={toggle2fa.isPending}
          className={`mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-60 ${
            profile.twoFaEnabled ? "bg-slate-700 hover:bg-slate-600" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {toggle2fa.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {profile.twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Sessions tab ---------- */

function SessionsTab() {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: qk.sessions,
    queryFn: () => api.sessions.list(),
    refetchInterval: 20_000,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => api.sessions.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.sessions });
      toast.success("Session revoked");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-montserrat text-[20px] font-bold text-primary">Active sessions</h2>
      <p className="mt-1 text-[13px] text-muted">
        These are the devices logged into your account. Revoking a session immediately signs it out.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading && sessions.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
          </div>
        )}
        {!isLoading && sessions.length === 0 && (
          <p className="py-6 text-center text-[13px] text-muted">No active sessions.</p>
        )}
        {sessions.map((s: Session) => (
          <div
            key={s.id}
            className={`flex flex-col gap-3 rounded-xl border bg-page/40 p-4 sm:flex-row sm:items-center sm:justify-between ${
              s.current ? "border-brand-red/40 bg-brand-red/5" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated">
                <Monitor className="h-5 w-5 text-brand-red" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-primary">
                  {shortenUA(s.userAgent)}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-semibold text-brand-red">
                      This device
                    </span>
                  )}
                </p>
                <p className="font-mono text-[11px] text-muted">{s.ipAddress ?? "unknown IP"}</p>
                <p className="text-[11px] text-subtle">
                  Started {new Date(s.createdAt).toLocaleString()} · Last active {new Date(s.lastActive).toLocaleString()}
                </p>
              </div>
            </div>
            {!s.current && (
              <button
                onClick={() => revoke.mutate(s.id)}
                disabled={revoke.isPending && revoke.variables === s.id}
                className="inline-flex items-center gap-1 self-end rounded-lg bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50 sm:self-auto"
              >
                <Ban className="h-3.5 w-3.5" />
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function shortenUA(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  const os = ua.match(/(Mac OS X|Windows NT [\d.]+|Linux|iPhone OS|Android [\d.]+)/);
  return `${browser?.[1] ?? "Browser"} · ${os?.[1] ?? "Unknown OS"}`;
}

/* ---------- KYC tab ---------- */

function KycTab({ profile }: { profile: Profile }) {
  const statusMeta =
    profile.kycStatus === "VERIFIED"
      ? {
          label: "Verified",
          Icon: ShieldCheck,
          tone: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          msg: "You're fully verified — every feature is unlocked.",
        }
      : profile.kycStatus === "PENDING"
        ? {
            label: "Pending review",
            Icon: ShieldAlert,
            tone: "bg-amber-500/10 text-amber-500 border-amber-500/30",
            msg: "Your documents are being reviewed. This usually takes 24–48 hours.",
          }
        : {
            label: "Not started",
            Icon: Info,
            tone: "bg-slate-500/10 text-secondary border-slate-500/30",
            msg: "Verify your identity to unlock higher withdrawal limits and full account access.",
          };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-montserrat text-[20px] font-bold text-primary">Identity verification (KYC)</h2>

      <div className={`mt-6 flex items-start gap-4 rounded-xl border p-5 ${statusMeta.tone}`}>
        <statusMeta.Icon className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">{statusMeta.label}</p>
          <p className="mt-1 text-[13px] opacity-80">{statusMeta.msg}</p>
          {profile.kycVerifiedAt && (
            <p className="mt-2 text-[11px] opacity-70">
              Verified {new Date(profile.kycVerifiedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {profile.kycStatus !== "VERIFIED" && (
        <div className="mt-6 rounded-xl border bg-page/40 p-5">
          <h3 className="text-[15px] font-semibold text-primary">What you&apos;ll need</h3>
          <ul className="mt-3 space-y-2 text-[13px] text-secondary">
            <li>• A government-issued photo ID (passport, driver&apos;s licence, or national ID)</li>
            <li>• A recent proof of address (utility bill, bank statement — dated within 3 months)</li>
            <li>• A selfie holding the ID</li>
          </ul>
          <p className="mt-4 text-[12px] text-muted">
            KYC submission form is on the way. In the meantime, contact support to submit documents manually.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- Field helpers ---------- */

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
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-secondary">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full cursor-not-allowed rounded-lg border bg-elevated px-3 py-2 text-[13px] text-muted"
      />
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border bg-card px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red ${
    hasError ? "border-red-500/60" : ""
  }`;
}
