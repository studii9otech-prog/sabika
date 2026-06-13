"use client";

import { useState } from "react";
import { usePriceHistory, useActivePrices } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, Locale } from "@/lib/utils/format";
import { useTranslations, useLocale } from "next-intl";
import HistoryChart from "./HistoryChart";

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

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

export default function PriceChart() {
  const [period, setPeriod] = useState<Period>("1M");
  const [selectedKarat, setSelectedKarat] = useState<string>("21");
  const KARATS = ["21", "18", "24", "14", "12"] as const;

  const { data, isLoading } = usePriceHistory(period);
  const { activeCurrency, activeUsdToLocal, data: activeGoldData } = useActivePrices();
  const t = useTranslations("chart");
  const tCommon = useTranslations("common");
  const tPeriods = useTranslations("periods");
  const tKarats = useTranslations("karats");
  const locale = useLocale();
  const isAr = locale === "ar";

  const usdToEGP = activeGoldData?.usdToEGP || 50;
  const conversionFactor = (activeUsdToLocal && usdToEGP) ? (activeUsdToLocal / usdToEGP) : 1;
  const karatMultiplier = Number(selectedKarat) / 21;

  const chartData =
    data?.data?.map((point: { timestamp: string; price: number }) => ({
      date: formatDate(point.timestamp, locale as Locale),
      price: point.price * conversionFactor * karatMultiplier,
    })) ?? [];

  const prices = chartData.map((d: { price: number }) => d.price);
  const priceMin = prices.length ? Math.min(...prices) * 0.997 : 0;
  const priceMax = prices.length ? Math.max(...prices) * 1.003 : 0;
  const firstPrice = prices[0] ?? 0;
  const lastPrice = prices[prices.length - 1] ?? 0;
  const isUp = lastPrice >= firstPrice;
  const changePct = firstPrice
    ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)
    : "0.00";
  const lineColor = isUp ? "#10B981" : "#EF4444";

  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase());
  const isEgp = (activeCurrency || "EGP").toLowerCase() === "egp";
  const decimalPlaces = isThreeDecimals ? 3 : (isEgp ? 0 : 2);

  const formatPrice = (v: number) => {
    return v.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="text-start">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            {t("title")}
          </p>
          <p className="text-base font-bold text-foreground">
            {isAr
              ? `الذهب عيار ${selectedKarat} · ${tCommon(activeCurrency.toLowerCase() as any)} / جرام`
              : `Gold ${selectedKarat}K · ${activeCurrency} / gram`}
          </p>
        </div>

        {/* Period selector */}
        <div className="grid grid-cols-6 sm:flex items-center gap-0.5 bg-muted/60 rounded-xl p-1 w-full sm:w-auto">
          {PERIODS.map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-1 py-1.5 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-150 text-center whitespace-nowrap cursor-pointer ${
                period === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tPeriods(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Karat selector tabs & info */}
      <div className="mb-6 border-b border-border/30 pb-4">
        <div className="flex flex-wrap items-center gap-1 mb-3">
          {KARATS.map((k) => {
            const active = selectedKarat === k;
            return (
              <button
                key={k}
                onClick={() => setSelectedKarat(k)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                {isAr ? `عيار ${k}` : `${k}K`}
              </button>
            );
          })}
        </div>

        {/* Karat info box */}
        <div className="rounded-xl border border-zinc-150/40 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 text-xs text-start transition-all duration-300 flex items-start gap-2.5">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? `ذهب عيار ${selectedKarat}` : `Gold ${selectedKarat}K`}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].purityAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].purityEn}
              </span>
              {KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeAr && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].badgeEn}
                </span>
              )}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed text-[11px] sm:text-xs">
              {isAr ? KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].descAr : KARAT_INFO[selectedKarat as keyof typeof KARAT_INFO].descEn}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isLoading || !chartData.length ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : (
        <div className="h-56">
          <HistoryChart
            chartData={chartData}
            priceMin={priceMin}
            priceMax={priceMax}
            trendColor={lineColor}
            isAr={isAr}
            locale={locale}
            activeCurrency={activeCurrency}
          />
        </div>
      )}

      {/* Summary stats */}
      {chartData.length > 0 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30 text-xs">
          <div className="text-center">
            <p className="text-muted-foreground mb-0.5">{t("min")}</p>
            <p className="font-price font-bold text-red-500">{formatPrice(priceMin)} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-0.5">{t("max")}</p>
            <p className="font-price font-bold text-emerald-500">{formatPrice(priceMax)} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-0.5">{t("change")}</p>
            <p className={`font-bold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
              {isUp ? "+" : ""}{changePct}%
            </p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-muted-foreground mb-0.5">{t("lastPrice")}</p>
            <p className="font-price font-bold text-foreground">{formatPrice(lastPrice)} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
