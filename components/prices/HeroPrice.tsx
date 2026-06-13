"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Skeleton } from "@/components/ui/skeleton";
import NumberTicker from "@/components/common/NumberTicker";
import OunceSpotTicker from "@/components/prices/OunceSpotTicker";
import { useActivePrices, useOuncePrice } from "@/hooks/useLivePrice";
import { formatPriceChange, formatChange, getSecondsSince } from "@/lib/utils/format";
import { generateMockHistory } from "@/lib/calculations/goldPrice";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const KARATS = ["21", "18", "24", "14", "12"] as const;
type PricesKey = "karat12" | "karat14" | "karat18" | "karat21" | "karat24";

/** Convert an array of values to a smooth SVG cubic-bezier path */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function HeroCustomTooltip({ active, payload, label, locale, tCommon, activeCurrency }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  locale: string;
  tCommon: any;
  activeCurrency: string;
}) {
  if (!active || !payload?.length) return null;
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase());
  const isEgp = (activeCurrency || "EGP").toLowerCase() === "egp";
  const decimalPlaces = isThreeDecimals ? 3 : (isEgp ? 0 : 2);
  
  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md px-3 py-2 shadow-lg text-xs text-start">
      <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="font-price font-bold text-foreground">
        {payload[0].value.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
      </p>
    </div>
  );
}

export default function HeroPrice() {
  const { ounceUSD: liveOunceUSD } = useOuncePrice();
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const { data, isLoading, activeCurrency } = useActivePrices();
  const [selectedKarat, setSelectedKarat] = useState<string>("21");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Entrance animation ─────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || isLoading) return;
    const items = containerRef.current.querySelectorAll(".g-fade");
    gsap.fromTo(items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.05 }
    );
  }, [isLoading]);

  /* ─── Live seconds counter ───────────────────────────────── */
  useEffect(() => {
    if (!data?.meta?.lastUpdated) return;
    const iv = setInterval(() => setSecondsAgo(getSecondsSince(data.meta.lastUpdated)), 1000);
    return () => clearInterval(iv);
  }, [data?.meta?.lastUpdated]);

  const karatKey   = `karat${selectedKarat}` as PricesKey;
  const priceData  = data?.prices?.[karatKey];

  // Determine trend direction based on gold ounce USD spot price change
  const trendDirection = useMemo(() => {
    if (liveOunceUSD === null || !data?.prices?.ounceUSD) {
      return priceData?.direction || "up";
    }
    if (liveOunceUSD > data.prices.ounceUSD) return "up";
    if (liveOunceUSD < data.prices.ounceUSD) return "down";
    return priceData?.direction || "up";
  }, [liveOunceUSD, data?.prices?.ounceUSD, priceData?.direction]);

  const isUp       = trendDirection === "up";
  const isDown     = trendDirection === "down";
  const locale     = t("liveLabel") === "مباشر" ? "ar" : "en";
  const isAr       = locale === "ar";

  /* ─── Sparkline data (24 hourly ticks for daily view) ─────── */
  const chartData = useMemo(() => {
    if (!priceData) return [];
    
    // Generate 24 hourly points using the deterministic generator
    const raw = generateMockHistory(priceData.gramPriceEGP, 24, 0.005);
    
    return raw.map((point, i) => {
      const hour = 24 - i;
      const label = hour === 0 
        ? (isAr ? "الآن" : "Now") 
        : (isAr ? `منذ ${hour} س` : `${hour}h ago`);
      
      return {
        name: label,
        price: point.price,
      };
    });
  }, [priceData, isAr]);

  const pricesList = chartData.map(d => d.price);
  const chartMin = pricesList.length ? Math.min(...pricesList) : (priceData?.gramPriceEGP ?? 0) * 0.995;
  const chartMax = pricesList.length ? Math.max(...pricesList) : (priceData?.gramPriceEGP ?? 0) * 1.005;

  /* ─── Trend color ────────────────────────────────────────── */
  const trendColor = isUp ? "#10B981" : isDown ? "#EF4444" : "#B8960C";

  /* ─── Loading skeleton ───────────────────────────────────── */
  if (isLoading || !priceData || !data || !chartData.length) {
    return (
      <div className="px-6 pt-10 pb-4 max-w-2xl mx-auto space-y-6">
        {/* karat tabs */}
        <div className="flex gap-6">
          {KARATS.map(k => <Skeleton key={k} className="h-9 w-20 rounded-xl" />)}
        </div>
        {/* label */}
        <Skeleton className="h-4 w-32" />
        {/* big price */}
        <Skeleton className="h-16 w-56" />
        {/* badge row */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
        {/* chart */}
        <Skeleton className="h-28 w-full rounded-2xl" />
        {/* footer */}
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="px-6 pt-10 pb-6 max-w-2xl mx-auto">

      {/* ── Karat Tabs ─────────────────────────────────────────────── */}
      <div className="g-fade flex items-center gap-1 mb-8">
        {KARATS.map((k) => {
          const active = selectedKarat === k;
          return (
            <button
              key={k}
              onClick={() => setSelectedKarat(k)}
              className={[
                "relative px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 cursor-pointer",
                active
                  ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
              ].join(" ")}
            >
              {isAr ? `عيار ${k}` : `${k}K`}
            </button>
          );
        })}

        {/* Live dot — pushed to end */}
        <div className="mr-auto flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isAr ? "مباشر" : "Live"}
        </div>
      </div>

      {/* ── Label ──────────────────────────────────────────────────── */}
      <p className="g-fade text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-4 text-start">
        {isAr ? `الذهب عيار ${selectedKarat} · ${tCommon(activeCurrency.toLowerCase() as any)} / جرام` : `Gold ${selectedKarat}K · ${activeCurrency} / gram`}
      </p>

      {/* ── Big Price ──────────────────────────────────────────────── */}
      <div className="g-fade mb-3">
        <NumberTicker
          value={priceData.gramPriceEGP}
          locale={isAr ? "ar-EG" : "en-US"}
          decimals={isAr ? 0 : 0}
          className="text-[3.75rem] sm:text-[4.5rem] font-black tabular-nums leading-none tracking-tight text-zinc-900 dark:text-zinc-50 font-price"
          flashColor={isUp ? "up" : isDown ? "down" : "none"}
        />
      </div>

      {/* ── Change Row ─────────────────────────────────────────────── */}
      <div className="g-fade flex items-center gap-2.5 mb-8 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: trendColor }}
        >
          {isUp
            ? <TrendingUp className="w-4 h-4" />
            : isDown
            ? <TrendingDown className="w-4 h-4" />
            : <Minus className="w-4 h-4" />}
          {formatPriceChange(priceData.change24h, locale)} {tCommon(activeCurrency.toLowerCase() as any)}
        </span>

        <span
          className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
          style={{
            color: trendColor,
            background: isUp
              ? "rgba(16,185,129,0.1)"
              : isDown
              ? "rgba(239,68,68,0.1)"
              : "rgba(184,150,12,0.1)",
          }}
        >
          {formatChange(priceData.changePercent24h, locale)}
        </span>

        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          {isAr ? "منذ بداية اليوم" : "since market open"}
        </span>
      </div>

      {/* ── Recharts AreaChart ───────────────────────────────────── */}
      <div className="g-fade w-full h-[140px] mb-6 select-none" style={{ marginLeft: '-4px', marginRight: '-4px', width: 'calc(100% + 8px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: isAr ? 48 : 4, left: isAr ? 4 : 48, bottom: 5 }}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={trendColor} stopOpacity="0.20" />
                <stop offset="100%" stopColor={trendColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="var(--border)"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              hide={false}
            />
            <YAxis
              domain={[chartMin - 2, chartMax + 2]}
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => Math.round(v).toLocaleString(isAr ? "ar-EG" : "en-US")}
              width={44}
              orientation={isAr ? "right" : "left"}
              hide={false}
            />
            <RechartsTooltip
              content={<HeroCustomTooltip locale={locale} tCommon={tCommon} activeCurrency={activeCurrency} />}
              cursor={{ stroke: trendColor, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={trendColor}
              strokeWidth={3}
              fill="url(#heroGrad)"
              dot={false}
              activeDot={{ r: 4, fill: trendColor, stroke: "var(--card)", strokeWidth: 2 }}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Footer Stats ───────────────────────────────────────────── */}
      <div className="g-fade flex items-center justify-between text-[11px] font-price text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            {isAr ? "أعلى" : "H"}{" · "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round(chartMax).toLocaleString(isAr ? "ar-EG" : "en-US")}
            </span>
          </span>
          <span>
            {isAr ? "أدنى" : "L"}{" · "}
            <span className="text-red-500 dark:text-red-400 font-bold">
              {Math.round(chartMin).toLocaleString(isAr ? "ar-EG" : "en-US")}
            </span>
          </span>
          {/* Live ounce USD spot price — updates every second */}
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="text-zinc-400 dark:text-zinc-500">
              {isAr ? "أونصة" : "Spot oz"}{" · $"}
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">
              <OunceSpotTicker locale="en-US" className="text-[11px]" />
            </span>
          </span>
        </div>
        <span>
          {isAr ? `تحديث · ${secondsAgo}ث` : `Updated · ${secondsAgo}s`}
        </span>
      </div>

    </div>
  );
}
