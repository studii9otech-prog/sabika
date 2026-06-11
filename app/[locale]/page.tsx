import HeroPrice from "@/components/prices/HeroPrice";
import PriceChart from "@/components/charts/PriceChart";
import MetalCards from "@/components/prices/MetalCards";
import PriceTable from "@/components/prices/PriceTable";
import MarketPulseCardsClient from "../../components/prices/MarketPulseCards";
import EgyptIndicators from "@/components/prices/EgyptIndicators";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketPage" });

  return (
    <div className="min-h-screen">

      {/* ── Hero — narrow, centered ─────────────────────────── */}
      <HeroPrice />

      {/* ── Sections — full width ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">

        {/* Market Pulse Cards */}
        <section>
          <SectionHeader label={t("pulseTitle")} sub={t("pulseSub")} />
          <Suspense fallback={<PulseCardsSkeleton />}>
            <MarketPulseCardsClient />
          </Suspense>
        </section>

        {/* Egyptian Market Indicators */}
        <EgyptIndicators />

        {/* Price Table */}
        <section>
          <SectionHeader label={t("matrixTitle")} sub={t("matrixSub")} />
          <PriceTable />
        </section>

        {/* Price Chart */}
        <section>
          <SectionHeader label={t("chartTitle")} sub={t("chartSub")} />
          <PriceChart />
        </section>

        {/* Other Metals */}
        <section>
          <SectionHeader label={t("otherMetalsTitle")} sub={t("otherMetalsSub")} />
          <MetalCards />
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-5 text-start">
      <h2 className="text-lg font-bold text-foreground">{label}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function PulseCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card p-5">
          <Skeleton className="h-3 w-20 mb-4" />
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
