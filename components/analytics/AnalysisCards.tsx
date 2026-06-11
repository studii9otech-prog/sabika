"use client";

import { useTranslations, useLocale } from "next-intl";
import { useActivePrices } from "@/hooks/useLivePrice";
import { BarChart3, Calendar, Compass } from "lucide-react";

const ANALYSIS_ITEMS = [
  {
    id: "day",
    icon: BarChart3,
    supportEGP: 5420,
    resistanceEGP: 5680,
    trendKey: "trendUp",
    trendColor: "text-up",
  },
  {
    id: "week",
    icon: Calendar,
    supportEGP: 5350,
    resistanceEGP: 5750,
    trendKey: "trendNeutralUp",
    trendColor: "text-primary",
  },
  {
    id: "month",
    icon: Compass,
    supportEGP: 5200,
    resistanceEGP: 5900,
    trendKey: "trendUpStrong",
    trendColor: "text-up",
  },
];

export default function AnalysisCards() {
  const t = useTranslations("analytics");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data, activeCountry, activeCurrency, activeUsdToLocal } = useActivePrices();

  const convertEgpToActive = (egpValue: number) => {
    if (activeCountry === "EG" || !data) {
      return egpValue.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
    }
    // EGP -> USD -> Local
    const usdVal = egpValue / (data.usdToEGP || 52.08);
    const localVal = usdVal * (activeUsdToLocal || 1);

    const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes(activeCurrency.toLowerCase());
    const fractionDigits = isThreeDecimals ? 3 : 2;

    return localVal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ANALYSIS_ITEMS.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className="bg-card border border-border/80 rounded-2xl p-6 card-hover text-start animate-in fade-in-50 duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <IconComponent className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm text-foreground">{t(`${item.id}.period`)}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-down-light border border-down/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("support")}</p>
                <p className="font-price font-bold text-down text-sm">
                  {convertEgpToActive(item.supportEGP)} {tCommon(activeCurrency.toLowerCase() as any)}
                </p>
              </div>
              <div className="bg-up-light border border-up/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("resistance")}</p>
                <p className="font-price font-bold text-up text-sm">
                  {convertEgpToActive(item.resistanceEGP)} {tCommon(activeCurrency.toLowerCase() as any)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/75">{t("trendLabel")}</span>
              <span className={`text-xs font-bold ${item.trendColor}`}>
                {t(item.trendKey)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {t(`${item.id}.explanation`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
