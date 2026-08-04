"use client";

import { useEffect } from "react";
import { usePublicSettings } from "@/lib/usePublicSettings";

/**
 * Applies platform settings that only make sense at the document level:
 * favicon and document.title. Mounted once from the root layout.
 */
export default function DynamicBrand() {
  const settings = usePublicSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Favicon — replace any existing <link rel="icon"> so we don't stack them.
    if (settings.favicon) {
      const existing = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]');
      existing.forEach((el) => el.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = settings.favicon;
      document.head.appendChild(link);
    }
  }, [settings.favicon]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!settings.companyName) return;
    // Only rewrite the leading brand segment ("Swan Trade Capital | ..."). Pages
    // that set their own metadata keep whatever comes after the pipe.
    const current = document.title;
    const parts = current.split("|");
    if (parts.length > 1) {
      document.title = `${settings.companyName} |${parts.slice(1).join("|")}`;
    } else {
      document.title = settings.companyName;
    }
  }, [settings.companyName]);

  return null;
}
