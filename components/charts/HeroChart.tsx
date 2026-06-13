"use client";

import { useState } from "react";
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

/** Interpolates between Red (#EF4444), Amber (#F59E0B), and Green (#10B981) based on price position */
function getColorForPrice(price: number, min: number, max: number): string {
  if (max === min) return "#F59E0B";
  const pct = Math.max(0, Math.min(1, (price - min) / (max - min)));
  
  let r, g, b;
  if (pct < 0.5) {
    // Interpolate between Red (pct=0) and Amber (pct=0.5)
    const t = pct / 0.5;
    r = Math.round(239 + (245 - 239) * t);
    g = Math.round(68 + (158 - 68) * t);
    b = Math.round(68 + (11 - 68) * t);
  } else {
    // Interpolate between Amber (pct=0.5) and Green (pct=1)
    const t = (pct - 0.5) / 0.5;
    r = Math.round(245 + (16 - 245) * t);
    g = Math.round(158 + (185 - 158) * t);
    b = Math.round(11 + (129 - 11) * t);
  }
  return `rgb(${r}, ${g}, ${b})`;
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

function CustomCursor({ points, customStroke }: any) {
  if (!points || points.length < 2) return null;
  const start = points[0];
  const end = points[1];
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke={customStroke}
      strokeWidth={1}
      strokeDasharray="4 4"
    />
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
  const [hoveredPriceLocal, setHoveredPriceLocal] = useState<number | null>(null);

  const hoveredColor = hoveredPriceLocal !== null
    ? getColorForPrice(hoveredPriceLocal, chartMin, chartMax)
    : null;

  return (
    <div dir="ltr" className="w-full h-[150px] mb-6 select-none" style={{ marginLeft: "-4px", marginRight: "-4px", width: "calc(100% + 8px)" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: isAr ? 0 : 8, left: isAr ? 8 : 0, bottom: 0 }}
          onMouseMove={(state: any) => {
            if (state?.activePayload?.[0]) {
              const price = state.activePayload[0].payload.price;
              const name = state.activePayload[0].payload.name;
              setHoveredPriceLocal(price);
              onHoverChange(price, name);
            }
          }}
          onMouseLeave={() => {
            setHoveredPriceLocal(null);
            onHoverChange(null, null);
          }}
        >
          <defs>
            {/* Multi-color gradient for the line stroke: High is green, Mid is amber, Low is red */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10B981" />
              <stop offset="50%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            {/* Fading gradient for the Area fill under the line */}
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor="#10B981" stopOpacity={0.16} />
              <stop offset="50%"  stopColor="#F59E0B" stopOpacity={0.08} />
              <stop offset="95%"  stopColor="#EF4444" stopOpacity={0.00} />
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
            padding={{ left: 20, right: 20 }}
            hide={false}
          />
          <YAxis
            domain={[chartMin - 2, chartMax + 2]}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-rubik), sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => Math.round(v).toLocaleString(isAr ? "ar-EG" : "en-US")}
            width={40}
            orientation={isAr ? "right" : "left"}
            hide={false}
          />
          <RechartsTooltip
            content={<HeroCustomTooltip locale={locale} tCommon={tCommon} activeCurrency={activeCurrency} />}
            cursor={<CustomCursor customStroke={hoveredColor || trendColor} />}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="url(#lineGrad)"
            strokeWidth={2}
            fill="url(#heroGrad)"
            dot={false}
            activeDot={(props: any) => {
              const { cx, cy, payload } = props;
              if (cx === undefined || cy === undefined) return null;
              const price = payload.price;
              const dotColor = getColorForPrice(price, chartMin, chartMax);
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={dotColor}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              );
            }}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
