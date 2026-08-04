"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, qk } from "@/lib/api";
import { FileUploader } from "@/components/FileUploader";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const methodId = searchParams.get("methodId") ?? "";
  const amount = searchParams.get("amount") ?? "";

  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trxHash, setTrxHash] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const { data: methods = [] } = useQuery({
    queryKey: qk.depositMethods,
    queryFn: () => api.depositMethods.list(),
    staleTime: 60_000,
  });
  const method = methods.find((m) => String(m.id) === methodId) ?? null;

  const address = method?.address ?? "";
  const network = method?.network ?? method?.symbol ?? "";

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createDeposit = useMutation({
    mutationFn: () =>
      api.deposits.create({
        depositMethodId: String(method!.id),
        amount: Number(amount),
        trxHash: trxHash.trim() || undefined,
        proofUrl: proofUrl || undefined,
      }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Payment submitted");
      qc.invalidateQueries({ queryKey: qk.deposits });
      qc.invalidateQueries({ queryKey: qk.transactions });
      // Send them to the transactions view with the Deposit filter pre-selected.
      setTimeout(() => router.push("/transactions?tab=DEPOSIT"), 900);
    },
    onError: (e: Error) => setError(e.message),
  });

  const submit = () => {
    if (!method || !amount) return;
    setError(null);
    createDeposit.mutate();
  };
  const submitting = createDeposit.isPending;

  if (!method) {
    return (
      <div className="p-8 text-center text-muted">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <p className="mt-2">Loading payment details…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-montserrat text-[24px] font-bold text-primary">Make Payment</h1>
            <p className="text-[13px] text-muted">Complete your payment process</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-elevated p-3">
            <div>
              <p className="text-[11px] text-muted">Payment Amount</p>
              <p className="font-montserrat text-[18px] font-bold text-primary">${Number(amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated">
            {method.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={method.logoUrl} alt={method.symbol} className="h-8 w-8 rounded-full object-contain" />
            ) : (
              <CreditCard className="h-5 w-5 text-brand-red" />
            )}
          </div>
          <div>
            <p className="text-[12px] text-muted">Your payment method</p>
            <p className="font-montserrat text-[16px] font-bold text-primary">{method.name}</p>
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-elevated p-4 text-center text-[14px] text-secondary">
          Send <span className="font-bold text-primary">${Number(amount).toFixed(2)}</span> to the address below using {network}.
        </p>

        <div className="mt-6">
          <label className="text-[14px] font-semibold text-primary">{method.name} Address</label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border bg-page p-3">
            <input readOnly value={address} className="flex-1 bg-transparent text-[13px] text-secondary outline-none" />
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 rounded-md bg-elevated px-3 py-1.5 text-[12px] font-medium text-secondary transition-colors hover:text-primary"
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Network Type: <span className="font-semibold text-primary">{network}</span>
          </p>
        </div>

        {address && (
          <div className="mt-6 flex justify-center">
            <div className="rounded-xl border bg-white p-3">
              <QRCodeSVG value={address} size={180} />
            </div>
          </div>
        )}

        <div className="mt-8">
          <label className="text-[14px] font-semibold text-primary">Transaction hash (optional)</label>
          <input
            value={trxHash}
            onChange={(e) => setTrxHash(e.target.value)}
            placeholder="Paste your blockchain tx hash for faster review"
            className="mt-2 w-full rounded-lg border bg-page px-4 py-3 font-mono text-[12px] text-primary outline-none focus:border-brand-red"
          />
        </div>

        <div className="mt-6">
          <FileUploader
            label="Upload payment proof (optional)"
            value={proofUrl}
            onChange={setProofUrl}
            folder="deposits/proofs"
            accept="image/*,application/pdf"
          />
          <p className="mt-1 text-[11px] text-subtle">Accepted: JPG, PNG, PDF. Uploaded to Cloudinary.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-center text-[13px] text-red-400">{error}</div>
        )}

        <button
          onClick={submit}
          disabled={submitting || submitted}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-red/80 to-emerald-600/80 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          {submitted ? "Submitted" : "Submit Payment"}
        </button>

        {submitted && (
          <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-center text-[13px] text-emerald-400">
            Payment submitted. Redirecting to your transactions…
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading…</div>}>
      <PaymentContent />
    </Suspense>
  );
}
