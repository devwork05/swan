"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePublicSettings } from "@/lib/usePublicSettings";

/**
 * Applies platform settings that only make sense at the document level:
 * favicon and document.title. Mounted once from the root layout.
 *
 * Titles are handled by prepending the admin-configured company name to
 * whatever the page's own metadata title is. We re-run on every navigation
 * because Next.js swaps document.title for each route, undoing our work.
 * A MutationObserver watches for any other title changes (e.g. from the same
 * route re-rendering) so we don't miss any of them either.
 */
export default function DynamicBrand() {
  const settings = usePublicSettings();
  const pathname = usePathname();
  const applyingRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Favicon — replace any existing <link rel="icon"> so we don't stack them.
    if (settings.favicon) {
      const existing = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]',
      );
      existing.forEach((el) => el.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = settings.favicon;
      document.head.appendChild(link);
    }
  }, [settings.favicon]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const brand = settings.companyName?.trim();

    const applyTitle = () => {
      if (applyingRef.current) return;
      const current = document.title || "";
      // The metadata title lives to the right of the last "|" (Next may leave
      // just "PageName" or a previous "Brand | PageName" that we already set).
      const base = current.includes("|")
        ? current.split("|").slice(1).join("|").trim()
        : current.trim();
      const next = brand
        ? base
          ? `${brand} | ${base}`
          : brand
        : base;
      if (document.title !== next) {
        applyingRef.current = true;
        document.title = next;
        // Release on the next microtask so the observer ignores our own write.
        queueMicrotask(() => {
          applyingRef.current = false;
        });
      }
    };

    applyTitle();

    // Catch any subsequent title changes Next.js makes for this route.
    const titleEl = document.querySelector("title");
    if (!titleEl) return;
    const observer = new MutationObserver(() => applyTitle());
    observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [settings.companyName, pathname]);

  return null;
}
