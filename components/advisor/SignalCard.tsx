"use client";

import { useMarketSignal } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Sparkles, Activity, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";

const SIGNAL_CONFIG = {
  buy: {
    label: "شراء قوي",
    labelEn: "Strong Buy",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    barClass: "bg-emerald-500 dark:bg-emerald-400",
    dotClass: "bg-emerald-500",
    icon: TrendingUp,
  },
  wait: {
    label: "انتظار وترقب",
    labelEn: "Wait & Watch",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    barClass: "bg-rose-500 dark:bg-rose-400",
    dotClass: "bg-rose-500",
    icon: TrendingDown,
  },
  neutral: {
    label: "سوق محايد",
    labelEn: "Neutral Market",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    barClass: "bg-amber-500 dark:bg-amber-400",
    dotClass: "bg-amber-500",
    icon: Minus,
  },
};

const IMPACT_CONFIG = {
  positive: {
    label: "إيجابي",
    labelEn: "Bullish",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  negative: {
    label: "سلبي",
    labelEn: "Bearish",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  },
  neutral: {
    label: "محايد",
    labelEn: "Neutral",
    color: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    icon: <Minus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />,
  },
};

export default function SignalCard() {
  const { data, isLoading } = useMarketSignal();
  const locale = useLocale();
  const isAr = locale === "ar";

  if (isLoading || !data?.signal) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="rounded-2xl border border-border/60 bg-card p-5 space-y-5 text-start">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const { signal } = data;
  const signalKey = (signal.signal as keyof typeof SIGNAL_CONFIG) || "neutral";
  const cfg = SIGNAL_CONFIG[signalKey];
  const Icon = cfg.icon;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="rounded-2xl border border-border/60 bg-card p-5 hover:border-border hover:shadow-sm transition-all duration-200 text-start space-y-6">
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badgeClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {isAr ? cfg.label : cfg.labelEn}
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            {isAr ? "إشارة السوق" : "Market Signal"}
          </span>
        </div>
        
        {/* Live Badge */}
        <div className="flex items-center gap-1.5 bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass} animate-pulse`} />
          <span className="text-[9px] font-black text-muted-foreground">
            {isAr ? "مباشر" : "LIVE"}
          </span>
        </div>
      </div>

      {/* ── Sentiment Scale (Horizontal Gauge) ─────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">
            {isAr ? "مقياس الاتجاه العام" : "Sentiment Spectrum"}
          </span>
          <span className="text-foreground text-sm font-black font-price bg-muted px-2.5 py-0.5 rounded-lg border border-border/40">
            {signal.score}%
          </span>
        </div>

        {/* Custom Spectrum Bar */}
        <div className="relative pt-4 pb-2">
          {/* Main Spectrum Track */}
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 relative border border-border/30">
            
            {/* Sentiment Indicator Cursor */}
            <div 
              className="absolute -top-1.5 -ml-2.5 w-5 h-5 rounded-full bg-background border-2 border-primary shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-700"
              style={{ left: `${signal.score}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[9px] font-black text-muted-foreground mt-2 uppercase tracking-wider">
            <span>{isAr ? "هبوطي" : "Bearish"}</span>
            <span>{isAr ? "محايد" : "Neutral"}</span>
            <span>{isAr ? "صعودي" : "Bullish"}</span>
          </div>
        </div>
      </div>

      {/* ── AI Analysis ───────────────────────────────────── */}
      <div className="bg-muted/20 border border-border/40 p-4 rounded-xl space-y-1.5 relative overflow-hidden">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold tracking-wider">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>{isAr ? "التحليل الاستثماري للذكاء الاصطناعي" : "AI INVESTMENT BRIEF"}</span>
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
          {isAr ? signal.reasoning.ar : signal.reasoning.en}
        </p>
      </div>

      {/* ── Driving Factors ──────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>{isAr ? "محركات السوق النشطة" : "Active Market Drivers"}</span>
        </p>
        
        <div className="grid gap-2">
          {signal.factors.map(
            (
              f: {
                name: { ar: string; en: string };
                impact: "positive" | "negative" | "neutral";
                value: string;
              },
              i: number
            ) => {
              const impactCfg = IMPACT_CONFIG[f.impact] || IMPACT_CONFIG.neutral;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40 hover:bg-muted/20 transition-all duration-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0">{impactCfg.icon}</span>
                    <span className="font-semibold text-foreground/90">
                      {isAr ? f.name.ar : f.name.en}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${impactCfg.bg} ${impactCfg.color}`}>
                      {isAr ? impactCfg.label : impactCfg.labelEn}
                    </span>
                    <span className="font-price font-bold text-foreground bg-background px-2 py-0.5 rounded-lg border border-border/60">
                      {f.value}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
