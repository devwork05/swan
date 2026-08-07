"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. Catches errors thrown from the root layout
 * itself (where `error.tsx` can't reach). Must define its own <html> and
 * <body> because it replaces the whole document.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0b0f19",
          color: "#e5e7eb",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1 style={{ marginTop: 20, fontSize: 24, fontWeight: 700 }}>Application error</h1>
          <p style={{ marginTop: 12, color: "#94a3b8", lineHeight: 1.55 }}>
            A serious error occurred and the app could not recover. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 16,
                padding: "8px 12px",
                background: "#131827",
                borderRadius: 8,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                color: "#64748b",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              background: "#c1121f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
