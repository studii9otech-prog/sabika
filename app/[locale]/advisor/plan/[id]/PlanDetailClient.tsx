"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useActivePrices } from "@/hooks/useLivePrice";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  TrendingUp, 
  PiggyBank, 
  ShieldCheck, 
  Award, 
  Sparkles,
  Minus,
  Plus
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface PlanPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const { locale, id: planId } = use(params);
  const { data, isLoading, activeCurrency } = useActivePrices();
  const t = useTranslations("planDetails");
  const tCommonRaw = useTranslations("common");
  const tCommon = (key: string) => {
    if (key === "egp" && activeCurrency) {
      return tCommonRaw(activeCurrency.toLowerCase() as any);
    }
    return tCommonRaw(key as any);
  };
  const isAr = locale === "ar";

  // Simulation inputs
  const [dcaAmount, setDcaAmount] = useState(5000); // DCA monthly saving amount
  const [timingCapital, setTimingCapital] = useState(50000); // Tactical Investor Capital
  const [hedgeCapital, setHedgeCapital] = useState(100000); // Hedge Cash Capital
  const [hedgeRatio, setHedgeRatio] = useState(20); // Hedging ratio percentage

  // Local state update handlers
  const handleAmountChange = (val: number) => {
    if (planId === "dca") setDcaAmount(Math.max(1000, val));
    if (planId === "timing") setTimingCapital(Math.max(5000, val));
    if (planId === "hedge") setHedgeCapital(Math.max(10000, val));
  };

  const handleRatioChange = (val: number) => {
    setHedgeRatio(Math.max(5, Math.min(50, val)));
  };

  if (isLoading || !data) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-start">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const price21 = data.prices?.karat21?.gramPriceEGP ?? 4200;

  // 1. ADVANCED DCA VOLATILITY ALGORITHM
  const dcaSim = (() => {
    const months = 12;
    const totalInvested = dcaAmount * months;
    
    // Scenario 1: Steady growth (15% CAGR)
    let steadyGrams = 0;
    let steadyPrice = price21;
    const steadyMonthlyRate = 0.15 / 12;
    for (let i = 0; i < months; i++) {
      steadyGrams += dcaAmount / steadyPrice;
      steadyPrice = steadyPrice * (1 + steadyMonthlyRate);
    }
    const steadyValuation = steadyGrams * steadyPrice;

    // Scenario 2: Volatile/Cyclical Market (15% Trend + 4.5% Sine Wave Volatility)
    let volatileGrams = 0;
    let volatilePrice = price21;
    const volatileMonthlyPrices: number[] = [];
    const monthlyGramsPurchased: number[] = [];
    
    for (let i = 0; i < months; i++) {
      const cycleNoise = Math.sin(i * 1.5) * 0.045; // Oscillates up & down
      volatilePrice = price21 * Math.pow(1 + steadyMonthlyRate, i) * (1 + cycleNoise);
      volatileMonthlyPrices.push(volatilePrice);
      
      const gramsBought = dcaAmount / volatilePrice;
      monthlyGramsPurchased.push(gramsBought);
      volatileGrams += gramsBought;
    }
    const volatileValuation = volatileGrams * volatilePrice;

    // Scenario 3: Downtrend correction (-8% CAGR)
    let bearGrams = 0;
    let bearPrice = price21;
    const bearMonthlyRate = -0.08 / 12;
    for (let i = 0; i < months; i++) {
      bearGrams += dcaAmount / bearPrice;
      bearPrice = bearPrice * (1 + bearMonthlyRate);
    }
    const bearValuation = bearGrams * bearPrice;

    return {
      totalInvested,
      steady: {
        grams: steadyGrams,
        value: steadyValuation,
        avgCost: totalInvested / steadyGrams,
        profitPct: ((steadyValuation - totalInvested) / totalInvested) * 100
      },
      volatile: {
        grams: volatileGrams,
        value: volatileValuation,
        avgCost: totalInvested / volatileGrams,
        profitPct: ((volatileValuation - totalInvested) / totalInvested) * 100,
        monthlyPrices: volatileMonthlyPrices,
        monthlyGrams: monthlyGramsPurchased
      },
      bear: {
        grams: bearGrams,
        value: bearValuation,
        avgCost: totalInvested / bearGrams,
        profitPct: ((bearValuation - totalInvested) / totalInvested) * 100
      }
    };
  })();

  // 2. ADVANCED TACTICAL VOLATILITY BREAKOUT ALGORITHM
  const timingSim = (() => {
    const dailyVolatility = 0.015; // 1.5% average daily price swing
    
    const support1 = price21 * (1 - 1.5 * dailyVolatility); // -2.25% dip (Immediate Support)
    const support2 = price21 * (1 - 3.0 * dailyVolatility); // -4.5% deep dip (Strong Support)
    const resistance1 = price21 * (1 + 2.0 * dailyVolatility); // +3.0% (Breakout point)
    const resistance2 = price21 * (1 + 4.5 * dailyVolatility); // +6.75% (Target sell)

    const t1Cap = timingCapital * 0.30; // 30% immediate spot buy
    const t2Cap = timingCapital * 0.40; // 40% support buy dip
    const t3Cap = timingCapital * 0.30; // 30% breakout buy

    const t1Grams = t1Cap / price21;
    const t2Grams = t2Cap / support1;
    const t3Grams = t3Cap / resistance1;

    const totalGrams = t1Grams + t2Grams + t3Grams;
    const totalInvested = t1Cap + t2Cap + t3Cap;
    const averageBuyPrice = totalInvested / totalGrams;

    return {
      t1: { cap: t1Cap, price: price21, grams: t1Grams },
      t2: { cap: t2Cap, price: support1, grams: t2Grams },
      t3: { cap: t3Cap, price: resistance1, grams: t3Grams },
      support1,
      support2,
      resistance1,
      resistance2,
      totalGrams,
      averageBuyPrice,
      expectedVal: totalGrams * resistance2,
      profitPct: ((totalGrams * resistance2 - totalInvested) / totalInvested) * 100,
    };
  })();

  // 3. DUAL-FACTOR CURRENCY & GOLD VOLATILITY ALGORITHM (INFLATION HEDGE)
  const hedgeSim = (() => {
    const goldPortion = hedgeCapital * (hedgeRatio / 100);
    const cashPortion = hedgeCapital * (1 - hedgeRatio / 100);

    const baseInflation = 0.20; // 20% local annual inflation decay
    const goldGlobalAppreciation = 0.08; // 8% global USD gold return
    const currencyDevaluation = 0.15; // 15% devaluation in Year 2

    const runHedgeSimulation = (years: number) => {
      const inflationFactor = Math.pow(1 + baseInflation, years);
      const optionAValue = hedgeCapital / inflationFactor;

      const goldGrowthFactor = Math.pow(1 + goldGlobalAppreciation, years);
      const devaluationFactor = years >= 2 ? (1 + currencyDevaluation) : 1;
      
      const futureGoldValue = goldPortion * goldGrowthFactor * devaluationFactor;
      const combinedPortfolioValue = futureGoldValue + cashPortion;
      const optionBValue = combinedPortfolioValue / inflationFactor;

      return {
        optionA: optionAValue,
        optionB: optionBValue,
        saved: optionBValue - optionAValue,
      };
    };

    return {
      goldPortion,
      cashPortion,
      y1: runHedgeSimulation(1),
      y2: runHedgeSimulation(2),
      y3: runHedgeSimulation(3),
    };
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-start space-y-8 min-h-screen">
      
      {/* ── Breadcrumb Back Navigation ────────────────────── */}
      <Link 
        href={`/${locale}/advisor`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
        <span>{t("backToAdvisor")}</span>
      </Link>

      {/* ── Plan Hero Banner ────────────────────────────────── */}
      {planId === "dca" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">DCA</span>
            <h1 className="text-xl font-bold text-foreground">{t("dcaTitle")}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {t("dcaDesc")}
            </p>
          </div>
        </div>
      )}

      {planId === "timing" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,150,12,0.04),transparent_50%)] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">Tactical</span>
            <h1 className="text-xl font-bold text-foreground">{t("timingTitle")}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {t("timingDesc")}
            </p>
          </div>
        </div>
      )}

      {planId === "hedge" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,150,12,0.04),transparent_50%)] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">Hedge</span>
            <h1 className="text-xl font-bold text-foreground">{t("hedgeTitle")}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {t("hedgeDesc")}
            </p>
          </div>
        </div>
      )}

      {/* ── Split Layout: Parameters & Simulation Details ───── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters & Core results (Cols: 5) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Card containing Simulation parameters input */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("simParameters")}
            </h2>

            {/* Input dcaAmount */}
            {planId === "dca" && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground">
                  {t("monthlySavings")}
                </label>
                <div className="flex items-center justify-between border border-border/50 rounded-xl p-2 bg-muted/10">
                  <button 
                    onClick={() => handleAmountChange(dcaAmount - 1000)}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-price font-black text-foreground text-sm">
                    {dcaAmount.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                  </span>
                  <button 
                    onClick={() => handleAmountChange(dcaAmount + 1000)}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Input timingCapital */}
            {planId === "timing" && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground">
                  {t("availableCapital")}
                </label>
                <div className="flex items-center justify-between border border-border/50 rounded-xl p-2 bg-muted/10">
                  <button 
                    onClick={() => handleAmountChange(timingCapital - 5000)}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-price font-black text-foreground text-sm">
                    {timingCapital.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                  </span>
                  <button 
                    onClick={() => handleAmountChange(timingCapital + 5000)}
                    className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Input hedgeCapital & ratio */}
            {planId === "hedge" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    {t("totalLiquidAssets")}
                  </label>
                  <div className="flex items-center justify-between border border-border/50 rounded-xl p-2 bg-muted/10">
                    <button 
                      onClick={() => handleAmountChange(hedgeCapital - 10000)}
                      className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-price font-black text-foreground text-sm">
                      {hedgeCapital.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                    </span>
                    <button 
                      onClick={() => handleAmountChange(hedgeCapital + 10000)}
                      className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground flex justify-between">
                    <span>{t("goldAllocationRatio")}</span>
                    <span className="text-primary font-black font-price">{hedgeRatio}%</span>
                  </label>
                  <div className="flex items-center justify-between border border-border/50 rounded-xl p-2 bg-muted/10">
                    <button 
                      onClick={() => handleRatioChange(hedgeRatio - 5)}
                      className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-price font-black text-foreground text-sm">
                      {t("goldPortionLabel")} {(hedgeCapital * (hedgeRatio / 100)).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                    </span>
                    <button 
                      onClick={() => handleRatioChange(hedgeRatio + 5)}
                      className="w-8 h-8 rounded-lg border border-border hover:border-primary flex items-center justify-center text-foreground hover:text-primary cursor-pointer active:scale-95 transition-all bg-background"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Price context widget */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {t("spotPriceKarat21")}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-black font-price text-foreground leading-none">
                {price21.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}/{tCommon("gram")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                {t("spotPriceSub")}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Projections & Graphs (Cols: 7) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* ─────────────────── DCA SIMULATION ─────────────────── */}
          {planId === "dca" && (
            <div className="space-y-6">
              
              {/* Scenarios projections overview */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <div className="space-y-1 text-left">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {t("volatilityCostTitle")}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t("volatilityCostSub")}
                  </p>
                </div>

                <div className="grid gap-3">
                  {/* Scenario 1: Volatile Cyclical Market */}
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-start">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t("volatileMarket")}
                      </span>
                      <p className="text-muted-foreground text-[10px]">
                        {t("avgCostLabel", { cost: Math.round(dcaSim.volatile.avgCost).toLocaleString(isAr ? "ar-EG" : "en-US") })}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="font-price font-black text-primary text-sm">
                        ~{Math.round(dcaSim.volatile.value).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                      </span>
                      <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mt-0.5">+{dcaSim.volatile.profitPct.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Scenario 2: Steady Growth */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-start">
                      <span className="font-bold text-foreground">{t("steadyMarket")}</span>
                      <p className="text-muted-foreground text-[10px]">
                        {t("steadyCostLabel", { cost: Math.round(dcaSim.steady.avgCost).toLocaleString(isAr ? "ar-EG" : "en-US") })}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="font-price font-black text-foreground text-sm">
                        ~{Math.round(dcaSim.steady.value).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                      </span>
                      <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mt-0.5">+{dcaSim.steady.profitPct.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Scenario 3: Down Correction */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-start">
                      <span className="font-bold text-muted-foreground">{t("bearMarket")}</span>
                      <p className="text-muted-foreground text-[10px]">{t("bearCostLabel")}</p>
                    </div>
                    <div className="text-end">
                      <span className="font-price font-bold text-foreground text-sm">
                        ~{Math.round(dcaSim.bear.value).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                      </span>
                      <p className="text-rose-600 dark:text-rose-400 text-[10px] font-bold mt-0.5">{dcaSim.bear.profitPct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly DCA target breakdown */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="space-y-0.5 text-left">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {t("compoundedBreakdown")}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {t("compoundedSub")}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground border-b border-border/30 pb-2 px-1">
                    <span>{t("tableMonth")}</span>
                    <span>{t("tablePrice")}</span>
                    <span>{t("tableGrams")}</span>
                    <span>{t("tableTotal")}</span>
                  </div>

                  {[1, 3, 6, 9, 12].map((idx) => {
                    const price = dcaSim.volatile.monthlyPrices[idx - 1];
                    const gramsVal = dcaSim.volatile.monthlyGrams[idx - 1];
                    // Slice cumulative grams
                    const cumulative = dcaSim.volatile.monthlyGrams.slice(0, idx).reduce((sum, g) => sum + g, 0);
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs py-2.5 px-1 border-b border-border/20 last:border-b-0 hover:bg-muted/10 rounded">
                        <span className="font-bold text-foreground">{isAr ? `شهر ${idx}` : `Month ${idx}`}</span>
                        <span className="font-price text-muted-foreground">{Math.round(price).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                        <span className="font-price text-foreground">{gramsVal.toFixed(2)} {tCommon("gram")}</span>
                        <span className="font-price font-bold text-primary">{cumulative.toFixed(2)} {tCommon("gram")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ─── TIMING SIMULATION ──────────────── */}
          {planId === "timing" && (
            <div className="space-y-6">
              
              {/* Technical Tranches Split */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <div className="space-y-1 text-left">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {t("tranchesTitle")}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t("tranchesSub", { cost: Math.round(timingSim.averageBuyPrice).toLocaleString(isAr ? "ar-EG" : "en-US") })}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Tranche 1 */}
                  <div className="p-3.5 border border-border/60 bg-card rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{t("tranche1")}</span>
                      <span className="font-price font-black text-primary">{timingSim.t1.cap.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>{t("tranche1Sub", { price: Math.round(timingSim.t1.price).toLocaleString(isAr ? "ar-EG" : "en-US") })}</span>
                      <span className="font-price font-bold text-foreground">≈ {timingSim.t1.grams.toFixed(2)} {tCommon("gram")}</span>
                    </div>
                  </div>

                  {/* Tranche 2 */}
                  <div className="p-3.5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {t("tranche2")}
                      </span>
                      <span className="font-price font-black text-primary">{timingSim.t2.cap.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>{t("tranche2Sub", { price: Math.round(timingSim.t2.price).toLocaleString(isAr ? "ar-EG" : "en-US") })}</span>
                      <span className="font-price font-bold text-primary">≈ {timingSim.t2.grams.toFixed(2)} {tCommon("gram")}</span>
                    </div>
                  </div>

                  {/* Tranche 3 */}
                  <div className="p-3.5 border border-border/60 bg-card rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{t("tranche3")}</span>
                      <span className="font-price font-black text-primary">{timingSim.t3.cap.toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>{t("tranche3Sub", { price: Math.round(timingSim.t3.price).toLocaleString(isAr ? "ar-EG" : "en-US") })}</span>
                      <span className="font-price font-bold text-foreground">≈ {timingSim.t3.grams.toFixed(2)} {tCommon("gram")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Levels Grid */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("techRangesTitle")}
                </h3>

                <div className="space-y-2">
                  {/* Resistance 2 */}
                  <div className="flex justify-between items-center text-xs p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{t("majorResistance")}</span>
                    <span className="font-price font-black text-rose-600 dark:text-rose-400">{Math.round(timingSim.resistance2).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                  </div>

                  {/* Resistance 1 */}
                  <div className="flex justify-between items-center text-xs p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg opacity-70">
                    <span className="text-rose-500 font-semibold">{t("breakoutPoint")}</span>
                    <span className="font-price font-black text-rose-500">{Math.round(timingSim.resistance1).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                  </div>

                  {/* Spot Current */}
                  <div className="flex justify-between items-center text-xs p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-primary font-black">{t("spotCurrentPrice")}</span>
                    <span className="font-price font-black text-primary">{Math.round(price21).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                  </div>

                  {/* Support 1 */}
                  <div className="flex justify-between items-center text-xs p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg opacity-70">
                    <span className="text-emerald-500 font-semibold">{t("support1Label")}</span>
                    <span className="font-price font-black text-emerald-500">{Math.round(timingSim.support1).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                  </div>

                  {/* Support 2 */}
                  <div className="flex justify-between items-center text-xs p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t("support2Label")}</span>
                    <span className="font-price font-black text-emerald-600 dark:text-emerald-400">{Math.round(timingSim.support2).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ─── HEDGE SIMULATION ────────────────── */}
          {planId === "hedge" && (
            <div className="space-y-6">
              
              {/* Asset Hedging Performance comparison sheet */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                <div className="space-y-1 text-left">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {t("preservationTitle")}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t("preservationSub")}
                  </p>
                </div>

                <div className="space-y-3.5">
                  
                  {/* Year 1 */}
                  <div className="p-3.5 border border-border/60 bg-card rounded-xl space-y-3">
                    <span className="text-xs font-bold text-foreground block">{t("afterYear1")}</span>
                    <div className="grid grid-cols-2 gap-4 text-xs text-start">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">{t("noHedgeCash")}</span>
                        <span className="font-price font-black text-rose-500">
                          {Math.round(hedgeSim.y1.optionA).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                      <div className="border-s border-border/50 ps-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[10px]">{t("hedgedPortfolio")}</span>
                        <span className="font-price font-black text-emerald-600 dark:text-emerald-400">
                          {Math.round(hedgeSim.y1.optionB).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Year 2 */}
                  <div className="p-3.5 border border-border/60 bg-card rounded-xl space-y-3">
                    <span className="text-xs font-bold text-foreground block">{t("afterYear2")}</span>
                    <div className="grid grid-cols-2 gap-4 text-xs text-start">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">{t("noHedgeCash")}</span>
                        <span className="font-price font-black text-rose-500">
                          {Math.round(hedgeSim.y2.optionA).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                      <div className="border-s border-border/50 ps-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[10px]">{t("hedgedPortfolio")}</span>
                        <span className="font-price font-black text-emerald-600 dark:text-emerald-400">
                          {Math.round(hedgeSim.y2.optionB).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Year 3 */}
                  <div className="p-3.5 border border-primary/20 bg-primary/5 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-primary block">{t("afterYear3")}</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">{t("hedgeActive")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-start">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">{t("noHedgeCash")}</span>
                        <span className="font-price font-black text-rose-500">
                          {Math.round(hedgeSim.y3.optionA).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                      <div className="border-s border-border/50 ps-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px]">{t("hedgedPortfolio")}</span>
                        <span className="font-price font-black text-emerald-600 dark:text-emerald-400">
                          {Math.round(hedgeSim.y3.optionB).toLocaleString(isAr ? "ar-EG" : "en-US")} {tCommon("egp")}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-primary/20 pt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-start">
                      {t("hedgeSavedNote", { saved: Math.round(hedgeSim.y3.saved).toLocaleString(isAr ? "ar-EG" : "en-US") })}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
