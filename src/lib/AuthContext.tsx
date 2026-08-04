"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearAuth, type AuthResponse } from "@/lib/api";

interface AuthContextType {
  auth: AuthResponse | null;
  user: AuthResponse["user"] | null;
  loading: boolean;
  /** True while the token is being verified against the server. */
  verifying: boolean;
  logout: () => Promise<void>;
  /** Force a refetch of /auth/me — useful right after login. */
  refetch: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth state derived from a server call to /auth/me. On mount every layout
 * verifies the token — if the session has been revoked or the user removed,
 * the query fails and the axios interceptor kicks them to /login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();

  // Only fire /auth/me if we have a stored token. Guests skip the call.
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.auth.me(),
    enabled: hasToken,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      /* best-effort; token may already be dead */
    }
    clearAuth();
    if (typeof window !== "undefined") localStorage.removeItem("adminAuthBackup");
    qc.clear();
    router.push("/login");
  };

  const user = query.data ?? null;
  const auth: AuthResponse | null =
    typeof window !== "undefined" && user
      ? { token: localStorage.getItem("token") ?? "", user }
      : null;

  const value: AuthContextType = {
    auth,
    user,
    loading: hasToken && query.isLoading,
    verifying: query.isFetching,
    logout,
    refetch: () => query.refetch(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface UseAuthOptions {
  /**
   * "guest" — bounce authenticated users away (used on /login, /register).
   * "auth"  — bounce guests to /login (used on dashboards; layouts already do this).
   */
  middleware?: "guest" | "auth";
  /** Where to send authenticated users when middleware === "guest". */
  redirectIfAuthenticated?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  const router = useRouter();
  const { middleware, redirectIfAuthenticated } = options;

  useEffect(() => {
    if (ctx.loading) return;
    if (middleware === "guest" && ctx.user) {
      // If a role-specific dashboard was passed, respect it; otherwise route by
      // the user's own role (admin → admin dashboard, user → user dashboard).
      const target =
        redirectIfAuthenticated ?? (ctx.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      router.replace(target);
    }
  }, [ctx.loading, ctx.user, middleware, redirectIfAuthenticated, router]);

  return ctx;
}
