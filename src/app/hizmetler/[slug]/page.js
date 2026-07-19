import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import { absoluteUrl, BUSINESS, safeJsonLd, SERVICE_PAGES } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map(({ slug }) => ({ slug }));
}

function getService(slug) {
  return SERVICE_PAGES.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const path = `/hizmetler/${service.slug}`;
  return {
    title: service.seoTitle,
    description: service.description,
    alternates: { canonical: path },
    openGraph: {
      title: service.seoTitle,
      description: service.description,
      url: path,
      type: "website",
      images: [{ url: service.image, alt: `${service.title} uygulaması` }],
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.description,
      images: [service.image],
    },
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const url = absoluteUrl(`/hizmetler/${service.slug}`);
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(`Merhaba AKC Oto Kılıf, ${service.title} hizmeti için teklif almak istiyorum.`)}`;
  const related = SERVICE_PAGES.filter((item) => item.slug !== service.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        serviceType: service.title,
        description: service.description,
        url,
        image: absoluteUrl(service.image),
        provider: { "@id": `${absoluteUrl()}#business` },
        areaServed: { "@type": "City", name: "Konya" },
        availableChannel: {
          "@type": "ServiceChannel",
          servicePhone: BUSINESS.phone,
          serviceUrl: url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl() },
          { "@type": "ListItem", position: 2, name: "Hizmetler", item: absoluteUrl("/#hizmetler") },
          { "@type": "ListItem", position: 3, name: service.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="site-shell service-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <nav className="service-nav" aria-label="Ana menü">
        <Link className="brand" href="/">
          <span className="brand-logo-frame"><Image className="brand-logo" src="/images/akc-logo-square.png" alt="AKC Oto Kılıf logo" width={72} height={72} /></span>
          <span><strong>AKC Oto Kılıf</strong><small>Konya • Özel dikim • Montaj</small></span>
        </Link>
        <div className="service-nav-links"><Link href="/">Ana Sayfa</Link><Link href="/urunler">Ürünler</Link><a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>Hemen Ara</a></div>
      </nav>

      <div className="service-breadcrumb" aria-label="İçerik yolu"><Link href="/">Ana Sayfa</Link><span>/</span><span>{service.title}</span></div>

      <section className="service-hero">
        <div className="service-hero-copy">
          <p className="eyebrow">{service.eyebrow}</p>
          <h1>{service.heading}</h1>
          <p>{service.intro}</p>
          <div className="hero-actions">
            <a className="primary-btn" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp ile Teklif Al</a>
            <a className="secondary-btn" href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>
          </div>
        </div>
        <div className="service-hero-image"><Image src={service.image} alt={`${service.title} örnek uygulama`} width={1200} height={900} priority /></div>
      </section>

      <section className="service-content">
        <div>
          <p className="eyebrow">AKC uygulama standardı</p>
          <h2>{service.title} hizmetinde neler sunuyoruz?</h2>
          <p>Doğru sonuç için araç bilgisi ve beklenti önce netleştirilir. Malzeme yalnızca görünümüne göre değil, kullanım yoğunluğu ve bakım ihtiyacına göre seçilir. Üretim sonrası montajda koltuk formunun korunması ve temiz bitiş hedeflenir.</p>
        </div>
        <ul>{service.benefits.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}</ul>
      </section>

      <section className="service-process">
        <p className="eyebrow">Nasıl ilerliyoruz?</p>
        <h2>Bilgiden montaja dört net adım</h2>
        <div className="service-steps">
          {[['01', 'Araç bilgisi', 'Marka, model, yıl ve koltuk tipi alınır.'], ['02', 'Tasarım seçimi', 'Malzeme, renk ve dikiş seçenekleri belirlenir.'], ['03', 'Üretim planı', 'Uygulama kapsamı, süre ve teklif netleştirilir.'], ['04', 'Profesyonel montaj', 'Ürün araca kontrollü biçimde uygulanır.']].map(([no, title, text]) => <article key={no}><small>{no}</small><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="service-local">
        <div><p className="eyebrow">Konya / Karatay</p><h2>Atölyemize gelmeden önce araç bilgisiyle fiyat alın.</h2><p>{BUSINESS.address}. Konya merkezden WhatsApp üzerinden marka, model, yıl ve koltuk fotoğrafını göndererek uygun seçenekleri öğrenebilirsiniz.</p></div>
        <a className="primary-btn" href={whatsappUrl} target="_blank" rel="noreferrer">Araç Bilgisi Gönder</a>
      </section>

      <section className="related-services">
        <p className="eyebrow">Diğer hizmetler</p><h2>Aracınız için diğer çözümler</h2>
        <div>{related.map((item) => <Link key={item.slug} href={`/hizmetler/${item.slug}`}><span>{item.title}</span><small>Detayları gör →</small></Link>)}</div>
      </section>

      <SiteFooter />
    </main>
  );
}
