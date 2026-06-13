"use client";

import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface HeroChartProps {
  chartData: { name: string; price: number }[];
  chartMin: number;
  chartMax: number;
  trendColor: string;
  isAr: boolean;
  locale: string;
  activeCurrency: string;
  onHoverChange: (price: number | null, label: string | null) => void;
}

function HeroCustomTooltip({ active, payload, label, locale, tCommon, activeCurrency }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  locale: string;
  tCommon: any;
  activeCurrency: string;
}) {
  if (!active || !payload?.length) return null;
  const isThreeDecimals = ["kwd", "bhd", "omr", "jod"].includes((activeCurrency || "EGP").toLowerCase());
  const isEgp = (activeCurrency || "EGP").toLowerCase() === "egp";
  const decimalPlaces = isThreeDecimals ? 3 : (isEgp ? 0 : 2);
  
  return (
    <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md px-3 py-2 shadow-lg text-xs text-start">
      <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="font-price font-bold text-foreground">
        {payload[0].value.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })} {tCommon((activeCurrency || "EGP").toLowerCase() as any)}
      </p>
    </div>
  );
}

export default function HeroChart({
  chartData,
  chartMin,
  chartMax,
  trendColor,
  isAr,
  locale,
  activeCurrency,
  onHoverChange,
}: HeroChartProps) {
  const tCommon = useTranslations("common");

  return (
    <div className="w-full h-[150px] mb-6 select-none" style={{ marginLeft: "-4px", marginRight: "-4px", width: "calc(100% + 8px)" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: isAr ? -44 : 0, left: isAr ? 0 : -44, bottom: 0 }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]) {
              onHoverChange(
                state.activePayload[0].payload.price,
                state.activePayload[0].payload.name
              );
            }
          }}
          onMouseLeave={() => {
            onHoverChange(null, null);
          }}
        >
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor={trendColor} stopOpacity={0.18} />
              <stop offset="95%" stopColor={trendColor} stopOpacity={0.00} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-rubik), sans-serif" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            hide={false}
          />
          <YAxis
            domain={[chartMin - 2, chartMax + 2]}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-rubik), sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => Math.round(v).toLocaleString(isAr ? "ar-EG" : "en-US")}
            width={48}
            orientation={isAr ? "right" : "left"}
            hide={false}
          />
          <RechartsTooltip
            content={<HeroCustomTooltip locale={locale} tCommon={tCommon} activeCurrency={activeCurrency} />}
            cursor={{ stroke: trendColor, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={trendColor}
            strokeWidth={2}
            fill="url(#heroGrad)"
            dot={false}
            activeDot={{ r: 4, fill: trendColor, stroke: "var(--card)", strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
