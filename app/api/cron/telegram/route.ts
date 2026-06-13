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
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      const host = request.headers.get("host") || "sabika-gold.vercel.app";
      const protocol = host.includes("localhost") ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }
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
    const saghaUSDVal = prices.saghaUSD || data.saghaUSD;
    const bankUSDVal = prices.bankUSD || usdToEGP;

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

    // Formatting rates for clean presentation without parenthesis BiDi issues
    const p24 = Math.round(prices.karat24.gramPriceEGP).toLocaleString("ar-EG");
    const p21 = Math.round(prices.karat21.gramPriceEGP).toLocaleString("ar-EG");
    const p18 = Math.round(prices.karat18.gramPriceEGP).toLocaleString("ar-EG");
    const p14 = Math.round(prices.karat14.gramPriceEGP).toLocaleString("ar-EG");
    
    // Handled karat12 if defined, else fallback safely
    const karat12Item = prices.karat12 || { gramPriceEGP: Math.round(prices.karat24.gramPriceEGP * 0.5), changePercent24h: 0.45, direction: "up" };
    const p12 = Math.round(karat12Item.gramPriceEGP).toLocaleString("ar-EG");

    const change24 = `${prices.karat24.changePercent24h > 0 ? "+" : ""}${prices.karat24.changePercent24h}%`;
    const change21 = `${prices.karat21.changePercent24h > 0 ? "+" : ""}${prices.karat21.changePercent24h}%`;
    const change18 = `${prices.karat18.changePercent24h > 0 ? "+" : ""}${prices.karat18.changePercent24h}%`;
    const change14 = `${prices.karat14.changePercent24h > 0 ? "+" : ""}${prices.karat14.changePercent24h}%`;
    const change12 = `${karat12Item.changePercent24h > 0 ? "+" : ""}${karat12Item.changePercent24h}%`;

    // 4. Format the post text with HTML formatting
    const message = `
🪙 <b>أسعار الذهب المباشرة — سبيكة</b>
📅 <b>التحديث:</b> ${dateStr}

📊 <b>أسعار الذهب (جنيه مصري / جرام):</b>
━━━━━━━━━━━━━━━━━━
🥇 <b>عيار 24 :</b> ${p24} ج.م  |  ${dirEmoji(prices.karat24.direction)} ${change24}
🥈 <b>عيار 21 :</b> ${p21} ج.م  |  ${dirEmoji(prices.karat21.direction)} ${change21}
🥉 <b>عيار 18 :</b> ${p18} ج.م  |  ${dirEmoji(prices.karat18.direction)} ${change18}
🎗️ <b>عيار 14 :</b> ${p14} ج.م  |  ${dirEmoji(prices.karat14.direction)} ${change14}
🎗️ <b>عيار 12 :</b> ${p12} ج.م  |  ${dirEmoji(karat12Item.direction)} ${change12}
━━━━━━━━━━━━━━━━━━

📉 <b>مؤشرات السوق والصاغة:</b>
🏦 <b>سعر دولار البنك:</b> ${bankUSDVal ? bankUSDVal.toFixed(2) : "—"} ج.م
💵 <b>سعر دولار الصاغة:</b> ${saghaUSDVal ? saghaUSDVal.toFixed(2) : "—"} ج.م
🌐 <b>الأونصة عالمياً:</b> ${prices.ounceUSD.toLocaleString("en-US")} $

🔗 <b>روابط المتابعة الرسمية:</b>
🌐 موقع سبيكة الرسمي: ${baseUrl}
📢 قناة التليجرام: https://t.me/SabikaLivePrices
🟢 قناة الواتساب: https://whatsapp.com/channel/0029VbDoPswBVJkxJ9v7qs3c
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
