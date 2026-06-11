import { NextResponse } from "next/server";
import { MOCK_GOLD_DATA } from "@/lib/calculations/goldPrice";

export const revalidate = 300; // 5 دقايق

function buildMetalsData(usdToEGP: number) {
  // بيانات mock واقعية للمعادن
  const metals = {
    gold: {
      metal: "gold" as const,
      priceUSD: MOCK_GOLD_DATA.ounceUSD,
      priceEGP: Math.round(MOCK_GOLD_DATA.ounceUSD * usdToEGP),
      change24h: MOCK_GOLD_DATA.ounceUSD - MOCK_GOLD_DATA.previousDayOunceUSD,
      changePercent24h: parseFloat(
        (
          ((MOCK_GOLD_DATA.ounceUSD - MOCK_GOLD_DATA.previousDayOunceUSD) /
            MOCK_GOLD_DATA.previousDayOunceUSD) *
          100
        ).toFixed(2)
      ),
      weekHigh: MOCK_GOLD_DATA.ounceUSD * 1.02,
      weekLow: MOCK_GOLD_DATA.ounceUSD * 0.97,
      yearHigh: MOCK_GOLD_DATA.ounceUSD * 1.15,
      yearLow: MOCK_GOLD_DATA.ounceUSD * 0.82,
      lastUpdated: new Date().toISOString(),
    },
    silver: {
      metal: "silver" as const,
      priceUSD: 33.45,
      priceEGP: Math.round(33.45 * usdToEGP),
      change24h: 0.35,
      changePercent24h: 1.06,
      weekHigh: 34.2,
      weekLow: 32.8,
      yearHigh: 35.5,
      yearLow: 22.1,
      lastUpdated: new Date().toISOString(),
    },
    platinum: {
      metal: "platinum" as const,
      priceUSD: 1045.0,
      priceEGP: Math.round(1045.0 * usdToEGP),
      change24h: -8.5,
      changePercent24h: -0.81,
      weekHigh: 1068,
      weekLow: 1032,
      yearHigh: 1120,
      yearLow: 890,
      lastUpdated: new Date().toISOString(),
    },
    palladium: {
      metal: "palladium" as const,
      priceUSD: 1055.0,
      priceEGP: Math.round(1055.0 * usdToEGP),
      change24h: 12.0,
      changePercent24h: 1.15,
      weekHigh: 1080,
      weekLow: 1020,
      yearHigh: 1250,
      yearLow: 950,
      lastUpdated: new Date().toISOString(),
    },
  };

  const currencies = {
    usd: { from: "USD", to: "EGP", rate: usdToEGP, change24h: -0.12, lastUpdated: new Date().toISOString() },
    eur: { from: "EUR", to: "EGP", rate: usdToEGP * 1.085, change24h: 0.08, lastUpdated: new Date().toISOString() },
    gbp: { from: "GBP", to: "EGP", rate: usdToEGP * 1.27, change24h: -0.15, lastUpdated: new Date().toISOString() },
    sar: { from: "SAR", to: "EGP", rate: usdToEGP * 0.267, change24h: 0.02, lastUpdated: new Date().toISOString() },
    aed: { from: "AED", to: "EGP", rate: usdToEGP * 0.272, change24h: -0.01, lastUpdated: new Date().toISOString() },
  };

  return { metals, currencies };
}

export async function GET() {
  let usdToEGP = MOCK_GOLD_DATA.usdToEGP;

  try {
    const fxRes = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EGP,EUR,GBP,SAR,AED",
      { next: { revalidate: 1800 } }
    );
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData.rates?.EGP) usdToEGP = fxData.rates.EGP;
    }
  } catch {
    // نستخدم القيمة الافتراضية
  }

  const { metals, currencies } = buildMetalsData(usdToEGP);

  return NextResponse.json({
    success: true,
    metals,
    currencies,
    meta: { lastUpdated: new Date().toISOString() },
  });
}
