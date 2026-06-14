"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = ["1", "2", "3", "4", "5"];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-card/45 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,150,12,0.02),transparent_50%)] pointer-events-none" />
      
      {/* Section Header */}
      <div className="mb-8 text-start max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <HelpCircle className="w-5.5 h-5.5 text-primary" />
          {t("title")}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqItems.map((itemKey, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={itemKey}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-primary/30 bg-primary/5 dark:bg-primary/[0.02]"
                  : "border-border/50 bg-muted/10 hover:border-border hover:bg-muted/20"
              }`}
            >
              {/* Question Trigger */}
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-start font-bold text-xs sm:text-sm text-foreground cursor-pointer focus:outline-none select-none"
              >
                <span>{t(`q${itemKey}` as any)}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {/* Answer Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[300px] border-t border-border/30" : "max-h-0"
                } overflow-hidden`}
              >
                <div className="px-5 py-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {t(`a${itemKey}` as any)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
