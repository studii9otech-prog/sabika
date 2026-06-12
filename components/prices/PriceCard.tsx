"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPriceChange, formatChange } from "@/lib/utils/format";
import { useSettingsStore } from "@/store/settingsStore";

interface PriceCardProps {
  title: string;
  icon?: React.ReactNode;
  priceEGP?: number;
  priceUSD?: number;
  change24h?: number;
  changePercent24h?: number;
  direction?: "up" | "down" | "stable";
  sparkData?: number[];
  isLoading?: boolean;
  index?: number;
}

/** Smooth bezier sparkline */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const W = 72, H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 4 - ((v - min) / rng) * (H - 8),
  }));

  // Smooth cubic bezier
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cp} ${pts[i - 1].y}, ${cp} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const fill = `${d} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={`cg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#cg-${color.replace("#", "")})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PriceCard({
  title,
  icon,
  priceEGP,
  priceUSD,
  change24h = 0,
  changePercent24h = 0,
  direction = "stable",
  sparkData,
  isLoading = false,
  index = 0,
}: PriceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tCommon = useTranslations("common");
  const tHero = useTranslations("hero");
  const { currency } = useSettingsStore();
  const activeCurrency = currency || "EGP";

  useEffect(() => {
    if (!cardRef.current || isLoading) return;
    gsap.fromTo(cardRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: index * 0.07, ease: "power2.out" }
    );
  }, [isLoading, index]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <Skeleton className="h-3 w-20 mb-4" />
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-3 w-16 mb-4" />
        <Skeleton className="h-5 w-24" />
      </div>
    );
  }

  const isUp = direction === "up";
  const isDown = direction === "down";
  const locale = tHero("liveLabel") === "مباشر" ? "ar" : "en";
  const trendColor = isUp ? "#10B981" : isDown ? "#EF4444" : "#A1A1AA";

  return (
    <div
      ref={cardRef}
      className="group rounded-2xl border border-border/60 bg-card hover:border-border transition-all duration-200 p-5 cursor-pointer"
    >
      {/* Top row: label + sparkline */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-amber-500">{icon}</span>}
          <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        </div>
        {sparkData && <MiniSparkline data={sparkData} color={trendColor} />}
      </div>

      {/* Price */}
      <p className="text-2xl font-black tabular-nums text-foreground tracking-tight mb-1 font-price whitespace-nowrap">
        {priceEGP?.toLocaleString(locale === "ar" ? "ar-EG" : "en-US") ?? "—"}
        <span className="text-xs font-medium text-muted-foreground mr-1 ml-1">
          {tCommon(activeCurrency.toLowerCase() as any)}/{tCommon("gram")}
        </span>
      </p>

      {/* Change */}
      <div className="flex items-center gap-2 mt-2">
        <span
          className="inline-flex items-center gap-1 text-xs font-bold"
          style={{ color: trendColor }}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {formatPriceChange(change24h, locale)} {tCommon(activeCurrency.toLowerCase() as any)}
        </span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{
            color: trendColor,
            background: isUp
              ? "rgba(16,185,129,0.1)"
              : isDown
              ? "rgba(239,68,68,0.1)"
              : "rgba(161,161,170,0.1)",
          }}
        >
          {formatChange(changePercent24h, locale)}
        </span>
      </div>

      {/* USD price footer */}
      {priceUSD && (
        <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/30 font-price">
          {locale === "ar" ? "عالمياً" : "Global"}{" "}
          <span className="text-foreground font-semibold">${priceUSD.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
}
