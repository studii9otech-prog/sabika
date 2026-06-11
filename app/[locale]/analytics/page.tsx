import PriceChart from "@/components/charts/PriceChart";
import SignalCard from "@/components/advisor/SignalCard";
import AnalysisCards from "@/components/analytics/AnalysisCards";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analytics" });
  return {
    title: `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: t("subtitle"),
  };
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analytics" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="glassy-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 text-start">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("subtitle")}
          </p>
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
