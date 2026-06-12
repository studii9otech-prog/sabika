"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePriceHistory, useActivePrices } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, Locale } from "@/lib/utils/format";
import { useTranslations, useLocale } from "next-intl";

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

function CustomTooltip({ active, payload, label, locale, tCommon, activeCurrency }: {
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
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 shadow-lg text-xs text-start">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-price font-bold text-foreground">
        {payload[0].value.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
      </p>
    </div>
  );
}

export default function PriceChart() {
  const [period, setPeriod] = useState<Period>("1M");
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

  const chartData =
    data?.data?.map((point: { timestamp: string; price: number }) => ({
      date: formatDate(point.timestamp, locale as Locale),
      price: point.price * conversionFactor,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-start">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            {t("title")}
          </p>
          <p className="text-base font-bold text-foreground">
            {t("sub")}
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

      {/* Chart */}
      {isLoading || !chartData.length ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cgChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={lineColor} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--border)"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-rubik), sans-serif" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[priceMin, priceMax]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-rubik), sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatPrice(v)}
                width={74}
              />
              <Tooltip content={<CustomTooltip locale={locale} tCommon={tCommon} activeCurrency={activeCurrency} />} cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#cgChart)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: "var(--card)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
