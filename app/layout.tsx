import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
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
  metadataBase: new URL("https://sabika-app.com"),
  title: "سبيكة | Sabika - رفيقك الاستثماري في عالم الذهب",
  description:
    "متابعة أسعار الذهب والمعادن الثمينة في مصر والوطن العربي بشكل مباشر، مع تحليلات ذكية وإشارات استثمارية.",
  keywords: ["سعر الذهب", "gold price", "ذهب مصر", "أسعار الذهب اليوم", "مؤشرات الصاغة"],
  openGraph: {
    title: "سبيكة | Sabika - رفيقك الاستثماري في عالم الذهب",
    description:
      "متابعة أسعار الذهب والمعادن الثمينة في مصر والوطن العربي بشكل مباشر، مع تحليلات ذكية وإشارات استثمارية.",
    url: "https://sabika-app.com",
    siteName: "Sabika سبيكة",
    images: [
      {
        url: "/assets/images/sabika_preview.png",
        width: 1200,
        height: 630,
        alt: "سبيكة - رفيقك الاستثماري في عالم الذهب",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "سبيكة | Sabika - رفيقك الاستثماري في عالم الذهب",
    description:
      "متابعة أسعار الذهب والمعادن الثمينة في مصر والوطن العربي بشكل مباشر، مع تحليلات ذكية وإشارات استثمارية.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
