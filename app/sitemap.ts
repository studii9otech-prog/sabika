import { MetadataRoute } from "next";

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

  for (const route of routes) {
    for (const locale of locales) {
      items.push({
        url: `https://sabika-app.com/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  return items;
}
