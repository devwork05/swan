"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Loader2,
  Building2,
  DollarSign,
  Gift,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Mail,
  Cloud,
  MessageCircle,
} from "lucide-react";
import { api, qk, type PlatformSettings, type UpdateSettingsRequest } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";
import { FileUploader } from "@/components/FileUploader";

type Tab =
  | "general"
  | "financial"
  | "bonus"
  | "kyc"
  | "branding"
  | "email"
  | "cloudinary"
  | "livechat";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "general", label: "General", icon: Building2 },
  { key: "financial", label: "Financial", icon: DollarSign },
  { key: "bonus", label: "Bonus", icon: Gift },
  { key: "kyc", label: "KYC", icon: ShieldCheck },
  { key: "branding", label: "Branding", icon: ImageIcon },
  { key: "email", label: "Email", icon: Mail },
  { key: "cloudinary", label: "Cloudinary", icon: Cloud },
  { key: "livechat", label: "Live chat", icon: MessageCircle },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: qk.admin.settings,
    queryFn: () => api.admin.settings.get(),
  });

  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const patch = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const saveMutation = useMutation({
    mutationFn: () => api.admin.settings.update(form as UpdateSettingsRequest),
    onSuccess: () => {
      setOk(true);
      setErr(null);
      qc.invalidateQueries({ queryKey: qk.admin.settings });
      qc.invalidateQueries({ queryKey: qk.publicSettings });
      setTimeout(() => setOk(false), 2000);
    },
    onError: (e: Error) => setErr(e.message),
  });

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const cloudinaryReady = !!(form.cloudinaryCloudName && form.cloudinaryApiKey && form.cloudinaryApiSecret);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader title="Platform Settings" icon={Settings} subtitle="Configuration that applies across the whole platform." />

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

      <AdminCard className="mt-4">
        {tab === "general" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldText label="Company name" value={form.companyName ?? ""} onChange={(v) => patch("companyName", v)} />
            <FieldText label="Contact email" value={form.contactEmail ?? ""} onChange={(v) => patch("contactEmail", v)} />
            <FieldText label="Contact phone" value={form.contactPhone ?? ""} onChange={(v) => patch("contactPhone", v)} />
            <FieldText label="WhatsApp number" value={form.whatsappNumber ?? ""} onChange={(v) => patch("whatsappNumber", v)} />
            <FieldText label="Timezone" value={form.timezone ?? "UTC"} onChange={(v) => patch("timezone", v)} />
            <div className="sm:col-span-2">
              <label className="text-[12px] text-muted">Office address</label>
              <textarea
                value={form.address ?? ""}
                onChange={(e) => patch("address", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
              />
            </div>
          </div>
        )}

        {tab === "financial" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Withdrawals enabled" checked={form.withdrawEnabled} onChange={(v) => patch("withdrawEnabled", v)} />
            <Toggle label="Peer transfers enabled" checked={form.transferEnabled} onChange={(v) => patch("transferEnabled", v)} />
            <FieldNumber label="Minimum deposit" value={form.minDeposit} onChange={(v) => patch("minDeposit", v)} />
            <FieldNumber label="Minimum withdrawal" value={form.minWithdraw} onChange={(v) => patch("minWithdraw", v)} />
            <FieldNumber label="Minimum transfer" value={form.minTransfer} onChange={(v) => patch("minTransfer", v)} />
            <FieldNumber label="Transfer fee %" value={form.transferPercent} onChange={(v) => patch("transferPercent", v)} step="0.01" />
          </div>
        )}

        {tab === "bonus" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Welcome bonus on register" checked={form.welcomeBonusEnabled} onChange={(v) => patch("welcomeBonusEnabled", v)} />
            <FieldNumber label="Welcome bonus amount" value={form.welcomeBonusAmount} onChange={(v) => patch("welcomeBonusAmount", v)} />
          </div>
        )}

        {tab === "kyc" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="KYC available" checked={form.verifyKyc} onChange={(v) => patch("verifyKyc", v)} />
            <Toggle label="Require KYC on registration" checked={form.kycOnRegistration} onChange={(v) => patch("kycOnRegistration", v)} />
            <Toggle label="Require KYC before withdrawal" checked={form.kycRequiredForWithdrawal} onChange={(v) => patch("kycRequiredForWithdrawal", v)} />
            <Toggle label="Require email verification" checked={form.verifyEmail} onChange={(v) => patch("verifyEmail", v)} />
            <FieldNumber label="KYC verification fee" value={form.kycFee} onChange={(v) => patch("kycFee", v)} />
          </div>
        )}

        {tab === "branding" && (
          <div className="space-y-4">
            {!cloudinaryReady && (
              <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-[12px] text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                Uploads require Cloudinary. Configure it in the <b>Cloudinary</b> tab first.
              </div>
            )}
            <FileUploader
              label="Favicon"
              value={form.siteFaviconUrl}
              onChange={(url) => patch("siteFaviconUrl", url)}
              folder="branding/favicon"
            />
            <FileUploader
              label="Dark-mode logo"
              value={form.siteDarkLogoUrl}
              onChange={(url) => patch("siteDarkLogoUrl", url)}
              folder="branding/logo-dark"
            />
            <FileUploader
              label="Light-mode logo"
              value={form.siteLightLogoUrl}
              onChange={(url) => patch("siteLightLogoUrl", url)}
              folder="branding/logo-light"
            />
          </div>
        )}

        {tab === "email" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldText label="SMTP host" value={form.mailHost ?? ""} onChange={(v) => patch("mailHost", v)} />
            <FieldNumber label="SMTP port" value={form.mailPort ?? 587} onChange={(v) => patch("mailPort", v)} />
            <FieldText label="Username" value={form.mailUsername ?? ""} onChange={(v) => patch("mailUsername", v)} />
            <FieldPassword label="Password" value={form.mailPassword ?? ""} onChange={(v) => patch("mailPassword", v)} />
            <div>
              <label className="text-[12px] text-muted">Encryption</label>
              <select
                value={form.mailEncryption ?? ""}
                onChange={(e) => patch("mailEncryption", e.target.value)}
                className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
              >
                <option value="">None</option>
                <option value="tls">STARTTLS</option>
                <option value="ssl">SSL</option>
              </select>
            </div>
            <FieldText label="From address" value={form.mailFromAddress ?? ""} onChange={(v) => patch("mailFromAddress", v)} />
            <FieldText label="From name" value={form.mailFromName ?? ""} onChange={(v) => patch("mailFromName", v)} />
          </div>
        )}

        {tab === "cloudinary" && (
          <div className="space-y-3">
            <div className="rounded-md bg-blue-500/10 p-3 text-[12px] text-blue-300">
              These credentials power every file upload on the platform (logos, gateway logos, payment proofs).
              Find them in Cloudinary → Dashboard → Product Environment Credentials.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldText label="Cloud name" value={form.cloudinaryCloudName ?? ""} onChange={(v) => patch("cloudinaryCloudName", v)} />
              <FieldText label="API key" value={form.cloudinaryApiKey ?? ""} onChange={(v) => patch("cloudinaryApiKey", v)} />
              <div className="sm:col-span-2">
                <FieldPassword label="API secret" value={form.cloudinaryApiSecret ?? ""} onChange={(v) => patch("cloudinaryApiSecret", v)} />
              </div>
            </div>
          </div>
        )}

        {tab === "livechat" && (
          <div className="space-y-3">
            <div className="rounded-md bg-blue-500/10 p-3 text-[12px] text-blue-300">
              Paste the entire{" "}
              <code className="rounded bg-black/30 px-1 py-0.5 font-mono">&lt;script&gt;</code> tag from your chat vendor
              (Smartsupp, Tawk.to, Crisp, etc.). It&apos;s injected on every user-facing page.
            </div>
            <div>
              <label className="text-[12px] text-muted">Live-chat script</label>
              <textarea
                value={form.liveChatScript ?? ""}
                onChange={(e) => patch("liveChatScript", e.target.value)}
                rows={10}
                placeholder="<script>...</script>"
                spellCheck={false}
                className="mt-1 w-full rounded-md border bg-page px-3 py-2 font-mono text-[12px] text-primary outline-none focus:border-brand-red"
              />
            </div>
          </div>
        )}

        {err && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[13px] text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {err}
          </div>
        )}
        {ok && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-[13px] text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Settings saved.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border pt-4">
          <p className="text-[11px] text-subtle">
            Last cron: {form.lastCron ? new Date(form.lastCron).toLocaleString() : "—"} · Updated{" "}
            {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "—"}
          </p>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand-red px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </AdminCard>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
      />
    </div>
  );
}

function FieldPassword({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <div className="relative mt-1">
        <input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border bg-page px-3 py-2 pr-16 text-[13px] text-primary outline-none focus:border-brand-red"
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[11px] text-muted hover:text-primary"
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="text-[12px] text-muted">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
      />
    </div>
  );
}

function Toggle({
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
