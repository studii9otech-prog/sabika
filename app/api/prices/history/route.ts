import { NextRequest, NextResponse } from "next/server";
import { generateMockHistory, MOCK_GOLD_DATA, calculateEgyptianGramPrice } from "@/lib/calculations/goldPrice";
import { priceHistoryStore } from "@/lib/priceHistory";
import { getBaseUrl } from "@/lib/utils";

// للفترات الطويلة (أسبوع+) نستخدم cache ثابت 15 دقيقة، لكن لـ 1D لا نريد cache
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "1M";

  // ────────────────────────────────────────────────────────────────────────
  // 1D: استخدام Price History Engine (snapshots حقيقية)
  // ────────────────────────────────────────────────────────────────────────
  if (period === "1D") {
    // جلب السعر الحالي لاستخدامه كـ anchor للـ fallback
    let currentPrice = 0;
    try {
      const baseUrl = getBaseUrl();
      const goldRes = await fetch(`${baseUrl}/api/prices/gold`, {
        next: { revalidate: 30 },
      });
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        if (goldData?.prices?.karat21?.gramPriceEGP) {
          currentPrice = goldData.prices.karat21.gramPriceEGP;
        }
      }
    } catch (err) {
      console.error("[History/1D] Error fetching live gold price:", err);
    }

    // Fallback إذا فشل جلب السعر
    if (!currentPrice) {
      currentPrice = calculateEgyptianGramPrice(
        MOCK_GOLD_DATA.ounceUSD,
        MOCK_GOLD_DATA.usdToEGP,
        21
      );
    }

    // توليد mock fallback (24 نقطة) لملء الفراغات
    const mockFallback = generateMockHistory(currentPrice, 24, 0.0015, true);

    // عدد الـ snapshots الحقيقية في آخر 24 ساعة
    const realSnapshots = priceHistoryStore.getRecent(24);

    let data: { timestamp: string; price: number; real: boolean }[];

    if (realSnapshots.length >= 2) {
      // ── يوجد بيانات حقيقية كافية ──
      // نملأ الفراغات بـ linear interpolation
      data = priceHistoryStore.getFilledHourly(24, mockFallback);
    } else {
      // ── لا يوجد بيانات حقيقية بعد (cold-start أو re-deploy) ──
      // استخدام الـ mock الذكي كاملاً مع تأشيرة real: false
      data = mockFallback.map((p) => ({ ...p, real: false }));

      // إضافة السعر الحالي كآخر نقطة حقيقية (نقطة واحدة على الأقل)
      if (currentPrice > 0) {
        data[data.length - 1] = {
          timestamp: new Date().toISOString(),
          price: currentPrice,
          real: true,
        };
        // تسجيل السعر الحالي في الـ store
        priceHistoryStore.add(currentPrice);
      }
    }

    return NextResponse.json(
      {
        success: true,
        period,
        data,
        meta: {
          lastUpdated: new Date().toISOString(),
          realSnapshots: realSnapshots.length,
          totalStored: priceHistoryStore.count(),
          engine: realSnapshots.length >= 2 ? "real" : "mock-fallback",
        },
      },
      {
        headers: {
          // لا نريد cache للـ 1D لأن البيانات تتغير كل طلب
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // الفترات الطويلة (1W, 1M, 3M, 1Y, 5Y): Mock بناءً على السعر الحالي
  // ────────────────────────────────────────────────────────────────────────
  let currentPrice = 0;
  try {
    const baseUrl = getBaseUrl();
    const goldRes = await fetch(`${baseUrl}/api/prices/gold`, {
      next: { revalidate: 30 },
    });
    if (goldRes.ok) {
      const goldData = await goldRes.json();
      if (goldData?.prices?.karat21?.gramPriceEGP) {
        currentPrice = goldData.prices.karat21.gramPriceEGP;
      }
    }
  } catch (err) {
    console.error("[History] Error fetching live gold price for history:", err);
    currentPrice = calculateEgyptianGramPrice(
      MOCK_GOLD_DATA.ounceUSD,
      MOCK_GOLD_DATA.usdToEGP,
      21
    );
  }

  if (!currentPrice) {
    currentPrice = calculateEgyptianGramPrice(
      MOCK_GOLD_DATA.ounceUSD,
      MOCK_GOLD_DATA.usdToEGP,
      21
    );
  }

  const daysMap: Record<string, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    "5Y": 1825,
  };

  const days = daysMap[period] || 30;

  const volatilityMap: Record<string, number> = {
    "1W": 0.008,
    "1M": 0.015,
    "3M": 0.025,
    "1Y": 0.05,
    "5Y": 0.12,
  };
  const volatility = volatilityMap[period] || 0.015;

  const mockData = generateMockHistory(currentPrice, days, volatility, false);
  const data = mockData.map((p) => ({ ...p, real: false }));

  return NextResponse.json(
    {
      success: true,
      period,
      data,
      meta: {
        lastUpdated: new Date().toISOString(),
        engine: "mock",
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    }
  );
}
