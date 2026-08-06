"use client";

import { useEffect } from "react";
import { usePublicSettings } from "@/lib/usePublicSettings";

/**
 * Floating support widgets driven by admin settings.
 *
 * - `liveChatScript`  — raw HTML/JS the admin pastes from Tawk.to, Crisp,
 *   Intercom, etc. Injected into <body> so the provider's own floating
 *   launcher renders.
 * - `whatsappNumber`  — when set, renders a WhatsApp floating button that
 *   opens a wa.me conversation in a new tab.
 *
 * If neither is configured, nothing is rendered — no static placeholder.
 */
export default function ChatWidget() {
  const { liveChatScript, whatsappNumber } = usePublicSettings();

  useEffect(() => {
    if (!liveChatScript) return;
    if (typeof document === "undefined") return;

    // Parse the pasted string so inline <script> tags are promoted into real
    // script elements — otherwise they don't execute when set via innerHTML.
    const parser = document.createElement("div");
    parser.innerHTML = liveChatScript;

    const appended: Node[] = [];

    Array.from(parser.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
        const src = node as HTMLScriptElement;
        const clone = document.createElement("script");
        Array.from(src.attributes).forEach((a) => clone.setAttribute(a.name, a.value));
        if (src.textContent) clone.textContent = src.textContent;
        document.body.appendChild(clone);
        appended.push(clone);
      } else {
        document.body.appendChild(node.cloneNode(true));
        appended.push(document.body.lastChild!);
      }
    });

    return () => {
      appended.forEach((n) => n.parentNode?.removeChild(n));
    };
  }, [liveChatScript]);

  const waDigits = whatsappNumber ? whatsappNumber.replace(/\D+/g, "") : "";
  const waHref = waDigits ? `https://wa.me/${waDigits}` : null;

  if (!waHref) return null;

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] transition-transform hover:scale-105 hover:bg-[#1eb555]"
    >
      <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
        <path d="M19.11 17.34c-.28-.14-1.68-.83-1.94-.92-.26-.1-.45-.14-.64.14-.19.28-.73.92-.9 1.11-.17.19-.33.21-.61.07-.28-.14-1.2-.44-2.28-1.41-.84-.75-1.41-1.68-1.57-1.96-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.47.09-.19.05-.35-.02-.5-.07-.14-.63-1.52-.86-2.09-.23-.55-.46-.48-.63-.49l-.53-.01c-.19 0-.5.07-.76.35-.26.28-1 .98-1 2.38 0 1.4 1.03 2.76 1.17 2.95.14.19 2.02 3.08 4.89 4.32.68.29 1.22.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.68-.68 1.92-1.34.24-.66.24-1.22.17-1.34-.07-.12-.26-.19-.54-.33zM16 3C8.83 3 3 8.83 3 16c0 2.34.63 4.53 1.73 6.42L3 29l6.75-1.77A12.9 12.9 0 0016 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm0 23.7c-1.98 0-3.9-.53-5.58-1.53l-.4-.24-4.01 1.05 1.07-3.9-.26-.4A10.7 10.7 0 015.3 16C5.3 10.1 10.1 5.3 16 5.3S26.7 10.1 26.7 16 21.9 26.7 16 26.7z" />
      </svg>
    </a>
  );
}
