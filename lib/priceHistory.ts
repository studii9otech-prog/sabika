/**
 * Price Snapshot Engine
 * ---------------------
 * Singleton in-memory store يحفظ snapshots حقيقية لأسعار الذهب عيار 21 (جرام / EGP)
 * يدعم آخر 168 نقطة (= 7 أيام × 24 ساعة)، مع deduplication وfillGaps تلقائي.
 *
 * ملاحظة: البيانات تُفقد عند Vercel cold-start أو re-deploy.
 * في هذه الحالة يتدخل الـ fallback في history route لإكمال البيانات بـ mock.
 */

export interface PriceSnapshot {
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** سعر جرام ذهب عيار 21 بالجنيه المصري */
  price: number;
  /** هل هذه النقطة حقيقية (scraped) أم مُولَّدة (mock/interpolated) */
  real: boolean;
}

const MAX_SNAPSHOTS = 168; // 7 days × 24 hours

/** Singleton class — instance واحد لكل عملية Node.js */
class PriceHistoryStore {
  private snapshots: PriceSnapshot[] = [];

  /**
   * يضيف snapshot جديدة.
   * Deduplication: إذا كانت هناك نقطة في نفس الساعة (بدقة ±5 دقائق) يتم تحديثها بدلاً من إضافة مكررة.
   */
  add(price: number, timestamp?: string): void {
    if (!price || price <= 0) return;

    const now = timestamp ? new Date(timestamp) : new Date();
    const isoNow = now.toISOString();

    // Dedup: هل هناك نقطة في نفس الفترة (±5 دقائق)؟
    const FIVE_MIN_MS = 5 * 60 * 1000;
    const existing = this.snapshots.findIndex(
      (s) => Math.abs(new Date(s.timestamp).getTime() - now.getTime()) < FIVE_MIN_MS
    );

    if (existing !== -1) {
      // تحديث النقطة الموجودة بآخر سعر
      this.snapshots[existing] = { timestamp: isoNow, price, real: true };
    } else {
      this.snapshots.push({ timestamp: isoNow, price, real: true });
    }

    // الاحتفاظ بآخر MAX_SNAPSHOTS فقط (FIFO)
    if (this.snapshots.length > MAX_SNAPSHOTS) {
      this.snapshots = this.snapshots.slice(this.snapshots.length - MAX_SNAPSHOTS);
    }

    // ترتيب تصاعدي حسب الوقت دائماً
    this.snapshots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * يرجع آخر N ساعة من الـ snapshots.
   * @param hours عدد الساعات (افتراضياً 24)
   */
  getRecent(hours: number = 24): PriceSnapshot[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.snapshots.filter(
      (s) => new Date(s.timestamp).getTime() >= cutoff
    );
  }

  /** عدد الـ snapshots الكلي المحفوظ */
  count(): number {
    return this.snapshots.length;
  }

  /** آخر snapshot محفوظة */
  latest(): PriceSnapshot | null {
    return this.snapshots.length > 0
      ? this.snapshots[this.snapshots.length - 1]
      : null;
  }

  /**
   * يملأ الفراغات بـ linear interpolation عند غياب بعض الساعات.
   * يرجع مصفوفة مرتبة تحتوي على نقطة لكل ساعة من آخر `hours` ساعة.
   * النقاط المُدخَلة تحمل `real: false`.
   */
  getFilledHourly(
    hours: number,
    fallbackPoints: { timestamp: string; price: number }[]
  ): PriceSnapshot[] {
    const real = this.getRecent(hours);

    // إذا لا يوجد بيانات حقيقية كافية، ارجع الـ fallback
    if (real.length < 2) {
      return fallbackPoints.map((p) => ({ ...p, real: false }));
    }

    const now = Date.now();
    const result: PriceSnapshot[] = [];

    for (let i = hours; i >= 0; i--) {
      const targetTime = now - i * 60 * 60 * 1000;

      // أقرب نقطة حقيقية قبل هذه اللحظة
      const before = [...real]
        .reverse()
        .find((s) => new Date(s.timestamp).getTime() <= targetTime);

      // أقرب نقطة حقيقية بعد هذه اللحظة
      const after = real.find(
        (s) => new Date(s.timestamp).getTime() >= targetTime
      );

      let price: number;
      let isReal = false;

      if (before && after) {
        const t1 = new Date(before.timestamp).getTime();
        const t2 = new Date(after.timestamp).getTime();
        if (t1 === t2) {
          price = before.price;
          isReal = true;
        } else {
          // linear interpolation
          const ratio = (targetTime - t1) / (t2 - t1);
          price = Math.round(before.price + ratio * (after.price - before.price));
          isReal = Math.abs(targetTime - t1) < 5 * 60 * 1000; // ±5 دقائق = حقيقي
        }
      } else if (before) {
        price = before.price;
        isReal = Math.abs(targetTime - new Date(before.timestamp).getTime()) < 5 * 60 * 1000;
      } else if (after) {
        price = after.price;
        isReal = Math.abs(targetTime - new Date(after.timestamp).getTime()) < 5 * 60 * 1000;
      } else {
        // لا يوجد بيانات — استخدام آخر سعر معروف أو fallback
        price = real[real.length - 1]?.price ?? fallbackPoints[0]?.price ?? 0;
      }

      result.push({
        timestamp: new Date(targetTime).toISOString(),
        price,
        real: isReal,
      });
    }

    return result;
  }
}

// Singleton — يضمن instance واحد طوال دورة حياة السيرفر
const globalForHistory = globalThis as typeof globalThis & {
  _priceHistoryStore?: PriceHistoryStore;
};

if (!globalForHistory._priceHistoryStore) {
  globalForHistory._priceHistoryStore = new PriceHistoryStore();
}

export const priceHistoryStore = globalForHistory._priceHistoryStore;
