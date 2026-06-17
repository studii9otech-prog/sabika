import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [depthRes, tradesRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/depth?symbol=PAXGUSDT&limit=8", {
        cache: "no-store",
      }),
      fetch("https://api.binance.com/api/v3/trades?symbol=PAXGUSDT&limit=10", {
        cache: "no-store",
      }),
    ]);

    if (!depthRes.ok || !tradesRes.ok) {
      throw new Error(`Failed to fetch from Binance. Depth status: ${depthRes.status}, Trades status: ${tradesRes.status}`);
    }

    const depth = await depthRes.json();
    const trades = await tradesRes.json();

    return NextResponse.json({
      success: true,
      depth,
      trades,
    });
  } catch (error: any) {
    console.error("Binance proxy fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
