"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed bot allocations. Real integration would post to a
 * `bot_subscriptions` endpoint with lifecycle events; this hook just tracks
 * the "start / stop / show me my history" surface the UI needs.
 */
export interface BotAllocation {
  botId: string;
  botName: string;
  amount: number;
  pair: string;
  startedAt: number;
  /** Illustrative running PnL — grows slowly over time for a sense of motion. */
  seedPnl: number;
  status: "ACTIVE" | "STOPPED";
}

export interface BotTradeRecord {
  id: string;
  botId: string;
  botName: string;
  pair: string;
  direction: "RISE" | "FALL";
  result: "WIN" | "LOSS";
  profit: number;
  amount: number;
  at: number;
}

const KEY_ALLOC = "swan.bots.allocations";
const KEY_HIST = "swan.bots.history";

export function useBotTrading() {
  const [allocations, setAllocations] = useState<BotAllocation[]>([]);
  const [history, setHistory] = useState<BotTradeRecord[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const a = localStorage.getItem(KEY_ALLOC);
      if (a) setAllocations(JSON.parse(a));
      const h = localStorage.getItem(KEY_HIST);
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  const persistAlloc = useCallback((next: BotAllocation[]) => {
    setAllocations(next);
    try {
      localStorage.setItem(KEY_ALLOC, JSON.stringify(next));
    } catch {}
  }, []);

  const persistHist = useCallback((next: BotTradeRecord[]) => {
    setHistory(next);
    try {
      localStorage.setItem(KEY_HIST, JSON.stringify(next));
    } catch {}
  }, []);

  const start = useCallback(
    (input: { botId: string; botName: string; amount: number; pair: string }) => {
      const alloc: BotAllocation = {
        ...input,
        startedAt: Date.now(),
        seedPnl: 0,
        status: "ACTIVE",
      };
      setAllocations((prev) => {
        const next = [alloc, ...prev];
        try {
          localStorage.setItem(KEY_ALLOC, JSON.stringify(next));
        } catch {}
        return next;
      });
      return alloc;
    },
    [],
  );

  const stop = useCallback((botId: string, startedAt: number) => {
    setAllocations((prev) => {
      const next = prev.map((a) =>
        a.botId === botId && a.startedAt === startedAt ? { ...a, status: "STOPPED" as const } : a,
      );
      try {
        localStorage.setItem(KEY_ALLOC, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const recordTrade = useCallback((record: Omit<BotTradeRecord, "id" | "at">) => {
    setHistory((prev) => {
      const next: BotTradeRecord[] = [
        { ...record, id: `bt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now() },
        ...prev,
      ];
      try {
        localStorage.setItem(KEY_HIST, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return {
    allocations,
    history,
    start,
    stop,
    recordTrade,
    replaceAllocations: persistAlloc,
    replaceHistory: persistHist,
  };
}
