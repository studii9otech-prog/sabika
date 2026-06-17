import type { GoldPrice, GoldPricesResponse } from "@/types/market";

/**
 * حساب سعر الجرام المصري بناءً على السعر العالمي وسعر الدولار
 */
export function calculateEgyptianGramPrice(
  goldOunceUSD: number,
  usdToEGP: number,
  karat: 12 | 14 | 18 | 21 | 24
): number {
  const purity = karat / 24;
  const gramPriceUSD = goldOunceUSD / 31.1035;
  const gramPriceEGP = gramPriceUSD * usdToEGP * purity;
  const marketMargin = 1.07; // هامش السوق المصري 7%
  return Math.round(gramPriceEGP * marketMargin);
}

/**
 * حساب جميع العيارات دفعة واحدة
 */
export function calculateAllKarats(
  goldOunceUSD: number,
  usdToEGP: number,
  previousDayOunceUSD: number
): GoldPricesResponse["prices"] {
  const karats = [12, 14, 18, 21, 24] as const;

  const makeGoldPrice = (karat: 12 | 14 | 18 | 21 | 24): GoldPrice => {
    const gramPriceEGP = calculateEgyptianGramPrice(
      goldOunceUSD,
      usdToEGP,
      karat
    );
    const prevGramPriceEGP = calculateEgyptianGramPrice(
      previousDayOunceUSD,
      usdToEGP,
      karat
    );
    const purity = karat / 24;
    const gramPriceUSD = goldOunceUSD / 31.1035;

    const change24h = gramPriceEGP - prevGramPriceEGP;
    const changePercent24h =
      ((gramPriceEGP - prevGramPriceEGP) / prevGramPriceEGP) * 100;

    return {
      karatType: karat,
      gramPriceEGP,
      gramPriceUSD: gramPriceUSD * purity,
      change24h: Math.round(change24h),
      changePercent24h: parseFloat(changePercent24h.toFixed(2)),
      direction:
        change24h > 0 ? "up" : change24h < 0 ? "down" : "stable",
      lastUpdated: new Date().toISOString(),
    };
  };

  const prices = {
    karat12: makeGoldPrice(12),
    karat14: makeGoldPrice(14),
    karat18: makeGoldPrice(18),
    karat21: makeGoldPrice(21),
    karat24: makeGoldPrice(24),
    ounceUSD: goldOunceUSD,
    ounceEGP: Math.round(goldOunceUSD * usdToEGP * 1.07),
    kiloEGP: Math.round(
      ((goldOunceUSD / 31.1035) * 1000 * usdToEGP * 1.07)
    ),
  };

  return prices;
}

// Simple seedable pseudo-random generator
function seedRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * توليد بيانات تاريخية محاكاة (Mock) للرسوم البيانية بشكل حتمي وثابت
 */
export function generateMockHistory(
  currentPrice: number,
  days: number,
  volatility: number = 0.015,
  isHourly: boolean = false
): { timestamp: string; price: number }[] {
  const data: { timestamp: string; price: number }[] = [];
  
  // استخدام seed ثابت يعتمد فقط على عدد الأيام والفترة لضمان أن شكل المنحنى ثابت 100% ولا يقفز أو يتغير عند تحديث السعر
  const random = seedRandom(days + (isHourly ? 100 : 200) + 42);
  
  // توليد معاملات التغير النسبية بالرجوع للخلف من النقطة الأخيرة (التي تمثل السعر الحالي بقيمة 1.0)
  const multipliers = new Array(days + 1);
  multipliers[days] = 1.0;
  
  let currentMultiplier = 1.0;
  for (let i = days - 1; i >= 0; i--) {
    // إضافة انحياز طفيف للأعلى لمحاكاة النمو التاريخي للذهب عبر الزمن عند الرجوع للخلف
    const change = (random() - 0.46) * volatility;
    currentMultiplier = currentMultiplier * (1 - change);
    // حدود الأمان لمنع تضخم الأسعار بشكل غير منطقي
    currentMultiplier = Math.max(0.4, Math.min(2.5, currentMultiplier));
    multipliers[i] = currentMultiplier;
  }

  // بناء نقاط البيانات مع التوقيت المناسب
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    if (isHourly) {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }

    const priceVal = Math.round(currentPrice * multipliers[days - i]);
    data.push({
      timestamp: date.toISOString(),
      price: priceVal,
    });
  }

  return data;
}

/**
 * بيانات Mock واقعية لأسعار الذهب في مصر
 */
export const MOCK_GOLD_DATA = {
  ounceUSD: 3350,
  previousDayOunceUSD: 3310,
  usdToEGP: 50.85,
};
