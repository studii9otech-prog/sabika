"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMetals, useActivePrices } from "@/hooks/useLivePrice";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Gem,
  Layers,
  DollarSign,
  Euro,
  CircleDot,
} from "lucide-react";

export default function MarketStatusBar() {
  const t = useTranslations("hero");
  const tMetals = useTranslations("metals");
  const tKarats = useTranslations("karats");
  const tCommon = useTranslations("common");
  const tHero = useTranslations("hero");
  const locale = useLocale();
  const { data: metals } = useMetals();
  const { activeCurrency, activeUsdToLocal, isValidating, data: activePricesData } = useActivePrices();
  const [time, setTime] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);

  // Clock + market open logic
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getUTCHours() + 2;
      const day = now.getDay();
      const open = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
      setIsOpen(open);
      setTime(
        now.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [locale]);

  const localUsdRate = metals ? (activeUsdToLocal || metals.currencies.usd.rate) : 1;
  const localEurRate = metals ? metals.currencies.eur.rate * (localUsdRate / metals.currencies.usd.rate) : 1;
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase());
  const decimalPlaces = isThreeDecimals ? 3 : 2;

  // Build ticker items
  const items = metals
    ? [
        {
          label: `${tMetals("gold")} / ${tKarats("ounce")}`,
          price: `$${metals.metals.gold.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pct: metals.metals.gold.changePercent24h,
          Icon: Coins,
        },
        {
          label: `${tMetals("silver")} / ${tKarats("ounce")}`,
          price: `$${metals.metals.silver.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pct: metals.metals.silver.changePercent24h,
          Icon: Gem,
        },
        {
          label: `${tMetals("platinum")} / ${tKarats("ounce")}`,
          price: `$${metals.metals.platinum.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pct: metals.metals.platinum.changePercent24h,
          Icon: Layers,
        },
        {
          label: tHero("dollar"),
          price: `${localUsdRate.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })} ${tCommon((activeCurrency || "EGP").toLowerCase() as any)}`,
          pct: metals.currencies.usd.change24h,
          Icon: DollarSign,
        },
        {
          label: tHero("euro"),
          price: `${localEurRate.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })} ${tCommon((activeCurrency || "EGP").toLowerCase() as any)}`,
          pct: metals.currencies.eur.change24h,
          Icon: Euro,
        },
        {
          label: tMetals("palladium"),
          price: `$${metals.metals.palladium.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pct: metals.metals.palladium.changePercent24h,
          Icon: CircleDot,
        },
      ]
    : [];

  // Duplicate 4 times for seamless infinite loop
  const looped = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full bg-[#0C0C0E] border-b border-white/[0.06] text-start">
      {/* ── Row 1: Market status + time ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
        {/* Status dot & auto-refresh message */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${
                isOpen ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span
              className={`text-[11px] font-semibold tracking-wide ${
                isOpen ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {isOpen ? t("marketOpen") : t("marketClosed")}
            </span>
          </div>
          
          <span className="hidden xs:inline-block text-[10px] text-zinc-500 font-medium select-none">
            • {isValidating ? tHero("refreshing") : tHero("autoRefresh")}
          </span>
        </div>

        {/* Time */}
        {time && (
          <span className="font-price tabular-nums text-[11px] text-zinc-500">
            {time}
          </span>
        )}
      </div>

      {/* ── Row 2: Live prices ticker ────────────────────────────── */}
      {items.length > 0 && (
        <div className="border-t border-white/[0.04] overflow-hidden py-1.5">
          <div
            className={`flex items-center gap-0 ${locale === "ar" ? "animate-ticker-rtl" : "animate-ticker-ltr"} whitespace-nowrap`}
            style={{ width: "max-content" }}
          >
            {looped.map((item, i) => {
              const up = item.pct > 0;
              const down = item.pct < 0;
              return (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-5 border-r border-white/[0.06] last:border-r-0"
                >
                  {/* Icon */}
                  <item.Icon className="w-3 h-3 text-amber-500/70 flex-shrink-0" />

                  {/* Label */}
                  <span className="text-[11px] text-zinc-500">{item.label}</span>

                  {/* Price */}
                  <span className="font-price text-[11px] font-bold text-zinc-200">
                    {item.price}
                  </span>

                  {/* Change */}
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                      up
                        ? "text-emerald-500"
                        : down
                        ? "text-red-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {up ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : down ? (
                      <TrendingDown className="w-2.5 h-2.5" />
                    ) : null}
                    {up ? "+" : ""}
                    {item.pct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Dynamic 30-second progress bar linked to data update key */}
      <div className="relative w-full h-[1.5px] bg-white/[0.02] overflow-hidden">
        <div
          key={activePricesData?.meta?.lastUpdated}
          className={`h-full bg-gradient-to-r from-amber-500/10 via-amber-500/80 to-amber-500/10 transition-all duration-300 ${
            isValidating ? "w-full opacity-100 animate-pulse" : "animate-progress-30s"
          }`}
          style={{ width: isValidating ? "100%" : undefined }}
        />
      </div>
    </div>
  );
}
