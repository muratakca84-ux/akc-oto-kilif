import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import Icon from "@/components/Icon";
import { absoluteUrl, BUSINESS, safeJsonLd, SERVICE_PAGES } from "@/lib/seo";

export const dynamicParams = false;

const STEPS = [
  ["Araç bilgisi", "Marka, model, yıl ve koltuk tipi alınır."],
  ["Tasarım seçimi", "Malzeme, renk ve dikiş seçenekleri belirlenir."],
  ["Üretim planı", "Uygulama kapsamı, süre ve fiyat netleştirilir."],
  ["Profesyonel montaj", "Ürün araca kontrollü biçimde uygulanır."],
];

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
  const phoneHref = `tel:+${BUSINESS.phone.replace(/\D/g, "")}`;
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
    <>
      <SiteHeader />
      <FloatingContactButtons />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <main>
        <section className="page-hero page-hero--split">
          <div className="container page-hero-grid">
            <div>
              <nav className="breadcrumb" aria-label="İçerik yolu">
                <Link href="/">Ana Sayfa</Link>
                <Icon name="chevron" size={14} />
                <Link href="/#hizmetler">Hizmetler</Link>
                <Icon name="chevron" size={14} />
                <span>{service.title}</span>
              </nav>
              <p className="eyebrow">{service.eyebrow}</p>
              <h1>{service.heading}</h1>
              <p className="lead">{service.intro}</p>
              <div className="actions">
                <a className="btn btn-primary btn-lg" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" size={18} /> WhatsApp ile teklif alın
                </a>
                <a className="btn btn-outline btn-lg" href={phoneHref}>
                  <Icon name="phone" size={18} /> {BUSINESS.phone}
                </a>
              </div>
            </div>
            <div className="page-hero-media">
              <Image src={service.image} alt={`${service.title} örnek uygulama`} width={1200} height={900} priority />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split split--text">
            <div className="split-copy">
              <p className="eyebrow">Kapsam</p>
              <h2>{service.title} hizmetinde neler sunuyoruz?</h2>
              <p>
                Doğru sonuç için araç bilgisi ve beklenti önce netleştirilir. Malzeme yalnızca görünümüne göre değil,
                kullanım yoğunluğu ve bakım ihtiyacına göre seçilir. Montajda koltuk formunun korunması ve temiz bitiş
                hedeflenir.
              </p>
            </div>
            <ul className="check-list check-list--boxed">
              {service.benefits.map((benefit) => (
                <li key={benefit}>
                  <Icon name="check" size={18} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">Çalışma süreci</p>
              <h2>Bilgiden montaja dört adım.</h2>
            </header>
            <ol className="steps">
              {STEPS.map(([title, text], index) => (
                <li key={title}>
                  <span className="step-no">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-dark">
          <div className="container cta-band">
            <div>
              <p className="eyebrow eyebrow--light">Konya · Karatay</p>
              <h2>Atölyeye gelmeden önce fiyat alın.</h2>
              <p>
                {BUSINESS.address}. Marka, model, yıl ve koltuk fotoğrafını WhatsApp&apos;tan göndererek uygun
                seçenekleri öğrenebilirsiniz.
              </p>
            </div>
            <a className="btn btn-primary btn-lg" href={whatsappUrl} target="_blank" rel="noreferrer">
              Araç bilgisi gönderin <Icon name="arrow" size={18} />
            </a>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">Diğer hizmetler</p>
              <h2>Aracınız için diğer çözümler</h2>
            </header>
            <div className="related-grid">
              {related.map((item) => (
                <Link key={item.slug} className="related-card" href={`/hizmetler/${item.slug}`}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <span className="link-arrow">
                    İncele <Icon name="arrow" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
