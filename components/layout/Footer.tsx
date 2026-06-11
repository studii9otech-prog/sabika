"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

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
    <footer className="bg-[#09090B] text-neutral-100 border-t border-[#27272A] mt-20 w-full text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/images/logo_footer.svg"
                alt="Sabika"
                className="h-[34px] w-auto object-contain"
              />
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {t("tagline")}
            </p>
            {/* Address & Developer */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{t("address")}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                <span>{t("developedBy")}</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://x.com/mhmd_t21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/mo-hassan21ta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("pagesHeader")}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href === "/" ? `/${locale}` : `/${locale}${link.href}`}
                    className="text-neutral-400 text-xs hover:text-primary transition-colors duration-150"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("disclaimerHeader")}
            </h3>
            <p className="text-neutral-400 text-[10px] leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#27272A] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-[10px]">
            © {year} {tNav("brand")} · {t("rights")}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="text-neutral-500 text-[10px]">
              {t("liveData")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
