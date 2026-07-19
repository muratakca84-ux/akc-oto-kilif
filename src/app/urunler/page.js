"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthNavMenu from "@/components/AuthNavMenu";
import ProductCatalog from "@/components/ProductCatalog";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fallbackSettings = {
  businessName: "AKC Oto Kılıf",
  brandSubtitle: "Premium ürünler • Sipariş merkezi",
  brandLogoUrl: "/images/akc-logo-square.png",
  phone: "+90 501 586 42 84",
  whatsapp: "905015864284",
  email: "info@akcotokilif.com",
  address: "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya",
  workingHours: "Pazartesi - Cumartesi 09:00 - 19:00",
  heroImageUrl: "/images/hero-premium-seat-covers.jpg",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function ProductsPage() {
  const [settings, setSettings] = useState(fallbackSettings);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings({ ...fallbackSettings, ...snapshot.data() });
        }
      },
      () => setSettings(fallbackSettings)
    );

    return () => unsubscribe();
  }, []);

  const phoneDisplay = settings.phone || fallbackSettings.phone;
  const phoneHref = `tel:+${onlyDigits(phoneDisplay)}`;

  const whatsappNumber = onlyDigits(settings.whatsapp || settings.phone);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20%C3%BCr%C3%BCnler%20hakk%C4%B1nda%20bilgi%20ve%20teklif%20almak%20istiyorum.`;

  const productHighlights = useMemo(
    () => [
      {
        number: "01",
        title: "Özel ölçü mantığı",
        text: "Araç modeline ve koltuk yapısına uygun ürün seçimi.",
      },
      {
        number: "02",
        title: "Premium görünüm",
        text: "Dikiş, malzeme ve renk uyumuyla daha şık iç mekân.",
      },
      {
        number: "03",
        title: "Hızlı teklif",
        text: "Ürünü inceleyip WhatsApp üzerinden hızlıca teklif alın.",
      },
    ],
    []
  );

  return (
    <main className="site-shell page-shell products-page-shell">
      <FloatingContactButtons phoneHref={phoneHref} whatsappHref={whatsappHref} />
      <nav className="navbar navbar--compact">
        <Link className="brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
          {settings.brandLogoUrl ? (
            <span className="brand-logo-frame">
              <img
                className="brand-logo"
                src={settings.brandLogoUrl}
                alt={`${settings.businessName || "AKC Oto Kılıf"} logo`}
              />
            </span>
          ) : (
            <span className="brand-mark">AKC</span>
          )}

          <span>
            <strong>{settings.businessName || "AKC Oto Kılıf"}</strong>
            <small>{settings.brandSubtitle || fallbackSettings.brandSubtitle}</small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Sayfa menüsü">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
          <Link href="/#galeri">Galeri</Link>
          <Link href="/#iletisim">İletişim</Link>
        </div>

        <div className="nav-actions">
          <AuthNavMenu />

          <a className="nav-cta" href={phoneHref}>
            Hemen Ara
          </a>
        </div>
      </nav>

      <section className="products-hero">
        <div className="products-hero-copy">
          <p className="eyebrow">Ürün kataloğu</p>

          <h1>
            Modern ve premium oto kılıf çözümleri
            <span>tek merkezde.</span>
          </h1>

          <p>
            Aracınıza uygun özel üretim ürünleri inceleyin, fiyat bilgisini
            görün ve bir tıkla WhatsApp üzerinden hızlı teklif alın.
          </p>

          <div className="hero-actions">
            <a
              className="primary-btn"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Teklif Al
            </a>

            <Link className="secondary-btn" href="/">
              Ana Sayfaya Dön
            </Link>

            <a className="secondary-btn" href={phoneHref}>
              Bizi Ara
            </a>
          </div>

          <div className="products-trust-row">
            <span>✓ Özel dikim</span>
            <span>✓ Profesyonel montaj</span>
            <span>✓ Premium görünüm</span>
          </div>
        </div>

        <div className="products-hero-panel">
          <div className="products-hero-card">
            <span>AKC ürün sistemi</span>
            <strong>Detay odaklı, şık ve dayanıklı seçenekler.</strong>
            <p>
              Ürün kartları admin panelden yönetilir. Görseller, fiyatlar,
              indirimler ve sıralama tek merkezden güncellenir.
            </p>
          </div>

          <div className="products-mini-grid">
            {productHighlights.map((item) => (
              <article key={item.number}>
                <small>{item.number}</small>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="products-catalog-section">
        <div className="section-head section-head--centered">
          <p className="eyebrow">Katalog</p>
          <h2>Ürünleri inceleyin, uygun seçenek için hızlıca iletişime geçin.</h2>
          <p>
            Fiyatı görünen ürünlerde doğrudan bilgi alabilir, teklifli ürünlerde
            araç bilgisiyle net fiyat isteyebilirsiniz.
          </p>
        </div>

        <ProductCatalog />
      </section>

      <section className="products-bottom-cta">
        <div>
          <p className="eyebrow">Karar veremediniz mi?</p>
          <h2>Aracınızın marka, model ve yıl bilgisini gönderin.</h2>
          <p>
            Size en uygun kılıf, malzeme, renk ve montaj seçeneği için hızlıca
            dönüş yapalım.
          </p>
        </div>

        <div className="products-bottom-actions">
          <a
            className="primary-btn"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp ile Sor
          </a>

          <a className="secondary-btn" href={phoneHref}>
            Telefon: {phoneDisplay}
          </a>
        </div>
      </section>
    </main>
  );
}
