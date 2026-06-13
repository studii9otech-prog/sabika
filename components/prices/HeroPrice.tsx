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

export default function HeroPrice() {
  const { ounceUSD: liveOunceUSD } = useOuncePrice();
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const { data, isLoading, activeCurrency } = useActivePrices();
  const [selectedKarat, setSelectedKarat] = useState<string>("21");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const prevKarat = useRef(selectedKarat);

  /* ─── Entrance animation ─────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || isLoading) return;
    const items = containerRef.current.querySelectorAll(".g-fade");
    gsap.fromTo(items,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.05 }
    );
  }, [isLoading]);

  /* ─── Chart draw animation on karat switch ──────────────── */
  useEffect(() => {
    if (!lineRef.current) return;
    if (prevKarat.current !== selectedKarat) {
      // Fade out → update → draw in
      gsap.to([lineRef.current, fillRef.current], {
        opacity: 0, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          // Draw in
          const len = lineRef.current?.getTotalLength?.() ?? 400;
          if (lineRef.current) {
            lineRef.current.style.strokeDasharray = String(len);
            lineRef.current.style.strokeDashoffset = String(len);
          }
          gsap.to([lineRef.current, fillRef.current], { opacity: 1, duration: 0 });
          gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 1.0,
            ease: "power2.inOut",
          });
          gsap.fromTo(fillRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.1 });
        }
      });
      prevKarat.current = selectedKarat;
    } else {
      // First load draw
      const len = lineRef.current?.getTotalLength?.() ?? 400;
      lineRef.current.style.strokeDasharray = String(len);
      lineRef.current.style.strokeDashoffset = String(len);
      gsap.to(lineRef.current, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: 0.3 });
      gsap.fromTo(fillRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.4 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKarat, isLoading]);

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

  /* ─── Sparkline geometry ─────────────────────────────────── */
  const spark = useMemo(() => {
    if (!priceData) return null;
    const raw = generateMockHistory(priceData.gramPriceEGP, 28, 0.007).map(d => d.price);
    const W = 500, H = 80;
    const padT = 6, padB = 4;
    const minV = Math.min(...raw);
    const maxV = Math.max(...raw);
    const rng  = maxV - minV || 1;
    const pts  = raw.map((v, i) => ({
      x: (i / (raw.length - 1)) * W,
      y: padT + ((maxV - v) / rng) * (H - padT - padB),
    }));
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const firstY = pts[0].y;
    // Close fill down to bottom baseline
    const fill = `${line} L ${W} ${H} L 0 ${H} Z`;
    return { line, fill, last, W, H, firstY };
  }, [priceData]);

  /* ─── Trend color ────────────────────────────────────────── */
  const trendColor = isUp ? "#10B981" : isDown ? "#EF4444" : "#B8960C";

  /* ─── Loading skeleton ───────────────────────────────────── */
  if (isLoading || !priceData || !data || !spark) {
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

      {/* ── Sparkline ──────────────────────────────────────────────── */}
      <div className="g-fade w-full mb-6" style={{ marginLeft: '-4px', marginRight: '-4px', width: 'calc(100% + 8px)' }}>
        <svg
          viewBox={`0 0 ${spark.W} ${spark.H}`}
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: "120px" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={trendColor} stopOpacity="0.22" className="transition-all duration-700" />
              <stop offset="75%"  stopColor={trendColor} stopOpacity="0.05" className="transition-all duration-700" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0"    className="transition-all duration-700" />
            </linearGradient>
            <filter id="lineGlow" x="-5%" y="-15%" width="110%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor={trendColor} floodOpacity="0.25" className="transition-all duration-700" />
            </filter>
          </defs>

          {/* Gradient fill area */}
          <path
            ref={fillRef}
            d={spark.fill}
            fill="url(#heroGrad)"
            className="transition-all duration-700 ease-out"
            style={{
              transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1), fill 0.8s ease",
            }}
          />

          {/* Main line */}
          <path
            ref={lineRef}
            d={spark.line}
            fill="none"
            stroke={trendColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
            className="transition-all duration-700 ease-out"
            style={{
              transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.8s ease",
            }}
          />

          {/* Live endpoint dot */}
          <circle 
            cx={spark.last.x} 
            cy={spark.last.y} 
            r="4" 
            fill={trendColor} 
            className="transition-all duration-700"
            style={{ transition: "cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1), fill 0.8s ease" }}
          />
          <circle
            cx={spark.last.x}
            cy={spark.last.y}
            r="8"
            fill={trendColor}
            opacity="0.18"
            className="animate-ping transition-all duration-700"
            style={{ 
              transformOrigin: `${spark.last.x}px ${spark.last.y}px`, 
              animationDuration: '2s',
              transition: "cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1), fill 0.8s ease"
            }}
          />
        </svg>
      </div>

      {/* ── Footer Stats ───────────────────────────────────────────── */}
      <div className="g-fade flex items-center justify-between text-[11px] font-price text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            {isAr ? "أعلى" : "H"}{" · "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round(priceData.gramPriceEGP * 1.003).toLocaleString(isAr ? "ar-EG" : "en-US")}
            </span>
          </span>
          <span>
            {isAr ? "أدنى" : "L"}{" · "}
            <span className="text-red-500 dark:text-red-400 font-bold">
              {Math.round(priceData.gramPriceEGP * 0.997).toLocaleString(isAr ? "ar-EG" : "en-US")}
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
