"use client";

import { useMemo } from "react";
import { useActivePrices } from "@/hooks/useLivePrice";
import { useLocale } from "next-intl";

export default function EgyptIndicators() {
  const { data: goldPrices, activeCountry } = useActivePrices();
  const locale = useLocale();
  const isAr = locale === "ar";

  const proMetrics = useMemo(() => {
    if (!goldPrices) return null;
    const local24 = goldPrices.prices.karat24.gramPriceEGP;
    const ounceUSD = goldPrices.prices.ounceUSD;
    const bankUSD = goldPrices.usdToEGP;
    const impliedUSD = (local24 * 31.1035) / ounceUSD;
    return {
      impliedUSD,
      bankUSD
    };
  }, [goldPrices]);

  if (activeCountry !== "EG" || !goldPrices) return null;

  const egyptPrices = (goldPrices?.prices as any);
  const bankUSDVal = egyptPrices?.bankUSD || (proMetrics ? proMetrics.bankUSD : 52.03);
  const saghaUSDVal = egyptPrices?.saghaUSD || (proMetrics ? proMetrics.impliedUSD : 52.93);
  const usdSpreadVal = egyptPrices?.usdSpread || (saghaUSDVal - bankUSDVal);
  const goldCoinVal = egyptPrices?.goldCoinEGP || (goldPrices?.prices?.karat21?.gramPriceEGP ? goldPrices.prices.karat21.gramPriceEGP * 8 : 50120);
  const silverVal = egyptPrices?.silverEGP || 141.56;

  const currencyLabel = isAr ? "جنيه" : "EGP";

  return (
    <section className="space-y-4 animate-in fade-in duration-300">
      <div className="text-start mb-5">
        <h2 className="text-lg font-bold text-foreground">
          {isAr ? "مؤشرات السوق المصري" : "Egyptian Market Indicators"}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAr ? "سعر دولار البنك مقابل الصاغة والفرق الفعلي، بالإضافة لأسعار الفضة والجنيه الذهب" : "Official Dollar vs Sagha rate, spread, local gold coin, and silver price"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Bank Dollar */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {isAr ? "الدولار في البنوك" : "Bank Dollar"}
          </span>
          <p className="text-lg font-black text-foreground font-price">
            {bankUSDVal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {currencyLabel}</span>
          </p>
        </div>
        {/* Sagha Dollar */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {isAr ? "دولار الصاغة الآن" : "Sagha Dollar"}
          </span>
          <p className="text-lg font-black text-amber-500 font-price">
            {saghaUSDVal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {currencyLabel}</span>
          </p>
        </div>
        {/* Dollar Spread */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {isAr ? "الفرق بين البنك والصاغة" : "Dollar Spread"}
          </span>
          <p className="text-lg font-black text-red-500 font-price">
            {usdSpreadVal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {currencyLabel}</span>
          </p>
        </div>
        {/* Gold Coin */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {isAr ? "الجنيه الذهب" : "Gold Coin"}
          </span>
          <p className="text-lg font-black text-foreground font-price">
            {Math.round(goldCoinVal).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
            <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {currencyLabel}</span>
          </p>
        </div>
        {/* Silver Price */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {isAr ? "سعر جرام الفضة" : "Silver Price / g"}
          </span>
          <p className="text-lg font-black text-foreground font-price">
            {silverVal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-medium text-muted-foreground mr-1 ml-1"> {currencyLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
