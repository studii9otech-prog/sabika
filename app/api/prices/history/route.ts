import { NextRequest, NextResponse } from "next/server";
import { generateMockHistory, MOCK_GOLD_DATA, calculateEgyptianGramPrice } from "@/lib/calculations/goldPrice";
import { getBaseUrl } from "@/lib/utils";

export const revalidate = 900; // 15 minutes cache revalidation on server

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "1M";

  // Fetch actual live gold price to keep history synchronized with current live prices
  let currentPrice = 3000;
  try {
    const baseUrl = getBaseUrl();
    const goldRes = await fetch(`${baseUrl}/api/prices/gold`, {
      next: { revalidate: 30 }
    });
    if (goldRes.ok) {
      const goldData = await goldRes.json();
      if (goldData?.prices?.karat21?.gramPriceEGP) {
        currentPrice = goldData.prices.karat21.gramPriceEGP;
      }
    }
  } catch (err) {
    console.error("Error fetching live gold price for history:", err);
    // Fallback to calculations if fetch fails
    const usdToEGP = MOCK_GOLD_DATA.usdToEGP;
    currentPrice = calculateEgyptianGramPrice(
      MOCK_GOLD_DATA.ounceUSD,
      usdToEGP,
      21
    );
  }

  const daysMap: Record<string, number> = {
    "1D": 24, // 24 hourly points for 1-day view
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    "5Y": 1825,
  };

  const days = daysMap[period] || 30;
  const isHourly = period === "1D";

  // Volatility scale fits the duration
  const volatilityMap: Record<string, number> = {
    "1D": 0.0015,
    "1W": 0.008,
    "1M": 0.015,
    "3M": 0.025,
    "1Y": 0.05,
    "5Y": 0.12,
  };
  const volatility = volatilityMap[period] || 0.015;

  const data = generateMockHistory(currentPrice, days, volatility, isHourly);

  return NextResponse.json({
    success: true,
    period,
    data,
    meta: { lastUpdated: new Date().toISOString() },
  });
}
