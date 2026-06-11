import type { MarketSignal, SignalFactor } from "@/types/market";

interface SignalInput {
  currentPrice: number;
  price24hAgo: number;
  price7dAgo: number;
  price30dAgo: number;
  usdChange24h: number;
}

function generateReasoning(
  signal: "buy" | "wait" | "neutral",
  score: number
): { ar: string; en: string } {
  if (signal === "buy") {
    return {
      ar: "السوق أظهر استقراراً مع توقعات بارتفاع متوسط خلال الأيام القادمة بناءً على تحركات الدولار والطلب العالمي.",
      en: "The market shows stability with moderate upside expectations based on dollar movements and global demand.",
    };
  } else if (signal === "wait") {
    return {
      ar: "الذهب في مرحلة ارتفاع حاد، ينصح بالانتظار لمستوى تصحيح أفضل قبل الشراء.",
      en: "Gold is in a sharp rally phase. It's advisable to wait for a better correction level before buying.",
    };
  } else {
    return {
      ar: "السوق في حالة حياد، لا توجد إشارات واضحة للشراء أو الانتظار في الوقت الحالي.",
      en: "The market is in a neutral state with no clear buy or wait signals at this time.",
    };
  }
}

export function calculateMarketSignal(input: SignalInput): MarketSignal {
  let score = 50;
  const factors: SignalFactor[] = [];

  // العامل 1: حركة السعر 24 ساعة
  const change24h =
    ((input.currentPrice - input.price24hAgo) / input.price24hAgo) * 100;

  if (change24h < -1.5) {
    score += 15;
    factors.push({
      name: { ar: "انخفاض سعري في 24 ساعة", en: "24h price decline" },
      value: `${change24h.toFixed(2)}%`,
      impact: "positive",
      weight: 15,
    });
  } else if (change24h > 2) {
    score -= 10;
    factors.push({
      name: { ar: "ارتفاع سعري في 24 ساعة", en: "24h price surge" },
      value: `+${change24h.toFixed(2)}%`,
      impact: "negative",
      weight: 10,
    });
  } else {
    factors.push({
      name: { ar: "حركة سعرية محايدة", en: "Neutral price movement" },
      value: `${change24h.toFixed(2)}%`,
      impact: "neutral",
      weight: 5,
    });
  }

  // العامل 2: الاتجاه الأسبوعي
  const change7d =
    ((input.currentPrice - input.price7dAgo) / input.price7dAgo) * 100;

  if (change7d < 0 && change24h > 0) {
    score += 10;
    factors.push({
      name: { ar: "بداية ارتداد أسبوعي", en: "Weekly rebound beginning" },
      value: `${change7d.toFixed(2)}%`,
      impact: "positive",
      weight: 10,
    });
  }

  // العامل 3: حركة الدولار
  if (input.usdChange24h < -0.5) {
    score += 8;
    factors.push({
      name: { ar: "الدولار في تراجع", en: "USD weakening" },
      value: `${input.usdChange24h.toFixed(2)}%`,
      impact: "positive",
      weight: 8,
    });
  } else if (input.usdChange24h > 0.5) {
    score -= 8;
    factors.push({
      name: { ar: "الدولار في ارتفاع", en: "USD strengthening" },
      value: `+${input.usdChange24h.toFixed(2)}%`,
      impact: "negative",
      weight: 8,
    });
  }

  // العامل 4: مقارنة بالشهر
  const vsMonth =
    ((input.currentPrice - input.price30dAgo) / input.price30dAgo) * 100;

  if (vsMonth < -3) {
    score += 12;
    factors.push({
      name: { ar: "تراجع عن مستوى الشهر", en: "Below monthly level" },
      value: `${vsMonth.toFixed(2)}%`,
      impact: "positive",
      weight: 12,
    });
  }

  // تحديد الإشارة النهائية
  let signal: "buy" | "wait" | "neutral";
  let strength: 1 | 2 | 3;

  if (score >= 65) {
    signal = "buy";
    strength = score >= 80 ? 3 : score >= 70 ? 2 : 1;
  } else if (score <= 35) {
    signal = "wait";
    strength = score <= 20 ? 3 : score <= 30 ? 2 : 1;
  } else {
    signal = "neutral";
    strength = 1;
  }

  // تاريخ انتهاء صلاحية الإشارة (غداً الفجر)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 1);
  validUntil.setHours(6, 0, 0, 0);

  return {
    signal,
    strength,
    score,
    reasoning: generateReasoning(signal, score),
    validUntil: validUntil.toISOString(),
    factors,
  };
}
