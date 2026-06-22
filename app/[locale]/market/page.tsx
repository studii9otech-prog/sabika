
import MarketDashboard from "@/components/market/MarketDashboard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Coins } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getBaseUrl } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketPage" });
  const baseUrl = getBaseUrl();
  return {
    title: `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/market`,
      languages: {
        ar: `${baseUrl}/ar/market`,
        en: `${baseUrl}/en/market`,
      },
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarketPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketPage" });

  return (
    <div className="min-h-screen bg-background">


      {/* Header section */}
      <div className="glassy-grid border-b border-border/40 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 text-start">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                  {t("liveActive")}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hub Dashboard */}
      <ErrorBoundary
        fallbackTitle="تعذّر تحميل لوحة السوق المباشر"
        fallbackDescription="حدث خطأ في تحميل بيانات السوق. يرجى تحديث الصفحة أو المحاولة لاحقاً."
      >
        <MarketDashboard locale={locale} />
      </ErrorBoundary>
    </div>
  );
}


