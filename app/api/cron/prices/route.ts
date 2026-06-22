import { NextRequest, NextResponse } from "next/server";
import { priceHistoryStore } from "@/lib/priceHistory";
import { getBaseUrl } from "@/lib/utils";

/**
 * Cron Job: تسجيل snapshot سعر الذهب عيار 21 كل ساعة
 * Schedule: "0 * * * *" (في vercel.json)
 *
 * الهدف: ضمان وجود نقطة بيانات حقيقية لكل ساعة حتى لو لم يزر أحد الموقع.
 * هذا يكمّل الـ snapshots التي تُسجَّل عند كل طلب gold API.
 */
export async function GET(req: NextRequest) {
  // حماية بسيطة — Vercel Cron يُرسل Authorization header
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = getBaseUrl();

    // جلب السعر الحالي من Gold API
    const goldRes = await fetch(`${baseUrl}/api/prices/gold`, {
      headers: { "x-internal-request": "1" },
      next: { revalidate: 0 }, // لا نريد cache هنا، نريد السعر الحقيقي
    });

    if (!goldRes.ok) {
      throw new Error(`Gold API responded with ${goldRes.status}`);
    }

    const goldData = await goldRes.json();
    const karat21Price = goldData?.prices?.karat21?.gramPriceEGP;
    const karat24Price = goldData?.prices?.karat24?.gramPriceEGP;

    if (!karat21Price || karat21Price <= 0) {
      throw new Error("Invalid karat21 price received");
    }

    // تسجيل snapshot الساعة الحالية
    priceHistoryStore.add(karat21Price);

    const latestSnapshot = priceHistoryStore.latest();
    const totalSnapshots = priceHistoryStore.count();

    console.log(
      `[Cron/Prices] Snapshot added: karat21=${karat21Price} EGP | Total snapshots: ${totalSnapshots}`
    );

    return NextResponse.json({
      success: true,
      snapshot: {
        timestamp: latestSnapshot?.timestamp,
        karat21: karat21Price,
        karat24: karat24Price ?? null,
      },
      store: {
        totalSnapshots,
        oldestTimestamp: priceHistoryStore.getRecent(168)?.[0]?.timestamp ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Cron/Prices] Failed:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
