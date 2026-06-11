import { NextRequest, NextResponse } from "next/server";
import { generateMockHistory, MOCK_GOLD_DATA, calculateEgyptianGramPrice } from "@/lib/calculations/goldPrice";

export const revalidate = 900; // 15 دقيقة

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "1M";

  let usdToEGP = MOCK_GOLD_DATA.usdToEGP;

  const currentPrice = calculateEgyptianGramPrice(
    MOCK_GOLD_DATA.ounceUSD,
    usdToEGP,
    21
  );

  const daysMap: Record<string, number> = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    "5Y": 1825,
  };

  const days = daysMap[period] || 30;
  const data = generateMockHistory(currentPrice, days);

  return NextResponse.json({
    success: true,
    period,
    data,
    meta: { lastUpdated: new Date().toISOString() },
  });
}
