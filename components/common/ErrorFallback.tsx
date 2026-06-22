"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorFallbackProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Compact card fallback (for section-level boundaries) */
  inline?: boolean;
}

/**
 * The UI rendered by ErrorBoundary when a child throws.
 * - `inline=false` (default) — renders a centred card suitable for a whole page section
 * - `inline=true`            — renders a slim banner suitable for a small widget
 */
export default function ErrorFallback({
  title,
  description,
  onRetry,
  inline = false,
}: ErrorFallbackProps) {
  const router = useRouter();

  const defaultTitle = "حدث خطأ غير متوقع";
  const defaultDesc =
    "تعذّر تحميل هذا القسم. يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية.";

  if (inline) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-semibold flex-1">
          {title ?? defaultTitle}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[11px] font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] p-8 rounded-2xl border border-border/60 bg-card text-center space-y-5">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-base font-bold text-foreground">
          {title ?? defaultTitle}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description ?? defaultDesc}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة المحاولة
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border/60 bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          الرئيسية
        </button>
      </div>
    </div>
  );
}
