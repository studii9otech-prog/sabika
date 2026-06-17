"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useActivePrices, useMetals, useMarketSignal, usePriceHistory, useMarketDepth } from "@/hooks/useLivePrice";
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

  // Fetching 30 days history data for indicators calculations
  const { data: historyResponse, isLoading: historyLoading } = usePriceHistory("1M");
  const historyData = historyResponse?.data || [];

  const historyPrices = useMemo(() => {
    return historyData.map((d: any) => d.price);
  }, [historyData]);

  /* ────────────────────────────────────────────────────────── */
  /* ── Live Trading Terminal States ───────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const baseKarat21Price = useMemo(() => {
    if (!goldPrices || !goldPrices.prices.karat21) return 0;
    return goldPrices.prices.karat21.gramPriceEGP;
  }, [goldPrices]);

  const [bids, setBids] = useState<{ price: number; quantity: number }[]>([]);
  const [asks, setAsks] = useState<{ price: number; quantity: number }[]>([]);
  const [recentTrades, setRecentTrades] = useState<{ id: string; time: string; type: "buy" | "sell"; price: number; quantity: number }[]>([]);

  // Arbitrage monitor states
  const [arbitrageWeight, setArbitrageWeight] = useState<number>(50);
  const [travelExpenses, setTravelExpenses] = useState<number>(18000);

  // Live Binance market depth integration
  const { data: apiDepthData } = useMarketDepth();

  // Map API depth data to current Bids and Asks if available, otherwise fall back to simulated states
  const activeBids = useMemo(() => {
    if (apiDepthData?.success && apiDepthData.depth?.bids?.length > 0) {
      const topBid = parseFloat(apiDepthData.depth.bids[0][0]);
      const topAsk = parseFloat(apiDepthData.depth.asks[0][0]);
      const paxgSpotPrice = (topBid + topAsk) / 2;
      const priceScale = baseKarat21Price > 0 ? (baseKarat21Price / paxgSpotPrice) : 1;

      return apiDepthData.depth.bids.map((b: [string, string]) => {
        const p = parseFloat(b[0]);
        const q = parseFloat(b[1]);
        return {
          price: Math.round(p * priceScale * 10) / 10,
          quantity: Math.round(q * 31.1034768 * 10) / 10
        };
      });
    }
    return bids;
  }, [apiDepthData, bids, baseKarat21Price]);

  const activeAsks = useMemo(() => {
    if (apiDepthData?.success && apiDepthData.depth?.asks?.length > 0) {
      const topBid = parseFloat(apiDepthData.depth.bids[0][0]);
      const topAsk = parseFloat(apiDepthData.depth.asks[0][0]);
      const paxgSpotPrice = (topBid + topAsk) / 2;
      const priceScale = baseKarat21Price > 0 ? (baseKarat21Price / paxgSpotPrice) : 1;

      return apiDepthData.depth.asks.map((a: [string, string]) => {
        const p = parseFloat(a[0]);
        const q = parseFloat(a[1]);
        return {
          price: Math.round(p * priceScale * 10) / 10,
          quantity: Math.round(q * 31.1034768 * 10) / 10
        };
      });
    }
    return asks;
  }, [apiDepthData, asks, baseKarat21Price]);

  const activeRecentTrades = useMemo(() => {
    if (apiDepthData?.success && apiDepthData.trades?.length > 0) {
      const topBid = apiDepthData.depth?.bids?.[0]?.[0] ? parseFloat(apiDepthData.depth.bids[0][0]) : 4200;
      const topAsk = apiDepthData.depth?.asks?.[0]?.[0] ? parseFloat(apiDepthData.depth.asks[0][0]) : 4200;
      const paxgSpotPrice = (topBid + topAsk) / 2;
      const priceScale = baseKarat21Price > 0 ? (baseKarat21Price / paxgSpotPrice) : 1;

      return apiDepthData.trades.map((t: any) => {
        const date = new Date(t.time);
        const timeStr = date.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", { hour12: false });
        return {
          id: t.id.toString(),
          time: timeStr,
          type: t.isBuyerMaker ? "sell" as const : "buy" as const,
          price: Math.round(parseFloat(t.price) * priceScale * 10) / 10,
          quantity: Math.round(parseFloat(t.qty) * 31.1034768 * 10) / 10
        };
      });
    }
    return recentTrades;
  }, [apiDepthData, recentTrades, baseKarat21Price, locale]);

  const investmentProducts = useMemo(() => {
    if (!goldPrices || !goldPrices.prices.karat24 || !goldPrices.prices.karat21) return [];

    const local24 = goldPrices.prices.karat24.gramPriceEGP;
    const local21 = goldPrices.prices.karat21.gramPriceEGP;
    const localScale = baseKarat21Price > 1000 ? 1 : (baseKarat21Price / 3100);

    // BTC Gold Coin (8g 21K)
    const coinNetVal = local21 * 8;
    const coinMakerFee = 65 * 8 * localScale; // 65 EGP/g maker fee + stamp scaled
    const coinVat = coinMakerFee * 0.14; // 14% VAT on maker fee
    const coinBuyPrice = coinNetVal + coinMakerFee + coinVat;
    const coinSellPrice = coinNetVal - 10 * 8 * localScale; // buyback discount of 10 EGP/g
    const coinCashback = coinMakerFee * 0.60;

    // 10g Bar (24K)
    const bar10NetVal = local24 * 10;
    const bar10MakerFee = 78 * 10 * localScale;
    const bar10Vat = bar10MakerFee * 0.14;
    const bar10BuyPrice = bar10NetVal + bar10MakerFee + bar10Vat;
    const bar10SellPrice = bar10NetVal - 5 * 10 * localScale; // buyback discount of 5 EGP/g
    const bar10Cashback = bar10MakerFee * 0.55;

    // 50g Bar (24K)
    const bar50NetVal = local24 * 50;
    const bar50MakerFee = 58 * 50 * localScale;
    const bar50Vat = bar50MakerFee * 0.14;
    const bar50BuyPrice = bar50NetVal + bar50MakerFee + bar50Vat;
    const bar50SellPrice = bar50NetVal - 5 * 50 * localScale;
    const bar50Cashback = bar50MakerFee * 0.55;

    // Ounce Bar (31.10g 24K)
    const ounceNetVal = local24 * 31.1035;
    const ounceMakerFee = 60 * 31.1035 * localScale;
    const ounceVat = ounceMakerFee * 0.14;
    const ounceBuyPrice = ounceNetVal + ounceMakerFee + ounceVat;
    const ounceSellPrice = ounceNetVal - 5 * 31.1035 * localScale;
    const ounceCashback = ounceMakerFee * 0.55;

    return [
      {
        id: "coin",
        nameAr: "جنيه ذهب استثماري (BTC)",
        nameEn: "Investment Gold Coin (BTC)",
        karat: "21K",
        weight: 8,
        buyPrice: coinBuyPrice,
        sellPrice: coinSellPrice,
        makerFee: coinMakerFee + coinVat,
        cashback: coinCashback,
        purity: "87.5%",
      },
      {
        id: "bar10",
        nameAr: "سبيكة ذهب نقي 10 جرام",
        nameEn: "10g Pure Gold Bar",
        karat: "24K",
        weight: 10,
        buyPrice: bar10BuyPrice,
        sellPrice: bar10SellPrice,
        makerFee: bar10MakerFee + bar10Vat,
        cashback: bar10Cashback,
        purity: "99.99%",
      },
      {
        id: "bar50",
        nameAr: "سبيكة ذهب نقي 50 جرام",
        nameEn: "50g Pure Gold Bar",
        karat: "24K",
        weight: 50,
        buyPrice: bar50BuyPrice,
        sellPrice: bar50SellPrice,
        makerFee: bar50MakerFee + bar50Vat,
        cashback: bar50Cashback,
        purity: "99.99%",
      },
      {
        id: "ounce",
        nameAr: "أوقية ذهب استثمارية (سبيكة)",
        nameEn: "Investment Gold Ounce Bar",
        karat: "24K",
        weight: 31.1,
        buyPrice: ounceBuyPrice,
        sellPrice: ounceSellPrice,
        makerFee: ounceMakerFee + ounceVat,
        cashback: ounceCashback,
        purity: "99.99%",
      }
    ];
  }, [goldPrices, baseKarat21Price]);

  useEffect(() => {
    if (baseKarat21Price > 0 && bids.length === 0) {
      const stepSize = baseKarat21Price > 1000 ? 1 : 0.1;
      const initialBids = [
        { price: Math.round((baseKarat21Price - stepSize * 1.5) * 10) / 10, quantity: Math.round(15 + Math.random() * 85) },
        { price: Math.round((baseKarat21Price - stepSize * 3) * 10) / 10, quantity: Math.round(30 + Math.random() * 170) },
        { price: Math.round((baseKarat21Price - stepSize * 4.5) * 10) / 10, quantity: Math.round(50 + Math.random() * 250) },
        { price: Math.round((baseKarat21Price - stepSize * 6) * 10) / 10, quantity: Math.round(80 + Math.random() * 320) },
        { price: Math.round((baseKarat21Price - stepSize * 8) * 10) / 10, quantity: Math.round(120 + Math.random() * 480) }
      ];
      const initialAsks = [
        { price: Math.round((baseKarat21Price + stepSize * 1.5) * 10) / 10, quantity: Math.round(15 + Math.random() * 85) },
        { price: Math.round((baseKarat21Price + stepSize * 3) * 10) / 10, quantity: Math.round(25 + Math.random() * 150) },
        { price: Math.round((baseKarat21Price + stepSize * 4.5) * 10) / 10, quantity: Math.round(45 + Math.random() * 210) },
        { price: Math.round((baseKarat21Price + stepSize * 6) * 10) / 10, quantity: Math.round(70 + Math.random() * 290) },
        { price: Math.round((baseKarat21Price + stepSize * 8) * 10) / 10, quantity: Math.round(110 + Math.random() * 410) }
      ];

      setBids(initialBids);
      setAsks(initialAsks);

      const initialTrades = Array.from({ length: 8 }).map((_, idx) => {
        const isBuy = Math.random() > 0.5;
        const offset = (Math.random() - 0.5) * 8 * stepSize;
        const date = new Date(Date.now() - idx * 25000);
        const timeStr = date.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", { hour12: false });
        return {
          id: Math.random().toString(36).substr(2, 9),
          time: timeStr,
          type: isBuy ? "buy" as const : "sell" as const,
          price: Math.round((baseKarat21Price + offset) * 10) / 10,
          quantity: Math.round((2 + Math.random() * 48) * 10) / 10
        };
      });
      setRecentTrades(initialTrades);
    }
  }, [baseKarat21Price, bids.length, locale]);

  useEffect(() => {
    if (baseKarat21Price === 0) return;

    const interval = setInterval(() => {
      const stepSize = baseKarat21Price > 1000 ? 1 : 0.1;
      
      setBids(prevBids => 
        prevBids.map((b, idx) => {
          const changePct = 0.85 + Math.random() * 0.3;
          let newQty = Math.round(b.quantity * changePct);
          if (newQty < 5) newQty = Math.round(10 + Math.random() * 90);
          if (newQty > 1000) newQty = Math.round(100 + Math.random() * 300);
          
          const priceOffset = -((idx * 1.5 + 1.5) * stepSize + (Math.random() > 0.75 ? (Math.random() > 0.5 ? stepSize : -stepSize) : 0));
          return {
            price: Math.round((baseKarat21Price + priceOffset) * 10) / 10,
            quantity: newQty
          };
        })
      );

      setAsks(prevAsks => 
        prevAsks.map((a, idx) => {
          const changePct = 0.85 + Math.random() * 0.3;
          let newQty = Math.round(a.quantity * changePct);
          if (newQty < 5) newQty = Math.round(10 + Math.random() * 90);
          if (newQty > 1000) newQty = Math.round(100 + Math.random() * 300);
          
          const priceOffset = ((idx * 1.5 + 1.5) * stepSize + (Math.random() > 0.75 ? (Math.random() > 0.5 ? stepSize : -stepSize) : 0));
          return {
            price: Math.round((baseKarat21Price + priceOffset) * 10) / 10,
            quantity: newQty
          };
        })
      );

      if (Math.random() > 0.35) {
        const isBuy = Math.random() > 0.5;
        const tradePrice = isBuy 
          ? (baseKarat21Price + stepSize * (0.5 + Math.random() * 1.5)) 
          : (baseKarat21Price - stepSize * (0.5 + Math.random() * 1.5));
        
        const newTrade = {
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", { hour12: false }),
          type: isBuy ? "buy" as const : "sell" as const,
          price: Math.round(tradePrice * 10) / 10,
          quantity: Math.round((1 + Math.random() * 30) * 10) / 10
        };

        setRecentTrades(prev => [newTrade, ...prev.slice(0, 7)]);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [baseKarat21Price, locale]);

  /* ────────────────────────────────────────────────────────── */
  /* ── Calculator States ───────────────────────────────────── */
  /* ────────────────────────────────────────────────────────── */
  const [calcAction, setCalcAction] = useState<"buy" | "sell">("buy");
  const [calcKarat, setCalcKarat] = useState<"24" | "21" | "18" | "14" | "12">("21");
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [makerFee, setMakerFee] = useState<number>(150); // EGP per gram maker fee (المصنعية)
  const [productType, setProductType] = useState<"bullion" | "jewelry">("bullion"); // bullion includes cashback

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

    // Calculate expected resold cashback (e.g. 60% of maker fee is returned upon selling back bullion)
    const expectedCashback = (calcAction === "buy" && productType === "bullion") 
      ? totalMakerFee * 0.60 
      : 0;

    return {
      rawValue,
      taxes,
      totalMakerFee,
      finalTotal,
      buybackDiscount: calcAction === "sell" ? calcWeight * 20 : 0,
      expectedCashback,
      netCost: (calcAction === "buy" && productType === "bullion")
        ? (rawValue + totalMakerFee + taxes) - (totalMakerFee * 0.60)
        : rawValue + totalMakerFee + taxes
    };
  }, [currentGramPrice, calcWeight, makerFee, calcAction, productType]);

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

    // Bank Certificate Value (22% annual interest yield, compounded monthly)
    const certAnnualRate = 0.22;
    const certMonthlyRate = certAnnualRate / 12;
    let certTotal = 0;
    for (let i = 0; i < dcaMonths; i++) {
      certTotal = (certTotal + dcaAmount) * (1 + certMonthlyRate);
    }
    const certProfit = certTotal - totalInvested;

    return {
      totalInvested,
      gramsAccumulated,
      projectedValue,
      profit,
      cashRealValue,
      lossOfPurchasingPower,
      certTotal,
      certProfit
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

  // RSI (14) Wilder's smoothed average calculation
  const rsiVal = useMemo(() => {
    if (historyPrices.length < 15) return { value: 58.4, label: isAr ? "محايد" : "Neutral" };
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= 14; i++) {
      const diff = historyPrices[i] - historyPrices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    
    let avgGain = gains / 14;
    let avgLoss = losses / 14;
    
    for (let i = 15; i < historyPrices.length; i++) {
      const diff = historyPrices[i] - historyPrices[i - 1];
      const currentGain = diff > 0 ? diff : 0;
      const currentLoss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * 13 + currentGain) / 14;
      avgLoss = (avgLoss * 13 + currentLoss) / 14;
    }
    
    if (avgLoss === 0) return { value: 100, label: isAr ? "شراء مفرط" : "Overbought" };
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    const roundedRsi = parseFloat(rsi.toFixed(1));
    
    let label = isAr ? "محايد" : "Neutral";
    if (roundedRsi > 70) label = isAr ? "شراء مفرط" : "Overbought";
    else if (roundedRsi < 30) label = isAr ? "بيع مفرط" : "Oversold";
    
    return { value: roundedRsi, label };
  }, [historyPrices, isAr]);

  // MACD (12, 26, 9) calculation
  const macdVal = useMemo(() => {
    if (historyPrices.length < 26) {
      return {
        macd: 0,
        signalLine: 0,
        signalText: isAr ? "اتجاه صاعد" : "Bullish Trend"
      };
    }
    
    const calcEMA = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const ema = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };
    
    const ema12 = calcEMA(historyPrices, 12);
    const ema26 = calcEMA(historyPrices, 26);
    
    const macdLine = ema12.map((val, idx) => val - ema26[idx]);
    const signalLine = calcEMA(macdLine, 9);
    
    const lastMacd = macdLine[macdLine.length - 1];
    const lastSignal = signalLine[signalLine.length - 1];
    const prevMacd = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];
    
    let signalText = isAr ? "محايد" : "Neutral";
    if (lastMacd > lastSignal && prevMacd <= prevSignal) {
      signalText = isAr ? "تقاطع شرائي (Bullish)" : "Bullish Crossover";
    } else if (lastMacd < lastSignal && prevMacd >= prevSignal) {
      signalText = isAr ? "تقاطع بيعي (Bearish)" : "Bearish Crossover";
    } else if (lastMacd > lastSignal) {
      signalText = isAr ? "اتجاه صاعد (Bullish)" : "Bullish Trend";
    } else {
      signalText = isAr ? "اتجاه هابط (Bearish)" : "Bearish Trend";
    }
    
    return { macd: lastMacd, signalLine: lastSignal, signalText };
  }, [historyPrices, isAr]);

  // SMA Crossover (5 vs 20)
  const smaCrossVal = useMemo(() => {
    const shortPeriod = 5;
    const longPeriod = 20;
    if (historyPrices.length < longPeriod) {
      return isAr ? "تقاطع ذهبي صاعد" : "Golden Cross";
    }
    
    const calcAvg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    const smaShort = calcAvg(historyPrices.slice(-shortPeriod));
    const smaLong = calcAvg(historyPrices.slice(-longPeriod));
    
    const prevPrices = historyPrices.slice(0, -1);
    const prevSmaShort = calcAvg(prevPrices.slice(-shortPeriod));
    const prevSmaLong = calcAvg(prevPrices.slice(-longPeriod));
    
    if (smaShort > smaLong && prevSmaShort <= prevSmaLong) {
      return isAr ? "تقاطع ذهبي صاعد (Golden Cross)" : "Golden Cross (Bullish)";
    } else if (smaShort < smaLong && prevSmaShort >= prevSmaLong) {
      return isAr ? "تقاطع الموت الهابط (Death Cross)" : "Death Cross (Bearish)";
    } else if (smaShort > smaLong) {
      return isAr ? "محاذاة صاعدة (Bullish)" : "Bullish Alignment";
    } else {
      return isAr ? "محاذاة هابطة (Bearish)" : "Bearish Alignment";
    }
  }, [historyPrices, isAr]);

  // Volatility status calculation (average daily percent change over 14 days)
  const volatilityVal = useMemo(() => {
    if (historyPrices.length < 5) return isAr ? "معتدل" : "Moderate";
    let sumPctChange = 0;
    for (let i = 1; i < historyPrices.length; i++) {
      const pct = Math.abs(historyPrices[i] - historyPrices[i - 1]) / historyPrices[i - 1];
      sumPctChange += pct;
    }
    const avgPct = (sumPctChange / (historyPrices.length - 1)) * 100;
    
    if (avgPct > 1.0) return isAr ? "مرتفع" : "High";
    if (avgPct < 0.4) return isAr ? "منخفض" : "Low";
    return isAr ? "معتدل" : "Moderate";
  }, [historyPrices, isAr]);

  // Classical Pivot Points support and resistance calculations
  const dynamicPivots = useMemo(() => {
    if (!goldPrices || !goldPrices.prices.karat21) return null;
    const currentPrice = goldPrices.prices.karat21.gramPriceEGP;
    
    if (historyPrices.length < 3) {
      return {
        pp: currentPrice,
        s1: currentPrice * 0.985,
        s2: currentPrice * 0.97,
        r1: currentPrice * 1.015,
        r2: currentPrice * 1.03
      };
    }
    
    const recentPrices = historyPrices.slice(-3);
    const high = Math.max(...recentPrices, currentPrice);
    const low = Math.min(...recentPrices, currentPrice);
    const close = currentPrice;
    
    const pp = (high + low + close) / 3;
    const s1 = (2 * pp) - high;
    const r1 = (2 * pp) - low;
    const s2 = pp - (high - low);
    const r2 = pp + (high - low);
    
    return { pp, s1, s2, r1, r2 };
  }, [goldPrices, historyPrices]);

  // Decoupling correlation index linked to premium percent
  const correlationData = useMemo(() => {
    if (!proMetrics) {
      return {
        label: t("strongCorr"),
        description: t("correlationDesc"),
        rating: 4
      };
    }
    const premium = proMetrics.localPremiumPercent;
    if (premium < 4) {
      return {
        label: t("veryStrongCorr"),
        description: t("correlationDescVeryStrong"),
        rating: 5
      };
    } else if (premium <= 8) {
      return {
        label: t("strongCorr"),
        description: t("correlationDescStrong"),
        rating: 4
      };
    } else if (premium <= 12) {
      return {
        label: t("modCorr"),
        description: t("correlationDescMod"),
        rating: 3
      };
    } else {
      return {
        label: t("weakCorr"),
        description: t("correlationDescWeak"),
        rating: 2
      };
    }
  }, [proMetrics, t]);

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

          {/* Live Bullion & Coin Investment Monitor */}
          {!goldLoading && investmentProducts.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                    {isAr ? "مراقب تسعير سبائك وجنيهات الذهب الاستثمارية الحية" : "Live Bullion & Sovereign Coin Investment Monitor"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr 
                      ? "الأسعار التفصيلية للسبائك وجنيهات الصاغة شاملة تكلفة المصنعية والدمغة وهامش الكاش باك المسترد عند البيع"
                      : "Real-time pricing for investment bars and sovereign coins including fabrication fees, stamp duties, and buyback cashback offsets"
                    }
                  </p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {isAr ? "تحديث مباشر" : "Live Spot Feeds"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {investmentProducts.map((product) => {
                  return (
                    <div 
                      key={product.id} 
                      className="bg-card border border-border/60 hover:border-primary/30 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {product.karat}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground">
                            {isAr ? `نقاء: ${product.purity}` : `Purity: ${product.purity}`}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-foreground pt-1 group-hover:text-primary transition-colors">
                          {isAr ? product.nameAr : product.nameEn}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {/* Buy Price */}
                        <div className="flex justify-between items-baseline bg-muted/40 p-2.5 rounded-xl border border-border/30">
                          <span className="text-[10px] text-muted-foreground font-semibold">{isAr ? "الشراء (جديد):" : "Buy (New):"}</span>
                          <span className="text-sm font-black text-foreground font-price">
                            {fmtLocal(product.buyPrice)} <span className="text-[9px] font-normal text-muted-foreground">{currencyLabel}</span>
                          </span>
                        </div>

                        {/* Sell Price */}
                        <div className="flex justify-between items-baseline bg-muted/25 p-2.5 rounded-xl border border-border/20">
                          <span className="text-[10px] text-muted-foreground font-semibold">{isAr ? "البيع (استرداد):" : "Sell (Buyback):"}</span>
                          <span className="text-sm font-black text-primary font-price">
                            {fmtLocal(product.sellPrice)} <span className="text-[9px] font-normal text-muted-foreground">{currencyLabel}</span>
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/20 pt-2 text-[9px] text-muted-foreground space-y-1.5">
                        <div className="flex justify-between">
                          <span>{isAr ? "المصنعية والضريبة والدمغة:" : "Fabrication + Taxes + Stamp:"}</span>
                          <span className="font-semibold text-foreground font-price">+{fmtLocal(product.makerFee)} {currencyLabel}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 dark:bg-emerald-500/[0.02] p-1.5 rounded-lg border border-emerald-500/10">
                          <span>{isAr ? "استرداد الكاش باك المتوقع:" : "Expected Cashback Offset:"}</span>
                          <span className="font-price">~{fmtLocal(product.cashback)} {currencyLabel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {goldLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
                <Skeleton className="h-[400px] lg:col-span-1 rounded-3xl" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* COLUMN 1 & 2: Order Book & Sales Tape */}
              <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t("orderBookTitle")}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t("orderBookSub")}
                      </p>
                    </div>
                    
                    {/* Live Ticker Status Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      {t("liveActive")}
                    </div>
                  </div>

                  {/* Side-by-Side Flex/Grid on md screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* ORDER BOOK (Bids/Asks) */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase px-1">
                        <span>{isAr ? "الطلب" : "Bid"}</span>
                        <span>{isAr ? "سعر العيار (٢١)" : "Price (21K)"}</span>
                        <span>{isAr ? "العرض" : "Ask"}</span>
                      </div>

                      {/* Asks (Sells) - Sorted High to Low visually (Asks are on top) */}
                      <div className="space-y-1">
                        {activeAsks.slice().reverse().map((ask: { price: number; quantity: number }, idx: number) => {
                          const maxQty = Math.max(...activeAsks.map((a: { quantity: number }) => a.quantity), ...activeBids.map((b: { quantity: number }) => b.quantity), 100);
                          const widthPct = Math.min(100, (ask.quantity / maxQty) * 100);
                          return (
                            <div key={`ask-${idx}`} className="relative flex justify-between items-center py-1.5 px-2 rounded-lg text-xs font-price overflow-hidden group">
                              <div 
                                className="absolute inset-y-0 right-0 bg-red-500/5 dark:bg-red-500/10 transition-all duration-500"
                                style={{ width: `${widthPct}%` }}
                              />
                              <span className="text-muted-foreground z-10">{ask.quantity}g</span>
                              <span className="text-rose-500 font-bold z-10">{fmtLocal(ask.price)}</span>
                              <span className="text-red-500/80 text-[10px] font-bold z-10">{isAr ? "عرض" : "ASK"}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Spread details bar */}
                      {activeBids.length > 0 && activeAsks.length > 0 && (
                        <div className="bg-muted/40 border border-border/40 py-2 px-3 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">{isAr ? "الفارق:" : "Spread:"}</span>
                            <span className="font-bold text-foreground font-price">
                              {fmtLocal(Math.max(0.1, activeAsks[0].price - activeBids[0].price))} {currencyLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">{isAr ? "الوسط:" : "Mid:"}</span>
                            <span className="font-bold text-primary font-price">
                              {fmtLocal((activeAsks[0].price + activeBids[0].price) / 2)} {currencyLabel}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Bids (Buys) */}
                      <div className="space-y-1">
                        {activeBids.map((bid: { price: number; quantity: number }, idx: number) => {
                          const maxQty = Math.max(...activeAsks.map((a: { quantity: number }) => a.quantity), ...activeBids.map((b: { quantity: number }) => b.quantity), 100);
                          const widthPct = Math.min(100, (bid.quantity / maxQty) * 100);
                          return (
                            <div key={`bid-${idx}`} className="relative flex justify-between items-center py-1.5 px-2 rounded-lg text-xs font-price overflow-hidden group">
                              <div 
                                className="absolute inset-y-0 left-0 bg-emerald-500/5 dark:bg-emerald-500/10 transition-all duration-500"
                                style={{ width: `${widthPct}%` }}
                              />
                              <span className="text-emerald-500/80 text-[10px] font-bold z-10">{isAr ? "طلب" : "BID"}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold z-10">{fmtLocal(bid.price)}</span>
                              <span className="text-muted-foreground z-10">{bid.quantity}g</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* TAPE READER (Time & Sales) */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase border-b border-border/35 pb-2 px-1 flex items-center justify-between">
                        <span>{t("recentTradesTitle")}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </h4>

                      <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                        {activeRecentTrades.map((trade: { id: string; time: string; type: "buy" | "sell"; price: number; quantity: number }) => (
                          <div 
                            key={trade.id} 
                            className="flex justify-between items-center py-2 px-2.5 rounded-xl text-xs bg-muted/20 border border-border/10 hover:border-border/40 transition-all animate-in fade-in slide-in-from-top-1 duration-300"
                          >
                            <span className="text-muted-foreground font-mono text-[10px]">{trade.time}</span>
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              trade.type === "buy" ? "text-emerald-500" : "text-rose-500"
                            }`}>
                              {trade.type === "buy" ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5" />
                              )}
                              {trade.type === "buy" ? (isAr ? "شراء" : "BUY") : (isAr ? "بيع" : "SELL")}
                            </span>
                            <span className="font-semibold text-foreground">{trade.quantity}g</span>
                            <span className="font-bold text-foreground font-price">{fmtLocal(trade.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footnote under book */}
                <p className="text-[10px] text-muted-foreground leading-relaxed pt-3 border-t border-border/20">
                  {isAr 
                    ? "* يتم تحديث دفتر الطلبات وحجم التداول وعمليات الشراء والبيع بشكل لحظي ومستمر بناءً على تغيرات أسعار الذهب الفورية المسجلة."
                    : "* The order book volume depth, spreads and completed transactions tape are updated dynamically in real-time according to spot market volatility."
                  }
                </p>
              </div>

              {/* COLUMN 3: Cairo vs Dubai Arbitrage Spread Monitor */}
              <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 space-y-6 flex flex-col justify-between h-full">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {t("arbitrageTitle")}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t("arbitrageSub")}
                      </p>
                    </div>
                  </div>

                  {goldPrices ? (
                    <div className="space-y-5">
                      {/* Weight Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isAr ? "وزن الذهب المستهدف (عيار 24)" : "Target Gold Weight (24K)"}
                          </label>
                          <span className="text-xs font-bold text-foreground font-price">
                            {arbitrageWeight} {isAr ? "جرام" : "grams"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          step="5"
                          value={arbitrageWeight}
                          onChange={(e) => setArbitrageWeight(parseInt(e.target.value))}
                          className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                          <span>10g</span>
                          <span>50g</span>
                          <span>100g</span>
                          <span>150g</span>
                        </div>
                      </div>

                      {/* Flight & Ticket Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            {isAr ? "تكاليف السفر الشاملة (تذكرة + إقامة)" : "Travel Expenses (Flight + Hotel)"}
                          </label>
                          <span className="text-xs font-bold text-foreground font-price">
                            {fmtInt(travelExpenses)} EGP
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5000"
                          max="40000"
                          step="1000"
                          value={travelExpenses}
                          onChange={(e) => setTravelExpenses(parseInt(e.target.value))}
                          className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                          <span>5,000 EGP</span>
                          <span>20,000 EGP</span>
                          <span>40,000 EGP</span>
                        </div>
                      </div>

                      {/* Comparative Statistics */}
                      <div className="bg-muted/40 border border-border/40 rounded-2xl p-4 space-y-2.5 text-xs">
                        {/* Egypt Cost */}
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{isAr ? "سعر الشراء في القاهرة:" : "Cairo Cost:"}</span>
                          <span className="font-bold text-foreground font-price">
                            {fmtInt(goldPrices.prices.karat24.gramPriceEGP * arbitrageWeight)} EGP
                          </span>
                        </div>

                        {/* Dubai Cost */}
                        {(() => {
                          const ounceUSD = goldPrices.prices.ounceUSD;
                          const bankUSD = goldPrices.usdToEGP;
                          const baseDubai24EGP = (ounceUSD / 31.1034768) * bankUSD;
                          const dubaiGoldCostEGP = baseDubai24EGP * 1.015 * arbitrageWeight;
                          const dubaiTotalCostEGP = dubaiGoldCostEGP + travelExpenses;
                          const netSaving = (goldPrices.prices.karat24.gramPriceEGP * arbitrageWeight) - dubaiTotalCostEGP;
                          const isProfitable = netSaving > 0;

                          return (
                            <>
                              <div className="flex justify-between items-center border-b border-border/30 pb-2">
                                <span className="text-muted-foreground">{isAr ? "سعر دبي والشراء (شامل السفر):" : "Dubai & Gold (incl. Travel):"}</span>
                                <span className="font-bold text-foreground font-price">
                                  {fmtInt(dubaiTotalCostEGP)} EGP
                                </span>
                              </div>

                              {/* Profit Badge & Valuation */}
                              <div className="pt-2 text-center space-y-2">
                                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                                  isProfitable 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-500"
                                }`}>
                                  {isProfitable ? (
                                    isAr ? "✓ استيراد شخصي مربح" : "✓ Profitable Travel Arbitrage"
                                  ) : (
                                    isAr ? "✗ الشراء المحلي أفضل" : "✗ Local Purchase Better"
                                  )}
                                </div>
                                
                                <div className="space-y-0.5">
                                  <p className={`text-2xl font-black font-price ${isProfitable ? "text-emerald-500" : "text-red-500"}`}>
                                    {isProfitable ? "+" : ""}{fmtInt(netSaving)} EGP
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {isAr ? "صافي التوفير / الأرباح" : "Net Savings / Profits"}
                                  </p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="h-48 w-full rounded-2xl" />
                  )}
                </div>

                {/* Explanatory Footer inside card */}
                <div className="text-[9px] leading-relaxed text-muted-foreground bg-muted/20 border border-border/10 p-3 rounded-xl mt-4">
                  <p className="font-bold text-foreground mb-0.5 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary" />
                    {isAr ? "معلومات الاستيراد:" : "Import Info:"}
                  </p>
                  <p>
                    {isAr 
                      ? "يقارن هذا النموذج سعر الصاغة المحلي بدولار الصاغة الضمني مع سعر الخليج الرسمي المحسوب بدولار البنك. حد إعفاء الذهب الشخصي من الجمارك للمسافرين القادمين لمصر هو 150 جرام."
                      : "This model compares local Sagha premium prices against Gulf prices converted at the official bank USD rate. The custom duty-free allowance for personal gold imports into Egypt is 150g per passenger."
                    }
                  </p>
                </div>

              </div>

            </div>
          )}

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

              {/* Inputs */}
              <div className="space-y-4">
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

                {/* Product Type selection (Only for buy) */}
                {calcAction === "buy" && (
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("goldProductType")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setProductType("bullion")}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          productType === "bullion"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("bullionOption")}
                      </button>
                      <button
                        onClick={() => setProductType("jewelry")}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          productType === "jewelry"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("jewelryOption")}
                      </button>
                    </div>
                  </div>
                )}

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

                      {productType === "bullion" && (
                        <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-price font-bold bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                          <span>{t("cashbackEstimate")}</span>
                          <span>
                            ~{fmtLocal(calcResults.expectedCashback)} {currencyLabel}
                          </span>
                        </div>
                      )}
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
                      {calcAction === "buy" ? (productType === "bullion" ? t("netCost") : t("totalToPay")) : t("totalToReceive")}
                    </span>
                    <span className="text-lg font-black text-primary font-price">
                      {fmtLocal(calcAction === "buy" && productType === "bullion" ? calcResults.netCost : calcResults.finalTotal)} {currencyLabel}
                    </span>
                  </div>

                  {calcAction === "buy" && productType === "bullion" && (
                    <p className="text-[9px] text-muted-foreground text-start leading-relaxed pt-1 border-t border-border/10">
                      {t("cashbackNote")}
                    </p>
                  )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
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

                    {/* Bank Certificate Card */}
                    <div className="bg-primary/5 dark:bg-primary/[0.02] border border-primary/20 rounded-2xl p-4 text-center space-y-1">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wide">
                        {t("bankCert")}
                      </span>
                      <p className="text-lg font-black text-foreground font-price">
                        {Math.round(dcaResults.certTotal).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} <span className="text-xs font-normal text-muted-foreground">{tCommon((activeCurrency || "EGP").toLowerCase() as any)}</span>
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {locale === "ar" ? "العائد: +" : "Profit: +"}
                        {Math.round(dcaResults.certProfit).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
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
                <p className="text-xl font-bold text-foreground">
                  {correlationData.label}
                </p>
                
                <div className="flex justify-center items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div 
                      key={s} 
                      className={`w-6 h-2 rounded-full transition-all duration-300 ${
                        s <= correlationData.rating 
                          ? (correlationData.rating >= 4 ? "bg-emerald-500" : correlationData.rating === 3 ? "bg-amber-500" : "bg-red-500") 
                          : "bg-muted"
                      }`} 
                    />
                  ))}
                </div>

                <div className="bg-muted/40 border border-border/40 rounded-xl p-3 text-[10px] text-muted-foreground text-start min-h-[72px] flex items-center">
                  {correlationData.description}
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

            {goldPrices && dynamicPivots ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
                
                {/* Indicators Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1.5">
                    {t("momentumTrend")}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">RSI (14)</span>
                    {historyLoading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className={`font-bold font-price ${
                        rsiVal.value > 70 ? "text-red-500" : rsiVal.value < 30 ? "text-emerald-500" : "text-foreground"
                      }`}>
                        {rsiVal.value} ({rsiVal.label})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">MACD (12, 26)</span>
                    {historyLoading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <span className={`font-bold font-price ${
                        macdVal.signalText.includes("Bullish") || macdVal.signalText.includes("شرائي") || macdVal.signalText.includes("صاعد") 
                          ? "text-emerald-500" 
                          : macdVal.signalText.includes("Bearish") || macdVal.signalText.includes("بيعي") || macdVal.signalText.includes("هابط")
                          ? "text-rose-500"
                          : "text-foreground"
                      }`}>
                        {macdVal.signalText}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">SMA Cross (5/20)</span>
                    {historyLoading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <span className={`font-bold ${
                        smaCrossVal.includes("Golden") || smaCrossVal.includes("ذهبي") || smaCrossVal.includes("صاعدة")
                          ? "text-emerald-500"
                          : smaCrossVal.includes("Death") || smaCrossVal.includes("الموت") || smaCrossVal.includes("هابطة")
                          ? "text-rose-500"
                          : "text-foreground"
                      }`}>
                        {smaCrossVal}
                      </span>
                    )}
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
                      {fmtLocal(dynamicPivots.pp)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("support1")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {fmtLocal(dynamicPivots.s1)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("support2")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {fmtLocal(dynamicPivots.s2)} {currencyLabel}
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
                    <span className="text-rose-500 font-bold">
                      {fmtLocal(dynamicPivots.r1)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-price">
                    <span className="text-muted-foreground">{t("resistance2")}</span>
                    <span className="text-rose-500 font-bold">
                      {fmtLocal(dynamicPivots.r2)} {currencyLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t("volatilityStatus")}</span>
                    {historyLoading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className={`font-bold ${
                        volatilityVal === "High" || volatilityVal === "مرتفع" 
                          ? "text-amber-500" 
                          : volatilityVal === "Low" || volatilityVal === "منخفض" 
                          ? "text-emerald-500" 
                          : "text-foreground"
                      }`}>
                        {volatilityVal}
                      </span>
                    )}
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
