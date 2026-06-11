export interface GoldPrice {
  karatType: 12 | 14 | 18 | 21 | 22 | 24;
  gramPriceEGP: number;
  gramPriceUSD: number;
  change24h: number;
  changePercent24h: number;
  direction: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface MetalPrice {
  metal: "gold" | "silver" | "platinum" | "palladium";
  priceUSD: number;
  priceEGP: number;
  change24h: number;
  changePercent24h: number;
  weekHigh: number;
  weekLow: number;
  yearHigh: number;
  yearLow: number;
  lastUpdated: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  change24h: number;
  lastUpdated: string;
}

export interface MarketSignal {
  signal: "buy" | "wait" | "neutral";
  strength: 1 | 2 | 3;
  score: number;
  reasoning: {
    ar: string;
    en: string;
  };
  validUntil: string;
  factors: SignalFactor[];
}

export interface SignalFactor {
  name: { ar: string; en: string };
  value: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
}

export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

export interface PriceHistory {
  metal: string;
  period: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
  data: ChartDataPoint[];
  currency: string;
}

export interface GoldPricesResponse {
  success: boolean;
  prices: {
    karat12?: GoldPrice;
    karat14: GoldPrice;
    karat18: GoldPrice;
    karat21: GoldPrice;
    karat24: GoldPrice;
    karat22?: GoldPrice;
    ounceUSD: number;
    ounceEGP: number;
    kiloEGP: number;
    
    // Egyptian Market Indicators
    bankUSD?: number;
    saghaUSD?: number;
    usdSpread?: number;
    goldCoinEGP?: number;
    silverEGP?: number;
  };
  usdToEGP: number;
  meta: {
    lastUpdated: string;
    nextUpdate: string;
    cached?: boolean;
  };
}

export interface MetalsResponse {
  success: boolean;
  metals: {
    gold: MetalPrice;
    silver: MetalPrice;
    platinum: MetalPrice;
    palladium: MetalPrice;
  };
  currencies: {
    usd: CurrencyRate;
    eur: CurrencyRate;
    gbp: CurrencyRate;
    sar: CurrencyRate;
    aed: CurrencyRate;
  };
  meta: {
    lastUpdated: string;
  };
}

export type Locale = "ar" | "en";
