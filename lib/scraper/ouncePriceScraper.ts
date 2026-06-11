/**
 * Shared ounce price scraper module.
 * Used by both the REST endpoint and the SSE stream.
 * Has its own in-memory cache to avoid hammering the external site.
 */

const GOLD_SITE_URL = "https://gold-price-live.com/";
const FETCH_TIMEOUT_MS = 5000;

// ── In-memory price cache (shared across all handlers on same Node process) ──
let _cached: { price: number; ts: number } | null = null;

/** How old (ms) the cache can be before we re-fetch. */
const MAX_CACHE_AGE_MS = 900; // ~1 request per second max

/**
 * Extracts the gold ounce USD spot price from the site HTML.
 * The confirmed pattern: `>4155.11 $</td>` or `>4155.11 $<`.
 */
function parseOunceFromHtml(html: string): number | null {
  // Primary: price before " $" in a table cell (most reliable from our probe)
  const m1 = html.match(/>([\d]{4,5}\.[\d]{2,3})\s*\$\s*</);
  if (m1) {
    const v = parseFloat(m1[1]);
    if (v >= 1200 && v <= 6000) return v;
  }

  // Fallback 1: price near "دولار" (Arabic for dollar)
  const m2 = html.match(/([\d,]{4,10}\.?[\d]{0,3})\s*<span[^>]*>\s*دولار/);
  if (m2) {
    const v = parseFloat(m2[1].replace(/,/g, ""));
    if (v >= 1200 && v <= 6000) return v;
  }

  // Fallback 2: any 4-digit.3-digit number in range
  const allMatches = [...html.matchAll(/([\d]{4}\.[\d]{2,3})/g)];
  for (const m of allMatches) {
    const v = parseFloat(m[1]);
    if (v >= 1200 && v <= 6000) return v;
  }

  return null;
}

/**
 * Fetches the live gold ounce USD spot price.
 * Uses an in-memory cache capped at ~1 fetch/second across the server process.
 * Returns null only if completely unable to fetch and no cache exists.
 */
export async function fetchOunceUSD(): Promise<{ price: number; fresh: boolean } | null> {
  const now = Date.now();

  // Return cached value if still fresh
  if (_cached && now - _cached.ts < MAX_CACHE_AGE_MS) {
    return { price: _cached.price, fresh: false };
  }

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(GOLD_SITE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(tid);

    if (res.ok) {
      const html = await res.text();
      const price = parseOunceFromHtml(html);
      if (price !== null) {
        _cached = { price, ts: now };
        return { price, fresh: true };
      }
    }
  } catch {
    clearTimeout(tid);
  }

  // Return stale cache rather than nothing
  if (_cached) {
    return { price: _cached.price, fresh: false };
  }

  return null;
}
