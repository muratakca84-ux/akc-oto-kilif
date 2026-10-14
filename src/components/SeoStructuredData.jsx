import { absoluteUrl, safeJsonLd, SITE_URL } from "@/lib/seo";
import { getContact, onlyDigits, SITE_FALLBACK } from "@/lib/site-config";

function toAbsolute(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

export default function SeoStructuredData({ settings = SITE_FALLBACK, faqs = [] }) {
  const contact = getContact(settings);
  const businessName = settings.businessName || SITE_FALLBACK.businessName;

  const graph = [
    {
      "@type": "AutomotiveBusiness",
      "@id": `${SITE_URL}/#business`,
      name: businessName,
      url: SITE_URL,
      telephone: `+${onlyDigits(contact.phoneDisplay)}`,
      email: contact.email,
      image: toAbsolute(settings.heroImageUrl) || `${SITE_URL}/opengraph-image`,
      logo: toAbsolute(settings.brandLogoUrl),
      priceRange: "₺₺",
      description: "Araca özel oto kılıf, koltuk döşeme ve profesyonel montaj hizmetleri.",
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address,
        addressLocality: "Karatay",
        addressRegion: "Konya",
        postalCode: "42030",
        addressCountry: "TR",
      },
      areaServed: ["Konya", "Karatay", "Meram", "Selçuklu"],
      hasMap: contact.mapsUrl,
      currenciesAccepted: "TRY",
      sameAs: contact.instagram ? [contact.instagram] : [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: businessName,
      inLanguage: "tr-TR",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
  ];

  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
