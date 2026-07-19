import { absoluteUrl, SERVICE_PAGES, SITE_URL } from "@/lib/seo";

const CONTENT_LAST_MODIFIED = "2026-07-19";

export default function sitemap() {
  const corePages = [
    {
      url: SITE_URL,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/images/hero-premium-seat-covers.jpg"), absoluteUrl("/images/seat-stitch-detail.jpg"), absoluteUrl("/images/suv-seat-cover-installation.jpg")],
    },
    {
      url: absoluteUrl("/urunler"),
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [absoluteUrl("/images/hero-premium-seat-covers.jpg")],
    },
    {
      url: absoluteUrl("/gizlilik"),
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/kvkk"),
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const servicePages = SERVICE_PAGES.map((service) => ({
    url: absoluteUrl(`/hizmetler/${service.slug}`),
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: service.slug === "konya-oto-kilif" ? 0.95 : 0.85,
    images: [absoluteUrl(service.image)],
  }));

  return [...corePages.slice(0, 2), ...servicePages, ...corePages.slice(2)];
}
