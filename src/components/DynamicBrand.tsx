"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePublicSettings } from "@/lib/usePublicSettings";

/**
 * Applies platform settings that only make sense at the document level:
 * favicon href + document.title. Mounted once from the root layout.
 *
 * IMPORTANT: we never remove <head> nodes React (via Next.js) may still be
 * tracking. Doing so caused "Cannot read properties of null (reading
 * 'removeChild')" crashes during route transitions. Instead we mutate the
 * existing <link rel="icon"> href in place, or append a fresh one only when
 * the page doesn't have one at all.
 *
 * Titles run on every navigation via a `usePathname` dependency — no
 * MutationObserver, because that racing with Next's own title updates is
 * what triggered the same DOM-remove crash on some routes.
 */
export default function DynamicBrand() {
  const settings = usePublicSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!settings.favicon) return;
    // Prefer updating whatever <link rel="icon"> Next put in the head — never
    // remove nodes React thinks it owns.
    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (existing) {
      if (existing.getAttribute("href") !== settings.favicon) {
        existing.setAttribute("href", settings.favicon);
      }
      return;
    }
    // No favicon element exists at all — safe to create one.
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = settings.favicon;
    document.head.appendChild(link);
  }, [settings.favicon]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const brand = settings.companyName?.trim();
    const current = document.title || "";
    // The metadata title lives to the right of the last "|" (Next may leave
    // just "PageName" or a previous "Brand | PageName" we already set).
    const base = current.includes("|")
      ? current.split("|").slice(1).join("|").trim()
      : current.trim();
    const next = brand ? (base ? `${brand} | ${base}` : brand) : base;
    if (next && document.title !== next) {
      document.title = next;
    }
  }, [settings.companyName, pathname]);

  return null;
}
