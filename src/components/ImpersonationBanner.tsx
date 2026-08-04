"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, UserCog } from "lucide-react";
import { api, saveAuth, type AuthResponse } from "@/lib/api";

const BACKUP_KEY = "adminAuthBackup";

/**
 * Small sticky bar shown whenever an admin has impersonated another user.
 * Reads {@code adminAuthBackup} (saved by the "Get access" button) — presence
 * of that key is the only signal that we're impersonating.
 */
export function ImpersonationBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [backup, setBackup] = useState<AuthResponse | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) {
      setBackup(null);
      return;
    }
    try {
      setBackup(JSON.parse(raw) as AuthResponse);
    } catch {
      localStorage.removeItem(BACKUP_KEY);
      setBackup(null);
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        setCurrentEmail((JSON.parse(userRaw) as { email?: string }).email ?? null);
      } catch {}
    }
  }, [pathname]);

  if (!backup) return null;

  const handleReturn = async () => {
    setReturning(true);
    // Revoke the impersonation session server-side (best-effort).
    try {
      await api.auth.logout();
    } catch {
      // Session may already be gone; keep going.
    }
    saveAuth(backup);
    localStorage.removeItem(BACKUP_KEY);
    router.push("/admin/dashboard");
    // Force a full refresh so useAuth re-reads the swapped-back token.
    setTimeout(() => window.location.assign("/admin/dashboard"), 100);
  };

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-[13px] text-amber-100 backdrop-blur">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 shrink-0" />
        <span>
          Impersonating <b className="text-primary">{currentEmail ?? "another user"}</b>{" "}
          <span className="text-amber-200/80">as {backup.user.email}</span>
        </span>
      </div>
      <button
        onClick={handleReturn}
        disabled={returning}
        className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/30 px-3 py-1 text-[12px] font-semibold text-primary transition-colors hover:bg-amber-500/50 disabled:opacity-60"
      >
        {returning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        Return to admin
      </button>
    </div>
  );
}
