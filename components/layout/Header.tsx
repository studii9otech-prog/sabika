"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageToggle from "@/components/common/LanguageToggle";
import ThemeToggle from "@/components/common/ThemeToggle";
import CountryToggle from "@/components/common/CountryToggle";
const navLinks = [
  { key: "prices", href: "/" },
  { key: "analytics", href: "/analytics" },
  { key: "advisor", href: "/advisor" },
  { key: "market", href: "/market" },
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
                className="w-72 rounded-l-2xl border-l border-border/60 bg-background"
              >
                <div className="flex flex-col gap-1.5 pt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={localePath(link.href)}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        isActive(link.href)
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
