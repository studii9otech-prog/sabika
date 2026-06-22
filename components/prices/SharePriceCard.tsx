"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useActivePrices } from "@/hooks/useLivePrice";
import { useTranslations, useLocale } from "next-intl";
import { Share2, Download, Check, Loader2, X } from "lucide-react";

// ─── SVG Sparkline Generator ─────────────────────────────────────────────────
function buildSparklinePath(
  prices: number[],
  width: number,
  height: number
): { path: string; fillPath: string; min: number; max: number } {
  if (prices.length < 2) return { path: "", fillPath: "", min: 0, max: 0 };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = prices.map((p, i) => ({
    x: pad + (i / (prices.length - 1)) * w,
    y: pad + h - ((p - min) / range) * h,
  }));

  // Smooth cubic bezier
  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const last = pts[pts.length - 1];
  const first = pts[0];
  const fillPath =
    path +
    ` L ${last.x} ${height} L ${first.x} ${height} Z`;

  return { path, fillPath, min, max };
}

// ─── The Card rendered via Canvas/SVG ────────────────────────────────────────
function drawShareCard(
  canvas: HTMLCanvasElement,
  opts: {
    isAr: boolean;
    karat: string;
    price: number;
    currency: string;
    currencyLabel: string;
    change24h: number;
    changePercent: number;
    isUp: boolean;
    ounceUSD: number;
    date: string;
    time: string;
    sparkPrices: number[];
  }
) {
  const {
    isAr, karat, price, currency, currencyLabel,
    change24h, changePercent, isUp,
    ounceUSD, date, time, sparkPrices,
  } = opts;

  const W = 1080;
  const H = 567;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d")!;

  // ── Background ───────────────────────────────────────────────────────────
  ctx.fillStyle = "#0B0B0E";
  ctx.fillRect(0, 0, W, H);

  // Radial gold glow — top center
  const glow = ctx.createRadialGradient(W / 2, -40, 0, W / 2, -40, 520);
  glow.addColorStop(0, "rgba(184,150,12,0.18)");
  glow.addColorStop(1, "rgba(184,150,12,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Bottom-right secondary glow
  const glow2 = ctx.createRadialGradient(W - 80, H + 60, 0, W - 80, H + 60, 380);
  glow2.addColorStop(0, "rgba(184,150,12,0.10)");
  glow2.addColorStop(1, "rgba(184,150,12,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle grid pattern ──────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.028)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Card border glow ─────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(184,150,12,0.28)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 1, 1, W - 2, H - 2, 24);
  ctx.stroke();

  // ── Inner top separator line ─────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 88); ctx.lineTo(W - 40, 88); ctx.stroke();

  // ── HEADER: Logo text + Live badge ──────────────────────────────────────
  const fontFamily = "'Rubik', 'Arial', sans-serif";
  
  // Sabika wordmark
  ctx.font = `700 22px ${fontFamily}`;
  ctx.fillStyle = "#B8960C";
  ctx.textBaseline = "middle";
  if (isAr) {
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillText("سبيكة", W - 44, 46);
  } else {
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillText("Sabika", 44, 46);
  }

  // sabika.app subdomain
  ctx.font = `400 13px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  if (isAr) {
    ctx.textAlign = "right";
    ctx.fillText("sabika.app", W - 44, 64);
  } else {
    ctx.textAlign = "left";
    ctx.fillText("sabika.app", 44, 64);
  }

  // Live badge — opposite side
  const badgeX = isAr ? 44 : W - 44;
  const badgeAlign = isAr ? "left" : "right";
  ctx.textAlign = badgeAlign as CanvasTextAlign;
  
  // Badge pill
  const badgeText = isAr ? "• مباشر" : "• Live";
  ctx.font = `600 12px ${fontFamily}`;
  const bm = ctx.measureText(badgeText);
  const bw = bm.width + 20;
  const bh = 24;
  const bx = isAr ? badgeX : badgeX - bw;
  const by = 34;
  ctx.fillStyle = "rgba(5,150,105,0.15)";
  roundRect(ctx, bx, by, bw, bh, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(5,150,105,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#10B981";
  ctx.fillText(badgeText, isAr ? bx + 10 : bx + bw - 10, by + bh / 2);

  // Date / time label
  ctx.textAlign = "center";
  ctx.font = `400 13px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.fillText(`${date} · ${time}`, W / 2, 46);

  // ── KARAT LABEL ──────────────────────────────────────────────────────────
  const karatLabel = isAr ? `ذهب عيار ${karat}` : `Gold ${karat}K`;
  ctx.font = `500 15px ${fontFamily}`;
  ctx.fillStyle = "rgba(184,150,12,0.85)";
  ctx.textAlign = isAr ? "right" : "left";
  ctx.direction = isAr ? "rtl" : "ltr";
  if (isAr) {
    ctx.fillText(`${karatLabel} · ${currencyLabel} / جرام`, W - 52, 128);
  } else {
    ctx.fillText(`${karatLabel} · ${currencyLabel} / gram`, 52, 128);
  }

  // ── MAIN PRICE ───────────────────────────────────────────────────────────
  const priceStr = Math.round(price).toLocaleString(isAr ? "ar-EG" : "en-US");
  ctx.font = `800 92px ${fontFamily}`;

  // Gold gradient text
  const goldGrad = ctx.createLinearGradient(0, 155, 0, 255);
  goldGrad.addColorStop(0, "#FFE9A0");
  goldGrad.addColorStop(0.45, "#D4A820");
  goldGrad.addColorStop(1, "#9F7506");
  ctx.fillStyle = goldGrad;
  ctx.textBaseline = "alphabetic";
  if (isAr) {
    ctx.textAlign = "right";
    ctx.fillText(priceStr, W - 52, 248);
  } else {
    ctx.textAlign = "left";
    ctx.fillText(priceStr, 52, 248);
  }

  // ── CHANGE BADGE ─────────────────────────────────────────────────────────
  const sign = isUp ? "+" : "";
  const changeColor = isUp ? "#10B981" : "#EF4444";
  const changeBg = isUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";
  const changeBorder = isUp ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)";

  const changePctText = `${sign}${changePercent.toFixed(2)}%`;
  const changeValText = isAr
    ? `${sign}${Math.round(Math.abs(change24h)).toLocaleString("ar-EG")} ${currencyLabel}`
    : `${sign}${Math.round(Math.abs(change24h)).toLocaleString("en-US")} ${currencyLabel}`;

  ctx.font = `700 17px ${fontFamily}`;
  ctx.textBaseline = "middle";

  const pctW = ctx.measureText(changePctText).width + 20;
  const valW = ctx.measureText(changeValText).width + 20;
  const badgeY = 270;
  const badgeH = 30;
  const gap = 10;

  let bx1: number, bx2: number;
  if (isAr) {
    bx1 = W - 52 - pctW;
    bx2 = bx1 - gap - valW;
  } else {
    bx1 = 52;
    bx2 = bx1 + pctW + gap;
  }

  // Pct badge
  ctx.fillStyle = changeBg;
  roundRect(ctx, bx1, badgeY, pctW, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = changeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = changeColor;
  ctx.textAlign = "center";
  ctx.fillText(changePctText, bx1 + pctW / 2, badgeY + badgeH / 2);

  // Val badge
  ctx.fillStyle = changeBg;
  roundRect(ctx, bx2, badgeY, valW, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = changeBorder;
  ctx.stroke();
  ctx.fillStyle = changeColor;
  ctx.fillText(changeValText, bx2 + valW / 2, badgeY + badgeH / 2);

  // ── 24H LABEL ────────────────────────────────────────────────────────────
  ctx.font = `400 12px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  if (isAr) {
    ctx.textAlign = "right";
    ctx.fillText("التغير خلال 24 ساعة", W - 52, 318);
  } else {
    ctx.textAlign = "left";
    ctx.fillText("24h change", 52, 318);
  }

  // ── SPARKLINE ────────────────────────────────────────────────────────────
  const sparkW = 440;
  const sparkH = 130;
  const sparkY = 345;
  const sparkX = isAr ? W - 52 - sparkW : 52;

  const { path, fillPath } = buildSparklinePath(sparkPrices, sparkW, sparkH);

  // Translate context
  ctx.save();
  ctx.translate(sparkX, sparkY);

  // Fill gradient under line
  const sparkFill = ctx.createLinearGradient(0, 0, 0, sparkH);
  sparkFill.addColorStop(0, isUp ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)");
  sparkFill.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sparkFill;
  const fillP2D = new Path2D(fillPath);
  ctx.fill(fillP2D);

  // Line stroke — gradient
  const sparkStroke = ctx.createLinearGradient(0, 0, sparkW, 0);
  sparkStroke.addColorStop(0, isUp ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)");
  sparkStroke.addColorStop(0.5, isUp ? "#10B981" : "#EF4444");
  sparkStroke.addColorStop(1, isUp ? "#34D399" : "#F87171");
  ctx.strokeStyle = sparkStroke;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const lineP2D = new Path2D(path);
  ctx.stroke(lineP2D);

  ctx.restore();

  // ── RIGHT PANEL: Stats ───────────────────────────────────────────────────
  const panelX = isAr ? 52 : W - 52 - 300;
  const panelY = 108;
  const panelW = 300;
  const panelH = 378;

  // Panel background
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  roundRect(ctx, panelX, panelY, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const stats = [
    {
      label: isAr ? "أونصة الذهب" : "Gold Ounce",
      value: `$${ounceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "#B8960C",
    },
    {
      label: isAr ? "عيار 24" : "Karat 24",
      value: `${Math.round(price * (24 / Number(karat))).toLocaleString(isAr ? "ar-EG" : "en-US")} ${currencyLabel}`,
      color: "#F4F4F5",
    },
    {
      label: isAr ? "عيار 18" : "Karat 18",
      value: `${Math.round(price * (18 / Number(karat))).toLocaleString(isAr ? "ar-EG" : "en-US")} ${currencyLabel}`,
      color: "#F4F4F5",
    },
    {
      label: isAr ? "عيار 21" : "Karat 21",
      value: `${Math.round(price * (21 / Number(karat))).toLocaleString(isAr ? "ar-EG" : "en-US")} ${currencyLabel}`,
      color: "#F4F4F5",
    },
  ];

  const rowH = panelH / stats.length;
  stats.forEach((s, i) => {
    const ry = panelY + i * rowH;
    const rMid = ry + rowH / 2;

    if (i < stats.length - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 16, ry + rowH);
      ctx.lineTo(panelX + panelW - 16, ry + rowH);
      ctx.stroke();
    }

    ctx.font = `400 12px ${fontFamily}`;
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.textBaseline = "middle";
    if (isAr) {
      ctx.textAlign = "right";
      ctx.fillText(s.label, panelX + panelW - 20, rMid - 10);
      ctx.font = `700 15px ${fontFamily}`;
      ctx.fillStyle = s.color;
      ctx.fillText(s.value, panelX + panelW - 20, rMid + 10);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(s.label, panelX + 20, rMid - 10);
      ctx.font = `700 15px ${fontFamily}`;
      ctx.fillStyle = s.color;
      ctx.fillText(s.value, panelX + 20, rMid + 10);
    }
  });

  // ── FOOTER ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, H - 52); ctx.lineTo(W - 40, H - 52); ctx.stroke();

  ctx.font = `400 12px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textBaseline = "middle";
  if (isAr) {
    ctx.textAlign = "right";
    ctx.fillText("البيانات مؤشرية فقط وليست توصية استثمارية", W - 44, H - 26);
    ctx.textAlign = "left";
    ctx.fillText("sabika.app", 44, H - 26);
  } else {
    ctx.textAlign = "left";
    ctx.fillText("For informational purposes only. Not financial advice.", 44, H - 26);
    ctx.textAlign = "right";
    ctx.fillText("sabika.app", W - 44, H - 26);
  }
}

// Helper: rounded rect
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface SharePriceCardProps {
  selectedKarat?: string;
  sparkPrices?: number[];
}

export default function SharePriceCard({
  selectedKarat = "21",
  sparkPrices = [],
}: SharePriceCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const { data, activeCurrency } = useActivePrices();
  const locale = useLocale();
  const isAr = locale === "ar";
  const tCommon = useTranslations("common");

  const karatKey = `karat${selectedKarat}` as
    | "karat12" | "karat14" | "karat18" | "karat21" | "karat24";
  const priceData = data?.prices?.[karatKey];

  const currencyLabel = tCommon((activeCurrency || "EGP").toLowerCase() as any);

  const handleClose = useCallback(() => {
    setIsActive(false);
    setTimeout(() => {
      setIsRendered(false);
      setState("idle");
      setPreviewUrl(null);
    }, 300);
  }, []);

  const generateCard = useCallback(async () => {
    if (!priceData || !data) return;
    setState("generating");
    setIsRendered(true);

    // slight delay to let modal mount and trigger entry animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsActive(true);
      }, 10);
    });

    await new Promise((r) => setTimeout(r, 80));

    const canvas = canvasRef.current!;
    const now = new Date();
    const dateStr = now.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
      weekday: "short", day: "numeric", month: "long", year: "numeric",
    });
    const timeStr = now.toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
      hour: "2-digit", minute: "2-digit",
    });

    // Use real spark prices or generate 24 realistic-looking points
    let sp = sparkPrices;
    if (!sp || sp.length < 4) {
      const base = priceData.gramPriceEGP;
      sp = Array.from({ length: 24 }, (_, i) => {
        const noise = (Math.sin(i * 0.7) * 0.008 + Math.cos(i * 1.3) * 0.005) * base;
        return Math.round(base + noise);
      });
    }

    drawShareCard(canvas, {
      isAr,
      karat: selectedKarat,
      price: priceData.gramPriceEGP,
      currency: activeCurrency || "EGP",
      currencyLabel: String(currencyLabel),
      change24h: priceData.change24h,
      changePercent: priceData.changePercent24h,
      isUp: priceData.change24h >= 0,
      ounceUSD: data.prices.ounceUSD,
      date: dateStr,
      time: timeStr,
      sparkPrices: sp,
    });

    setPreviewUrl(canvas.toDataURL("image/png", 1.0));
    setState("done");
  }, [priceData, data, isAr, selectedKarat, activeCurrency, currencyLabel, sparkPrices]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `sabika-gold-${selectedKarat}k-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!previewUrl || !canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return handleDownload();
        const file = new File([blob], `sabika-gold-${selectedKarat}k.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: isAr ? "أسعار الذهب — سبيكة" : "Gold Prices — Sabika" });
        } else {
          handleDownload();
        }
      }, "image/png");
    } catch {
      handleDownload();
    }
  };

  // Close on backdrop click (anywhere outside the card)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isRendered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, handleClose]);

  if (!priceData) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={generateCard}
        disabled={state === "generating"}
        title={isAr ? "مشاركة السعر" : "Share price card"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-muted/60 hover:border-primary/30 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {state === "generating" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Share2 className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        )}
        {isAr ? "مشاركة" : "Share"}
      </button>

      {/* Off-screen canvas */}
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      {/* Modal Overlay */}
      {isRendered && typeof document !== "undefined" && createPortal(
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 ${
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleBackdropClick}
        >
          {/* Ambient Glow behind the whole modal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div
            ref={modalRef}
            className={`relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#0B0B0E] border border-white/10 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.8)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isActive
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-dot" />
                <span className="text-sm font-bold text-white font-heading">
                  {isAr ? "بطاقة السعر القابلة للمشاركة" : "Shareable Price Card"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] text-zinc-400 font-semibold tracking-wider">
                  {isAr ? `عيار ${selectedKarat}` : `${selectedKarat}K`}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
              >
                <X className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Preview Area */}
            <div className="p-6 relative">
              {state === "generating" && (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <div className="absolute w-12 h-12 rounded-full border border-primary/20 animate-ping" />
                  </div>
                  <span className="text-sm font-medium animate-pulse">
                    {isAr ? "جاري تجهيز بطاقة السعر..." : "Preparing price card..."}
                  </span>
                </div>
              )}
              {state === "done" && previewUrl && (
                <div className="relative group">
                  {/* Subtle hover background glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-amber-500/20 blur-xl opacity-70 rounded-2xl group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
                  
                  <img
                    src={previewUrl}
                    alt="Share Card Preview"
                    className="relative w-full rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:scale-[1.01]"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            {state === "done" && (
              <div className="px-6 pb-6 flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-zinc-400" />
                  {isAr ? "تحميل PNG" : "Download PNG"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#B8960C] to-[#E6BA3C] hover:from-[#D4A820] hover:to-[#FFE9A0] active:scale-[0.98] text-black font-bold text-sm shadow-[0_4px_20px_rgba(184,150,12,0.25)] transition-all duration-200 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-black" />
                  {isAr ? "مشاركة" : "Share"}
                </button>
              </div>
            )}

            {/* Info note */}
            <div className="px-6 pb-5">
              <p className="text-[11px] text-zinc-500 text-center font-medium leading-relaxed">
                {isAr
                  ? "البطاقة تحتوي على السعر الحالي وبيانات 24 ساعة — مناسبة للمشاركة على واتساب وتليجرام وإنستجرام"
                  : "Card includes current price & 24h data — perfect for sharing on WhatsApp, Telegram & Instagram"}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
