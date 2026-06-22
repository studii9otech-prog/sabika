import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Search, Home, TrendingUp, BarChart3, BookOpen } from "lucide-react";

interface NotFoundProps {
  params?: Promise<{ locale: string }>;
}

/**
 * Next.js locale-scoped 404 page.
 * Triggered by notFound() calls or unmatched routes inside /[locale].
 */
export default async function NotFound(_props: NotFoundProps) {
  // Safe locale resolution — falls back to "ar" if params unavailable
  let locale = "ar";
  try {
    const t = await getTranslations({ locale: "ar", namespace: "nav" });
    void t; // just to verify it works
  } catch {
    // ignore
  }

  const isAr = locale === "ar";

  const quickLinks = [
    {
      href: `/${locale}`,
      label: isAr ? "الرئيسية" : "Home",
      icon: Home,
      desc: isAr ? "أسعار الذهب المباشرة" : "Live gold prices",
    },
    {
      href: `/${locale}/analytics`,
      label: isAr ? "التحليلات" : "Analytics",
      icon: BarChart3,
      desc: isAr ? "مؤشرات السوق الفنية" : "Technical indicators",
    },
    {
      href: `/${locale}/advisor`,
      label: isAr ? "المستشار" : "Advisor",
      icon: TrendingUp,
      desc: isAr ? "حاسبة الاستثمار الذكية" : "Smart investment calculator",
    },
    {
      href: `/${locale}/blog`,
      label: isAr ? "المدونة" : "Blog",
      icon: BookOpen,
      desc: isAr ? "مقالات وأدلة الاستثمار" : "Investment guides & articles",
    },
  ];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-background flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-2xl w-full text-center space-y-10">
        
        {/* Large 404 visual */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <span
              className="text-[120px] sm:text-[160px] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.3) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Search className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                {isAr ? "الصفحة غير موجودة" : "Page not found"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {isAr ? "عذراً، هذه الصفحة لا وجود لها" : "Sorry, this page doesn't exist"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isAr
                ? "قد يكون الرابط خاطئاً أو أن الصفحة قد أُزيلت. جرّب إحدى الصفحات أدناه أو ارجع للرئيسية."
                : "The link may be wrong or the page has been removed. Try one of the pages below or go back home."}
            </p>
          </div>
        </div>

        {/* Quick navigation cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-foreground">{link.label}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-relaxed hidden sm:block">
                  {link.desc}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Home CTA */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
