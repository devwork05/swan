"use client";

import { useCallback, useEffect, useState } from "react";

/** localStorage-backed watchlist. Keyed per-category so crypto/stocks stay separate. */
export type WatchCategory = "crypto" | "stock";

const KEY = (cat: WatchCategory) => `swan.watchlist.${cat}`;

export function useWatchlist(category: WatchCategory) {
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY(category));
      if (raw) setSymbols(JSON.parse(raw));
    } catch {}
  }, [category]);

  const save = useCallback(
    (next: string[]) => {
      setSymbols(next);
      try {
        localStorage.setItem(KEY(category), JSON.stringify(next));
      } catch {}
    },
    [category],
  );

  const add = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      setSymbols((prev) => {
        if (prev.includes(s)) return prev;
        const next = [...prev, s];
        try {
          localStorage.setItem(KEY(category), JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [category],
  );

  const remove = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      setSymbols((prev) => {
        const next = prev.filter((x) => x !== s);
        try {
          localStorage.setItem(KEY(category), JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [category],
  );

  const has = useCallback((symbol: string) => symbols.includes(symbol.toUpperCase()), [symbols]);

  return { symbols, add, remove, has, replace: save };
}
