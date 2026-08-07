"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Search,
  Clock,
  Users,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Package,
  Trash2,
  Eye,
  Copy,
  Check,
  Loader2,
  MoreVertical,
  User as UserIcon,
  Calendar,
  Shield,
  X,
} from "lucide-react";
import { api, qk, type Card, type CardStatus } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";

const STATUS_STYLE: Record<CardStatus, { label: string; badge: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", badge: "bg-yellow-500/15 text-yellow-500" },
  PAYMENT_PENDING: { label: "Payment Pending", badge: "bg-blue-500/15 text-blue-500" },
  UNDER_REVIEW: { label: "Under Review", badge: "bg-purple-500/15 text-purple-500" },
  APPROVED: { label: "Approved", badge: "bg-emerald-500/15 text-emerald-500" },
  REJECTED: { label: "Rejected", badge: "bg-red-500/15 text-red-500" },
  ISSUED: { label: "Issued", badge: "bg-indigo-500/15 text-indigo-500" },
  ACTIVATED: { label: "Active", badge: "bg-green-500/15 text-green-500" },
  BLOCKED: { label: "Blocked", badge: "bg-slate-500/15 text-slate-500" },
};

const STATUS_FILTERS: { key: "all" | CardStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "ISSUED", label: "Issued" },
  { key: "ACTIVATED", label: "Active" },
  { key: "REJECTED", label: "Rejected" },
];

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export default function AdminCardsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | CardStatus>("all");
  const [detail, setDetail] = useState<Card | null>(null);
  const [approveOpen, setApproveOpen] = useState<Card | null>(null);
  const [rejectOpen, setRejectOpen] = useState<Card | null>(null);
  const [issueOpen, setIssueOpen] = useState<Card | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<Card | null>(null);

  const { data: cardsData, isLoading } = useQuery({
    queryKey: qk.admin.cards(search, status),
    queryFn: () => api.admin.cards.list({ search, status, page: 0, size: 100 }),
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: qk.admin.cardStats,
    queryFn: () => api.admin.cards.stats(),
    refetchInterval: 30_000,
  });

  const cards = cardsData?.content ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "cards"] });
  };

  const confirmMut = useMutation({
    mutationFn: (id: number) => api.admin.cards.confirmPayment(id),
    onSuccess: () => {
      invalidate();
      toast.success("Payment confirmed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMut = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => api.admin.cards.approve(id, notes),
    onSuccess: () => {
      invalidate();
      setApproveOpen(null);
      toast.success("Card approved — activation email sent");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.admin.cards.reject(id, reason),
    onSuccess: () => {
      invalidate();
      setRejectOpen(null);
      toast.success("Card rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const issueMut = useMutation({
    mutationFn: ({ id, tracking }: { id: number; tracking?: string }) => api.admin.cards.issue(id, tracking),
    onSuccess: () => {
      invalidate();
      setIssueOpen(null);
      toast.success("Card marked as issued");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.admin.cards.remove(id),
    onSuccess: () => {
      invalidate();
      setDeleteOpen(null);
      toast.success("Card deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Card Management"
        icon={CreditCard}
        subtitle="Manage card applications, approvals, and issuance."
      />

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Cards" value={stats?.totalCards ?? 0} sub="All applications" icon={CreditCard} tint="text-brand-red" />
        <StatCard label="Pending Review" value={stats?.underReview ?? 0} sub="Awaiting action" icon={Clock} tint="text-amber-400" />
        <StatCard label="Active Cards" value={stats?.activated ?? 0} sub="Currently active" icon={Users} tint="text-emerald-400" />
        <StatCard label="Rejected" value={stats?.rejected ?? 0} sub="Declined" icon={XCircle} tint="text-red-400" />
      </div>

      {/* Search + status filters */}
      <AdminCard className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-montserrat text-[16px] font-bold text-primary">Card Applications</h2>
            <p className="text-[12px] text-muted">Review and manage all card applications.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or card number…"
              className="w-full rounded-md border bg-page py-2 pl-9 pr-3 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                status === f.key ? "bg-brand-red text-white" : "border bg-page text-secondary hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b text-muted">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Applied</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!isLoading && cards.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-subtle">
                    No card applications match your filters.
                  </td>
                </tr>
              )}
              {cards.map((c) => (
                <CardRow
                  key={c.id}
                  card={c}
                  onView={() => setDetail(c)}
                  onConfirm={() => confirmMut.mutate(c.id)}
                  onApprove={() => setApproveOpen(c)}
                  onReject={() => setRejectOpen(c)}
                  onIssue={() => setIssueOpen(c)}
                  onDelete={() => setDeleteOpen(c)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {detail && <DetailsModal card={detail} onClose={() => setDetail(null)} />}
      {approveOpen && (
        <ApproveModal
          card={approveOpen}
          onClose={() => setApproveOpen(null)}
          onConfirm={(notes) => approveMut.mutate({ id: approveOpen.id, notes })}
          pending={approveMut.isPending}
        />
      )}
      {rejectOpen && (
        <RejectModal
          card={rejectOpen}
          onClose={() => setRejectOpen(null)}
          onConfirm={(reason) => rejectMut.mutate({ id: rejectOpen.id, reason })}
          pending={rejectMut.isPending}
        />
      )}
      {issueOpen && (
        <IssueModal
          card={issueOpen}
          onClose={() => setIssueOpen(null)}
          onConfirm={(tracking) => issueMut.mutate({ id: issueOpen.id, tracking })}
          pending={issueMut.isPending}
        />
      )}
      {deleteOpen && (
        <ConfirmModal
          title="Delete Card Application"
          body={`Delete ${deleteOpen.userName}'s card application? This cannot be undone.`}
          confirmText="Delete"
          destructive
          onClose={() => setDeleteOpen(null)}
          onConfirm={() => deleteMut.mutate(deleteOpen.id)}
          pending={deleteMut.isPending}
        />
      )}
    </div>
  );
}

/* ---------- Row + actions menu ---------- */

function CardRow({
  card,
  onView,
  onConfirm,
  onApprove,
  onReject,
  onIssue,
  onDelete,
}: {
  card: Card;
  onView: () => void;
  onConfirm: () => void;
  onApprove: () => void;
  onReject: () => void;
  onIssue: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const stats = STATUS_STYLE[card.status];

  const actions = useMemo(() => {
    switch (card.status) {
      case "PAYMENT_PENDING":
        return [{ label: "Confirm Payment", icon: Shield, run: onConfirm }];
      case "UNDER_REVIEW":
        return [
          { label: "Approve", icon: CheckCircle, run: onApprove },
          { label: "Reject", icon: XCircle, run: onReject, destructive: true },
        ];
      case "APPROVED":
        return card.type === "PHYSICAL"
          ? [{ label: "Issue Card", icon: Package, run: onIssue }]
          : [];
      default:
        return [];
    }
  }, [card.status, card.type, onApprove, onConfirm, onIssue, onReject]);

  return (
    <tr className="border-b align-top">
      <td className="py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-primary">{card.userName}</p>
            <p className="text-[11px] text-muted">{card.userEmail}</p>
          </div>
        </div>
      </td>
      <td className="py-3">
        <span className="rounded-md border bg-page px-2 py-0.5 text-[11px] font-semibold text-secondary">
          {card.type === "VIRTUAL" ? "Virtual" : "Physical"}
        </span>
      </td>
      <td className="py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${stats.badge}`}>
          {stats.label}
        </span>
      </td>
      <td className="py-3 text-secondary">
        <span className="inline-flex items-center gap-1 text-[12px]">
          <Calendar className="h-3 w-3" />
          {fmtDate(card.createdAt)}
        </span>
      </td>
      <td className="py-3">
        {card.paymentTransactionHash ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
            Paid
          </span>
        ) : (
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold text-muted">Pending</span>
        )}
      </td>
      <td className="py-3">
        <div className="flex items-center justify-end">
          <ActionMenu
            open={open}
            setOpen={setOpen}
            items={[
              { icon: Eye, label: "View Details", onClick: onView },
              ...actions.map((a) => ({
                icon: a.icon,
                label: a.label,
                onClick: a.run,
                destructive: "destructive" in a && a.destructive,
                divideAbove: false,
              })),
              { icon: Trash2, label: "Delete", onClick: onDelete, destructive: true, divideAbove: true },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

/**
 * Renders the row-action menu into a portal so it can't be clipped by the
 * parent `overflow-x-auto` on the table. Position is calculated from the
 * trigger button's bounding rect on every open + on resize/scroll.
 */
type MenuAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  divideAbove?: boolean;
};

function ActionMenu({
  open,
  setOpen,
  items,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  items: MenuAction[];
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-primary"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && mounted && pos &&
        createPortal(
          <>
            <button
              className="fixed inset-0 z-[60] cursor-default"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              role="menu"
              className="fixed z-[70] w-52 overflow-hidden rounded-lg border bg-card shadow-xl"
              style={{ top: pos.top, right: pos.right }}
            >
              {items.map((it, i) => (
                <div key={`${it.label}-${i}`}>
                  {it.divideAbove && <div className="border-t" />}
                  <MenuItem
                    icon={it.icon}
                    label={it.label}
                    destructive={it.destructive}
                    onClick={() => {
                      setOpen(false);
                      it.onClick();
                    }}
                  />
                </div>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-elevated ${
        destructive ? "text-red-500" : "text-secondary hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ---------- Stat card ---------- */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${tint}`} />
      </div>
      <p className="mt-1 font-montserrat text-[24px] font-bold text-primary">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[11px] text-subtle">{sub}</p>
    </div>
  );
}

/* ---------- Modals ---------- */

function ModalShell({ title, subtitle, onClose, children, wide }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className={`max-h-[92vh] w-full ${wide ? "max-w-3xl" : "max-w-md"} overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-montserrat text-[18px] font-bold text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function ApproveModal({
  card,
  onClose,
  onConfirm,
  pending,
}: {
  card: Card;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  pending: boolean;
}) {
  const [notes, setNotes] = useState("");
  return (
    <ModalShell
      title="Approve Card Application"
      subtitle={`${card.userName} — ${card.type === "VIRTUAL" ? "Virtual" : "Physical"} card`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-[12px] text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle className="h-4 w-4" />
            Ready for Approval
          </div>
          <p className="mt-1">This generates the card number, CVV, and expiry. The user receives an email with activation instructions.</p>
        </div>
        <div>
          <label className="text-[12px] text-muted">Admin notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes to include in the approval email…"
            className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes.trim() || undefined)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Approve Card
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function RejectModal({
  card,
  onClose,
  onConfirm,
  pending,
}: {
  card: Card;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <ModalShell title="Reject Card Application" subtitle={card.userName} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-[12px] text-red-500">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Rejection Warning
          </div>
          <p className="mt-1">The user will receive an email with the reason below.</p>
        </div>
        <div>
          <label className="text-[12px] text-muted">Rejection reason *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Give a clear reason the user can act on…"
            className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-red-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={pending || !reason.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject Application
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function IssueModal({
  card,
  onClose,
  onConfirm,
  pending,
}: {
  card: Card;
  onClose: () => void;
  onConfirm: (tracking?: string) => void;
  pending: boolean;
}) {
  const [tracking, setTracking] = useState("");
  return (
    <ModalShell title="Issue Physical Card" subtitle={card.userName} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-[12px] text-blue-500">
          <div className="flex items-center gap-2 font-semibold">
            <Package className="h-4 w-4" />
            Ready for Shipping
          </div>
          <p className="mt-1">Mark this card as shipped to the address below.</p>
        </div>
        <div>
          <label className="text-[12px] text-muted">Shipping address</label>
          <div className="mt-1 rounded-md border bg-page px-3 py-2 text-[13px] text-secondary">
            {card.shippingAddress || "No address provided"}
          </div>
        </div>
        <div>
          <label className="text-[12px] text-muted">Tracking number (optional)</label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Carrier tracking ID"
            className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(tracking.trim() || undefined)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark as Issued
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  body,
  confirmText,
  onClose,
  onConfirm,
  pending,
  destructive,
}: {
  title: string;
  body: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  destructive?: boolean;
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="text-[13px] text-secondary">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60 ${
            destructive ? "bg-red-500 hover:bg-red-600" : "bg-brand-red hover:bg-brand-darkred"
          }`}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmText}
        </button>
      </div>
    </ModalShell>
  );
}

function DetailsModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: qk.admin.card(card.id),
    queryFn: () => api.admin.cards.get(card.id),
  });

  const full = data ?? card;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    toast.success("Copied");
  };

  return (
    <ModalShell title="Card Application Details" subtitle={`ID: ${card.id} · ${card.userName}`} onClose={onClose} wide>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[12px] text-muted">User</p>
              <div className="rounded-lg bg-elevated p-3">
                <p className="font-semibold text-primary">{full.userName}</p>
                <p className="text-[12px] text-muted">{full.userEmail}</p>
                {full.userPhone && <p className="text-[12px] text-muted">{full.userPhone}</p>}
              </div>

              <p className="mt-4 text-[12px] text-muted">Application</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-[11px] text-muted">Type</p>
                  <p className="font-semibold text-primary">{full.type === "VIRTUAL" ? "Virtual" : "Physical"}</p>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-[11px] text-muted">Status</p>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[full.status].badge}`}>
                    {STATUS_STYLE[full.status].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[12px] text-muted">Shipping address</p>
              <div className="rounded-lg bg-elevated p-3 text-[13px] text-secondary">
                {full.shippingAddress || "—"}
              </div>

              {full.paymentTransactionHash && (
                <>
                  <p className="mt-4 text-[12px] text-muted">Payment transaction</p>
                  <div className="flex items-center gap-2 rounded-lg bg-elevated p-3">
                    <code className="flex-1 break-all font-mono text-[11px] text-primary">
                      {full.paymentTransactionHash}
                    </code>
                    <button
                      onClick={() => copy(full.paymentTransactionHash!, "tx")}
                      className="text-muted hover:text-primary"
                    >
                      {copiedKey === "tx" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {full.cardNumber && (
            <div>
              <p className="text-[12px] text-muted">Card details</p>
              <div className="mt-1 grid gap-2 md:grid-cols-3">
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-[11px] text-muted">Card number</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-primary">{full.cardNumber}</p>
                    <button onClick={() => copy(full.cardNumber!, "pan")} className="text-muted hover:text-primary">
                      {copiedKey === "pan" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-[11px] text-muted">CVV</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-primary">{full.cvv}</p>
                    {full.cvv && (
                      <button onClick={() => copy(full.cvv!, "cvv")} className="text-muted hover:text-primary">
                        {copiedKey === "cvv" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-elevated p-3">
                  <p className="text-[11px] text-muted">Expiry</p>
                  <p className="font-bold text-primary">{fmtDate(full.expiryDate)}</p>
                </div>
              </div>
            </div>
          )}

          {full.pin && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-amber-500">PIN (hashed)</p>
                  <code className="font-mono text-[11px] text-secondary">{full.pin}</code>
                </div>
                <Shield className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          )}

          <div>
            <p className="text-[12px] text-muted">Timeline</p>
            <div className="mt-2 space-y-2">
              <TimelineRow color="bg-emerald-500" label="Application submitted" when={full.createdAt} />
              {full.issuedAt && <TimelineRow color="bg-blue-500" label="Approved & generated" when={full.issuedAt} />}
              {full.activatedAt && <TimelineRow color="bg-green-500" label="Card activated" when={full.activatedAt} />}
              {full.blockedAt && <TimelineRow color="bg-slate-500" label="Card blocked" when={full.blockedAt} />}
            </div>
          </div>

          {full.rejectionReason && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <p className="text-[12px] text-red-500">Rejection reason</p>
              <p className="mt-1 text-[13px] text-red-500">{full.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}

function TimelineRow({ color, label, when }: { color: string; label: string; when: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <div>
        <p className="text-[13px] font-medium text-primary">{label}</p>
        <p className="text-[11px] text-muted">{fmtDate(when)}</p>
      </div>
    </div>
  );
}
