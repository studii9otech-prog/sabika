"use client";

import { useTranslations, useLocale } from "next-intl";
import { useActivePrices, usePriceHistory, useMetals } from "@/hooks/useLivePrice";
import { safeDivide } from "@/lib/utils/safeCalc";
import { 
  BarChart3, 
  Calendar, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Scale, 
  Percent,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Info
} from "lucide-react";
import { useState, useMemo } from "react";

// Math helpers for technical finance oscillators
function calculateRSI(prices: number[]): number {
  if (prices.length < 2) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const count = prices.length - 1;
  const avgGain = safeDivide(gains, count, 0);
  const avgLoss = safeDivide(losses, count, 0);
  if (avgLoss === 0) return 100;
  const rs = safeDivide(avgGain, avgLoss, 0);
  return Math.round(100 - safeDivide(100, 1 + rs, 0));
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export default function AnalysisCards() {
  const t = useTranslations("analytics");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  
  const { data: goldPrices, activeCountry, activeCurrency, activeUsdToLocal } = useActivePrices();
  const { data: historyRes1D } = usePriceHistory("1D");
  const { data: historyRes1M } = usePriceHistory("1M");
  const { data: metals } = useMetals();

  // State
  const [selectedKarat, setSelectedKarat] = useState<"24" | "21" | "18" | "14" | "12">("21");
  const [pivotTimeframe, setPivotTimeframe] = useState<"day" | "week" | "month">("day");

  // Multipliers
  const basePrice = goldPrices?.prices?.karat21?.gramPriceEGP || 3200;
  const usdToEGP = goldPrices?.usdToEGP || 50.85;
  const conversionFactor = (activeUsdToLocal && usdToEGP) ? (activeUsdToLocal / usdToEGP) : 1;
  const karatMultiplier = Number(selectedKarat) / 21;

  // Live price of selected karat in local currency
  const livePriceLocal = useMemo(() => {
    if (!goldPrices) return basePrice * karatMultiplier;
    const karatKey = `karat${selectedKarat}` as const;
    if (goldPrices.prices[karatKey]) {
      return (goldPrices.prices[karatKey] as any).gramPriceEGP;
    }
    // Fallback calculation
    const purity = Number(selectedKarat) / 24;
    if (activeCountry === "EG") {
      return Math.round(goldPrices.prices.karat24.gramPriceEGP * purity);
    } else {
      const g24 = (goldPrices.prices.ounceUSD / 31.1034768) * (activeUsdToLocal || 1);
      return g24 * purity;
    }
  }, [goldPrices, selectedKarat, basePrice, karatMultiplier, activeCountry, activeUsdToLocal]);

  // Format currency helper
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes(activeCurrency.toLowerCase());
  const isEgp = activeCurrency.toLowerCase() === "egp";
  const decimalPlaces = isThreeDecimals ? 3 : (isEgp ? 0 : 2);
  const formatPrice = (val: number) => {
    return val.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Local prices historical series
  const historyPrices1DLocal = useMemo(() => {
    const list = historyRes1D?.data || [];
    if (!list.length) return [];
    return list.map((d: any) => d.price * (activeCountry === "EG" ? 1 : conversionFactor) * karatMultiplier);
  }, [historyRes1D, conversionFactor, karatMultiplier, activeCountry]);

  const historyPrices1MLocal = useMemo(() => {
    const list = historyRes1M?.data || [];
    if (!list.length) return [];
    return list.map((d: any) => d.price * (activeCountry === "EG" ? 1 : conversionFactor) * karatMultiplier);
  }, [historyRes1M, conversionFactor, karatMultiplier, activeCountry]);

  // Support & Resistance Ranges calculation
  const values = useMemo(() => {
    // 1. Daily range
    let dayHigh = livePriceLocal * 1.008;
    let dayLow = livePriceLocal * 0.992;
    if (historyPrices1DLocal.length) {
      dayHigh = Math.max(...historyPrices1DLocal, livePriceLocal);
      dayLow = Math.min(...historyPrices1DLocal, livePriceLocal);
      if (dayHigh === dayLow) {
        dayHigh = livePriceLocal * 1.006;
        dayLow = livePriceLocal * 0.994;
      }
    }

    // 2. Weekly range
    let weekHigh = livePriceLocal * 1.025;
    let weekLow = livePriceLocal * 0.975;
    if (historyPrices1MLocal.length) {
      const last7 = historyPrices1MLocal.slice(-7);
      weekHigh = Math.max(...last7, livePriceLocal);
      weekLow = Math.min(...last7, livePriceLocal);
      if (weekHigh === weekLow) {
        weekHigh = livePriceLocal * 1.02;
        weekLow = livePriceLocal * 0.98;
      }
    }

    // 3. Monthly range
    let monthHigh = livePriceLocal * 1.05;
    let monthLow = livePriceLocal * 0.95;
    if (historyPrices1MLocal.length) {
      monthHigh = Math.max(...historyPrices1MLocal, livePriceLocal);
      monthLow = Math.min(...historyPrices1MLocal, livePriceLocal);
      if (monthHigh === monthLow) {
        monthHigh = livePriceLocal * 1.04;
        monthLow = livePriceLocal * 0.96;
      }
    }

    return {
      day: { high: dayHigh, low: dayLow, close: livePriceLocal },
      week: { high: weekHigh, low: weekLow, close: livePriceLocal },
      month: { high: monthHigh, low: monthLow, close: livePriceLocal }
    };
  }, [livePriceLocal, historyPrices1DLocal, historyPrices1MLocal]);

  // Dynamic explanations
  const dayDesc = isAr
    ? `يتداول الذهب عيار ${selectedKarat} حالياً في نطاق يومي نشط. يقع مستوى الدعم اليومي الفعلي عند ${formatPrice(values.day.low)} ${tCommon(activeCurrency.toLowerCase() as any)}، بينما يمثل المستوى ${formatPrice(values.day.high)} ${tCommon(activeCurrency.toLowerCase() as any)} حاجز المقاومة الأول للمضاربات السريعة.`
    : `Gold ${selectedKarat}K is currently trading within an active daily range. The daily support lies at ${formatPrice(values.day.low)} ${tCommon(activeCurrency.toLowerCase() as any)}, while the ${formatPrice(values.day.high)} ${tCommon(activeCurrency.toLowerCase() as any)} level acts as the first resistance barrier.`;

  const weekDesc = isAr
    ? `بناءً على تداولات الـ ٧ أيام الماضية لعيار ${selectedKarat}، يقع نطاق الحركة الأسبوعي المتوقع بين الدعم ${formatPrice(values.week.low)} والمقاومة ${formatPrice(values.week.high)} ${tCommon(activeCurrency.toLowerCase() as any)}. وتعمل هذه المستويات كمحطات رئيسية لتجميع السيولة.`
    : `Based on the past 7 days of trading for ${selectedKarat}K, the expected weekly range lies between support ${formatPrice(values.week.low)} and resistance ${formatPrice(values.week.high)} ${tCommon(activeCurrency.toLowerCase() as any)}.`;

  const monthDesc = isAr
    ? `يشير التحليل الفني للـ ٣٠ يوماً الأخيرة لعيار ${selectedKarat} إلى اتجاه عام محدد. يقع الدعم الشهري الاستراتيجي عند ${formatPrice(values.month.low)} ${tCommon(activeCurrency.toLowerCase() as any)}، بينما يمثل المستوى ${formatPrice(values.month.high)} ${tCommon(activeCurrency.toLowerCase() as any)} المقاومة الشهرية الرئيسية للأجل المتوسط.`
    : `Technical analysis of the last 30 days for ${selectedKarat}K indicates a clear trend. The strategic monthly support is solid at ${formatPrice(values.month.low)} ${tCommon(activeCurrency.toLowerCase() as any)}, with ${formatPrice(values.month.high)} ${tCommon(activeCurrency.toLowerCase() as any)} acting as the main resistance level.`;

  const ANALYSIS_ITEMS = [
    {
      id: "day" as const,
      icon: BarChart3,
      title: t("day.period"),
      support: values.day.low,
      resistance: values.day.high,
      trendKey: "trendNeutralUp",
      trendColor: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      explanation: dayDesc
    },
    {
      id: "week" as const,
      icon: Calendar,
      title: t("week.period"),
      support: values.week.low,
      resistance: values.week.high,
      trendKey: "trendUp",
      trendColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      explanation: weekDesc
    },
    {
      id: "month" as const,
      icon: Compass,
      title: t("month.period"),
      support: values.month.low,
      resistance: values.month.high,
      trendKey: "trendUpStrong",
      trendColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      explanation: monthDesc
    },
  ];

  // Pivot Points Calculation logic (Classic vs Fibonacci)
  const pivots = useMemo(() => {
    const calc = (high: number, low: number, close: number) => {
      const pp = (high + low + close) / 3;
      return {
        pp,
        s1: 2 * pp - high,
        r1: 2 * pp - low,
        s2: pp - (high - low),
        r2: pp + (high - low),
        s3: low - 2 * (high - pp),
        r3: high + 2 * (pp - low),
        
        // Fibonacci
        fibS1: pp - 0.382 * (high - low),
        fibR1: pp + 0.382 * (high - low),
        fibS2: pp - 0.618 * (high - low),
        fibR2: pp + 0.618 * (high - low),
        fibS3: pp - 1.000 * (high - low),
        fibR3: pp + 1.000 * (high - low),
      };
    };

    return {
      day: calc(values.day.high, values.day.low, values.day.close),
      week: calc(values.week.high, values.week.low, values.week.close),
      month: calc(values.month.high, values.month.low, values.month.close)
    };
  }, [values]);

  // Technical Indicators and Oscillators calculations
  const indicators = useMemo(() => {
    // We use the 1M daily history for oscillators
    const historyPricesForOsc = historyPrices1MLocal.length ? historyPrices1MLocal : [livePriceLocal];
    
    // RSI 14
    const rsi = historyPricesForOsc.length >= 15 ? calculateRSI(historyPricesForOsc.slice(-15)) : 52;
    let rsiStatus = t("hold");
    let rsiSignal = t("hold");
    let rsiColor = "text-zinc-500 dark:text-zinc-400 bg-muted border border-border/40";
    if (rsi > 70) {
      rsiStatus = t("overbought");
      rsiSignal = t("sell");
      rsiColor = "text-red-500 bg-red-500/5 border border-red-500/10";
    } else if (rsi < 30) {
      rsiStatus = t("oversold");
      rsiSignal = t("strongBuy");
      rsiColor = "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10";
    } else if (rsi > 50) {
      rsiStatus = t("bullish");
      rsiSignal = t("buy");
      rsiColor = "text-emerald-500/80 bg-emerald-500/5 border border-emerald-500/10";
    } else {
      rsiStatus = t("bearish");
      rsiSignal = t("sell");
      rsiColor = "text-red-500/80 bg-red-500/5 border border-red-500/10";
    }

    // MACD (12, 26)
    const ema12 = historyPricesForOsc.length >= 12 ? calculateEMA(historyPricesForOsc, 12) : livePriceLocal;
    const ema26 = historyPricesForOsc.length >= 26 ? calculateEMA(historyPricesForOsc, 26) : livePriceLocal;
    const macd = ema12 - ema26;
    let macdStatus = t("hold");
    let macdSignal = t("hold");
    let macdColor = "text-zinc-500 dark:text-zinc-400 bg-muted border border-border/40";
    if (macd > 0.5) {
      macdStatus = t("bullish");
      macdSignal = t("buy");
      macdColor = "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10";
    } else if (macd < -0.5) {
      macdStatus = t("bearish");
      macdSignal = t("sell");
      macdColor = "text-red-500 bg-red-500/5 border border-red-500/10";
    }

    // SMA 20
    const sma20 = historyPricesForOsc.length >= 20 
      ? (historyPricesForOsc.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20) 
      : livePriceLocal;
    const smaStatus = livePriceLocal >= sma20 ? t("aboveAvg") : t("belowAvg");
    const smaSignal = livePriceLocal >= sma20 ? t("buy") : t("sell");
    const smaColor = livePriceLocal >= sma20 
      ? "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10" 
      : "text-red-500 bg-red-500/5 border border-red-500/10";

    // Gold-to-Silver Ratio
    const ratio = metals ? metals.metals.gold.priceUSD / metals.metals.silver.priceUSD : 82.5;
    let ratioStatus = t("normal");
    let ratioSignal = t("hold");
    let ratioColor = "text-zinc-500 dark:text-zinc-400 bg-muted border border-border/40";
    if (ratio > 82) {
      ratioStatus = t("silverCheap");
      ratioSignal = t("buy"); // buy silver
      ratioColor = "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10";
    } else if (ratio < 60) {
      ratioStatus = t("goldCheap");
      ratioSignal = t("buy"); // buy gold
      ratioColor = "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10";
    }

    // Local Gold Dollar Premium (Implied USD vs Bank USD)
    const bankUSD = goldPrices?.prices?.bankUSD || (activeCountry === "EG" ? 48.5 : 1);
    const saghaUSD = goldPrices?.prices?.saghaUSD || (activeCountry === "EG" ? 52.4 : 1);
    const premiumPercent = bankUSD ? ((saghaUSD - bankUSD) / bankUSD) * 100 : 0;
    
    let premiumStatus = t("premiumLow");
    let premiumSignal = t("buy");
    let premiumColor = "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10";
    if (premiumPercent > 8) {
      premiumStatus = t("premiumHigh");
      premiumSignal = t("strongSell");
      premiumColor = "text-red-500 bg-red-500/5 border border-red-500/10 animate-pulse";
    } else if (premiumPercent > 3) {
      premiumStatus = t("premiumFair");
      premiumSignal = t("hold");
      premiumColor = "text-amber-500 bg-amber-500/5 border border-amber-500/10";
    }

    // Calculate dynamic Sentiment Score
    let sentimentScore = 50;
    if (rsi < 30) sentimentScore += 25;
    else if (rsi > 70) sentimentScore -= 25;
    else if (rsi > 50) sentimentScore += 10;
    else if (rsi < 50) sentimentScore -= 10;

    if (macd > 0.5) sentimentScore += 15;
    else if (macd < -0.5) sentimentScore -= 15;

    if (livePriceLocal >= sma20) sentimentScore += 15;
    else sentimentScore -= 15;

    // Check 24h change
    const changePct = goldPrices?.prices?.karat21?.changePercent24h || 0;
    if (changePct > 0.5) sentimentScore += 10;
    else if (changePct < -0.5) sentimentScore -= 10;

    sentimentScore = Math.max(0, Math.min(100, sentimentScore));

    let sentimentLabel = t("hold");
    let sentimentColorText = "text-amber-500";
    let sentimentColorBg = "bg-amber-500/10";
    if (sentimentScore >= 80) {
      sentimentLabel = t("strongBuy");
      sentimentColorText = "text-emerald-500 dark:text-emerald-400";
      sentimentColorBg = "bg-emerald-500/10 border-emerald-500/20";
    } else if (sentimentScore >= 60) {
      sentimentLabel = t("buy");
      sentimentColorText = "text-emerald-500/80 dark:text-emerald-400/80";
      sentimentColorBg = "bg-emerald-500/5 border-emerald-500/10";
    } else if (sentimentScore <= 20) {
      sentimentLabel = t("strongSell");
      sentimentColorText = "text-red-500 dark:text-red-400";
      sentimentColorBg = "bg-red-500/10 border-red-500/20";
    } else if (sentimentScore <= 40) {
      sentimentLabel = t("sell");
      sentimentColorText = "text-red-500/80 dark:text-red-400/80";
      sentimentColorBg = "bg-red-500/5 border-red-500/10";
    }

    return {
      rsi: { val: rsi.toFixed(1), status: rsiStatus, signal: rsiSignal, color: rsiColor },
      macd: { val: macd.toFixed(2), status: macdStatus, signal: macdSignal, color: macdColor },
      sma: { val: formatPrice(sma20), status: smaStatus, signal: smaSignal, color: smaColor },
      ratio: { val: ratio.toFixed(1), status: ratioStatus, signal: ratioSignal, color: ratioColor },
      premium: { val: `${premiumPercent.toFixed(1)}%`, status: premiumStatus, signal: premiumSignal, color: premiumColor },
      sentiment: { score: sentimentScore, label: sentimentLabel, textClass: sentimentColorText, bgClass: sentimentColorBg, premiumPercent }
    };
  }, [livePriceLocal, historyPrices1MLocal, metals, goldPrices, locale, t]);

  // Pricing breakdown math for Valuation panel
  const valuationData = useMemo(() => {
    const globalOunce = goldPrices?.prices?.ounceUSD || 2350;
    const gramUsd24 = globalOunce / 31.1034768;
    const purity = Number(selectedKarat) / 24;
    const selectedGramUsd = gramUsd24 * purity;
    
    const bankUSD = goldPrices?.prices?.bankUSD || (activeCountry === "EG" ? 50.85 : 1);
    const saghaUSD = goldPrices?.prices?.saghaUSD || (activeCountry === "EG" ? 52.4 : 1);
    const premiumPct = indicators.sentiment.premiumPercent;
    
    // Fair price includes standard international transport, customs, and bank trade margins (~3%)
    const fairPriceLocal = selectedGramUsd * (activeUsdToLocal || bankUSD) * 1.03;
    
    // Dynamic advice and status colors
    let adviceText = t("premiumZoneSafe");
    let adviceBg = "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    let badgeColor = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    
    if (premiumPct > 8) {
      adviceText = t("premiumZoneDanger");
      adviceBg = "bg-red-500/5 border-red-500/10 text-red-800 dark:text-red-300";
      badgeColor = "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse";
    } else if (premiumPct > 3) {
      adviceText = t("premiumZoneWarning");
      adviceBg = "bg-amber-500/5 border-amber-500/10 text-amber-800 dark:text-amber-300";
      badgeColor = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }

    return {
      globalOunce,
      selectedGramUsd,
      bankUSD,
      saghaUSD,
      premiumPct,
      fairPriceLocal,
      adviceText,
      adviceBg,
      badgeColor
    };
  }, [goldPrices, selectedKarat, indicators, activeCountry, activeUsdToLocal, t]);

  // Active pivots timeframe level values
  const activePivots = pivots[pivotTimeframe];

  return (
    <div className="space-y-10 text-start">
      
      {/* ── Top Header Controls: Active Caliber ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/60 bg-muted/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm text-foreground">{t("caliberLabel")}</h3>
            <p className="text-[11px] text-muted-foreground">{isAr ? "اختر العيار لحساب جميع مستويات الارتكاز والتسعير الفعلي له" : "Choose caliber to recalculate technical metrics dynamically"}</p>
          </div>
        </div>
        
        {/* Caliber Pill Selector */}
        <div className="grid grid-cols-5 sm:flex gap-1 bg-background/50 border border-border/40 p-1 rounded-xl w-full sm:w-auto">
          {(["24", "21", "18", "14", "12"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedKarat(k)}
              className={`px-1 py-1.5 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer text-center whitespace-nowrap ${
                selectedKarat === k
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {isAr ? `عيار ${k}` : `${k}K`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 1: Support & Trend Cards ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {ANALYSIS_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="bg-card border border-border/60 rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header Period */}
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${item.trendColor}`}>
                    {t(item.trendKey)}
                  </span>
                </div>

                {/* S&R Boxes */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2 sm:p-3 text-center">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">{t("support")}</p>
                    <p className="font-price font-bold text-red-500 dark:text-red-400 text-xs sm:text-sm">
                      {formatPrice(item.support)} <span className="text-[10px] font-normal">{tCommon(activeCurrency.toLowerCase() as any)}</span>
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 sm:p-3 text-center">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">{t("resistance")}</p>
                    <p className="font-price font-bold text-emerald-500 dark:text-emerald-400 text-xs sm:text-sm">
                      {formatPrice(item.resistance)} <span className="text-[10px] font-normal">{tCommon(activeCurrency.toLowerCase() as any)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Analysis Note */}
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Section 2: Technical Grid Columns ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Technical Gauge & Oscillators Table */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sentiment Dial Gauge */}
          <div className="border border-border/60 rounded-2xl bg-card p-3.5 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">{t("sentimentTitle")}</h3>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${indicators.sentiment.bgClass} ${indicators.sentiment.textClass}`}>
                {indicators.sentiment.label}
              </span>
            </div>

            {/* Visual Progress Arc/Bar */}
            <div className="space-y-2" dir="ltr">
              <div className="h-4 bg-muted/60 rounded-full overflow-hidden relative border border-border/40">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${indicators.sentiment.score}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground border-x border-background transition-all duration-1000"
                  style={{ left: `${indicators.sentiment.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                <span>{isAr ? "بيع قوي" : "Strong Sell"}</span>
                <span>{isAr ? "محايد" : "Neutral"}</span>
                <span>{isAr ? "شراء قوي" : "Strong Buy"}</span>
              </div>
            </div>
          </div>

          {/* Oscillators Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">{t("indicatorsTitle")}</h3>
            </div>

            <div className="border border-border/60 rounded-2xl bg-card overflow-hidden">
              <table className="w-full border-collapse text-xs text-start table-auto">
                <thead>
                  <tr className="bg-muted/60 border-b border-border/60">
                    <th className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("indicator")}</th>
                    <th className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("value")}</th>
                    <th className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("status")}</th>
                    <th className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("signal")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {/* RSI */}
                  <tr className="hover:bg-muted/10">
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">{t("rsi")}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-price tabular-nums whitespace-nowrap text-[10px] sm:text-xs">{indicators.rsi.val}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.rsi.color}`}>
                        {indicators.rsi.status}
                      </span>
                    </td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.rsi.color}`}>
                        {indicators.rsi.signal}
                      </span>
                    </td>
                  </tr>
                  {/* MACD */}
                  <tr className="hover:bg-muted/10">
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">{t("macd")}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-price tabular-nums whitespace-nowrap text-[10px] sm:text-xs">{indicators.macd.val}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.macd.color}`}>
                        {indicators.macd.status}
                      </span>
                    </td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.macd.color}`}>
                        {indicators.macd.signal}
                      </span>
                    </td>
                  </tr>
                  {/* SMA 20 */}
                  <tr className="hover:bg-muted/10">
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">{t("sma20")}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-price tabular-nums whitespace-nowrap text-[10px] sm:text-xs">{indicators.sma.val} {tCommon(activeCurrency.toLowerCase() as any)}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.sma.color}`}>
                        {indicators.sma.status}
                      </span>
                    </td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.sma.color}`}>
                        {indicators.sma.signal}
                      </span>
                    </td>
                  </tr>
                  {/* Gold/Silver Ratio */}
                  <tr className="hover:bg-muted/10">
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">{t("ratio")}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-price tabular-nums whitespace-nowrap text-[10px] sm:text-xs">{indicators.ratio.val}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.ratio.color}`}>
                        {indicators.ratio.status}
                      </span>
                    </td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.ratio.color}`}>
                        {indicators.ratio.signal}
                      </span>
                    </td>
                  </tr>
                  {/* Local Premium */}
                  <tr className="hover:bg-muted/10">
                    <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-foreground whitespace-nowrap text-[10px] sm:text-xs">{t("premium")}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-price tabular-nums whitespace-nowrap text-[10px] sm:text-xs">{indicators.premium.val}</td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.premium.color}`}>
                        {indicators.premium.status}
                      </span>
                    </td>
                    <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${indicators.premium.color}`}>
                        {indicators.premium.signal}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Pivot Points Classical vs Fibonacci */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">{t("pivotTitle")}</h3>
            </div>
            
            {/* Pivot Period Selector Tabs */}
            <div className="flex bg-muted/60 border border-border/40 p-0.5 rounded-lg text-[10px] font-bold">
              {(["day", "week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPivotTimeframe(p)}
                  className={`px-2 py-1 rounded transition-all duration-150 cursor-pointer ${
                    pivotTimeframe === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`${p}Tab` as any)}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border/60 rounded-2xl bg-card overflow-hidden">
            <table className="w-full border-collapse text-xs text-start table-auto">
              <thead>
                <tr className="bg-muted/60 border-b border-border/60">
                  <th className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("level")}</th>
                  <th className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("classic")}</th>
                  <th className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-foreground text-[10px] sm:text-xs whitespace-nowrap">{t("fibonacci")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium font-price tabular-nums whitespace-nowrap">
                {/* R3 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-emerald-500 whitespace-nowrap text-[10px] sm:text-xs">{t("r3")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.r3)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibR3)}</td>
                </tr>
                {/* R2 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-emerald-500 whitespace-nowrap text-[10px] sm:text-xs">{t("r2")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.r2)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibR2)}</td>
                </tr>
                {/* R1 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-emerald-500 whitespace-nowrap text-[10px] sm:text-xs">{t("r1")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.r1)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibR1)}</td>
                </tr>
                {/* PP */}
                <tr className="hover:bg-muted/10 bg-primary/3">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-bold text-primary whitespace-nowrap text-[10px] sm:text-xs">{t("pivot")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-primary whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.pp)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center font-bold text-primary whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.pp)}</td>
                </tr>
                {/* S1 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-red-500 whitespace-nowrap text-[10px] sm:text-xs">{t("s1")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.s1)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibS1)}</td>
                </tr>
                {/* S2 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-red-500 whitespace-nowrap text-[10px] sm:text-xs">{t("s2")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.s2)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibS2)}</td>
                </tr>
                {/* S3 */}
                <tr className="hover:bg-muted/10">
                  <td className="px-1.5 py-2 sm:px-3 sm:py-2.5 text-start font-semibold text-red-500 whitespace-nowrap text-[10px] sm:text-xs">{t("s3")}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.s3)}</td>
                  <td className="px-1 py-2 sm:px-3 sm:py-2.5 text-center whitespace-nowrap text-[10px] sm:text-xs">{formatPrice(activePivots.fibS3)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Section 3: Pricing Breakdown & Premium Panel ──────── */}
      <div className="border border-border/60 rounded-2xl bg-card p-3.5 sm:p-5 space-y-6">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">{t("valuationTitle")}</h3>
            <p className="text-[11px] text-muted-foreground">{isAr ? "تفكيك تسعير الذهب لمعرفة مدى صحة وعدالة السعر المحلي مقارنة بالسوق العالمي" : "Deconstruction of local gold prices against international benchmarks"}</p>
          </div>
        </div>

        {/* Pricing Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
            <span className="text-[10px] font-bold text-muted-foreground block mb-1">{t("globalGramPrice")}</span>
            <span className="font-price font-bold text-base text-foreground">
              ${valuationData.selectedGramUsd.toFixed(2)}
            </span>
          </div>

          <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
            <span className="text-[10px] font-bold text-muted-foreground block mb-1">
              {activeCountry === "EG" ? t("impliedGoldDollar") : (isAr ? "سعر الصرف الفعلي للذهب" : "Implied Gold Exchange Rate")}
            </span>
            <span className="font-price font-bold text-base text-foreground">
              {formatPrice(valuationData.saghaUSD)} {tCommon(activeCurrency.toLowerCase() as any)}
            </span>
          </div>

          <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
            <span className="text-[10px] font-bold text-muted-foreground block mb-1">
              {activeCountry === "EG" ? t("officialBankRate") : (isAr ? "سعر الصرف الرسمي للدولار" : "Official Exchange Rate")}
            </span>
            <span className="font-price font-bold text-base text-foreground">
              {formatPrice(valuationData.bankUSD)} {tCommon(activeCurrency.toLowerCase() as any)}
            </span>
          </div>

          <div className="bg-muted/20 border border-border/40 rounded-xl p-4">
            <span className="text-[10px] font-bold text-muted-foreground block mb-1">{t("fairValue")} ({isAr ? "تقديري" : "Est"})</span>
            <span className="font-price font-bold text-base text-emerald-500 dark:text-emerald-400">
              {formatPrice(valuationData.fairPriceLocal)} {tCommon(activeCurrency.toLowerCase() as any)}
            </span>
          </div>
        </div>

        {/* Premium Level Alert Box */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${valuationData.adviceBg}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 font-medium leading-relaxed text-start">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">{t("premiumLabel")}:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${valuationData.badgeColor}`}>
                +{valuationData.premiumPct.toFixed(1)}%
              </span>
            </div>
            <p>{valuationData.adviceText}</p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Economic Laws of Gold ───────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">{t("lawsTitle")}</h3>
            <p className="text-[11px] text-muted-foreground">{isAr ? "قوانين ونظريات مالية تحكم أسواق الذهب وتساعدك على اتخاذ القرارات الصحيحة" : "Financial rules and economic equations that guide gold markets"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Law 1: Gold-Silver Ratio */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 text-start space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-xs text-foreground">{t("lawRatioTitle")}</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("lawRatioDesc")}
            </p>
            <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              <span>{isAr ? "النسبة الحالية:" : "Current Ratio:"}</span>
              <span className="font-price font-bold text-foreground">{indicators.ratio.val}</span>
            </div>
          </div>

          {/* Law 2: DCA */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 text-start space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-xs text-foreground">{t("lawDcaTitle")}</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("lawDcaDesc")}
            </p>
            <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              <span>{isAr ? "نوع الأمان الاستثماري:" : "Security Type:"}</span>
              <span className="font-bold text-emerald-500 dark:text-emerald-400">{isAr ? "مرتفع جداً" : "Very High"}</span>
            </div>
          </div>

          {/* Law 3: Making Fees */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 text-start space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-xs text-foreground">{t("lawFeeTitle")}</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("lawFeeDesc")}
            </p>
            <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              <span>{isAr ? "كاش باك استردادي:" : "Cashback Refund:"}</span>
              <span className="font-bold text-primary">{isAr ? "شامل ونشط" : "Covered & Active"}</span>
            </div>
          </div>

          {/* Law 4: FED & US Interest Rates */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 text-start space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-xs text-foreground">{t("lawFedTitle")}</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("lawFedDesc")}
            </p>
            <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              <span>{isAr ? "الارتباط بالفائدة:" : "Fed Rate Relation:"}</span>
              <span className="font-bold text-red-500 dark:text-red-400">{isAr ? "عكسي (-85%)" : "Inverse (-85%)"}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
