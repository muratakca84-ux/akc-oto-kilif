import { Suspense } from "react";
import "./globals.css";
import "./admin.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ThemeProvider from "@/components/ThemeProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://akcotokilif.com";

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf ve Döşeme",
    template: "%s | AKC Oto Kılıf",
  },

  description:
    "AKC Oto Kılıf; araca özel oto kılıf, koltuk döşeme, direksiyon kaplama, taban döşeme ve profesyonel montaj hizmetleri sunar.",

  keywords: [
    "AKC Oto Kılıf",
    "oto kılıf",
    "araç koltuk kılıfı",
    "özel dikim oto kılıf",
    "oto döşeme",
    "İstanbul oto kılıf",
    "profesyonel oto kılıf",
    "araç iç döşeme",
    "deri oto kılıf",
    "oto koltuk döşeme",
  ],

  openGraph: {
    title: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf",
    description:
      "Ölçülü dikim, premium görünüm ve profesyonel montaj ile aracınıza özel oto kılıf çözümleri.",
    url: siteUrl,
    siteName: "AKC Oto Kılıf",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AKC Oto Kılıf",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf",
    description:
      "Araca özel oto kılıf, döşeme ve profesyonel montaj çözümleri.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070707",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider />

        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>

        {children}
      </body>
    </html>
  );
}