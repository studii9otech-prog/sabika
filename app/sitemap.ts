import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["ar", "en"];
  const routes = [
    "",
    "/market",
    "/analytics",
    "/advisor",
    "/advisor/plan/dca",
    "/advisor/plan/timing",
    "/advisor/plan/hedge",
  ];

  const items: MetadataRoute.Sitemap = [];
  const baseUrl = getBaseUrl();

  for (const route of routes) {
    for (const locale of locales) {
      items.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  return items;
}
