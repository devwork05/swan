"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qk, type WalletSummary } from "@/lib/api";

const EMPTY: WalletSummary = {
  balance: 0,
  bonus: 0,
  referralBonus: 0,
  lockedBalance: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  totalProfit: 0,
};

export function useWallet() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.wallet,
    queryFn: () => api.wallet.summary(),
    refetchInterval: 8_000,
  });
  return {
    wallet: query.data ?? EMPTY,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: () => qc.invalidateQueries({ queryKey: qk.wallet }),
  };
}
