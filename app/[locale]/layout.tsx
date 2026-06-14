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
    ? "أسعار الذهب اليوم مباشر في مصر والوطن العربي | سبيكة Sabika"
    : "Live Gold Prices Today in Egypt & Arab World | Sabika";

  const description = isArabic
    ? "تابع أسعار الذهب اليوم في مصر والوطن العربي لحظة بلحظة. أسعار مباشرة لعيار 24، 21، 18، وأونصة الذهب، بالإضافة إلى إشارات الاستثمار وحاسبة الذهب الذكية لحفظ أموالك."
    : "Track live gold rates today in Egypt & the Arab world. Instant prices for 24K, 22K, 21K, 18K gold and spot ounces, with AI investment signals and DCA savings tools.";

  const keywords = isArabic
    ? ["سعر الذهب اليوم", "أسعار الذهب في مصر", "سعر الذهب مباشر", "عيار 21", "سعر جرام الذهب", "سبائك الذهب", "شراء الذهب مصر", "بورصة الذهب مباشر", "حاسبة الذهب", "سبيكة"]
    : ["gold price today", "live gold rates Egypt", "gold price per gram", "buy gold bullion", "karat 21 gold price", "spot gold ticker", "gold investment calculator", "Sabika gold"];

  return {
    title: {
      default: title,
      template: `%s | ${isArabic ? "سبيكة" : "Sabika"}`,
    },
    description,
    keywords,
    alternates: {
      canonical: `https://sabika-app.com/${locale}`,
      languages: {
        ar: "https://sabika-app.com/ar",
        en: "https://sabika-app.com/en",
      },
    },
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
          alt: isArabic ? "سبيكة - رفيقك الاستثماري في عالم الذهب" : "Sabika - Your Gold Companion",
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

  const faqQuestions = [
    {
      qAr: "كيف يتم تحديث أسعار الذهب في الموقع؟",
      aAr: "تُحدث الأسعار لحظياً ومباشرة بناءً على أسعار بورصة الذهب العالمية الفورية وتغيرات سعر الصرف المحلي بشكل تلقائي كل دقيقة دون الحاجة لتحديث الصفحة يدوياً.",
      qEn: "How are gold prices updated on the site?",
      aEn: "Prices are updated in real-time, pulling directly from global spot gold markets and local exchange rate metrics every 60 seconds automatically.",
    },
    {
      qAr: "ما هو أفضل وقت لشراء الذهب في مصر؟",
      aAr: "الذهب أداة ادخار وحفظ للقيمة على المدى الطويل. يُنصح دائماً باتباع استراتيجية الادخار التراكمي (DCA) عبر شراء كميات ثابتة شهرياً لتجنب تقلبات الأسعار وتجنب مخاطر اختيار توقيت فردي للشراء.",
      qEn: "When is the best time to buy gold in Egypt?",
      aEn: "Gold is a long-term wealth preservation tool. We recommend Dollar Cost Averaging (DCA)—buying fixed amounts monthly to average out market volatility and avoid entry timing risks.",
    },
    {
      qAr: "ما الفرق بين السبائك الذهبية والمشغولات عند الادخار؟",
      aAr: "للادخار يُفضل دائماً شراء السبائك والجنيهات الذهبية لأن مصنعيتها منخفضة جداً (تتراوح بين 50 إلى 80 جنيهاً للجرام) مقارنة بالمشغولات التي تزيد مصنعيتها، كما تتيح الشركات استرداد جزء من المصنعية (كاش باك) عند إعادة البيع بشرط الحفاظ على الغلاف مغلقاً.",
      qEn: "What is the difference between gold bars and jewelry for saving?",
      aEn: "For savings, gold bullion bars and coins are preferred due to significantly lower merchant making fees (typically 50-80 EGP/gram) compared to decorated jewelry, and they feature a cashback refund upon resell as long as the seal is intact.",
    },
    {
      qAr: "كيف تؤثر قرارات الفيدرالي الأمريكي على أسعار الذهب محلياً؟",
      aAr: "تؤثر أسعار الفائدة الفيدرالية وقوة الدولار عكسياً على الذهب عالمياً؛ فرفع الفائدة يوجه الأموال للسندات ويخفض الطلب على الذهب، مما ينعكس على السعر العالمي للأونصة ويقود السعر المحلي تبعاً لذلك بجانب تغيرات سعر الصرف المحلي.",
      qEn: "How do US Federal Reserve decisions affect local gold prices?",
      aEn: "Fed rate decisions inversely correlate with global gold prices; rate hikes increase bond yields and lower gold spot rates, driving down local currency gold prices depending on USD exchange rate fluctuations.",
    },
    {
      qAr: "هل التحليلات وإشارات الاستثمار في سبيكة مضمونة؟",
      aAr: "الحاسبة والمحاكاة والتحليلات الفنية هي أدوات لمساعدتك استناداً إلى انحرافات الأسعار اليومية والأداء التاريخي لأسواق الذهب. ولا تعتبر نصائح مالية رسمية للشراء أو البيع، وعليك دائماً مراجعة قراراتك المالية بنفسك.",
      qEn: "Are Sabika's AI signals and calculators guaranteed?",
      aEn: "Our pricing matrix, simulators, and technical indicators are calibrated based on daily volatility support lines and historical performances. They serve as strategic guidance and do not represent professional financial advisory.",
    }
  ];

  const mainEntity = faqQuestions.map(item => ({
    "@type": "Question",
    "name": isArabic ? item.qAr : item.qEn,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": isArabic ? item.aAr : item.aEn
    }
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": isArabic ? "سبيكة - أسعار الذهب اليوم مباشر" : "Sabika - Live Gold Prices",
        "url": `https://sabika-app.com/${locale}`,
        "description": isArabic
          ? "تابع أسعار الذهب اليوم في مصر والوطن العربي لحظة بلحظة. أسعار مباشرة لعيار 24، 21، 18، وأونصة الذهب، بالإضافة إلى إشارات الاستثمار وحاسبة الذهب الذكية لحفظ أموالك."
          : "Track live gold rates today in Egypt & the Arab world. Instant prices for 24K, 22K, 21K, 18K gold and spot ounces, with AI investment signals and DCA savings tools.",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "inLanguage": locale,
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "EGP"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": mainEntity
      }
    ]
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <TooltipProvider>
        <div
          dir={isArabic ? "rtl" : "ltr"}
          lang={locale}
          className={`min-h-screen flex flex-col bg-background text-foreground ${isArabic ? "font-arabic" : ""}`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
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
