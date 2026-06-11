import { NextResponse } from "next/server";
import {
  calculateMarketSignal,
} from "@/lib/calculations/signal";
import { MOCK_GOLD_DATA } from "@/lib/calculations/goldPrice";
import { calculateEgyptianGramPrice } from "@/lib/calculations/goldPrice";

export const revalidate = 3600; // ساعة

export async function GET() {
  let usdToEGP = MOCK_GOLD_DATA.usdToEGP;

  try {
    const fxRes = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EGP",
      { next: { revalidate: 1800 } }
    );
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData.rates?.EGP) usdToEGP = fxData.rates.EGP;
    }
  } catch {
    // نستخدم القيمة الافتراضية
  }

  const currentPrice = calculateEgyptianGramPrice(
    MOCK_GOLD_DATA.ounceUSD,
    usdToEGP,
    21
  );
  const price24hAgo = calculateEgyptianGramPrice(
    MOCK_GOLD_DATA.previousDayOunceUSD,
    usdToEGP,
    21
  );
  const price7dAgo = calculateEgyptianGramPrice(
    MOCK_GOLD_DATA.ounceUSD * 0.985,
    usdToEGP,
    21
  );
  const price30dAgo = calculateEgyptianGramPrice(
    MOCK_GOLD_DATA.ounceUSD * 0.96,
    usdToEGP,
    21
  );

  const signal = calculateMarketSignal({
    currentPrice,
    price24hAgo,
    price7dAgo,
    price30dAgo,
    usdChange24h: -0.12,
  });

  return NextResponse.json({
    success: true,
    signal,
    meta: { lastUpdated: new Date().toISOString() },
  });
}
