"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useActivePrices } from "@/hooks/useLivePrice";
import { TrendingUp, Coins, Landmark, Activity, Award, Minus, Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const MONTHLY_GOLD_RETURN = 0.012;

export default function InvestmentCalculator() {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(12);
  const { data, activeCurrency } = useActivePrices();
  const t = useTranslations("calculator");
  const tCommon = useTranslations("common");
  const tKarats = useTranslations("karats");
  const locale = useLocale();
  const isAr = locale === "ar";

  const price21 = data?.prices?.karat21?.gramPriceEGP ?? 4200;
  const grams = amount / price21;
  const expectedReturn = amount * Math.pow(1 + MONTHLY_GOLD_RETURN, months);
  const minReturn = amount * Math.pow(1 + MONTHLY_GOLD_RETURN * 0.6, months);
  const maxReturn = amount * Math.pow(1 + MONTHLY_GOLD_RETURN * 1.5, months);
  const returnPct = ((expectedReturn - amount) / amount) * 100;
  const bankReturn = amount * (1 + (0.225 / 12) * months);
  const stocksReturn = amount * Math.pow(1.018, months);
  const maxVal = Math.max(expectedReturn, bankReturn, stocksReturn) || 1;

  // Incremental control handlers
  const handleAmountChange = (val: number) => {
    const nextAmount = Math.max(1000, Math.min(500000, val));
    setAmount(nextAmount);
  };

  const handleMonthsChange = (val: number) => {
    const nextMonths = Math.max(1, Math.min(60, val));
    setMonths(nextMonths);
  };

  const comparisons = [
    {
      id: "gold",
      label: t("goldEst"),
      value: expectedReturn,
      pct: (expectedReturn / maxVal) * 100,
      isGold: true,
      icon: Coins,
      bar: "bg-gradient-to-r from-amber-500 to-primary",
    },
    {
      id: "bank",
      label: t("bankCertificate"),
      value: bankReturn,
      pct: (bankReturn / maxVal) * 100,
      isGold: false,
      icon: Landmark,
      bar: "bg-zinc-400 dark:bg-zinc-600",
    },
    {
      id: "stocks",
      label: t("stockMarket"),
      value: stocksReturn,
      pct: (stocksReturn / maxVal) * 100,
      isGold: false,
      icon: Activity,
      bar: "bg-zinc-400 dark:bg-zinc-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 hover:border-border hover:shadow-sm transition-all duration-200 text-start space-y-6">
      
      {/* ── Sliders Area with Interactive Step Buttons ─────── */}
      <div className="space-y-6">
        
        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              {t("amountLabel")}
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => handleAmountChange(amount - 5000)}
                className="w-6 h-6 rounded-full border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/5 active:scale-95 transition-all select-none cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-price font-black text-primary text-base min-w-[90px] text-center bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-lg">
                {amount.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
              </span>
              <button 
                type="button"
                onClick={() => handleAmountChange(amount + 5000)}
                className="w-6 h-6 rounded-full border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/5 active:scale-95 transition-all select-none cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <Slider
            value={[amount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              if (typeof val === "number") handleAmountChange(val);
            }}
            min={1000}
            max={500000}
            step={1000}
            className="w-full cursor-pointer [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-background [&_[data-slot=slider-thumb]]:shadow-md"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>1,000</span>
            <span>500,000</span>
          </div>
        </div>

        {/* Duration Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              {t("durationLabel")}
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => handleMonthsChange(months - 1)}
                className="w-6 h-6 rounded-full border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/5 active:scale-95 transition-all select-none cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-price font-black text-primary text-base min-w-[70px] text-center bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-lg">
                {months} {t("months")}
              </span>
              <button 
                type="button"
                onClick={() => handleMonthsChange(months + 1)}
                className="w-6 h-6 rounded-full border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/5 active:scale-95 transition-all select-none cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <Slider
            value={[months]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              if (typeof val === "number") handleMonthsChange(val);
            }}
            min={1}
            max={60}
            step={1}
            className="w-full cursor-pointer [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-muted [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-background [&_[data-slot=slider-thumb]]:shadow-md"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>1 m</span>
            <span>60 m (5 yrs)</span>
          </div>
        </div>
      </div>

      {/* ── Key Results Grid ─────────────────────────────── */}
      <div className={`grid grid-cols-2 border-y border-border/40 divide-x ${isAr ? "divide-x-reverse" : ""} divide-border/40`}>
        
        {/* Grams buy box */}
        <div className="py-4 pe-3 flex flex-col justify-between gap-1.5 text-start">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("estGrams")}
          </span>
          <p className="text-2xl font-black text-foreground tracking-tight font-price leading-none">
            {grams.toFixed(2)}
          </p>
          <span className="text-[9px] font-bold text-muted-foreground w-fit bg-muted px-2.5 py-0.5 rounded border border-border/40">
            {tKarats("karat21")}
          </span>
        </div>

        {/* Expected value return box */}
        <div className="py-4 ps-4 flex flex-col justify-between gap-1.5 text-start">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("yieldValue", { months })}
          </span>
          <p className="text-2xl font-black text-primary font-price tracking-tight leading-none">
            {Math.round(expectedReturn).toLocaleString(isAr ? "ar-EG" : "en-US")}
          </p>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-0.5 w-fit">
            <TrendingUp className="w-3 h-3" />
            +{returnPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ── Expected Range ───────────────────────────────── */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          {t("projectedYield")}
        </span>
        <div className="flex items-center gap-2">
          {/* Min tag */}
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 font-price bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
            {Math.round(minReturn).toLocaleString(isAr ? "ar-EG" : "en-US")}
          </span>
          {/* Progress bar */}
          <div className="flex-1 relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-[15%] right-[15%] bg-gradient-to-r from-rose-500/40 via-primary/50 to-emerald-500/40 rounded-full" />
          </div>
          {/* Max tag */}
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-price bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {Math.round(maxReturn).toLocaleString(isAr ? "ar-EG" : "en-US")}
          </span>
        </div>
      </div>

      {/* ── Comparison Alternatives ─────────────────────── */}
      <div className="space-y-3.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          {t("vsAlternatives")}
        </span>
        
        <div className="grid gap-2.5">
          {comparisons.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={[
                  "p-3 rounded-xl border transition-colors duration-200",
                  item.isGold 
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-sm" 
                    : "bg-muted/10 hover:bg-muted/20 border-border/40"
                ].join(" ")}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${item.isGold ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-semibold ${item.isGold ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                    {item.isGold && (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" />
                        {t("recommended")}
                      </span>
                    )}
                  </div>
                  
                  <span className={`font-bold font-price ${item.isGold ? "text-primary text-xs font-black" : "text-muted-foreground"}`}>
                    {Math.round(item.value).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                  <div
                    className={`h-full ${item.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
