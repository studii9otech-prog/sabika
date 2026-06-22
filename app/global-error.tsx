"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js root-level global error page.
 * Rendered only when the root layout itself crashes (extremely rare).
 *
 * IMPORTANT: This replaces the entire document, so it must include
 * its own <html> and <body> tags per Next.js requirements.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError page]", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          color: "#f0f0f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AlertTriangle style={{ width: 32, height: 32, color: "#f59e0b" }} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: 4, marginBottom: 8 }}>
            سبيكة
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>
            خطأ في النظام
          </h1>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: "0 0 32px" }}>
            حدث خطأ حرج يمنع تحميل الموقع. يرجى إعادة المحاولة.
          </p>

          {error.digest && (
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#555", marginBottom: 24 }}>
              #{error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 12,
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
