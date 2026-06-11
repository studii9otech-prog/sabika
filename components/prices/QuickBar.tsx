"use client";

import { useRef } from "react";
import { useMetals, useActivePrices } from "@/hooks/useLivePrice";
import { TrendingUp, TrendingDown, Minus, Coins, Gem, Layers, DollarSign, Euro, CircleDot } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface QuickItem {
  label: string;
  price: string;
  change: number;
  changePercent: number;
  icon: React.ReactNode;
}

export default function QuickBar() {
  const { data } = useMetals();
  const { activeCurrency, activeUsdToLocal } = useActivePrices();
  const trackRef = useRef<HTMLDivElement>(null);
  const tMetals = useTranslations("metals");
  const tKarats = useTranslations("karats");
  const tCommon = useTranslations("common");
  const tHero = useTranslations("hero");
  const locale = useLocale();

  const localUsdRate = data ? (activeUsdToLocal || data.currencies.usd.rate) : 1;
  const localEurRate = data ? data.currencies.eur.rate * (localUsdRate / data.currencies.usd.rate) : 1;
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase());
  const decimalPlaces = isThreeDecimals ? 3 : 2;

  const items: QuickItem[] = data
    ? [
        {
          label: `${tMetals("gold")} / ${tKarats("ounce")}`,
          price: `$${data.metals.gold.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: data.metals.gold.changePercent24h,
          changePercent: data.metals.gold.changePercent24h,
          icon: <Coins className="w-3.5 h-3.5" />,
        },
        {
          label: `${tMetals("silver")} / ${tKarats("ounce")}`,
          price: `$${data.metals.silver.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: data.metals.silver.changePercent24h,
          changePercent: data.metals.silver.changePercent24h,
          icon: <Gem className="w-3.5 h-3.5" />,
        },
        {
          label: `${tMetals("platinum")} / ${tKarats("ounce")}`,
          price: `$${data.metals.platinum.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: data.metals.platinum.changePercent24h,
          changePercent: data.metals.platinum.changePercent24h,
          icon: <Layers className="w-3.5 h-3.5" />,
        },
        {
          label: tHero("dollar"),
          price: `${localUsdRate.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })} ${tCommon((activeCurrency || "EGP").toLowerCase() as any)}`,
          change: data.currencies.usd.change24h,
          changePercent: data.currencies.usd.change24h,
          icon: <DollarSign className="w-3.5 h-3.5" />,
        },
        {
          label: tHero("euro"),
          price: `${localEurRate.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })} ${tCommon((activeCurrency || "EGP").toLowerCase() as any)}`,
          change: data.currencies.eur.change24h,
          changePercent: data.currencies.eur.change24h,
          icon: <Euro className="w-3.5 h-3.5" />,
        },
        {
          label: tMetals("palladium"),
          price: `$${data.metals.palladium.priceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: data.metals.palladium.changePercent24h,
          changePercent: data.metals.palladium.changePercent24h,
          icon: <CircleDot className="w-3.5 h-3.5" />,
        },
      ]
    : [];

  // Duplicate 4 times for seamless infinite loop
  const allItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full bg-[#09090B] border-y border-[#27272A] py-2.5 overflow-hidden">
      <div
        ref={trackRef}
        className={`flex items-center gap-6 ${locale === "ar" ? "animate-ticker-rtl" : "animate-ticker-ltr"} whitespace-nowrap`}
        style={{ width: "max-content" }}
      >
        {allItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-1 text-sm"
          >
            <span className="text-primary flex items-center justify-center">{item.icon}</span>
            <span className="text-neutral-400 font-medium">{item.label}</span>
            <span className="font-price font-bold text-neutral-100">
              {item.price}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                item.change > 0
                  ? "text-up"
                  : item.change < 0
                  ? "text-down"
                  : "text-neutral-mkt"
              }`}
            >
              {item.change > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : item.change < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {item.change > 0 ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
