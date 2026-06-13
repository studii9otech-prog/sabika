import { NextResponse } from "next/server";

export const revalidate = 0; // Prevent Next.js from caching this API endpoint

export async function GET(request: Request) {
  // 1. Authorization check for Vercel Cron or custom triggers
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET || "sabika_secret_123";

  const isAuthorized = 
    authHeader === `Bearer ${cronSecret}` || 
    secretParam === cronSecret;

  if (!isAuthorized) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Telegram credentials (with fallback to your created Bot Token)
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "8628826857:AAE3iSc0lqtNHA4MNl775tYzuSmrMd_UB1U";
  const chatId = process.env.TELEGRAM_CHAT_ID; // Public username (e.g. "@SabikaPrices") or private Chat ID

  if (!chatId) {
    return NextResponse.json(
      { success: false, error: "TELEGRAM_CHAT_ID is not configured in environment variables" },
      { status: 400 }
    );
  }

  try {
    // 2. Fetch live price data from the internal Gold Price API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/prices/gold`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch gold prices: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || !data.prices) {
      throw new Error("Invalid gold prices data structure received");
    }

    const prices = data.prices;
    const usdToEGP = data.usdToEGP;
    const saghaUSD = data.saghaUSD;

    // 3. Format date and time in Cairo timezone
    const dateStr = new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Cairo"
    });

    // Helper for trend emojis
    const dirEmoji = (dir: string) => {
      if (dir === "up") return "📈";
      if (dir === "down") return "📉";
      return "➖";
    };

    // 4. Format the post text with HTML formatting
    const message = `
🪙 <b>تحديث أسعار الذهب المباشرة - سبيكة</b>
📅 ${dateStr}

📊 <b>أسعار العيارات (ج.م / جرام):</b>
• <b>عيار 24 (خالص):</b> ${Math.round(prices.karat24.gramPriceEGP).toLocaleString("ar-EG")} ج.م (${prices.karat24.changePercent24h > 0 ? "+" : ""}${prices.karat24.changePercent24h}% ${dirEmoji(prices.karat24.direction)})
• <b>عيار 21 (شائع):</b> ${Math.round(prices.karat21.gramPriceEGP).toLocaleString("ar-EG")} ج.م (${prices.karat21.changePercent24h > 0 ? "+" : ""}${prices.karat21.changePercent24h}% ${dirEmoji(prices.karat21.direction)})
• <b>عيار 18 (مشغولات):</b> ${Math.round(prices.karat18.gramPriceEGP).toLocaleString("ar-EG")} ج.م (${prices.karat18.changePercent24h > 0 ? "+" : ""}${prices.karat18.changePercent24h}% ${dirEmoji(prices.karat18.direction)})
• <b>عيار 14:</b> ${Math.round(prices.karat14.gramPriceEGP).toLocaleString("ar-EG")} ج.م (${prices.karat14.changePercent24h > 0 ? "+" : ""}${prices.karat14.changePercent24h}% ${dirEmoji(prices.karat14.direction)})

📉 <b>مؤشرات الصاغة والسوق:</b>
• 💵 <b>سعر دولار الصاغة:</b> ${saghaUSD ? saghaUSD.toFixed(2) : "—"} ج.م
• 🏦 <b>سعر دولار البنك:</b> ${usdToEGP ? usdToEGP.toFixed(2) : "—"} ج.م
• 🌐 <b>الأونصة عالمياً:</b> $${prices.ounceUSD.toLocaleString("en-US")}

📱 <i>لمتابعة الشارت والتحليلات الفنية اللحظية وتوقعات الذكاء الاصطناعي:</i>
<a href="${baseUrl}">موقع سبيكة الرسمي</a>
`;

    // 5. Post message to Telegram Channel via Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.trim(),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!telegramRes.ok) {
      const errBody = await telegramRes.json();
      throw new Error(`Telegram API Error: ${JSON.stringify(errBody)}`);
    }

    return NextResponse.json({ success: true, message: "Price updates published to Telegram successfully" });
  } catch (error: any) {
    console.error("Cron Telegram Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
