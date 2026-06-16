"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  label: string;
  copiedLabel: string;
}

export default function ShareButton({ label, copiedLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopy}
        className="w-full h-10 rounded-xl border border-border/60 hover:border-primary/50 bg-card hover:bg-primary/5 text-xs font-bold text-foreground hover:text-primary transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98]"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500">{copiedLabel}</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
