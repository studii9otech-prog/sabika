"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useSettingsStore } from "@/store/settingsStore";
import type { GoldPricesResponse } from "@/types/market";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export function useGoldPrices() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<GoldPricesResponse>(
    "/api/prices/gold",
    fetcher,
    {
      refreshInterval: 30 * 1000, // Refresh in background every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 15 * 1000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh: mutate,
  };
}

export function useActivePrices() {
  const { data: goldData, error, isLoading, refresh, isValidating } = useGoldPrices();
  const { country, currency, setCurrency } = useSettingsStore();

  const countryToCurrencyMap: Record<string, string> = {
    EG: "EGP",
    SA: "SAR",
    AE: "AED",
    KW: "KWD",
    QA: "QAR",
    BH: "BHD",
    OM: "OMR",
    JO: "JOD",
    LY: "LYD",
  };

  const activeCountry = country || "EG";
  const activeCurrency = countryToCurrencyMap[activeCountry] || "EGP";

  useEffect(() => {
    if (activeCurrency && currency !== activeCurrency) {
      setCurrency(activeCurrency);
    }
  }, [activeCountry, activeCurrency, currency, setCurrency]);

  let activePrices = goldData?.prices;
  let activeUsdToLocal = goldData?.usdToEGP;

  if (goldData) {
    if ((goldData as any).countries?.[activeCountry]) {
      const countryData = (goldData as any).countries[activeCountry];
      activeUsdToLocal = countryData.exchangeRate;
      
      const mapPriceItem = (karatType: number, localPrice: number) => {
        const purity = karatType / 24;
        const ounceUSD = goldData.prices.ounceUSD;
        const gramPriceUSD = (ounceUSD / 31.1034768) * purity;
        return {
          karatType: karatType as any,
          gramPriceEGP: localPrice,
          gramPriceUSD,
          change24h: Math.round(localPrice * 0.0045 * 100) / 100,
          changePercent24h: 0.45,
          direction: "up" as const,
          lastUpdated: goldData.meta.lastUpdated,
        };
      };

      activePrices = {
        ...goldData.prices,
        karat12: countryData.prices.karat12 ? mapPriceItem(12, countryData.prices.karat12) : undefined,
        karat14: mapPriceItem(14, countryData.prices.karat14),
        karat18: mapPriceItem(18, countryData.prices.karat18),
        karat21: mapPriceItem(21, countryData.prices.karat21),
        karat24: mapPriceItem(24, countryData.prices.karat24),
        karat22: countryData.prices.karat22 ? mapPriceItem(22, countryData.prices.karat22) : undefined,
        ounceEGP: countryData.prices.ounceLocal,
        kiloEGP: countryData.prices.kiloLocal,
        
        // Expose local indicators
        bankUSD: countryData.prices.bankUSD,
        saghaUSD: countryData.prices.saghaUSD,
        usdSpread: countryData.prices.usdSpread,
        goldCoinEGP: countryData.prices.goldCoinEGP,
        silverEGP: countryData.prices.silverEGP,
      } as any;
    } else {
      const calcPrice = (karat: number) => {
        const purity = karat / 24;
        const ounceUSD = goldData.prices.ounceUSD;
        const gramPriceUSD = (ounceUSD / 31.1034768) * purity;
        const gramPriceEGP = Math.round(goldData.prices.karat24.gramPriceEGP * purity);
        return {
          karatType: karat as any,
          gramPriceEGP,
          gramPriceUSD,
          change24h: Math.round(gramPriceEGP * 0.0045),
          changePercent24h: 0.45,
          direction: "up" as const,
          lastUpdated: goldData.meta.lastUpdated,
        };
      };

      activePrices = {
        ...goldData.prices,
        karat12: calcPrice(12),
        karat22: calcPrice(22),
      } as any;
    }
  }

  const activeData = goldData ? {
    ...goldData,
    prices: activePrices as GoldPricesResponse["prices"],
    usdToEGP: activeUsdToLocal as number,
  } : undefined;

  return {
    data: activeData,
    error,
    isLoading,
    isValidating,
    refresh,
    activeCountry,
    activeCurrency,
    activeUsdToLocal,
  };
}

export function useMetals() {
  const { data, error, isLoading } = useSWR(
    "/api/prices/metals",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      dedupingInterval: 2 * 60 * 1000,
    }
  );

  return { data, error, isLoading };
}

export function usePriceHistory(period: string = "1M") {
  const { data, error, isLoading } = useSWR(
    `/api/prices/history?period=${period}`,
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000,
    }
  );

  return { data, error, isLoading };
}

export function useMarketSignal() {
  const { data, error, isLoading } = useSWR("/api/signal", fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}

export function useMarketDepth() {
  const { data, error, isLoading } = useSWR(
    "/api/prices/market-depth",
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds for active terminal feel
      revalidateOnFocus: true,
      dedupingInterval: 1500,
    }
  );

  return { data, error, isLoading };
}

/**
 * Connects to /api/prices/ounce using Server-Sent Events (SSE) for sub-second,
 * real-time streaming updates. Falls back gracefully to standard polling if needed.
 */
export function useOuncePrice() {
  const [data, setData] = useState<{ ounceUSD: number; timestamp: string } | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    function connectSSE() {
      if (typeof window === "undefined") return;

      if (!window.EventSource) {
        startPollingFallback();
        return;
      }

      eventSource = new EventSource("/api/prices/ounce");

      eventSource.onopen = () => {
        if (isMounted) {
          setIsLoading(false);
          setError(null);
        }
      };

      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && typeof parsed.ounceUSD === "number") {
            setData({
              ounceUSD: parsed.ounceUSD,
              timestamp: parsed.timestamp || new Date().toISOString(),
            });
            setIsLoading(false);
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      eventSource.onerror = () => {
        // Close broken stream and fall back to polling
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        startPollingFallback();
      };
    }

    async function startPollingFallback() {
      if (!isMounted) return;

      const fetchFallback = async () => {
        try {
          const res = await fetch("/api/prices/ounce");
          if (!res.ok) throw new Error("Fetch failed");
          const parsed = await res.json();
          if (isMounted && parsed && typeof parsed.ounceUSD === "number") {
            setData({
              ounceUSD: parsed.ounceUSD,
              timestamp: parsed.timestamp || new Date().toISOString(),
            });
            setIsLoading(false);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            setError(err);
          }
        }
      };

      // Perform initial fallback query
      await fetchFallback();

      // Setup interval polling if not already set
      if (!fallbackTimer && isMounted) {
        fallbackTimer = setInterval(fetchFallback, 1500);
      }
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, []);

  return {
    ounceUSD: data?.ounceUSD ?? null,
    timestamp: data?.timestamp ?? null,
    isLoading,
    error,
  };
}
