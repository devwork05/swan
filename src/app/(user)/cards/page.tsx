"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Lock,
  Wallet,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import { api, qk, type Card, type CardStatus, type CardType } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

const STATUS: Record<CardStatus, { label: string; text: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING_PAYMENT: { label: "Pending Payment", text: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  PAYMENT_PENDING: { label: "Payment Pending", text: "text-blue-500", bg: "bg-blue-500/10", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", text: "text-purple-500", bg: "bg-purple-500/10", icon: Shield },
  APPROVED: { label: "Approved", text: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle },
  REJECTED: { label: "Rejected", text: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
  ISSUED: { label: "Issued — Activate", text: "text-indigo-500", bg: "bg-indigo-500/10", icon: CreditCard },
  ACTIVATED: { label: "Active", text: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  BLOCKED: { label: "Blocked", text: "text-slate-500", bg: "bg-slate-500/10", icon: Lock },
};

function fmtDate(s?: string | null) {
  if (!s) return "N/A";
  const d = new Date(s);
  return d.toLocaleDateString();
}

function fmtCardNumber(n?: string | null) {
  if (!n) return "**** **** **** ****";
  return n.replace(/(\d{4})/g, "$1 ").trim();
}
function maskCardNumber(n?: string | null) {
  if (!n) return "**** **** **** ****";
  return "**** **** **** " + n.slice(-4);
}

export default function UserCardsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: qk.cardSettings,
    queryFn: () => api.cards.settings(),
  });

  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: qk.myCards,
    queryFn: () => api.cards.list(),
  });

  const [selected, setSelected] = useState<CardType | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [showDetails, setShowDetails] = useState<Card | null>(null);
  const [txHash, setTxHash] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [pin, setPin] = useState("");
  const [copied, setCopied] = useState(false);
  const [revealPan, setRevealPan] = useState(false);
  const [revealCvv, setRevealCvv] = useState(false);

  /**
   * Atomic "request card + submit payment hash" flow. Chained inside a single
   * mutation so we never end up with a card pending payment but no hash on it,
   * and so we don't depend on a stale `cards` list to find the new card ID.
   */
  const submitMut = useMutation({
    mutationFn: async () => {
      const created = await api.cards.request({
        type: selected!,
        shippingAddress: selected === "PHYSICAL" ? shippingAddress.trim() : undefined,
        termsAccepted: true,
      });
      return api.cards.submitPayment(created.id, txHash.trim());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myCards });
      toast.success("Payment submitted — your card is now under review.");
      setShowPayment(false);
      setTxHash("");
      setShippingAddress("");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activateMut = useMutation({
    mutationFn: (input: { id: number; pin: string }) => api.cards.activate(input.id, input.pin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myCards });
      toast.success("Card activated!");
      setShowActivate(false);
      setPin("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied");
  };

  const openApprovedCard = (c: Card) => {
    setShowDetails(c);
    setRevealPan(false);
    setRevealCvv(false);
  };

  if (loadingSettings || loadingCards) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!settings?.enableCardFeature) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <XCircle className="h-7 w-7" />
        </div>
        <h3 className="font-montserrat text-[18px] font-bold text-primary">Card Feature Disabled</h3>
        <p className="mt-2 text-[13px] text-muted">The card feature is currently unavailable. Please check back later.</p>
      </div>
    );
  }

  const pendingCard = cards.find((c) =>
    ["PENDING_PAYMENT", "PAYMENT_PENDING", "UNDER_REVIEW", "APPROVED"].includes(c.status),
  );

  const issuedCard = cards.find((c) => c.status === "ISSUED");

  return (
    <div className="mx-auto max-w-[1200px]">
      <div>
        <h1 className="font-montserrat text-[24px] font-bold text-primary sm:text-[28px]">Crypto Debit Cards</h1>
        <p className="text-[13px] text-muted">Get your virtual or physical crypto debit card.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-montserrat text-[16px] font-bold text-primary">Choose Card Type</h2>
              <p className="text-[12px] text-muted">Select the type of card you want.</p>
            </div>

            <fieldset className="grid gap-4 sm:grid-cols-2" aria-label="Card type">
              <CardTypeOption
                icon={Smartphone}
                title="Virtual Card"
                subtitle="Instant digital card for online purchases."
                price={settings.virtualCardFee}
                active={selected === "VIRTUAL"}
                onClick={() => setSelected("VIRTUAL")}
              />
              <CardTypeOption
                icon={CreditCard}
                title="Physical Card"
                subtitle="Physical card shipped to your address."
                price={settings.physicalCardFee}
                active={selected === "PHYSICAL"}
                onClick={() => setSelected("PHYSICAL")}
              />
            </fieldset>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Perk icon={CheckCircle} label="No monthly fees" />
              <Perk icon={Wallet} label="Crypto payments" />
              <Perk icon={Lock} label="Secure & insured" />
            </div>

            <button
              disabled={!selected || !!pendingCard}
              onClick={() => setShowPayment(true)}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-brand-red to-brand-darkred py-3 text-[14px] font-bold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingCard ? "Application pending — waiting on approval" : "Continue to Payment"}
            </button>
            {pendingCard && (
              <p className="mt-2 text-center text-[12px] text-amber-500">
                You already have an application in progress.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-montserrat text-[15px] font-bold text-primary">Card Features</h3>
            <ul className="mt-3 space-y-2 text-[13px] text-secondary">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> No foreign transaction fees</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 24/7 customer support</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Real-time transaction alerts</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Free ATM withdrawals</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-montserrat text-[16px] font-bold text-primary">Your Cards</h2>

          {cards.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-muted">
                <CreditCard className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[13px] text-muted">No cards yet.</p>
            </div>
          ) : (
            cards.map((c) => {
              const st = STATUS[c.status];
              const Icon = st.icon;
              const isApproved = c.status === "APPROVED" || c.status === "ACTIVATED" || c.status === "ISSUED";
              return (
                <div key={c.id} className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${c.status === "REJECTED" ? "border-red-500/30" : ""}`}>
                  <div className="bg-gradient-to-br from-brand-red/10 to-brand-darkred/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase text-muted">{c.type}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.text}`}>
                        <Icon className="h-3 w-3" />
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[15px] tracking-widest text-primary">
                      {maskCardNumber(c.cardNumber)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <div>
                        <p className="text-muted">Card holder</p>
                        <p className="font-semibold text-primary">{user?.fullName?.toUpperCase() ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted">Expires</p>
                        <p className="font-semibold text-primary">
                          {c.expiryDate
                            ? new Date(c.expiryDate).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" })
                            : "**/**"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px]">
                      {c.status === "REJECTED" && c.rejectionReason && (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="max-w-[140px] truncate">{c.rejectionReason}</span>
                        </span>
                      )}
                      {c.primary && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-500">Primary</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isApproved && c.cardNumber && (
                        <button
                          onClick={() => openApprovedCard(c)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold text-secondary hover:border-brand-red hover:text-brand-red"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      )}
                      {c.status === "ISSUED" && (
                        <button
                          onClick={() => setShowActivate(true)}
                          className="inline-flex items-center gap-1 rounded-md bg-brand-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-darkred"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Combined payment dialog — collects shipping (if physical) + tx hash and submits everything in one go. */}
      {showPayment && (
        <Modal
          title="Complete Payment"
          subtitle={`Send funds to pay for your ${selected?.toLowerCase()} card`}
          onClose={() => setShowPayment(false)}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-elevated p-4">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Card type</span>
                <span className="font-semibold text-primary">{selected}</span>
              </div>
              <div className="mt-1 flex justify-between text-[13px]">
                <span className="text-muted">Fee</span>
                <span className="font-bold text-brand-red">
                  ${(selected === "VIRTUAL" ? settings.virtualCardFee : settings.physicalCardFee).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[12px] text-muted">Send payment to this address</p>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-page p-3">
                <code className="flex-1 break-all font-mono text-[12px] text-primary">
                  {settings.cardPaymentAddress || "Admin has not configured a payment address yet"}
                </code>
                {settings.cardPaymentAddress && (
                  <button onClick={() => handleCopy(settings.cardPaymentAddress!)} className="text-muted hover:text-primary">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {settings.cardPaymentAddress && (
                <div className="mt-3 flex justify-center">
                  <img
                    alt="Payment QR"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(settings.cardPaymentAddress)}`}
                    className="rounded-md border bg-white p-2"
                  />
                </div>
              )}
            </div>

            {selected === "PHYSICAL" && (
              <div>
                <label className="text-[12px] text-muted">Shipping address *</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={2}
                  placeholder="Street, city, state, ZIP, country"
                  className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
                />
                <p className="mt-1 text-[11px] text-muted">Where should we ship your card?</p>
              </div>
            )}

            <div>
              <label className="text-[12px] text-muted">Transaction hash *</label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x…"
                className="mt-1 w-full rounded-md border bg-page px-3 py-2 font-mono text-[13px] text-primary outline-none focus:border-brand-red"
              />
              <p className="mt-1 text-[11px] text-muted">
                After sending the payment, paste the transaction hash from your wallet here.
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-[12px] text-blue-500">
              <div className="flex items-center gap-1 font-semibold">
                <Wallet className="h-4 w-4" />
                Send only the exact amount to avoid delays.
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPayment(false)} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
                Cancel
              </button>
              <button
                onClick={() => submitMut.mutate()}
                disabled={
                  submitMut.isPending
                  || !settings.cardPaymentAddress
                  || !txHash.trim()
                  || (selected === "PHYSICAL" && !shippingAddress.trim())
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
              >
                {submitMut.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                Submit Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Activate dialog */}
      {showActivate && (
        <Modal title="Activate Your Card" subtitle="Enter the 4-digit PIN we emailed you" onClose={() => setShowActivate(false)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-elevated p-3">
              <p className="text-[11px] text-muted">Card number</p>
              <p className="font-mono font-bold text-primary">
                **** **** **** {(issuedCard?.cardNumber ?? "XXXX").slice(-4)}
              </p>
            </div>
            <div>
              <label className="text-[12px] text-muted">4-digit PIN *</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="mt-1 w-full rounded-md border bg-page px-3 py-3 text-center font-mono text-2xl tracking-[0.6em] text-primary outline-none focus:border-brand-red"
              />
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-[12px] text-emerald-500">
              🔒 Your PIN is stored hashed. We never keep it in plain text.
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowActivate(false)} className="rounded-md border px-4 py-2 text-[13px] text-secondary hover:text-primary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!issuedCard) return toast.error("No issued card found");
                  activateMut.mutate({ id: issuedCard.id, pin });
                }}
                disabled={activateMut.isPending || pin.length !== 4 || !issuedCard}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
              >
                {activateMut.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                Activate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Card details modal */}
      {showDetails && (
        <Modal title="Card Details" onClose={() => setShowDetails(null)}>
          <div className="space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-brand-red to-brand-darkred p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-10 items-center justify-center rounded bg-yellow-300/90 shadow-inner" />
                <p className="font-mono text-[11px] opacity-80">{showDetails.type}</p>
              </div>
              <div className="mt-6">
                <p className="text-[11px] opacity-70">Card number</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-[17px] tracking-widest">
                    {revealPan ? fmtCardNumber(showDetails.cardNumber) : maskCardNumber(showDetails.cardNumber)}
                  </p>
                  <button onClick={() => setRevealPan((v) => !v)} className="rounded p-1 hover:bg-white/20">
                    {revealPan ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[11px] opacity-70">Card holder</p>
                  <p className="text-[13px] font-semibold uppercase">{user?.fullName ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] opacity-70">Expires</p>
                  <p className="font-mono text-[13px]">
                    {showDetails.expiryDate
                      ? new Date(showDetails.expiryDate).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" })
                      : "**/**"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-elevated p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted">CVV</p>
                  <p className="font-mono text-[18px] text-primary">
                    {revealCvv ? (showDetails.cvv ?? "***") : "***"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRevealCvv((v) => !v)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[12px] text-secondary hover:text-primary">
                    {revealCvv ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Show</>}
                  </button>
                  {showDetails.cvv && (
                    <button onClick={() => handleCopy(showDetails.cvv!)} className="rounded-md border px-3 py-1.5 text-[12px] text-secondary hover:text-primary">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-[13px]">
              <InfoRow label="Card type" value={showDetails.type} />
              <InfoRow label="Status" value={STATUS[showDetails.status].label} />
              <InfoRow label="Issued" value={fmtDate(showDetails.issuedAt)} />
              {showDetails.activatedAt && <InfoRow label="Activated" value={fmtDate(showDetails.activatedAt)} />}
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[12px] text-amber-600 dark:text-amber-400">
              Never share your card number, CVV, or PIN with anyone. Support will never ask for them.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function CardTypeOption({
  icon: Icon,
  title,
  subtitle,
  price,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  price: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <label
      className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-colors ${
        active ? "border-brand-red bg-brand-red/5" : "border-border hover:border-brand-red/50"
      }`}
    >
      <input
        type="radio"
        name="card-type"
        checked={active}
        onChange={onClick}
        className="sr-only"
      />

      {/* Radio dot */}
      <span
        aria-hidden
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          active ? "border-brand-red" : "border-border"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full transition-transform ${
            active ? "scale-100 bg-brand-red" : "scale-0 bg-transparent"
          }`}
        />
      </span>

      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
            <Icon className="h-4 w-4" />
          </div>
          <p className="font-semibold text-primary">{title}</p>
        </div>
        <p className="mt-1.5 text-[12px] text-muted">{subtitle}</p>
        <p className="mt-3 font-montserrat text-[20px] font-bold text-brand-red">
          ${price?.toLocaleString?.() ?? price}
        </p>
      </div>
    </label>
  );
}

function Perk({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-elevated p-3 text-center">
      <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[12px] font-semibold text-primary">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-none">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
