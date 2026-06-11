"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface NumberTickerProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** "ar-EG" for Arabic Eastern numerals, "en-US" for Western digits */
  locale?: string;
  flashColor?: "up" | "down" | "none";
  useGrouping?: boolean;
}

export default function NumberTicker({
  value,
  className = "",
  duration = 0.8,
  prefix = "",
  suffix = "",
  decimals = 0,
  locale = "ar-EG",
  flashColor = "none",
  useGrouping = true,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  const format = (v: number) =>
    v.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping,
    });

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const startValue = prevValue.current;
    const endValue = value;

    const colors = {
      up: "#10B981",
      down: "#EF4444",
      none: null,
    };

    const flashCol = colors[flashColor];

    gsap.fromTo(
      { val: startValue },
      { val: startValue },
      {
        val: endValue,
        duration,
        ease: "power2.out",
        snap: decimals === 0 ? { val: 1 } : undefined,
        onUpdate: function () {
          const current = this.targets()[0] as { val: number };
          el.textContent = prefix + format(current.val) + suffix;
        },
      }
    );

    if (flashCol && startValue !== endValue) {
      gsap.to(el, {
        color: flashCol,
        duration: 0.15,
        ease: "none",
        onComplete: () => {
          gsap.to(el, {
            color: "inherit",
            duration: 1.8,
            ease: "power1.out",
          });
        },
      });
    }

    prevValue.current = value;
  }, [value, duration, prefix, suffix, decimals, locale, flashColor, useGrouping]);

  return (
    <span ref={ref} className={`font-price tabular-nums ${className}`}>
      {prefix}
      {format(value)}
      {suffix}
    </span>
  );
}
