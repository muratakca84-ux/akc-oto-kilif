import { Suspense } from "react";
import "./globals.css";
import "./admin.css";
import "./auth.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import CookieConsent from "@/components/CookieConsent";
import ThemeProvider from "@/components/ThemeProvider";
import ControlGate from "@/components/dromocob-control/control-gate";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf ve Döşeme",
    template: "%s | AKC Oto Kılıf",
  },

  description:
    "Konya AKC Oto Kılıf; araca özel oto kılıf, koltuk döşeme, direksiyon kaplama ve profesyonel montaj hizmetleri sunar.",

  alternates: {
    canonical: "/",
  },

  category: "automotive",

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },

  keywords: [
    "AKC Oto Kılıf",
    "oto kılıf",
    "araç koltuk kılıfı",
    "özel dikim oto kılıf",
    "oto döşeme",
    "Konya oto kılıf",
    "profesyonel oto kılıf",
    "araç iç döşeme",
    "deri oto kılıf",
    "oto koltuk döşeme",
  ],

  openGraph: {
    title: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf",
    description:
      "Ölçülü dikim, premium görünüm ve profesyonel montaj ile aracınıza özel oto kılıf çözümleri.",
    url: SITE_URL,
    siteName: "AKC Oto Kılıf",
    locale: "tr_TR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf",
    description:
      "Araca özel oto kılıf, döşeme ve profesyonel montaj çözümleri.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },

  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7f3",
};

export default function RootLayout({ children }) {
  const pageContent = process.env.DROMOCOB_CONTROL_ENABLED === "true"
    ? <ControlGate>{children}</ControlGate>
    : children;

  return (
    <html lang="tr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          id="akc-consent-default"
          dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied', ad_storage: 'denied',
              ad_user_data: 'denied', ad_personalization: 'denied',
              wait_for_update: 500
            });
            try {
              if (localStorage.getItem('akc-analytics-consent') === 'granted') {
                gtag('consent', 'update', { analytics_storage: 'granted' });
              }
            } catch (_) {}
          ` }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider />

        <Suspense fallback={null}>
          <AnalyticsScripts />
          <AnalyticsTracker />
        </Suspense>

        {pageContent}
        <CookieConsent />
      </body>
    </html>
  );
}
