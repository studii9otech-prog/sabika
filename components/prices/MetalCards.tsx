"use client";

import { useMetals, useActivePrices } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Gem, Layers, CircleDot } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const METALS = [
  { key: "silver" as const, Icon: Gem },
  { key: "platinum" as const, Icon: Layers },
  { key: "palladium" as const, Icon: CircleDot },
];

export default function MetalCards() {
  const { data, isLoading } = useMetals();
  const { activeCurrency, activeUsdToLocal } = useActivePrices();
  const tMetals = useTranslations("metals");
  const tKarats = useTranslations("karats");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20 mb-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {METALS.map(({ key, Icon }) => {
        const m = data.metals[key];
        const isUp = m.changePercent24h > 0;
        const isDown = m.changePercent24h < 0;
        const trendColor = isUp ? "#10B981" : isDown ? "#EF4444" : "#A1A1AA";

        return (
          <div
            key={key}
            className="rounded-2xl border border-border/60 bg-card hover:border-border transition-colors p-5 text-start"
          >
            {/* Label */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{tMetals(key)}</p>
                <p className="text-[10px] text-muted-foreground">{tMetals(key)} / {tKarats("ounce")}</p>
              </div>
            </div>

            {/* USD Price */}
            <p className="text-2xl font-black tabular-nums text-foreground font-price tracking-tight mb-0.5">
              ${m.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              ≈ {((m.priceUSD * (activeUsdToLocal || 1))).toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
                minimumFractionDigits: ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase()) ? 3 : 2,
                maximumFractionDigits: ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase()) ? 3 : 2,
              })} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
            </p>

            {/* Change badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  color: trendColor,
                  background: isUp
                    ? "rgba(16,185,129,0.1)"
                    : isDown
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(161,161,170,0.1)",
                }}
              >
                {isUp
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : isDown
                  ? <TrendingDown className="w-3.5 h-3.5" />
                  : <Minus className="w-3.5 h-3.5" />}
                {m.changePercent24h > 0 ? "+" : ""}
                {m.changePercent24h.toFixed(2)}%
              </span>
            </div>

            {/* Week high/low */}
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                {tMetals("weekHigh")}{" "}
                <span className="font-price font-semibold text-foreground">${m.weekHigh.toFixed(2)}</span>
              </span>
              <span>
                {tMetals("weekLow")}{" "}
                <span className="font-price font-semibold text-foreground">${m.weekLow.toFixed(2)}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
