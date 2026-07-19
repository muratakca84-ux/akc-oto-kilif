import { safeJsonLd, SITE_URL } from "@/lib/seo";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function SeoStructuredData({ settings = {}, faqs = [] }) {
  const phone = /000\s*00\s*00$/.test(settings.phone || "")
    ? "+90 501 586 42 84"
    : settings.phone || "+90 501 586 42 84";
  const businessName = settings.businessName || "AKC Oto Kılıf";
  const address = String(settings.address || "").includes("eklenecek")
    ? "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya"
    : settings.address ||
      "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutomotiveBusiness",
        "@id": `${SITE_URL}/#business`,
        name: businessName,
        url: SITE_URL,
        telephone: `+${onlyDigits(phone)}`,
        email: settings.email || "info@akcotokilif.com",
        image: settings.heroImageUrl || `${SITE_URL}/opengraph-image`,
        logo: settings.brandLogoUrl || `${SITE_URL}/images/akc-logo-square.png`,
        priceRange: "₺₺",
        description:
          "Araca özel oto kılıf, koltuk döşeme ve profesyonel montaj hizmetleri.",
        address: {
          "@type": "PostalAddress",
          streetAddress: address,
          addressLocality: "Karatay",
          addressRegion: "Konya",
          postalCode: "42030",
          addressCountry: "TR",
        },
        areaServed: ["Konya", "Karatay", "Meram", "Selçuklu"],
        openingHours: "Mo-Sa 09:00-19:00",
        hasMap: settings.googleMapsUrl || "https://www.google.com/maps/search/?api=1&query=AKC+Oto+K%C4%B1l%C4%B1f+Karatay+Konya",
        currenciesAccepted: "TRY",
        paymentAccepted: "Cash, Credit Card",
        sameAs: settings.instagram ? [settings.instagram] : [],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: businessName,
        inLanguage: "tr-TR",
        publisher: { "@id": `${SITE_URL}/#business` },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }}
    />
  );
}
