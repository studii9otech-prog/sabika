"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useOuncePrice } from "@/hooks/useLivePrice";

/**
 * A smooth live-updating display for the gold ounce USD spot price.
 * Updates every second silently in the background.
 * Supports 3 decimal places: e.g. 4,153.750
 */
export default function OunceSpotTicker({
  locale = "en-US",
  className = "",
}: {
  locale?: string;
  className?: string;
}) {
  const { ounceUSD } = useOuncePrice();
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<number | null>(null);
  const [direction, setDirection] = useState<"up" | "down" | "none">("none");

  const fmt = (v: number) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
      useGrouping: true,
    });

  useEffect(() => {
    if (ounceUSD === null || !spanRef.current) return;
    const el = spanRef.current;
    const prev = prevRef.current;

    if (prev === null) {
      // First render — just set text
      el.textContent = fmt(ounceUSD);
      prevRef.current = ounceUSD;
      return;
    }

    if (prev === ounceUSD) return; // no change

    const dir = ounceUSD > prev ? "up" : "down";
    setDirection(dir);
    prevRef.current = ounceUSD;

    // Smooth number tween
    gsap.fromTo(
      { val: prev },
      { val: prev },
      {
        val: ounceUSD,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: function () {
          const cur = (this.targets()[0] as { val: number }).val;
          el.textContent = fmt(cur);
        },
      }
    );

    // Color flash
    const flashColor = dir === "up" ? "#10B981" : "#EF4444";
    gsap.to(el, {
      color: flashColor,
      duration: 0.12,
      ease: "none",
      onComplete: () => {
        gsap.to(el, { color: "inherit", duration: 2.0, ease: "power1.out" });
      },
    });

    // Reset direction after a moment
    const t = setTimeout(() => setDirection("none"), 2500);
    return () => clearTimeout(t);
  }, [ounceUSD]);

  if (ounceUSD === null) {
    return (
      <span className={`font-price tabular-nums text-muted-foreground ${className}`}>
        —
      </span>
    );
  }

  return (
    <span
      className={`font-price tabular-nums inline-flex items-baseline gap-1 ${className}`}
    >
      {/* Pulse dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block self-center flex-shrink-0 ${
          direction === "up"
            ? "bg-emerald-500"
            : direction === "down"
            ? "bg-red-500"
            : "bg-amber-500"
        } animate-pulse`}
      />
      <span ref={spanRef}>{fmt(ounceUSD)}</span>
    </span>
  );
}
