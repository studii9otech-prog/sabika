import { NextResponse } from "next/server";

/** Shape of one Binance depth level: [price, quantity] */
type DepthLevel = [string, string];

/** Minimal shape we expect from Binance's /depth endpoint */
interface BinanceDepthResponse {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

/** Minimal shape we expect from Binance's /trades endpoint */
interface BinanceTradeResponse {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

/**
 * Returns true only when `v` is a non-empty array whose first element is an
 * array of two strings — the format Binance uses for order book levels.
 */
function isValidDepthSide(v: unknown): v is DepthLevel[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    Array.isArray(v[0]) &&
    v[0].length === 2 &&
    typeof v[0][0] === "string" &&
    typeof v[0][1] === "string"
  );
}

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second hard limit

  try {
    const [depthRes, tradesRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/depth?symbol=PAXGUSDT&limit=8", {
        cache: "no-store",
        signal: controller.signal,
      }),
      fetch("https://api.binance.com/api/v3/trades?symbol=PAXGUSDT&limit=10", {
        cache: "no-store",
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    if (!depthRes.ok || !tradesRes.ok) {
      throw new Error(
        `Binance HTTP error — depth: ${depthRes.status}, trades: ${tradesRes.status}`
      );
    }

    const depth = (await depthRes.json()) as BinanceDepthResponse;
    const trades = (await tradesRes.json()) as BinanceTradeResponse[];

    // ── Validate response shape before forwarding ──────────────────────────
    if (!isValidDepthSide(depth?.bids) || !isValidDepthSide(depth?.asks)) {
      throw new Error("Binance depth response has unexpected shape");
    }
    if (!Array.isArray(trades)) {
      throw new Error("Binance trades response is not an array");
    }

    return NextResponse.json(
      { success: true, depth, trades },
      {
        headers: {
          // Allow the browser/CDN to cache for 3 seconds max
          "Cache-Control": "public, max-age=3, stale-while-revalidate=5",
        },
      }
    );
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    const isAbort =
      error instanceof Error && error.name === "AbortError";
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      isAbort
        ? "[market-depth] Binance request timed out after 5 s"
        : `[market-depth] Fetch error: ${message}`
    );

    return NextResponse.json(
      { success: false, error: isAbort ? "timeout" : message },
      {
        status: 503,
        headers: {
          // Do not cache error responses
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

