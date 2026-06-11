"use client";

import { useMemo } from "react";
import { useActivePrices } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function PriceTable() {
  const { data, isLoading, activeCurrency } = useActivePrices();
  const t = useTranslations("table");
  const tKarats = useTranslations("karats");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const rows = useMemo(() => {
    if (!data) return [];
    const list = [];
    if (data.prices.karat24) {
      list.push({ key: "karat24" as const, purity: "99.9%", badgeKey: "pure" });
    }
    if ((data.prices as any).karat22) {
      list.push({ key: "karat22" as const, purity: "91.6%", badgeKey: "" });
    }
    if (data.prices.karat21) {
      list.push({ key: "karat21" as const, purity: "87.5%", badgeKey: "mostCommon" });
    }
    if (data.prices.karat18) {
      list.push({ key: "karat18" as const, purity: "75.0%", badgeKey: "" });
    }
    if (data.prices.karat14) {
      list.push({ key: "karat14" as const, purity: "58.5%", badgeKey: "" });
    }
    if ((data.prices as any).karat12) {
      list.push({ key: "karat12" as const, purity: "50.0%", badgeKey: "" });
    }
    return list;
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40">
          <Skeleton className="h-4 w-40" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-start">
          {t("title")}
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-6 py-2.5 bg-muted/30 border-b border-border/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span className="text-start">{t("karat")}</span>
        <span className="text-center">{t("gramPrice")}</span>
        <span className="text-center">{t("change")}</span>
        <span className="text-end">{t("globalPrice")}</span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const item = (data.prices as any)[row.key];
        if (!item) return null;
        const isUp = item.direction === "up";
        const isDown = item.direction === "down";
        const trendColor = isUp ? "#10B981" : isDown ? "#EF4444" : "#A1A1AA";

        return (
          <div
            key={row.key}
            className={`grid grid-cols-4 items-center px-6 py-4 border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors ${
              i === 1 || i === 2 ? "bg-amber-50/30 dark:bg-amber-950/5" : ""
            }`}
          >
            {/* Karat label */}
            <div className="flex items-center gap-2 text-start">
              <div>
                <p className="text-sm font-bold text-foreground">{tKarats(row.key)}</p>
                <p className="text-[10px] text-muted-foreground">{row.purity}</p>
              </div>
              {row.badgeKey && (
                <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  {tKarats(row.badgeKey)}
                </span>
              )}
            </div>

            {/* EGP price */}
            <p className="text-center font-price font-black tabular-nums text-foreground text-base">
              {item.gramPriceEGP.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
              <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {tCommon(activeCurrency.toLowerCase() as any)}</span>
            </p>

            {/* Change */}
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="inline-flex items-center gap-0.5 text-xs font-bold"
                style={{ color: trendColor }}
              >
                {isUp
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : isDown
                  ? <TrendingDown className="w-3.5 h-3.5" />
                  : <Minus className="w-3.5 h-3.5" />}
                {item.change24h > 0 ? "+" : ""}
                {item.change24h}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  color: trendColor,
                  background: isUp
                    ? "rgba(16,185,129,0.1)"
                    : isDown
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(161,161,170,0.1)",
                }}
              >
                {item.changePercent24h > 0 ? "+" : ""}
                {item.changePercent24h}%
              </span>
            </div>

            {/* USD */}
            <p className="text-end font-price text-xs text-muted-foreground tabular-nums">
              <span className="text-foreground font-semibold">${item.gramPriceUSD.toFixed(2)}</span>/{tCommon("gram")}
            </p>
          </div>
        );
      })}

      {/* Footer: ounce + kilo */}
      <div className="px-6 py-3 bg-muted/20 border-t border-border/40">
        <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-3">
          <span className="text-start">
            {t("ounceWithWeight")}{" "}
            <span className="font-price font-bold text-foreground">
              {data.prices.ounceEGP.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {tCommon(activeCurrency.toLowerCase() as any)}
            </span>
            <span className="text-muted-foreground/60 mr-1 ml-1">
              · ${data.prices.ounceUSD.toLocaleString("en-US")}
            </span>
          </span>
          <span className="text-end">
            {t("kilo")}{" "}
            <span className="font-price font-bold text-foreground">
              {data.prices.kiloEGP.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {tCommon(activeCurrency.toLowerCase() as any)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
