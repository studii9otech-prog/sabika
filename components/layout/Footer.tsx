"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();

  const links = [
    { key: "prices", href: "/" },
    { key: "analytics", href: "/analytics" },
    { key: "advisor", href: "/advisor" },
    { key: "market", href: "/market" },
  ];

  return (
    <footer className="bg-[#09090B] text-zinc-100 border-t border-white/[0.05] mt-24 w-full text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Column 1: Brand (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <Link href={locale === "/" ? `/${locale}` : `/${locale}`} className="inline-block">
              <img
                src="/assets/images/logo_footer.svg"
                alt="Sabika"
                className="h-[34px] w-auto object-contain"
              />
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              {t("tagline")}
            </p>
          </div>

          {/* Column 2: Navigation Links (Span 3) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("pagesHeader")}
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href === "/" ? `/${locale}` : `/${locale}${link.href}`}
                    className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors duration-150"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Location (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {locale === "ar" ? "الموقع" : "Location"}
            </h3>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{t("address")}</span>
            </div>
          </div>

          {/* Column 4: Disclaimer (Span 3) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("disclaimerHeader")}
            </h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>

        </div>

        {/* Bottom Copyright & Live Status */}
        <div className="border-t border-white/[0.05] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-xs">
            © {year} {tNav("brand")} · {t("rights")}
          </p>
          
          {/* Simple Clean Live Status */}
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("liveData")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
