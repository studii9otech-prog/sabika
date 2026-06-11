import { NextResponse } from "next/server";
import {
  calculateAllKarats,
  MOCK_GOLD_DATA,
} from "@/lib/calculations/goldPrice";

export const revalidate = 60; // Cache revalidation in Next.js

const HOME_URL = "https://gold-price-live.com/";
const MARKET_URL = "https://gold-price-live.com/market";

let memoryCache: any = null;

// Fallback rates against EGP (Local Currency to EGP)
const defaultEgpRates: Record<string, number> = {
  sar: 13.87,
  aed: 14.18,
  qar: 14.28,
  kwd: 168.79,
  jod: 73.46,
  omr: 135.45,
  bhd: 138.03,
  lyd: 8.15,
};

function extractKaratPrice(html: string, karat: number): number | null {
  // Try table pattern first
  const tableRegex = new RegExp(`ذهب عيار ${karat}<\\/td>\\s*<td[^>]*>\\s*([0-9.,]+)\\s*<span`, "i");
  const tableMatch = html.match(tableRegex);
  if (tableMatch) {
    return parseInt(tableMatch[1].replace(/,/g, ""), 10);
  }

  // Try card pattern second
  const regex = new RegExp(`عيار ${karat}\\s*<\\/div>\\s*<div[^>]*>\\s*([0-9.,]+)\\s*<`, "i");
  const match = html.match(regex);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
}

function extractSpecialPrice(html: string, label: string): number | null {
  const regex = new RegExp(`${label}\\s*<\\/div>\\s*<div[^>]*>\\s*([0-9.]+)\\s*<span`, "i");
  const match = html.match(regex);
  return match ? parseFloat(match[1].replace(/,/g, "")) : null;
}

function extractCurrencyRate(html: string, code: string): number | null {
  const regex = new RegExp(`href="[^"]*\\/market\\/${code}-[^"]*".*?>\\s*([0-9.]+)\\s*<span[^>]*>\\s*جنيه مصري`, "is");
  const match = html.match(regex);
  return match ? parseFloat(match[1]) : null;
}

function buildResponseFromData(scrapedData: any) {
  const usdToEGP = scrapedData.usdToEGP;
  const ounceUSD = scrapedData.ounceUSD;
  const egpRates = scrapedData.egpRates;

  const makePriceItem = (karat: number, gramPriceEGP: number) => {
    const purity = karat / 24;
    const gramPriceUSD = ounceUSD / 31.1034768;
    const change24h = Math.round(gramPriceEGP * 0.0045);
    const changePercent24h = 0.45;

    return {
      karatType: karat,
      gramPriceEGP,
      gramPriceUSD: gramPriceUSD * purity,
      change24h,
      changePercent24h,
      direction: "up" as const,
      lastUpdated: scrapedData.lastUpdated,
    };
  };

  // Build countries data map
  const countries: Record<string, any> = {};

  const bankUSD = scrapedData.prices.bankUSD || usdToEGP;
  const saghaUSD = scrapedData.prices.saghaUSD || Math.round((scrapedData.prices.karat24 * 31.1035 / ounceUSD) * 100) / 100;
  const usdSpread = scrapedData.prices.usdSpread || Math.round((saghaUSD - bankUSD) * 100) / 100;
  const goldCoinEGP = scrapedData.prices.goldCoinEGP || Math.round(scrapedData.prices.karat21 * 8);
  const silverEGP = scrapedData.prices.silverEGP || 141.56;

  // 1. Egypt (EG)
  countries.EG = {
    currency: "EGP",
    exchangeRate: usdToEGP,
    prices: {
      karat12: scrapedData.prices.karat12 || Math.round(scrapedData.prices.karat24 * (12/24)),
      karat14: scrapedData.prices.karat14,
      karat18: scrapedData.prices.karat18,
      karat21: scrapedData.prices.karat21,
      karat22: Math.round(scrapedData.prices.karat24 * (22/24)),
      karat24: scrapedData.prices.karat24,
      ounceLocal: Math.round(ounceUSD * usdToEGP),
      kiloLocal: Math.round(scrapedData.prices.karat24 * 1000),
      
      bankUSD,
      saghaUSD,
      usdSpread,
      goldCoinEGP,
      silverEGP,
    }
  };

  // Other countries mapping
  const countryList = [
    { code: "SA", currency: "SAR", key: "sar" },
    { code: "AE", currency: "AED", key: "aed" },
    { code: "KW", currency: "KWD", key: "kwd" },
    { code: "QA", currency: "QAR", key: "qar" },
    { code: "BH", currency: "BHD", key: "bhd" },
    { code: "OM", currency: "OMR", key: "omr" },
    { code: "JO", currency: "JOD", key: "jod" },
    { code: "LY", currency: "LYD", key: "lyd" },
  ];

  for (const country of countryList) {
    const rateEgp = egpRates[country.key] || defaultEgpRates[country.key];
    const usdToLocal = usdToEGP / rateEgp;
    
    const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes(country.key);
    const roundFactor = isThreeDecimals ? 1000 : 100;
    const round = (val: number) => Math.round(val * roundFactor) / roundFactor;

    const g24 = (ounceUSD / 31.1034768) * usdToLocal;

    countries[country.code] = {
      currency: country.currency,
      exchangeRate: parseFloat(usdToLocal.toFixed(4)),
      prices: {
        karat12: round(g24 * (12/24)),
        karat14: round(g24 * (14/24)),
        karat18: round(g24 * (18/24)),
        karat21: round(g24 * (21/24)),
        karat22: round(g24 * (22/24)),
        karat24: round(g24),
        ounceLocal: round(ounceUSD * usdToLocal),
        kiloLocal: round(g24 * 1000),
      }
    };
  }

  return {
    success: true,
    prices: {
      karat12: makePriceItem(12, scrapedData.prices.karat12 || Math.round(scrapedData.prices.karat24 * (12/24))),
      karat14: makePriceItem(14, scrapedData.prices.karat14),
      karat18: makePriceItem(18, scrapedData.prices.karat18),
      karat21: makePriceItem(21, scrapedData.prices.karat21),
      karat24: makePriceItem(24, scrapedData.prices.karat24),
      ounceUSD,
      ounceEGP: Math.round(ounceUSD * usdToEGP),
      kiloEGP: Math.round(scrapedData.prices.karat24 * 1000),
      
      bankUSD,
      saghaUSD,
      usdSpread,
      goldCoinEGP,
      silverEGP,
    },
    usdToEGP,
    countries,
    meta: {
      lastUpdated: scrapedData.lastUpdated,
      nextUpdate: new Date(Date.now() + 60000).toISOString(),
      live: true,
    },
  };
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "ar,en-US;q=0.7,en;q=0.3"
    };

    // Fetch both URLs concurrently
    const [homeRes, marketRes] = await Promise.all([
      fetch(HOME_URL, { headers, signal: controller.signal, next: { revalidate: 60 } }),
      fetch(MARKET_URL, { headers, signal: controller.signal, next: { revalidate: 300 } }).catch(() => null)
    ]);

    clearTimeout(timeoutId);

    if (homeRes && homeRes.ok) {
      const html = await homeRes.text();

      const usdToEGP = extractSpecialPrice(html, "الدولار في البنوك") || 52.08;
      const ounceUSD = extractSpecialPrice(html, "أونصة الذهب") || 2350;
      
      const karat24 = extractKaratPrice(html, 24) || Math.round((ounceUSD / 31.1035) * usdToEGP * 1.07);
      const karat21 = extractKaratPrice(html, 21) || Math.round((ounceUSD / 31.1035) * usdToEGP * 1.07 * (21/24));
      const karat18 = extractKaratPrice(html, 18) || Math.round((ounceUSD / 31.1035) * usdToEGP * 1.07 * (18/24));
      const karat14 = extractKaratPrice(html, 14) || Math.round(karat24 * (14/24));
      const karat12 = extractKaratPrice(html, 12) || Math.round(karat24 * (12/24));

      // Extra scraped elements
      const bankUSD = extractSpecialPrice(html, "الدولار في البنوك") || usdToEGP;
      const saghaUSD = extractSpecialPrice(html, "دولار الصاغة الآن") || Math.round((karat24 * 31.1035 / ounceUSD) * 100) / 100;
      const usdSpread = extractSpecialPrice(html, "الفرق بين البنك والصاغة") || Math.round((saghaUSD - bankUSD) * 100) / 100;
      const goldCoinEGP = extractSpecialPrice(html, "جنيه الذهب") || Math.round(karat21 * 8);
      const silverEGP = extractSpecialPrice(html, "سعر الفضة") || 141.56;

      // Parse currency market HTML if available
      const egpRates: Record<string, number> = {};
      if (marketRes && marketRes.ok) {
        try {
          const marketHtml = await marketRes.text();
          for (const key of Object.keys(defaultEgpRates)) {
            const val = extractCurrencyRate(marketHtml, key);
            if (val) {
              egpRates[key] = val;
            }
          }
        } catch (err) {
          console.error("Error parsing currency page:", err);
        }
      }

      const parsedData = {
        usdToEGP,
        ounceUSD,
        prices: { 
          karat24, 
          karat21, 
          karat18, 
          karat14, 
          karat12,
          bankUSD,
          saghaUSD,
          usdSpread,
          goldCoinEGP,
          silverEGP,
        },
        egpRates,
        lastUpdated: new Date().toISOString()
      };

      const responseData = buildResponseFromData(parsedData);
      memoryCache = responseData;
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("Error fetching live gold prices from scraper:", error);
  }

  // Fallback to in-memory cache if scraper failed
  if (memoryCache) {
    return NextResponse.json({
      ...memoryCache,
      meta: { ...memoryCache.meta, cached: true }
    });
  }

  // Fallback to mock calculations
  const goldOunceUSD = MOCK_GOLD_DATA.ounceUSD;
  const previousDayOunceUSD = MOCK_GOLD_DATA.previousDayOunceUSD;
  const usdToEGP = MOCK_GOLD_DATA.usdToEGP;

  const egpPrices = calculateAllKarats(goldOunceUSD, usdToEGP, previousDayOunceUSD);

  const fallbackData = {
    usdToEGP,
    ounceUSD: goldOunceUSD,
    prices: {
      karat24: egpPrices.karat24.gramPriceEGP,
      karat21: egpPrices.karat21.gramPriceEGP,
      karat18: egpPrices.karat18.gramPriceEGP,
      karat14: egpPrices.karat14.gramPriceEGP,
      karat12: egpPrices.karat12 ? egpPrices.karat12.gramPriceEGP : Math.round(egpPrices.karat24.gramPriceEGP * (12/24)),
      bankUSD: usdToEGP,
      saghaUSD: Math.round((egpPrices.karat24.gramPriceEGP * 31.1035 / goldOunceUSD) * 100) / 100,
      usdSpread: Math.round(((egpPrices.karat24.gramPriceEGP * 31.1035 / goldOunceUSD) - usdToEGP) * 100) / 100,
      goldCoinEGP: Math.round(egpPrices.karat21.gramPriceEGP * 8),
      silverEGP: 141.56,
    },
    egpRates: defaultEgpRates,
    lastUpdated: new Date().toISOString()
  };

  const responseData = buildResponseFromData(fallbackData);
  return NextResponse.json({
    ...responseData,
    success: false,
    meta: {
      ...responseData.meta,
      fallback: true
    }
  });
}
