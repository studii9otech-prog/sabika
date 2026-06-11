"use client";

import { useActivePrices } from "@/hooks/useLivePrice";
import PriceCard from "./PriceCard";
import { generateMockHistory } from "@/lib/calculations/goldPrice";
import { Coins, Sparkles, Layers, Award } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MarketPulseCards() {
  const { data, isLoading } = useActivePrices();
  const tMetals = useTranslations("metals");
  const tKarats = useTranslations("karats");

  const karats = [
    { key: "karat21" as const, icon: <Coins className="w-4 h-4" /> },
    { key: "karat24" as const, icon: <Sparkles className="w-4 h-4" /> },
    { key: "karat18" as const, icon: <Layers className="w-4 h-4" /> },
    { key: "karat14" as const, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {karats.map((k, i) => {
        const priceData = data?.prices?.[k.key];
        // Generate spark data from current price
        const sparkData = priceData
          ? generateMockHistory(priceData.gramPriceEGP, 14, 0.008).map(
              (d) => d.price
            )
          : undefined;

        const label = `${tMetals("gold")} ${tKarats(k.key)}`;

        return (
          <PriceCard
            key={k.key}
            title={label}
            icon={k.icon}
            priceEGP={priceData?.gramPriceEGP}
            priceUSD={priceData?.gramPriceUSD}
            change24h={priceData?.change24h}
            changePercent24h={priceData?.changePercent24h}
            direction={priceData?.direction}
            sparkData={sparkData}
            isLoading={isLoading}
            index={i}
          />
        );
      })}
    </div>
  );
}
