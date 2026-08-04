"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed follow state for copy trading. Real integration would move
 * this into the backend as a `copy_subscriptions` table with fills over time —
 * this hook just tracks which traders the user follows and their per-trader
 * risk settings so the UI feels alive.
 */
export interface CopyConfig {
  copyPercent: number;
  maxPerTrade: number;
  dailyLimit: number;
  fundedAmount: number;
}

export interface CopyState {
  [traderId: string]: CopyConfig;
}

const KEY = "swan.copy.follows";
const DEFAULT: CopyConfig = { copyPercent: 25, maxPerTrade: 250, dailyLimit: 1_500, fundedAmount: 0 };

export function useCopyTrading() {
  const [state, setState] = useState<CopyState>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback((next: CopyState) => {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const follow = useCallback(
    (traderId: string, cfg: Partial<CopyConfig> = {}) =>
      setState((prev) => {
        const next = { ...prev, [traderId]: { ...DEFAULT, ...cfg } };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      }),
    [],
  );

  const unfollow = useCallback(
    (traderId: string) =>
      setState((prev) => {
        const next = { ...prev };
        delete next[traderId];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      }),
    [],
  );

  const update = useCallback(
    (traderId: string, cfg: Partial<CopyConfig>) =>
      setState((prev) => {
        if (!prev[traderId]) return prev;
        const next = { ...prev, [traderId]: { ...prev[traderId], ...cfg } };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      }),
    [],
  );

  const isFollowing = useCallback((id: string) => Boolean(state[id]), [state]);

  return { state, follow, unfollow, update, isFollowing, replace: persist };
}
