"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CountryOption {
  code: string;
  nameKey: string;
  flag: string;
  currency: string;
}

const countries: CountryOption[] = [
  { code: "EG", nameKey: "egypt", flag: "/assets/images/flags/eg.svg", currency: "EGP" },
  { code: "SA", nameKey: "saudi", flag: "/assets/images/flags/sa.svg", currency: "SAR" },
  { code: "AE", nameKey: "uae", flag: "/assets/images/flags/ae.svg", currency: "AED" },
  { code: "KW", nameKey: "kuwait", flag: "/assets/images/flags/kw.svg", currency: "KWD" },
  { code: "QA", nameKey: "qatar", flag: "/assets/images/flags/qa.svg", currency: "QAR" },
  { code: "BH", nameKey: "bahrain", flag: "/assets/images/flags/bh.svg", currency: "BHD" },
  { code: "OM", nameKey: "oman", flag: "/assets/images/flags/om.svg", currency: "OMR" },
  { code: "JO", nameKey: "jordan", flag: "/assets/images/flags/jo.svg", currency: "JOD" },
  { code: "LY", nameKey: "libya", flag: "/assets/images/flags/ly.svg", currency: "LYD" },
];

export default function CountryToggle() {
  const t = useTranslations("common");
  const { country, setCountry, setCurrency } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCountry = countries.find((c) => c.code === (country || "EG")) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: CountryOption) => {
    setCountry(option.code);
    setCurrency(option.currency);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="font-semibold text-xs px-2.5 py-1.5 h-auto rounded-xl hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5"
      >
        <img
          src={activeCountry.flag}
          alt={activeCountry.code}
          className="w-5 h-5 rounded-full object-cover border border-neutral-700/50 dark:border-white/10 shadow-sm select-none flex-shrink-0"
        />
        <span className="hidden sm:inline-block text-neutral-300 font-medium">
          {t(activeCountry.nameKey)}
        </span>
        <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-md uppercase">
          {t(activeCountry.currency.toLowerCase())}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-popover border border-border/80 shadow-lg z-50 overflow-hidden header-blur bg-background/95 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-1.5 space-y-0.5">
            {countries.map((item) => (
              <button
                key={item.code}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-start cursor-pointer ${
                  country === item.code
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={item.flag}
                    alt={item.code}
                    className="w-5 h-5 rounded-full object-cover border border-neutral-700/30 dark:border-white/10 shadow-sm select-none flex-shrink-0"
                  />
                  <span>{t(item.nameKey)}</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  country === item.code ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {t(item.currency.toLowerCase())}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
