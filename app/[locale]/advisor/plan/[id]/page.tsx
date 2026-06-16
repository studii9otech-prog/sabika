import { getTranslations } from "next-intl/server";
import PlanDetailClient from "./PlanDetailClient";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "planDetails" });

  let title = "";
  let description = "";

  if (id === "dca") {
    title = t("dcaTitle");
    description = t("dcaDesc");
  } else if (id === "timing") {
    title = t("timingTitle");
    description = t("timingDesc");
  } else if (id === "hedge") {
    title = t("hedgeTitle");
    description = t("hedgeDesc");
  }

  const baseTitle = `${title} - ${locale === "ar" ? "سبيكة" : "Sabika"}`;
  const baseUrl = getBaseUrl();

  return {
    title: baseTitle,
    description: description,
    alternates: {
      canonical: `${baseUrl}/${locale}/advisor/plan/${id}`,
      languages: {
        ar: `${baseUrl}/ar/advisor/plan/${id}`,
        en: `${baseUrl}/en/advisor/plan/${id}`,
      },
    },
    openGraph: {
      title: baseTitle,
      description: description,
      url: `${baseUrl}/${locale}/advisor/plan/${id}`,
      siteName: locale === "ar" ? "سبيكة" : "Sabika",
      images: [
        {
          url: "/assets/images/sabika_preview.png",
          width: 1200,
          height: 630,
          alt: locale === "ar" ? "سبيكة" : "Sabika",
        },
      ],
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: description,
      images: ["/assets/images/sabika_preview.png"],
    },
  };
}

export default async function Page({ params }: PageProps) {
  return <PlanDetailClient params={params} />;
}
