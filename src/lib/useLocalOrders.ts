"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Local-only order book. Persisting to the backend + real fills would replace
 * this with a mutation and a real ledger — but for the trading-platform UI pass
 * we just store submitted orders in localStorage so the "Open Orders" and
 * "Recent Trades" panes have something to render.
 */
export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP_LIMIT";

export interface LocalOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price?: number;
  stopPrice?: number;
  duration: string;
  status: "OPEN" | "FILLED" | "CANCELLED";
  createdAt: number;
}

const KEY = "swan.orders";

export function useLocalOrders() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback((next: LocalOrder[]) => {
    setOrders(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const place = useCallback(
    (input: Omit<LocalOrder, "id" | "status" | "createdAt">) => {
      const order: LocalOrder = {
        ...input,
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: input.type === "MARKET" ? "FILLED" : "OPEN",
        createdAt: Date.now(),
      };
      setOrders((prev) => {
        const next = [order, ...prev];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      return order;
    },
    [],
  );

  const cancel = useCallback((id: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" as const } : o));
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { orders, place, cancel, replace: persist };
}
