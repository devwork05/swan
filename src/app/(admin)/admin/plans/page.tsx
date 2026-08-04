"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderOpen,
  Plus,
  Loader2,
  X,
  Pencil,
  Trash2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { api, qk, ApiError, type InvestmentPlan } from "@/lib/api";
import { AdminCard, PageHeader, StatusPill, fmt } from "@/components/dashboard/AdminUI";

const INCREMENT_INTERVALS = [
  "Yearly on June 1st at 17:00",
  "Yearly",
  "Quarterly on 4th at 14:00",
  "Quarterly",
  "Every 6 Months on January 1st and July 1st",
  "Every 6 Months",
  "Last Day of the Month",
  "Twice Monthly",
  "Monthly",
  "Weekly on Monday at 8:00",
  "Weekly",
  "Twice Daily",
  "Daily",
  "Every 6 Hours",
  "Every 4 Hours",
  "Every 2 Hours",
  "Hourly",
  "Every 30 Minutes",
  "Every 15 Minutes",
  "Every 10 Minutes",
];

const planSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  minAmount: z.coerce.number().positive("Min amount must be positive"),
  maxAmount: z.coerce.number().positive("Max amount must be positive"),
  minReturn: z.coerce.number().positive("Min return must be positive"),
  maxReturn: z.coerce.number().positive("Max return must be positive"),
  duration: z
    .string()
    .regex(
      /^\d+\s+(Minute|Minutes|Hour|Hours|Day|Days|Week|Weeks|Month|Months|Year|Years)$/i,
      'Invalid duration. Example: "1 Day" or "3 Months"',
    ),
  incrementInterval: z.string().min(1, "Interval is required"),
  incrementType: z.enum(["PERCENTAGE", "FIXED"]),
  incrementAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const parts = val.split(",").map((a) => parseFloat(a.trim()));
      return parts.every((n) => !Number.isNaN(n) && n > 0);
    }, "Must be comma-separated positive numbers"),
  bonus: z.coerce.number().min(0, "Bonus cannot be negative"),
  referralBonus: z.coerce.number().min(0, "Referral bonus cannot be negative"),
  returnCapital: z.boolean(),
  active: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

const emptyPlan = (): PlanFormData => ({
  name: "",
  description: "",
  price: 100,
  minAmount: 100,
  maxAmount: 1000,
  minReturn: 3,
  maxReturn: 5,
  duration: "7 Days",
  incrementInterval: "Daily",
  incrementType: "PERCENTAGE",
  incrementAmount: "0.5, 0.7, 1.0",
  bonus: 0,
  referralBonus: 0,
  returnCapital: true,
  active: true,
});

const fromPlan = (p: InvestmentPlan): PlanFormData => ({
  name: p.name,
  description: p.description ?? "",
  price: p.price,
  minAmount: p.minAmount,
  maxAmount: p.maxAmount,
  minReturn: p.minReturn,
  maxReturn: p.maxReturn,
  duration: p.duration,
  incrementInterval: p.incrementInterval,
  incrementType: p.incrementType,
  incrementAmount: p.incrementAmount,
  bonus: p.bonus,
  referralBonus: p.referralBonus,
  returnCapital: p.returnCapital,
  active: p.active,
});

export default function AdminPlansPage() {
  const [tab, setTab] = useState<"plans" | "subscriptions">("plans");
  const [editing, setEditing] = useState<InvestmentPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<InvestmentPlan | null>(null);
  const [showAlert, setShowAlert] = useState(true);

  const qc = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem("plansAlertDismissed");
    if (stored) {
      try {
        const { ts } = JSON.parse(stored);
        if (Date.now() - ts < 24 * 60 * 60 * 1000) setShowAlert(false);
        else localStorage.removeItem("plansAlertDismissed");
      } catch {}
    }
  }, []);

  const dismissAlert = () => {
    localStorage.setItem("plansAlertDismissed", JSON.stringify({ ts: Date.now() }));
    setShowAlert(false);
  };

  const plansQuery = useQuery({
    queryKey: qk.admin.plans,
    queryFn: () => api.admin.plans.list(),
    refetchInterval: 15_000,
  });

  const subsQuery = useQuery({
    queryKey: qk.admin.subscriptions,
    queryFn: () => api.admin.plans.subscriptions(),
    refetchInterval: 10_000,
    enabled: tab === "subscriptions",
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.admin.plans.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.plans });
      qc.invalidateQueries({ queryKey: qk.plans });
      toast.success("Plan deleted");
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Plans"
        icon={FolderOpen}
        subtitle="Create and manage investment plans."
        right={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </button>
        }
      />

      {showAlert && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-500/40 bg-blue-500/10 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <p className="flex-1 text-[13px] text-secondary">
            Users can&apos;t invest in an <b>inactive</b> plan — but users already subscribed
            to an inactive plan keep earning ROI until it expires. Use inactive when you want a
            plan visible but temporarily un-purchasable.
          </p>
          <button onClick={dismissAlert} className="text-muted hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {(["plans", "subscriptions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium capitalize transition-colors ${
              tab === t ? "bg-brand-red text-white" : "border border text-muted hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <AdminCard className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border text-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Range</th>
                  <th className="pb-3 font-medium">ROI</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Interval</th>
                  <th className="pb-3 font-medium">Payouts</th>
                  <th className="pb-3 font-medium">Bonus / Ref</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {plansQuery.isLoading && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                    </td>
                  </tr>
                )}
                {plansQuery.data?.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-subtle">No plans yet.</td>
                  </tr>
                )}
                {plansQuery.data?.map((p) => (
                  <tr key={p.id} className="border-b border">
                    <td className="py-3">
                      <p className="font-semibold text-primary">{p.name}</p>
                      <p className="text-[11px] text-subtle truncate max-w-[240px]">{p.description}</p>
                    </td>
                    <td className="py-3 text-secondary">{fmt(p.minAmount)} – {fmt(p.maxAmount)}</td>
                    <td className="py-3 text-emerald-400">{p.minReturn}% – {p.maxReturn}%</td>
                    <td className="py-3 text-secondary">{p.duration}</td>
                    <td className="py-3 text-muted text-[11px]">{p.incrementInterval}</td>
                    <td className="py-3 text-muted text-[11px] font-mono">
                      {p.incrementAmount}{p.incrementType === "PERCENTAGE" ? "%" : "$"}
                    </td>
                    <td className="py-3 text-secondary">{fmt(p.bonus)} / {fmt(p.referralBonus)}</td>
                    <td className="py-3"><StatusPill status={p.active ? "ACTIVE" : "INACTIVE"} /></td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[12px] font-semibold text-secondary transition-colors hover:border-brand-red hover:text-brand-red"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {tab === "subscriptions" && (
        <AdminCard className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border text-muted">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Accrued</th>
                  <th className="pb-3 font-medium text-right">Expected</th>
                  <th className="pb-3 font-medium">Ends</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subsQuery.isLoading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                    </td>
                  </tr>
                )}
                {subsQuery.data?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-subtle">No subscriptions.</td>
                  </tr>
                )}
                {subsQuery.data?.map((s) => (
                  <tr key={s.id} className="border-b border">
                    <td className="py-3">
                      <p className="font-semibold text-primary">{s.userFullName}</p>
                      <p className="text-[11px] text-subtle">{s.userEmail}</p>
                    </td>
                    <td className="py-3 text-secondary">{s.planName}</td>
                    <td className="py-3 text-right font-semibold text-primary">{fmt(s.amount)}</td>
                    <td className="py-3 text-right text-emerald-400">{fmt(s.accruedProfit)}</td>
                    <td className="py-3 text-right text-secondary">{fmt(s.expectedReturn)}</td>
                    <td className="py-3 text-muted">{new Date(s.endsAt).toLocaleDateString()}</td>
                    <td className="py-3"><StatusPill status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {(editing || creating) && (
        <PlanModal
          initial={editing ? fromPlan(editing) : emptyPlan()}
          existingId={editing?.id ?? null}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}

      {deleting && (
        <DeleteDialog
          plan={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => removeMutation.mutate(deleting.id)}
          isDeleting={removeMutation.isPending}
        />
      )}
    </div>
  );
}

function PlanModal({
  initial,
  existingId,
  onClose,
}: {
  initial: PlanFormData;
  existingId: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!existingId;
  const [showDurationGuide, setShowDurationGuide] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema) as Resolver<PlanFormData>,
    defaultValues: initial,
  });

  const saveMutation = useMutation({
    mutationFn: (data: PlanFormData) =>
      isEdit ? api.admin.plans.update(existingId, data) : api.admin.plans.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.plans });
      qc.invalidateQueries({ queryKey: qk.plans });
      toast.success(isEdit ? "Plan updated" : "Plan created");
      onClose();
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
      for (const [field, msgs] of Object.entries(err.fieldErrors || {})) {
        if (Array.isArray(msgs) && msgs.length > 0) {
          setError(field as keyof PlanFormData, { type: "server", message: msgs[0] });
        }
      }
    },
  });

  const onSubmit: SubmitHandler<PlanFormData> = (data) => saveMutation.mutate(data);
  const incrementType = watch("incrementType");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">{isEdit ? "Edit Plan" : "New Plan"}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Plan name" error={errors.name?.message} className="sm:col-span-2">
            <input {...register("name")} className={inputCls(!!errors.name)} />
          </Field>

          <Field label="Description" error={errors.description?.message} help="Comprehensive overview of the plan's features and benefits." className="sm:col-span-2">
            <textarea {...register("description")} rows={2} className={inputCls(!!errors.description)} />
          </Field>

          <Field label="Plan price ($)" error={errors.price?.message} help="Headline number shown on the plan card.">
            <input type="number" step="any" {...register("price")} className={inputCls(!!errors.price)} />
          </Field>

          <Field label="Duration" error={errors.duration?.message} help={
            <button type="button" onClick={() => setShowDurationGuide(true)} className="inline-flex items-center gap-1 text-brand-red hover:underline">
              <Info className="h-3 w-3" /> View duration guide
            </button>
          }>
            <input {...register("duration")} placeholder='e.g. "1 Day", "3 Weeks", "6 Months"' className={inputCls(!!errors.duration)} />
          </Field>

          <Field label="Minimum investment ($)" error={errors.minAmount?.message} help="Smallest amount a user can invest.">
            <input type="number" step="any" {...register("minAmount")} className={inputCls(!!errors.minAmount)} />
          </Field>

          <Field label="Maximum investment ($)" error={errors.maxAmount?.message} help="Largest amount a user can invest.">
            <input type="number" step="any" {...register("maxAmount")} className={inputCls(!!errors.maxAmount)} />
          </Field>

          <Field label="Minimum return (%)" error={errors.minReturn?.message} help="Lower bound of expected ROI (informational only).">
            <input type="number" step="any" {...register("minReturn")} className={inputCls(!!errors.minReturn)} />
          </Field>

          <Field label="Maximum return (%)" error={errors.maxReturn?.message} help="Upper bound of expected ROI (informational only).">
            <input type="number" step="any" {...register("maxReturn")} className={inputCls(!!errors.maxReturn)} />
          </Field>

          <Field label="Gift bonus ($)" error={errors.bonus?.message} help="Optional bonus credited when a user buys this plan.">
            <input type="number" step="any" {...register("bonus")} className={inputCls(!!errors.bonus)} />
          </Field>

          <Field label="Referral bonus ($)" error={errors.referralBonus?.message} help="One-time bonus to the referrer when a referred user invests.">
            <input type="number" step="any" {...register("referralBonus")} className={inputCls(!!errors.referralBonus)} />
          </Field>

          <Field label="Increment interval" error={errors.incrementInterval?.message} help="How often the system credits profit to the user's wallet.">
            <select {...register("incrementInterval")} className={inputCls(!!errors.incrementInterval)}>
              {INCREMENT_INTERVALS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </Field>

          <Field label="Increment type" error={errors.incrementType?.message} help="Is each payout a percent of principal or a fixed amount?">
            <select
              {...register("incrementType")}
              onChange={(e) => setValue("incrementType", e.target.value as "PERCENTAGE" | "FIXED", { shouldDirty: true })}
              className={inputCls(!!errors.incrementType)}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </select>
          </Field>

          <Field
            label={`Increment amount(s) (${incrementType === "PERCENTAGE" ? "%" : "$"})`}
            error={errors.incrementAmount?.message}
            help='Single value or comma-separated list — the system randomly picks one per tick. Example: "2.1, 4, 5.2, 7.3".'
            className="sm:col-span-2"
          >
            <input {...register("incrementAmount")} className={inputCls(!!errors.incrementAmount)} />
          </Field>

          <label className="flex items-center gap-2 text-[13px] text-secondary">
            <input type="checkbox" {...register("returnCapital")} className="h-4 w-4 accent-brand-red" />
            Return capital at maturity
          </label>
          <label className="flex items-center gap-2 text-[13px] text-secondary">
            <input type="checkbox" {...register("active")} className="h-4 w-4 accent-brand-red" />
            Active (users can invest)
          </label>

          <div className="sm:col-span-2 flex justify-end gap-3 border-t border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-[13px] font-semibold text-secondary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending || (isEdit && !isDirty)}
              className="inline-flex items-center gap-2 rounded-md bg-brand-red px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>

      {showDurationGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setShowDurationGuide(false)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-montserrat text-[16px] font-bold text-primary">Duration Format Guide</h3>
                <p className="text-[12px] text-muted">How to format investment duration values.</p>
              </div>
              <button onClick={() => setShowDurationGuide(false)} className="text-muted hover:text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-4 text-[13px]">
              <div>
                <p className="font-medium text-primary">Format rules</p>
                <ul className="mt-1 list-disc pl-5 text-muted">
                  <li>Number, space, unit (never write out the number).</li>
                  <li>Capitalize the first letter of the unit.</li>
                  <li>Singular or plural both accepted.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-primary">Examples</p>
                <div className="mt-1 rounded-md bg-page p-3 font-mono text-[12px] text-secondary">
                  1 Day{"\n"}3 Weeks{"\n"}48 Hours{"\n"}6 Months{"\n"}1 Year
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDurationGuide(false)}
              className="mt-5 w-full rounded-md bg-slate-700 py-2 text-[13px] font-semibold text-white hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteDialog({
  plan,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  plan: InvestmentPlan;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl border border-red-500/40 bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-montserrat text-[16px] font-bold">Confirm deletion</h3>
        </div>
        <p className="mt-3 text-[13px] text-secondary">
          Deleting <b>&quot;{plan.name}&quot;</b> also removes every user subscription tied to it.
          This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-[13px] font-semibold text-secondary hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-md bg-red-500/80 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  help,
  className,
  children,
}: {
  label: string;
  error?: string;
  help?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className="text-[12px] font-medium text-secondary">{label}</label>
      {children}
      {help && !error && <p className="text-[11px] text-subtle">{help}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red ${
    hasError ? "border-red-500/60" : "border"
  }`;
}
