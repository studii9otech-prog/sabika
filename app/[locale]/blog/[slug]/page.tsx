import { ARTICLES } from "@/lib/blog/data";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import ShareButton from "@/components/common/ShareButton";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Support build-time static generation for maximum speed and zero hosting cost
export async function generateStaticParams() {
  return ARTICLES.flatMap((article) =>
    ["ar", "en"].map((locale) => ({
      locale,
      slug: article.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: `${article.title[locale as "ar" | "en"]} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: article.excerpt[locale as "ar" | "en"],
    alternates: {
      canonical: `https://sabika-app.com/${locale}/blog/${slug}`,
      languages: {
        ar: `https://sabika-app.com/ar/blog/${slug}`,
        en: `https://sabika-app.com/en/blog/${slug}`,
      },
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  const isAr = locale === "ar";

  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    notFound();
  }

  const contentBlocks = article.content[locale as "ar" | "en"] || [];
  
  // Extract all headings for the Table of Contents
  const headings = contentBlocks
    .map((block, idx) => ({ block, idx }))
    .filter(({ block }) => block.type === "heading");

  return (
    <div className="min-h-screen">
      
      {/* ── Breadcrumb & Back navigation ─────────────────────── */}
      <div className="border-b border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs">
          <Link
            href={`/${locale}/blog`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer font-bold"
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{t("backToBlog")}</span>
          </Link>
          
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span>{locale === "ar" ? "الرئيسية" : "Home"}</span>
            <span>/</span>
            <span>{t("title")}</span>
            <span>/</span>
            <span className="text-foreground font-bold line-clamp-1 max-w-[150px] sm:max-w-xs">
              {isAr ? article.title.ar : article.title.en}
            </span>
          </div>
        </div>
      </div>

      {/* ── Article Cover & Title Banner ─────────────────────── */}
      <div className="glassy-grid border-b border-border/40 py-10 sm:py-16 text-start">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Category Badge & Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              {article.category === "market"
                ? t("categoryMarket")
                : article.category === "guide"
                ? t("categoryGuide")
                : t("categoryNews")}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {article.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t("readTime", { minutes: article.readTime })}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight font-display max-w-3xl">
            {isAr ? article.title.ar : article.title.en}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {isAr ? article.subtitle.ar : article.subtitle.en}
          </p>

          {/* Author Details Card */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-border/20 w-fit">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary select-none">
              {article.author.avatar}
            </div>
            <div>
              <p className="text-xs font-black text-foreground">
                {isAr ? article.author.name.ar : article.author.name.en}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isAr ? article.author.role.ar : article.author.role.en}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Article Main Layout ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main content body */}
          <article className="lg:col-span-8 space-y-6">
            {contentBlocks.map((block, idx) => {
              switch (block.type) {
                case "heading":
                  return (
                    <h2
                      id={`h-${idx}`}
                      key={idx}
                      className="text-lg sm:text-xl font-bold text-foreground mt-8 mb-4 border-b border-border/40 pb-2 text-start font-heading scroll-mt-20"
                    >
                      {block.text}
                    </h2>
                  );
                case "paragraph":
                  return (
                    <p
                      key={idx}
                      className="text-sm sm:text-base text-foreground/90 leading-relaxed text-start font-normal mb-4"
                    >
                      {block.text}
                    </p>
                  );
                case "blockquote":
                  return (
                    <blockquote
                      key={idx}
                      className="p-4 my-6 rounded-xl border-s-4 border-primary bg-muted/20 text-start text-sm sm:text-base font-medium text-foreground relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-full filter blur-xl pointer-events-none" />
                      <p className="relative z-10 leading-relaxed italic">{block.text}</p>
                    </blockquote>
                  );
                case "list":
                  return (
                    <ul
                      key={idx}
                      className="list-disc list-inside space-y-2.5 text-start text-sm sm:text-base text-foreground/90 my-5 ps-4"
                    >
                      {block.items?.map((item, itemIdx) => (
                        <li key={itemIdx} className="leading-relaxed">
                          <span className="ps-1.5">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                case "table":
                  return (
                    <div key={idx} className="overflow-x-auto w-full my-6 rounded-xl border border-border/60 shadow-sm bg-card">
                      <table className="w-full border-collapse text-start text-xs sm:text-sm">
                        <thead className="bg-muted/60 border-b border-border/60">
                          <tr>
                            {block.headers?.map((header, headIdx) => (
                              <th key={headIdx} className="p-3.5 font-bold text-foreground text-start">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows?.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-3.5 text-muted-foreground text-start font-medium font-price">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Table of contents card */}
            {headings.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-start space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{t("toc")}</span>
                </h3>
                
                <div className="space-y-1.5 border-s border-border">
                  {headings.map(({ block, idx }) => (
                    <a
                      key={idx}
                      href={`#h-${idx}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-all text-start block py-1.5 ps-4 border-s-2 border-transparent -ms-[1px] hover:border-primary/40 leading-snug"
                    >
                      {block.text}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Sharing actions card */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 text-start space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("share")}
              </h3>
              <ShareButton label={t("copyLink")} copiedLabel={t("copied")} />
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
