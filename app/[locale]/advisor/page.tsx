import SignalCard from "@/components/advisor/SignalCard";
import InvestmentCalculator from "@/components/advisor/InvestmentCalculator";
import {
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  Brain,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "advisorPage" });
  const baseUrl = getBaseUrl();
  return {
    title: `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/advisor`,
      languages: {
        ar: `${baseUrl}/ar/advisor`,
        en: `${baseUrl}/en/advisor`,
      },
    },
  };
}

const PLANS = [
  {
    icon: PiggyBank,
    title: { ar: "المدخر الصغير", en: "Micro-Saver" },
    strategy: "DCA",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    strategyFull: "Dollar Cost Averaging",
    yield: { ar: "14.4% سنوياً", en: "14.4% Annually" },
    horizon: { ar: "طويل الأجل", en: "Long Term" },
    risk: { ar: "منخفضة", en: "Low", colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    description: {
      ar: 'شراء كمية ثابتة شهرياً بغض النظر عن تذبذب السعر اليومي لتجنب مخاطر التوقيت.',
      en: 'Purchase a fixed amount monthly regardless of price volatility to mitigate timing risks.'
    }
  },
  {
    icon: TrendingUp,
    title: { ar: "المستثمر المتوسط", en: "Tactical Investor" },
    strategy: "Timing",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    strategyFull: "Technical Analysis",
    yield: { ar: "22.0% سنوياً", en: "22.0% Annually" },
    horizon: { ar: "متوسط الأجل", en: "Medium Term" },
    risk: { ar: "متوسطة", en: "Medium", colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
    description: {
      ar: "شراء وتوزيع رأس المال على مراحل زمنية وتحديد مستويات الدعم الفنية القوية.",
      en: "Allocate capital in segments and buy specifically at strong support levels."
    }
  },
  {
    icon: ShieldCheck,
    title: { ar: "التحوط من التضخم", en: "Inflation Hedge" },
    strategy: "Hedge",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    strategyFull: "Inflation Hedge",
    yield: { ar: "حفظ القيمة", en: "Preserve Value" },
    horizon: { ar: "طويل جداً", en: "Very Long" },
    risk: { ar: "منخفضة جداً", en: "Very Low", colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    description: {
      ar: "تخصيص جزء ثابت من الثروة (15-20%) لحماية رأس المال من التضخم طويل الأجل.",
      en: "Allocate a fixed portion (15-20%) of wealth to shield assets from long-term inflation."
    }
  },
];

const TIPS = [
  {
    num: "01",
    title: { ar: "حفظ القيمة أولاً", en: "Value Preservation" },
    body: {
      ar: "الذهب أداة لحفظ القوة الشرائية على المدى البعيد، وتجنب المضاربات السريعة.",
      en: "Gold is an asset for preserving purchasing power long term, not for quick speculation."
    },
  },
  {
    num: "02",
    title: { ar: "الشراء المنتظم يكسب", en: "Dollar Cost Averaging" },
    body: {
      ar: "تقسيم رأس المال والشراء شهرياً يقلل من متوسط تكلفة الشراء الإجمالية.",
      en: "Segmenting capital and purchasing monthly averages out the overall entry cost."
    },
  },
  {
    num: "03",
    title: { ar: "التنويع ضرورة", en: "Diversification" },
    body: {
      ar: "لا تضع كامل مدخراتك في أصل واحد؛ حد الـ 20% في الذهب هو خيار متوازن.",
      en: "Avoid putting all savings in a single asset; a 20% cap on gold is generally balanced."
    },
  },
  {
    num: "04",
    title: { ar: "احسب التكلفة الكاملة", en: "Total Cost Auditing" },
    body: {
      ar: "رسوم المصنعية والضرائب جزء لا يتجزأ من التكلفة الفعلية، احسبها بدقة.",
      en: "Making fees and taxes are integrated costs of physical gold purchase. Calculate them."
    },
  },
];

function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-5 text-start">
      <h2 className="text-lg font-bold text-foreground">{label}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

export default async function AdvisorPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "advisorPage" });
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="glassy-grid border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start gap-4 text-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  {t("aiSupported")}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 pt-10">

        {/* ── Signal + Calculator ─────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <SectionHeader
                label={t("signalHeader")}
                sub={t("signalSub")}
              />
              <SignalCard />
            </div>
            <div>
              <SectionHeader
                label={t("yieldHeader")}
                sub={t("yieldSub")}
              />
              <InvestmentCalculator />
            </div>
          </div>
        </section>

        {/* ── Investment Plans ────────────────────────────────── */}
        <section>
          <SectionHeader
            label={t("plansHeader")}
            sub={t("plansSub")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-start">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const titleText = isAr ? plan.title.ar : plan.title.en;
              const descText = isAr ? plan.description.ar : plan.description.en;

              return (
                <div
                  key={titleText}
                  className="bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-4.5 h-4.5 ${plan.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-0.5 rounded border border-border/40">
                        {plan.strategy}
                      </span>
                    </div>

                    {/* Plan Heading */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {titleText}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {descText}
                      </p>
                    </div>

                    {/* Distinctive Specs Sheet 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-4">
                      {/* Box 1: Strategy Type */}
                      <div className="bg-muted/30 dark:bg-zinc-900/30 border border-border/40 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          {t("planType")}
                        </span>
                        <span className="text-[10px] font-bold text-foreground font-price">
                          {plan.strategy}
                        </span>
                      </div>

                      {/* Box 2: Expected Yield */}
                      <div className="bg-muted/30 dark:bg-zinc-900/30 border border-border/40 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          {t("planYield")}
                        </span>
                        <span className="text-[10px] font-bold text-primary font-price">
                          {isAr ? plan.yield.ar : plan.yield.en}
                        </span>
                      </div>

                      {/* Box 3: Horizon */}
                      <div className="bg-muted/30 dark:bg-zinc-900/30 border border-border/40 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          {t("planHorizon")}
                        </span>
                        <span className="text-[10px] font-bold text-foreground font-price">
                          {isAr ? plan.horizon.ar : plan.horizon.en}
                        </span>
                      </div>

                      {/* Box 4: Risk Badge inside Grid */}
                      <div className="bg-muted/30 dark:bg-zinc-900/30 border border-border/40 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          {t("planRisk")}
                        </span>
                        <span className={`text-[10px] font-black ${plan.risk.colorClass} border px-2 py-0.5 rounded-md`}>
                          {isAr ? plan.risk.ar : plan.risk.en}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <Link href={`/${locale}/advisor/plan/${plan.strategy.toLowerCase()}`} className="w-full">
                    <button className="w-full py-2.5 rounded-xl border border-border hover:border-primary/50 text-xs font-bold text-foreground hover:text-primary bg-muted/20 hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer">
                      <span>{t("applyModel")}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Tips ────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            label={t("tipsHeader")}
            sub={t("tipsSub")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
            {TIPS.map((tip, i) => {
              const titleText = isAr ? tip.title.ar : tip.title.en;
              const bodyText = isAr ? tip.body.ar : tip.body.en;

              return (
                <div
                  key={i}
                  className="bg-card border border-border/60 rounded-2xl p-5 flex gap-4 hover:border-border hover:shadow-sm transition-all duration-200"
                >
                  <div className="text-2xl font-black text-primary/30 tracking-tight font-price mt-0.5 select-none">
                    {tip.num}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {titleText}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {bodyText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
