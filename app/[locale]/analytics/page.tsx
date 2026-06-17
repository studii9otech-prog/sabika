import PriceChart from "@/components/charts/PriceChart";
import SignalCard from "@/components/advisor/SignalCard";
import AnalysisCards from "@/components/analytics/AnalysisCards";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analytics" });
  const baseUrl = getBaseUrl();
  return {
    title: `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/analytics`,
      languages: {
        ar: `${baseUrl}/ar/analytics`,
        en: `${baseUrl}/en/analytics`,
      },
    },
  };
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analytics" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const isAr = locale === "ar";

  return (
    <div className="glassy-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 text-start flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("subtitle")}
            </p>
          </div>
          
          <Link
            href={`/${locale}/blog/understanding-gold-technical-analysis`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30 transition-all text-xs font-bold w-fit shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAr ? "دليل قراءة المؤشرات الفنية" : "Technical Indicators Guide"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
          </Link>
        </div>

        {/* Main Chart */}
        <section className="mb-10">
          <PriceChart />
        </section>

        {/* Analysis Cards */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight text-start">
            {t("technicalTitle")}
          </h2>
          <AnalysisCards />
        </section>

        {/* Signal */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight text-start">
            {t("signalTitle")}
          </h2>
          <div className="max-w-md">
            <SignalCard />
          </div>
        </section>
      </div>
    </div>
  );
}
