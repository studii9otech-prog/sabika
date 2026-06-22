"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home, ArrowRight } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js locale-scoped error page.
 * Rendered whenever a Server Component inside /[locale]/** throws.
 *
 * Must be a Client Component ("use client") per Next.js spec.
 */
export default function LocaleError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log to console only — never expose raw errors to users in production
    console.error("[LocaleError page]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        
        {/* Decorative icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-3xl bg-amber-500/5 animate-ping" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-primary tracking-widest uppercase">سبيكة</p>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto pt-1">
            تعذّر تحميل الصفحة بسبب خطأ داخلي. بيانات الأسعار المباشرة قد تكون متاحة في الصفحة الرئيسية.
          </p>
        </div>

        {/* Error digest (production-safe, no message leak) */}
        {error.digest && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground">
              خطأ #{error.digest}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-border/60 bg-muted/50 text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </button>
        </div>

        {/* Quick links */}
        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-3">أو انتقل مباشرة إلى:</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { label: "الأسعار", href: "/ar/prices" },
              { label: "التحليلات", href: "/ar/analytics" },
              { label: "المستشار", href: "/ar/advisor" },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2"
              >
                {link.label}
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
