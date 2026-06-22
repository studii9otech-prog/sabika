"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Globe, ShieldAlert } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  const links = [
    { key: "prices", href: "/" },
    { key: "analytics", href: "/analytics" },
    { key: "advisor", href: "/advisor" },
    { key: "market", href: "/market" },
    { key: "blog", href: "/blog" },
    { key: "contact", href: "/contact" },
  ];

  return (
    <footer className="relative bg-[#09090B] text-zinc-100 border-t border-white/[0.06] mt-24 w-full text-start overflow-hidden">
      {/* Subtle radial golden glow behind footer */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/3 rounded-full filter blur-[80px] pointer-events-none z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          
          {/* Column 1: Brand & Socials (Span 4) */}
          <div className="md:col-span-4 space-y-5">
            <Link href={`/${locale}`} className="inline-block group">
              <img
                src="/assets/images/logo_footer.svg"
                alt="Sabika"
                className="h-[36px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              {t("tagline")}
            </p>
          </div>

          {/* Column 2: Navigation Links (Span 3) */}
          <div className="md:col-span-3 md:ps-6 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{t("pagesHeader")}</span>
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href === "/" ? `/${locale}` : `/${locale}${link.href}`}
                    className="group flex items-center gap-2 text-zinc-400 hover:text-primary text-xs transition-colors duration-150"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary/80 transition-all duration-200" />
                    <span>{tNav(link.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Developer (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAr ? "التواصل والموقع" : "Contact & Info"}</span>
            </h3>
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="font-medium">{t("address")}</span>
              </div>
              <div className="border-t border-white/[0.04] pt-2.5 space-y-2">
                {/* Social Icons */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://x.com/mhmd_t21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center text-zinc-400 hover:text-primary transition-all duration-200 cursor-pointer"
                    aria-label="Twitter"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/mo-hassan21ta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center text-zinc-400 hover:text-primary transition-all duration-200 cursor-pointer"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Disclaimer Card (Span 3) */}
          <div className="md:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04] space-y-2.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t("disclaimerHeader")}</span>
              </h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                {t("disclaimer")}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Live Status */}
        <div className="border-t border-white/[0.06] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-[11px]">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {tNav("brand")} · {t("rights")}
          </p>
          
          {/* Pulse Indicator styled as a Pill Badge */}
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-500/90 font-bold text-[10px] tracking-wide uppercase select-none">
              {t("liveData")}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
