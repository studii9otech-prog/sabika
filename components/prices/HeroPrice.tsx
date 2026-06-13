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
import HeroChart from "@/components/charts/HeroChart";

const KARATS = ["21", "18", "24", "14", "12"] as const;
type PricesKey = "karat12" | "karat14" | "karat18" | "karat21" | "karat24";

const KARAT_INFO = {
  "24": {
    purityAr: "نقاء 99.9%",
    purityEn: "99.9% Purity",
    descAr: "الذهب الخالص عالي النقاء، يُسخدم بشكل أساسي في السبائك والجنيهات الذهبية للادخار والاستثمار لعدم تعرضه للتآكل بسهولة عند عدم خلطه بالمعادن.",
    descEn: "Pure gold of high purity, mainly used in bullion bars and gold coins for savings and investment due to its high resistance to tarnishing when unalloyed.",
    badgeAr: "خالص",
    badgeEn: "Pure",
  },
  "21": {
    purityAr: "نقاء 87.5%",
    purityEn: "87.5% Purity",
    descAr: "العيار الأكثر شعبية وطلباً في مصر والوطن العربي، يجمع بين البريق الذهبي الرائع والصلابة المناسبة لتصنيع المجوهرات اليومية.",
    descEn: "The most popular and demanded karat in Egypt and the Arab world, combining a wonderful golden luster with suitable hardness for daily jewelry.",
    badgeAr: "الأكثر شيوعاً",
    badgeEn: "Most Popular",
  },
  "18": {
    purityAr: "نقاء 75.0%",
    purityEn: "75.0% Purity",
    descAr: "يتميز بصلابة عالية ولمعان مميز، ويُعد الخيار المفضل لتصنيع المجوهرات المرصعة بالألماس والأحجار الكريمة والتصاميم العصرية الإيطالية.",
    descEn: "Characterized by high hardness and distinct shine, it is the preferred choice for diamond-encrusted jewelry and modern Italian designs.",
    badgeAr: "تصاميم عصرية",
    badgeEn: "Modern Designs",
  },
  "14": {
    purityAr: "نقاء 58.5%",
    purityEn: "58.5% Purity",
    descAr: "عيار اقتصادي يتمتع بصلابة ومقاومة عالية جداً للاحتكاك، ويُستخدم في تصنيع المجوهرات العملية اليومية الخفيفة وسهلة الاقتناء.",
    descEn: "An economical karat with very high hardness and wear resistance, used for lightweight, practical daily jewelry that is easy to acquire.",
    badgeAr: "اقتصادي",
    badgeEn: "Economical",
  },
  "12": {
    purityAr: "نقاء 50.0%",
    purityEn: "50.0% Purity",
    descAr: "يحتوي على نصف وزنه من الذهب النقي والنصف الآخر من المعادن المضافة، ويُعتبر خياراً اقتصادياً للغاية في الأسواق الغربية.",
    descEn: "Contains half of its weight in pure gold and the other half in alloyed metals, representing a highly economical entry-level option.",
    badgeAr: "اقتصادي للغاية",
    badgeEn: "Entry Level",
  }
};

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



export default function HeroPrice() {
  const { ounceUSD: liveOunceUSD } = useOuncePrice();
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const { data, isLoading, activeCurrency } = useActivePrices();
  const [selectedKarat, setSelectedKarat] = useState<string>("21");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
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

  // Determine daily trend direction based on the 24h price change
  const isUp       = priceData ? priceData.change24h > 0 : true;
  const isDown     = priceData ? priceData.change24h < 0 : false;
  
  // Live trend direction based on live gold ounce USD spot price updates
  const liveDirection = useMemo(() => {
    if (liveOunceUSD === null || !data?.prices?.ounceUSD) return "none";
    if (liveOunceUSD > data.prices.ounceUSD) return "up";
    if (liveOunceUSD < data.prices.ounceUSD) return "down";
    return "none";
  }, [liveOunceUSD, data?.prices?.ounceUSD]);

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
      <div className="g-fade flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-1">
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
          <div className="ms-auto flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? "مباشر" : "Live"}
          </div>
        </div>

        {/* Karat info box */}
        <div className="rounded-2xl border border-zinc-150/40 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 text-xs text-start transition-all duration-300 flex items-start gap-2.5">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? `ذهب عيار ${selectedKarat}` : `Gold ${selectedKarat}K`}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].purityAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].purityEn}
              </span>
              {KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeAr && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeEn}
                </span>
              )}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed text-[11px] sm:text-xs">
              {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].descAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].descEn}
            </p>
          </div>
        </div>
      </div>

      {/* ── Label ──────────────────────────────────────────────────── */}
      <p className="g-fade text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-4 text-start">
        {isAr ? `الذهب عيار ${selectedKarat} · ${tCommon(activeCurrency.toLowerCase() as any)} / جرام` : `Gold ${selectedKarat}K · ${activeCurrency} / gram`}
      </p>

      {/* ── Big Price ──────────────────────────────────────────────── */}
      <div className="g-fade mb-3">
        <NumberTicker
          value={hoveredPrice !== null ? hoveredPrice : priceData.gramPriceEGP}
          locale={isAr ? "ar-EG" : "en-US"}
          decimals={isAr ? 0 : 0}
          className="text-[3.75rem] sm:text-[4.5rem] font-black tabular-nums leading-none tracking-tight text-zinc-900 dark:text-zinc-50 font-price"
          flashColor={hoveredPrice !== null ? "none" : liveDirection}
        />
      </div>

      {/* ── Change Row ─────────────────────────────────────────────── */}
      <div className="g-fade flex items-center gap-2.5 mb-8 flex-wrap h-8">
        {hoveredPrice !== null ? (
          <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 select-none animate-fade-in">
            {isAr ? `السعر ${hoveredLabel}` : `Price ${hoveredLabel}`}
          </span>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-bold animate-fade-in"
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
              className="text-sm font-bold px-2.5 py-0.5 rounded-lg animate-fade-in"
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

            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium animate-fade-in">
              {isAr ? "منذ بداية اليوم" : "since market open"}
            </span>
          </>
        )}
      </div>

      {/* ── Recharts AreaChart ───────────────────────────────────── */}
      <HeroChart
        chartData={chartData}
        chartMin={chartMin}
        chartMax={chartMax}
        trendColor={trendColor}
        isAr={isAr}
        locale={locale}
        activeCurrency={activeCurrency}
        onHoverChange={(price, label) => {
          setHoveredPrice(price);
          setHoveredLabel(label);
        }}
      />

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
