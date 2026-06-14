"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, Coins, LineChart, Brain, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageToggle from "@/components/common/LanguageToggle";
import ThemeToggle from "@/components/common/ThemeToggle";
import CountryToggle from "@/components/common/CountryToggle";
const navLinks = [
  { key: "prices", href: "/" },
  { key: "analytics", href: "/analytics" },
  { key: "advisor", href: "/advisor" },
  { key: "market", href: "/market" },
  { key: "contact", href: "/contact" },
];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const localePath = (href: string) => href === "/" ? `/${locale}` : `/${locale}${href}`;
  const isActive = (href: string) => {
    const path = localePath(href);
    if (href === "/") {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "header-blur bg-background/85 border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={localePath("/")}
            className="flex items-center gap-2 group"
          >
            <>
              <img
                src="/assets/images/logo.svg"
                alt="Sabika"
                className="h-[34px] w-auto object-contain transition-all duration-300 group-hover:scale-105 dark:hidden"
              />
              <img
                src="/assets/images/logo_footer.svg"
                alt="Sabika"
                className="h-[34px] w-auto object-contain transition-all duration-300 group-hover:scale-105 hidden dark:block"
              />
            </>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 bg-muted/20 border border-border/50 p-1.5 rounded-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={localePath(link.href)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <CountryToggle />
            <LanguageToggle />
            <ThemeToggle />

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted/80 transition-colors cursor-pointer">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent
                side={locale === "ar" ? "right" : "left"}
                className={`w-72 bg-background/95 header-blur backdrop-blur-xl border-border/40 shadow-2xl p-0 ${
                  locale === "ar"
                    ? "rounded-l-3xl border-l"
                    : "rounded-r-3xl border-r"
                }`}
              >
                <div className="flex flex-col h-full pt-6">
                  {/* Brand Header */}
                  <div className="px-6 pb-6 mb-4 border-b border-border/20 text-start">
                    <img
                      src="/assets/images/logo.svg"
                      alt="Sabika"
                      className="h-[28px] w-auto object-contain transition-all duration-300 dark:hidden"
                    />
                    <img
                      src="/assets/images/logo_footer.svg"
                      alt="Sabika"
                      className="h-[28px] w-auto object-contain transition-all duration-300 hidden dark:block"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                      {locale === "ar" ? "رفيقك الاستثماري في عالم الذهب" : "Your Gold Investment Companion"}
                    </p>
                  </div>

                  {/* Nav Links */}
                  <nav className="flex flex-col gap-1 px-3">
                    {navLinks.map((link) => {
                      const active = isActive(link.href);
                      const Icon =
                        link.key === "prices"
                          ? Coins
                          : link.key === "analytics"
                          ? LineChart
                          : link.key === "advisor"
                          ? Brain
                          : Globe;

                      return (
                        <Link
                          key={link.key}
                          href={localePath(link.href)}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-xl ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground/80"}`} />
                          <span>{t(link.key)}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
