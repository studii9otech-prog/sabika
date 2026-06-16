import { ARTICLES } from "@/lib/blog/data";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, User } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  const title = `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`;
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: {
      canonical: `https://sabika-app.com/${locale}/blog`,
      languages: {
        ar: "https://sabika-app.com/ar/blog",
        en: "https://sabika-app.com/en/blog",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://sabika-app.com/${locale}/blog`,
      siteName: locale === "ar" ? "سبيكة" : "Sabika",
      images: [
        {
          url: "https://sabika-app.com/assets/images/sabika_preview.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://sabika-app.com/assets/images/sabika_preview.png"],
    },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category = "all" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  const isAr = locale === "ar";

  // Categories list
  const categories = [
    { key: "all", label: t("all"), href: `/${locale}/blog` },
    { key: "market", label: t("categoryMarket"), href: `/${locale}/blog?category=market` },
    { key: "guide", label: t("categoryGuide"), href: `/${locale}/blog?category=guide` },
    { key: "news", label: t("categoryNews"), href: `/${locale}/blog?category=news` },
  ];

  // Filter and sort articles by date descending (newest first)
  const sortedArticles = [...ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const filteredArticles = category === "all"
    ? sortedArticles
    : sortedArticles.filter((a) => a.category === category);

  // Identify featured article (only shown at full width if on "all" and we have posts)
  const showFeatured = category === "all" && filteredArticles.length > 0;
  const featuredArticle = showFeatured ? filteredArticles[0] : null;
  const gridArticles = showFeatured ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="min-h-screen">
      
      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="glassy-grid border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start gap-4 text-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  {isAr ? "تحليلات الصاغة" : "Expert Insights"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2 font-heading">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-10">
        
        {/* ── Category Tabs (Filter Segmented Control) ───────── */}
        <div className="flex justify-start">
          <div className="inline-flex p-1 bg-muted/50 rounded-2xl border border-border/40 gap-1 overflow-x-auto max-w-full">
            {categories.map((cat) => {
              const active = category === cat.key;
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-card text-foreground shadow-sm border border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Featured Article Layout ─────────────────────────── */}
        {featuredArticle && (
          <Link
            href={`/${locale}/blog/${featuredArticle.slug}`}
            className="group relative block rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden text-start cursor-pointer"
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/3 rounded-full filter blur-[100px] pointer-events-none z-0" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
              {/* Left/Graphic side (Cover Image - Clean, no overlays/filters) */}
              <div className="lg:col-span-5 relative border-b lg:border-b-0 lg:border-e border-border/40 min-h-[260px] lg:min-h-full overflow-hidden bg-muted/20">
                <img
                  src={featuredArticle.coverImage}
                  alt={isAr ? featuredArticle.title.ar : featuredArticle.title.en}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              {/* Text/Details side */}
              <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  {/* Badges & Meta info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit">
                      {t("featured")}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md shadow-sm">
                      {featuredArticle.category === "market"
                        ? t("categoryMarket")
                        : featuredArticle.category === "guide"
                        ? t("categoryGuide")
                        : t("categoryNews")}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground sm:ms-auto">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {featuredArticle.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t("readTime", { minutes: featuredArticle.readTime })}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors font-heading">
                    {isAr ? featuredArticle.title.ar : featuredArticle.title.en}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {isAr ? featuredArticle.excerpt.ar : featuredArticle.excerpt.en}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 px-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center bg-background/80 select-none">
                      <img
                        src="/assets/images/logo.svg"
                        alt="Sabika"
                        className="h-4 w-auto object-contain dark:hidden"
                      />
                      <img
                        src="/assets/images/logo_footer.svg"
                        alt="Sabika"
                        className="h-4 w-auto object-contain hidden dark:block"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">
                        {isAr ? featuredArticle.author.name.ar : featuredArticle.author.name.en}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {isAr ? featuredArticle.author.role.ar : featuredArticle.author.role.en}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 group-hover:translate-x-1 transition-all">
                    <span>{t("readMore")}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Articles Grid ───────────────────────────────────── */}
        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            {gridArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/blog/${article.slug}`}
                className="group bg-card border border-border/60 hover:border-primary/30 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Cover Image at Top */}
                <div className="relative h-48 w-full overflow-hidden border-b border-border/40 bg-muted/20">
                  <img
                    src={article.coverImage}
                    alt={isAr ? article.title.ar : article.title.en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <span className="absolute top-3 start-3 text-[9px] font-black uppercase tracking-wider text-primary bg-background/95 border border-primary/20 px-2.5 py-0.5 rounded-md shadow-sm">
                    {article.category === "market"
                      ? t("categoryMarket")
                      : article.category === "guide"
                      ? t("categoryGuide")
                      : t("categoryNews")}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t("readTime", { minutes: article.readTime })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors font-heading line-clamp-2">
                      {isAr ? article.title.ar : article.title.en}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {isAr ? article.excerpt.ar : article.excerpt.en}
                    </p>
                  </div>

                  {/* Footer metadata & link */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="h-7 px-1.5 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center bg-background/80 select-none">
                        <img
                          src="/assets/images/logo.svg"
                          alt="Sabika"
                          className="h-3.5 w-auto object-contain dark:hidden"
                        />
                        <img
                          src="/assets/images/logo_footer.svg"
                          alt="Sabika"
                          className="h-3.5 w-auto object-contain hidden dark:block"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground">
                          {isAr ? article.author.name.ar : article.author.name.en}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-all">
                      <span>{t("readMore")}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !featuredArticle && (
            <div className="py-20 text-center rounded-2xl border border-border/60 bg-muted/10">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-semibold">
                {isAr ? "لا توجد مقالات متاحة في هذا القسم حالياً." : "No articles found in this category yet."}
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
