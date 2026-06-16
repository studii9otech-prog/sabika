import ContactForm from "@/components/common/ContactForm";
import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const baseUrl = getBaseUrl();
  return {
    title: `${t("title")} - ${locale === "ar" ? "سبيكة" : "Sabika"}`,
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        ar: `${baseUrl}/ar/contact`,
        en: `${baseUrl}/en/contact`,
      },
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="glassy-grid border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start gap-4 text-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  {locale === "ar" ? "اتصال مباشر" : "Direct Support"}
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

      {/* ── Contact Form Section ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <ContactForm />
      </div>
    </div>
  );
}
