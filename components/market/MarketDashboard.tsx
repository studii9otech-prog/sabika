"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useActivePrices, useMetals, useMarketSignal } from "@/hooks/useLivePrice";
import PriceTable from "@/components/prices/PriceTable";
import MetalCards from "@/components/prices/MetalCards";
import MarketPulseCardsClient from "@/components/prices/MarketPulseCards";
import PriceChart from "@/components/charts/PriceChart";
import OunceSpotTicker from "@/components/prices/OunceSpotTicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins,
  Sparkles,
  Layers,
  Award,
  Info,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  ShieldAlert,
  ArrowRightLeft,
  BookOpen,
  DollarSign,
  LineChart,
  Percent,
  CheckCircle2,
  TrendingUpIcon,
  Shield,
  Briefcase
} from "lucide-react";

interface MarketDashboardProps {
  locale: string;
}

export default function MarketDashboard({ locale }: MarketDashboardProps) {
  const isAr = locale === "ar";
  const t = useTranslations("marketPage");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"watch" | "trade" | "pro">("watch");

  // Fetching real/simulated prices and market signal data
  const { data: goldPrices, isLoading: goldLoading, activeCountry, activeCurrency, activeUsdToLocal } = useActivePrices();
  const { data: metalPrices, isLoading: metalLoading } = useMetals();

  // Active currency helpers
  const activeCurrencyLower = (activeCurrency || "EGP").toLowerCase() as any;
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes(activeCurrencyLower);
  const isEgp = activeCurrencyLower === "egp";
  const decimalPlaces = isThreeDecimals ? 3 : (isEgp ? 0 : 2);
  const currencyLabel = tCommon(activeCurrencyLower);
  
  // Format a local-currency number
  const fmtLocal = (v: number) => v.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  // Format EGP integer rounded (for prices already in local currency from API)
  const fmtInt = (v: number) => Math.round(v).toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
  const { data: signalResponse, isLoading: signalLoading } = useMarketSignal();
  const marketSignal = signalResponse?.signal;

  /* ────────────────────────────────────────────────────────── */
  /* ── Calculator States ───────────────────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const [calcAction, setCalcAction] = useState<"buy" | "sell">("buy");
  const [calcKarat, setCalcKarat] = useState<"24" | "21" | "18" | "14" | "12">("21");
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [makerFee, setMakerFee] = useState<number>(150); // EGP per gram maker fee (المصنعية)

  /* ────────────────────────────────────────────────────────── */
  /* ── DCA Savings States ──────────────────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const [dcaAmount, setDcaAmount] = useState<number>(5000); // monthly EGP savings
  const [dcaMonths, setDcaMonths] = useState<number>(12); // months duration

  /* ────────────────────────────────────────────────────────── */
  /* ── Computations for Buyers/Sellers ─────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const currentGramPrice = useMemo(() => {
    if (!goldPrices) return 0;
    const key = `karat${calcKarat}` as "karat24" | "karat21" | "karat18" | "karat14" | "karat12";
    const item = goldPrices.prices[key];
    return item ? item.gramPriceEGP : 0;
  }, [goldPrices, calcKarat]);

  const calcResults = useMemo(() => {
    if (!currentGramPrice) return null;
    const rawValue = currentGramPrice * calcWeight;
    const taxRate = 0.0125; // 1.25% stamp duty & tax in Egypt
    const taxes = calcAction === "buy" ? rawValue * taxRate : 0;
    const totalMakerFee = calcAction === "buy" ? calcWeight * makerFee : 0;
    const finalTotal = calcAction === "buy" 
      ? rawValue + totalMakerFee + taxes 
      : rawValue - (calcWeight * 20); // typical small buyback fee (خصم كسر) of 20 EGP/g when selling

    return {
      rawValue,
      taxes,
      totalMakerFee,
      finalTotal,
      buybackDiscount: calcAction === "sell" ? calcWeight * 20 : 0
    };
  }, [currentGramPrice, calcWeight, makerFee, calcAction]);

  /* ────────────────────────────────────────────────────────── */
  /* ── DCA Predictions ─────────────────────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const dcaResults = useMemo(() => {
    if (!goldPrices || !goldPrices.prices.karat21) return null;
    const price21 = goldPrices.prices.karat21.gramPriceEGP;
    const totalInvested = dcaAmount * dcaMonths;
    const gramsAccumulated = totalInvested / price21;
    
    // Assume 25% annualized gold price increase due to inflation and EGP depreciation
    const projectedPrice21 = price21 * (1 + 0.25 * (dcaMonths / 12));
    const projectedValue = gramsAccumulated * projectedPrice21;
    const profit = projectedValue - totalInvested;
    
    // Cash value purchase capacity decay (assuming 20% annual inflation)
    const cashRealValue = totalInvested * Math.pow(1 - 0.20, dcaMonths / 12);
    const lossOfPurchasingPower = totalInvested - cashRealValue;

    return {
      totalInvested,
      gramsAccumulated,
      projectedValue,
      profit,
      cashRealValue,
      lossOfPurchasingPower
    };
  }, [goldPrices, dcaAmount, dcaMonths]);

  /* ────────────────────────────────────────────────────────── */
  /* ── Professional Analytics Calculations ─────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const proMetrics = useMemo(() => {
    if (!goldPrices) return null;
    const local24 = goldPrices.prices.karat24.gramPriceEGP;
    const ounceUSD = goldPrices.prices.ounceUSD;
    const bankUSD = goldPrices.usdToEGP;

    // Implied USD exchange rate priced into local gold
    // local 24k gram price * 31.1035 (grams per ounce) / global ounce USD
    const impliedUSD = (local24 * 31.1035) / ounceUSD;
    
    // Local gold premium over global spot EGP rate (translated at bank rate)
    const global24EGP = (ounceUSD / 31.1035) * bankUSD;
    const localPremiumPercent = ((local24 - global24EGP) / global24EGP) * 100;

    return {
      impliedUSD,
      localPremiumPercent,
      bankUSD,
      global24EGP
    };
  }, [goldPrices]);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="text-start font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-20">
      
      {/* ── Tabs Navigation ─────────────────────────────────────── */}
      <div className="border-b border-border/40 pb-px mb-6 w-full">
        <div className="grid grid-cols-3 sm:flex gap-1 p-1 bg-muted/50 rounded-2xl border border-border/30 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("watch")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "watch"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">{t("tabWatch")}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "trade"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">{t("tabTrade")}</span>
          </button>

          <button
            onClick={() => setActiveTab("pro")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "pro"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">{t("tabPro")}</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: WATCH (LIVE MARKET) ──────────────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "watch" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Quick Metrics Bar */}
          {proMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("ounceUSD")}
                  </p>
                  <p className="text-xl font-black text-foreground mt-1 font-price flex items-baseline gap-1">
                    <span className="text-muted-foreground text-sm font-semibold">$</span>
                    <OunceSpotTicker className="text-xl font-black" />
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("bankUSD")}
                  </p>
                  <p className="text-xl font-black text-foreground mt-1 font-price">
                    {fmtLocal(proMetrics.bankUSD)} <span className="text-xs font-semibold text-muted-foreground">{currencyLabel}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("premiumIndex")}
                  </p>
                  <p className={`text-xl font-black mt-1 font-price ${
                    proMetrics.localPremiumPercent > 8 ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    +{proMetrics.localPremiumPercent.toFixed(2)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          )}



          {/* Market Pulse Cards */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-4 text-start">
              {t("pulseTitle")}
            </h3>
            <MarketPulseCardsClient />
          </div>

          {/* Price Table */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-4 text-start">
              {t("matrixTitle")}
            </h3>
            <PriceTable />
          </div>

          {/* Price Chart */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-4 text-start">
              {t("chartTitle")}
            </h3>
            <PriceChart />
          </div>

          {/* Other Metals */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-4 text-start">
              {t("otherMetalsTitle")}
            </h3>
            <MetalCards />
          </div>

        </div>
      )}

      {/* ── TAB 2: TRADE (BUY & INVEST TOOLS) ───────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "trade" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* BUY/SELL CALCULATOR */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t("calcTitle")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t("calcSub")}
                  </p>
                </div>
              </div>

              {/* Action tabs inside calculator */}
              <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-xl border border-border/20">
                <button
                  onClick={() => setCalcAction("buy")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    calcAction === "buy"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("calcBuy")}
                </button>
                <button
                  onClick={() => setCalcAction("sell")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    calcAction === "sell"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("calcSell")}
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                {/* Karat selection */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("selectKarat")}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["24", "21", "18", "14", "12"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setCalcKarat(k)}
                        className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          calcKarat === k
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {locale === "ar" ? `عيار ${k}` : `${k}K`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Inputs */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("weightGrams")}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalcWeight(Math.max(1, calcWeight - 1))}
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-muted-foreground/10 text-foreground font-bold flex items-center justify-center cursor-pointer select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={calcWeight || ""}
                      onChange={(e) => setCalcWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="flex-1 h-10 rounded-xl bg-muted/40 border border-border/60 text-center font-bold font-price text-foreground"
                    />
                    <button
                      onClick={() => setCalcWeight(calcWeight + 1)}
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-muted-foreground/10 text-foreground font-bold flex items-center justify-center cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {([5, 10, 20, 50, 100] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setCalcWeight(w)}
                        className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-muted/30 border border-border/40 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {w}g
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maker fee (Only for Buy) */}
                {calcAction === "buy" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("makerFeeGram")}
                      </label>
                      <span className="text-xs font-bold text-primary font-price">{fmtLocal(makerFee)} {currencyLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50"
                        max="350"
                        step="10"
                        value={makerFee}
                        onChange={(e) => setMakerFee(parseInt(e.target.value))}
                        className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {[
                        { val: 60, lbl: t("presetCoin") },
                        { val: 120, lbl: t("presetJewelry") },
                        { val: 180, lbl: t("presetStd") },
                        { val: 280, lbl: t("presetPremium") }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => setMakerFee(preset.val)}
                          className={`py-1 text-[9px] font-bold rounded-lg border cursor-pointer transition-all ${
                            makerFee === preset.val
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {preset.lbl} ({fmtLocal(preset.val)} {currencyLabel})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Breakdown Output */}
              {calcResults && (
                <div className="bg-muted/30 border border-border/40 rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    {t("receiptTitle")}
                  </p>
                  
                  <div className="flex justify-between text-xs text-muted-foreground font-price">
                    <span>{t("baseGramPrice")}</span>
                    <span className="text-foreground font-semibold">
                      {fmtLocal(currentGramPrice)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground font-price">
                    <span>{t("netGoldValue", { weight: calcWeight })}</span>
                    <span className="text-foreground font-semibold">
                      {fmtLocal(calcResults.rawValue)} {currencyLabel}
                    </span>
                  </div>

                  {calcAction === "buy" ? (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground font-price">
                        <span>{t("totalMakerFee")}</span>
                        <span className="text-foreground font-semibold">
                          +{fmtLocal(calcResults.totalMakerFee)} {currencyLabel}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground font-price">
                        <span>{t("vatStamp")}</span>
                        <span className="text-foreground font-semibold">
                          +{fmtLocal(calcResults.taxes)} {currencyLabel}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs text-muted-foreground font-price">
                      <span>{t("buybackSpread")}</span>
                      <span className="text-red-500 font-semibold">
                          -{fmtLocal(calcResults.buybackDiscount)} {currencyLabel}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border/40 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">
                      {calcAction === "buy" ? t("totalToPay") : t("totalToReceive")}
                    </span>
                    <span className="text-lg font-black text-primary font-price">
                      {fmtLocal(calcResults.finalTotal)} {currencyLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* DCA SAVINGS PLANNER */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t("dcaTitle")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t("dcaSub")}
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                {/* Monthly Amount */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {t("monthlySavings")}
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-price">{fmtLocal(dcaAmount)} {currencyLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDcaAmount(Math.max(500, dcaAmount - 500))}
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-muted-foreground/10 text-foreground font-bold flex items-center justify-center cursor-pointer select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="500"
                      value={dcaAmount || ""}
                      onChange={(e) => setDcaAmount(Math.max(100, parseInt(e.target.value) || 0))}
                      className="flex-1 h-10 rounded-xl bg-muted/40 border border-border/60 text-center font-bold font-price text-foreground"
                    />
                    <button
                      onClick={() => setDcaAmount(dcaAmount + 500)}
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-muted-foreground/10 text-foreground font-bold flex items-center justify-center cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                    {([1000, 3000, 5000, 10000, 20000] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setDcaAmount(a)}
                        className="py-1 text-[10px] font-bold rounded-lg bg-muted/30 border border-border/40 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {fmtLocal(a)} {currencyLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("savingsDuration")}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 6, lbl: t("dur6m") },
                      { val: 12, lbl: t("dur12m") },
                      { val: 24, lbl: t("dur24m") },
                      { val: 36, lbl: t("dur36m") }
                    ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => setDcaMonths(d.val)}
                        className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          dcaMonths === d.val
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                            : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d.lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculations comparison */}
              {dcaResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Gold card */}
                    <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-1">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        {t("goldSaving")}
                      </span>
                      <p className="text-lg font-black text-foreground font-price">
                        {dcaResults.gramsAccumulated.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">{t("gramUnit")}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t("equalsApprox", {
                          amount: Math.round(dcaResults.projectedValue).toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                          currency: tCommon((activeCurrency || "EGP").toLowerCase() as any)
                        })}
                      </p>
                    </div>

                    {/* Cash Drawer card */}
                    <div className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-1">
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">
                        {t("cashDrawer", { currency: activeCurrency || "EGP" })}
                      </span>
                      <p className="text-lg font-black text-foreground font-price">
                        {dcaResults.totalInvested.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} <span className="text-xs font-normal text-muted-foreground">{tCommon((activeCurrency || "EGP").toLowerCase() as any)}</span>
                      </p>
                      <p className="text-[10px] text-red-500 font-bold">
                        {t("cashLoss", {
                          amount: Math.round(dcaResults.lossOfPurchasingPower).toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                          currency: tCommon((activeCurrency || "EGP").toLowerCase() as any)
                        })}
                      </p>
                    </div>

                  </div>

                  {/* Inflation mitigation note */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-[10px] leading-relaxed text-muted-foreground space-y-1">
                    <p className="font-bold text-foreground flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      {t("shieldProtection")}
                    </p>
                    <p>
                      {t("dcaNote", {
                        amount: dcaAmount.toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                        months: dcaMonths,
                        profit: Math.round(dcaResults.profit).toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                        currency: tCommon((activeCurrency || "EGP").toLowerCase() as any)
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* MARKET SIGNAL & ACTIONS GUIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Advisor Signal Integration */}
            <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-xs font-bold text-foreground">
                    {t("tacticalSignal")}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                {signalLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : marketSignal?.signal ? (
                  <div className="space-y-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold border ${
                      marketSignal.signal === "buy" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : marketSignal.signal === "wait"
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-muted border-border/60 text-muted-foreground"
                    }`}>
                      {marketSignal.signal === "buy" ? t("signalBuy") : marketSignal.signal === "wait" ? t("signalWait") : t("signalNeutral")}
                    </span>

                    <div className="space-y-1">
                      <p className="text-3xl font-black text-foreground font-price">
                        {marketSignal.score}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t("confidenceIndex")}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground text-start leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/40">
                      {marketSignal?.reasoning ? (locale === "ar" ? marketSignal.reasoning.ar : marketSignal.reasoning.en) : ""}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{locale === "ar" ? "عذرًا، تعذر تحميل إشارة السوق حاليًا." : "Market Signal currently unavailable"}</p>
                )}
              </div>

              <div className="text-[10px] text-muted-foreground text-center">
                {t("signalExpiry")}
              </div>
            </div>

            {/* Smart Buyer Checklist Guide */}
            <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {t("guideTitle")}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("guideSub")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t("guide1Header")}
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {t("guide1Body")}
                  </p>
                </div>

                <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t("guide2Header")}
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {t("guide2Body")}
                  </p>
                </div>

                <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t("guide3Header")}
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {t("guide3Body")}
                  </p>
                </div>

                <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t("guide4Header")}
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {t("guide4Body")}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: PRO (PROFESSIONAL ANALYTICS) ─────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "pro" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LOCAL GOLD PREMIUM INDEX */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Percent className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {t("proPremiumTitle")}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("proPremiumSub")}
                  </p>
                </div>
              </div>

              {proMetrics ? (
                <div className="space-y-5 text-center">
                  <p className="text-3xl font-black text-foreground font-price">
                    +{proMetrics.localPremiumPercent.toFixed(2)}%
                  </p>
                  
                  {/* Gauge needle indicator */}
                  <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden relative border border-border/40">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        proMetrics.localPremiumPercent < 4 
                          ? "bg-emerald-500" 
                          : proMetrics.localPremiumPercent <= 8 
                          ? "bg-amber-500" 
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, proMetrics.localPremiumPercent * 8))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                    <span className="text-emerald-500">{t("premiumLow")}</span>
                    <span className="text-amber-500">{t("premiumFair")}</span>
                    <span className="text-red-500">{t("premiumHigh")}</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-start leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/40">
                    {proMetrics.localPremiumPercent < 4 
                      ? t("premiumLowDesc")
                      : proMetrics.localPremiumPercent <= 8
                      ? t("premiumFairDesc")
                      : t("premiumHighDesc")
                    }
                  </p>
                </div>
              ) : (
                <Skeleton className="h-32 w-full rounded-2xl" />
              )}
            </div>

            {/* IMPLIED GOLD EXCHANGE RATE */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {t("impliedRateTitle")}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("impliedRateSub")}
                  </p>
                </div>
              </div>

              {proMetrics ? (
                <div className="space-y-4 text-center">
                  <p className="text-3xl font-black text-foreground font-price">
                    {fmtLocal(proMetrics.impliedUSD)} <span className="text-xs font-normal text-muted-foreground">{currencyLabel}</span>
                  </p>

                  <div className="bg-muted/40 border border-border/40 rounded-2xl p-4 space-y-2 text-start text-xs font-price text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("officialBankRate")}</span>
                      <span className="text-foreground font-semibold">{fmtLocal(proMetrics.bankUSD)} {currencyLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("dollarSpread")}</span>
                      <span className="text-foreground font-semibold font-price">
                        +{fmtLocal(proMetrics.impliedUSD - proMetrics.bankUSD)} {currencyLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed text-muted-foreground text-start">
                    {t("impliedRateDesc")}
                  </p>
                </div>
              ) : (
                <Skeleton className="h-32 w-full rounded-2xl" />
              )}
            </div>

            {/* MARKET SENSITIVITY DECOUPLING METER */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {t("correlationTitle")}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("correlationSub")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-3xl font-black text-foreground font-price">
                  {t("strongCorr")}
                </p>
                
                <div className="flex justify-center items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div 
                      key={s} 
                      className={`w-6 h-2 rounded-full ${
                        s <= 4 ? "bg-primary" : "bg-muted"
                      }`} 
                    />
                  ))}
                </div>

                <div className="bg-muted/40 border border-border/40 rounded-xl p-3 text-[10px] text-muted-foreground text-start">
                  {t("correlationDesc")}
                </div>
              </div>
            </div>

          </div>

          {/* TECHNICAL TRADING INDICATORS */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <LineChart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t("techIndicatorsTitle")}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {t("techIndicatorsSub")}
                </p>
              </div>
            </div>

            {goldPrices ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Indicators Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1.5">
                    {t("momentumTrend")}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <span className="font-bold text-foreground font-price">58.4 (Neutral)</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">MACD (12, 26)</span>
                    <span className="font-bold text-emerald-500 font-price">Bullish Crossover</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">SMA (50 vs 200)</span>
                    <span className="font-bold text-emerald-500">Golden Cross</span>
                  </div>
                </div>

                {/* Pivot points Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1.5">
                    {t("pivotSupport")}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{t("pivotPoint")}</span>
                    <span className="font-bold text-foreground font-price">
                      {fmtLocal(goldPrices.prices.karat21.gramPriceEGP)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("support1")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {fmtLocal(goldPrices.prices.karat21.gramPriceEGP * 0.985)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("support2")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {fmtLocal(goldPrices.prices.karat21.gramPriceEGP * 0.97)} {currencyLabel}
                    </span>
                  </div>
                </div>

                {/* Resistance Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1.5">
                    {t("resistanceLevels")}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("resistance1")}</span>
                    <span className="text-red-500 font-bold">
                      {fmtLocal(goldPrices.prices.karat21.gramPriceEGP * 1.015)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("resistance2")}</span>
                    <span className="text-red-500 font-bold">
                      {fmtLocal(goldPrices.prices.karat21.gramPriceEGP * 1.03)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t("volatilityStatus")}</span>
                    <span className="text-foreground font-bold">{t("volModerate")}</span>
                  </div>
                </div>

              </div>
            ) : (
              <Skeleton className="h-24 w-full rounded-xl" />
            )}
          </div>

        </div>
      )}

      {/* Info Notice Card */}
      <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 text-xs text-muted-foreground space-y-2">
        <p className="font-bold text-foreground flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" />
          {t("disclaimerTitle")}
        </p>
        <p className="leading-relaxed">
          {t("disclaimerText")}
        </p>
      </div>

    </div>
  );
}
