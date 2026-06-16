import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getBaseUrl } from "@/lib/utils";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "أسعار الذهب اليوم مباشر في مصر والوطن العربي | سبيكة Sabika",
  description:
    "تابع أسعار الذهب اليوم في مصر والوطن العربي لحظة بلحظة. أسعار مباشرة لعيار 24، 21، 18، وأونصة الذهب، بالإضافة إلى إشارات الاستثمار وحاسبة الذهب الذكية لحفظ أموالك.",
  keywords: ["سعر الذهب اليوم", "أسعار الذهب في مصر", "سعر الذهب مباشر", "عيار 21", "سعر جرام الذهب", "سبائك الذهب", "شراء الذهب مصر", "بورصة الذهب مباشر", "حاسبة الذهب", "سبيكة"],
  openGraph: {
    title: "أسعار الذهب اليوم مباشر في مصر والوطن العربي | سبيكة Sabika",
    description:
      "تابع أسعار الذهب اليوم في مصر والوطن العربي لحظة بلحظة. أسعار مباشرة لعيار 24، 21، 18، وأونصة الذهب، بالإضافة إلى إشارات الاستثمار وحاسبة الذهب الذكية لحفظ أموالك.",
    url: getBaseUrl(),
    siteName: "Sabika سبيكة",
    images: [
      {
        url: "/assets/images/sabika_preview.png",
        width: 1200,
        height: 630,
        alt: "سبيكة - أسعار الذهب اليوم مباشر",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أسعار الذهب اليوم مباشر في مصر والوطن العربي | سبيكة Sabika",
    description:
      "تابع أسعار الذهب اليوم في مصر والوطن العربي لحظة بلحظة. أسعار مباشرة لعيار 24، 21, 18، وأونصة الذهب، بالإضافة إلى إشارات الاستثمار وحاسبة الذهب الذكية لحفظ أموالك.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} h-full antialiased`}
    >
      <head />
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
