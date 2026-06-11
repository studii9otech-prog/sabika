import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MarketStatusBar from "@/components/layout/MarketStatusBar";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic
    ? "سبيكة | Sabika - رفيقك الاستثماري في عالم الذهب"
    : "Sabika - Your Gold Investment Companion";

  const description = isArabic
    ? "متابعة أسعار الذهب والمعادن الثمينة في مصر والوطن العربي بشكل مباشر، مع تحليلات ذكية وإشارات استثمارية."
    : "Track live gold and precious metal prices in Egypt and the Arab world, with smart analytics and investment signals.";

  const keywords = isArabic
    ? ["سعر الذهب", "gold price", "ذهب مصر", "أسعار الذهب اليوم", "مؤشرات الصاغة", "البورصة العالمية"]
    : ["gold price", "silver price", "gold Egypt", "live gold rates", "precious metals"];

  return {
    title: {
      default: title,
      template: `%s | ${isArabic ? "سبيكة" : "Sabika"}`,
    },
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://sabika-app.com/${locale}`,
      siteName: isArabic ? "سبيكة" : "Sabika",
      images: [
        {
          url: "/assets/images/sabika_preview.png",
          width: 1200,
          height: 630,
          alt: isArabic ? "سبيكة - رفيقك الاستثماري في عالم الذهب" : "Sabika - Your Gold Investment Companion",
        },
      ],
      locale: isArabic ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/images/sabika_preview.png"],
    },
    icons: {
      icon: [
        { url: "/assets/images/logo.svg", type: "image/svg+xml" },
      ],
      shortcut: "/assets/images/logo.svg",
      apple: "/assets/images/logo.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isArabic = locale === "ar";

  return (
    <NextIntlClientProvider messages={messages}>
      <TooltipProvider>
        <div
          dir={isArabic ? "rtl" : "ltr"}
          lang={locale}
          className={`min-h-screen flex flex-col bg-background text-foreground ${isArabic ? "font-arabic" : ""}`}
        >
          <MarketStatusBar />
          <Header />
          <main key={locale} className="flex-1 locale-transition-container">
            {children}
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
