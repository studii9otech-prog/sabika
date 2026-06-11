export type Locale = "ar" | "en";

/**
 * تنسيق سعر بالعملة
 */
export function formatPrice(
  value: number,
  currency: string,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * تنسيق رقم عادي مع فواصل
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * تنسيق نسبة مئوية مع علامة + أو -
 */
export function formatChange(value: number, locale: Locale): string {
  const sign = value > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(Math.abs(value));
  return `${value < 0 ? "-" : sign}${formatted}%`;
}

/**
 * تنسيق تغيير السعر بالجنيه
 */
export function formatPriceChange(value: number, locale: Locale): string {
  const sign = value > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { minimumFractionDigits: 0, maximumFractionDigits: 0 }
  ).format(Math.abs(value));
  return `${value < 0 ? "-" : sign}${formatted}`;
}

/**
 * حساب الوقت منذ آخر تحديث بالثواني
 */
export function getSecondsSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
}

/**
 * تنسيق تاريخ بشكل مختصر
 */
export function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
  });
}
