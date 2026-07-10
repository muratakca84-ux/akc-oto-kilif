"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const fallbackSettings = {
  businessName: "AKC Oto Kılıf",
  heroTitle: "Aracınıza özel oto kılıf ve döşeme çözümleri.",
  heroSubtitle:
    "AKC Oto Kılıf; binek, SUV, hafif ticari, taksi, servis ve filo araçları için ölçülü, dayanıklı, şık ve profesyonel montajlı oto kılıf hizmeti sunar.",
  phone: "+90 500 000 00 00",
  whatsapp: "905000000000",
  email: "info@akcotokilif.com",
  address: "Adres bilgisi eklenecek",
  instagram: "",
  workingHours: "Hafta içi / Cumartesi",
  heroImageUrl: "",
  googleMapsUrl: "",
};

const fallbackServices = [
  {
    title: "Araca Özel Oto Kılıf",
    category: "Binek Araç",
    material: "Deri görünümlü",
    priceText: "Teklif alınız",
    description:
      "Araç marka, model, yıl ve koltuk yapısına göre hazırlanan; koltuğa net oturan, potluk yapmayan özel dikim kılıf çözümleri.",
    icon: "✦",
  },
  {
    title: "Profesyonel Montaj",
    category: "Montaj",
    material: "Kontrollü uygulama",
    priceText: "Teklif alınız",
    description:
      "Koltuk formunu bozmadan, airbag ve emniyet detaylarına dikkat edilerek yapılan temiz, kontrollü ve özenli montaj.",
    icon: "◆",
  },
  {
    title: "Koltuk Döşeme Yenileme",
    category: "Döşeme",
    material: "Deri / Kumaş",
    priceText: "Teklif alınız",
    description:
      "Yıpranmış, solmuş veya eskimiş koltuklar için deri, kumaş ve kombin malzeme seçenekleriyle yenileme hizmeti.",
    icon: "◈",
  },
  {
    title: "Ticari Araç Çözümleri",
    category: "Filo",
    material: "Dayanıklı kullanım",
    priceText: "Teklif alınız",
    description:
      "Taksi, servis, filo ve hafif ticari araçlar için uzun ömürlü, kolay temizlenebilir ve yoğun kullanıma uygun çözümler.",
    icon: "⬢",
  },
];

const fallbackGallery = [
  { title: "Premium deri görünüm", tag: "Premium", imageUrl: "" },
  { title: "Spor dikiş detayları", tag: "Detay", imageUrl: "" },
  { title: "Kumaş + deri kombin", tag: "Kombin", imageUrl: "" },
  { title: "Filo tipi dayanıklı kullanım", tag: "Filo", imageUrl: "" },
  { title: "Araç içi yenileme", tag: "Yenileme", imageUrl: "" },
  { title: "Özel renk uygulamaları", tag: "Tasarım", imageUrl: "" },
];

const categories = [
  "Binek Araç",
  "SUV",
  "Hafif Ticari",
  "Taksi",
  "Servis Aracı",
  "Filo Araçları",
];

const steps = [
  "Araç marka, model ve yıl bilgisi alınır.",
  "Kullanım amacı ve malzeme beklentisi netleştirilir.",
  "Renk, dikiş ve tasarım seçenekleri belirlenir.",
  "Üretim ve profesyonel montaj süreci tamamlanır.",
];

const advantages = [
  "Model uyumlu ölçü mantığı",
  "Koltuğa oturan temiz görünüm",
  "Yoğun kullanıma uygun malzeme",
  "Kurumsal araçlar için filo çözümü",
  "WhatsApp üzerinden hızlı teklif",
  "Panelden yönetilebilir içerik altyapısı",
];

const adminFeatures = [
  "Ürün ve hizmet kartları yönetimi",
  "Galeri ve portfolyo görsel yönetimi",
  "Müşteri taleplerini takip etme",
  "Telefon, WhatsApp, adres ve site metinlerini düzenleme",
];

const faqs = [
  {
    q: "Kılıflar araca özel mi hazırlanıyor?",
    a: "Evet. AKC Oto Kılıf tarafında hedef, universal kılıf gibi bol duran bir görüntü değil; koltuğa oturan, temiz ve profesyonel duran bir sonuçtur.",
  },
  {
    q: "Airbag uyumu önemli mi?",
    a: "Evet, çok önemli. Koltuk güvenlik yapısı dikkate alınmadan yapılan uygulamalar doğru değildir. Montaj ve dikim planı bu hassasiyetle yapılmalıdır.",
  },
  {
    q: "Ticari araçlara uygun üretim var mı?",
    a: "Evet. Taksi, servis, filo ve hafif ticari araçlarda dayanıklı, kolay temizlenebilir ve yoğun kullanıma uygun malzemeler tercih edilir.",
  },
  {
    q: "Teklif almak için hangi bilgiler gerekir?",
    a: "Araç marka, model, yıl, koltuk tipi ve istenen malzeme tarzı yeterlidir. Fotoğraf gönderilirse daha net değerlendirme yapılabilir.",
  },
];

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}
function formatPrice(value, currency = "TRY") {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
}

function getProductPricing(product) {
  const currency = product?.currency || "TRY";
  const note = String(product?.priceText || "").trim();

  if (product?.showPrice === false) {
    return {
      oldText: "",
      finalText: note || "Teklif alınız",
      note: "",
    };
  }

  const normalPrice = formatPrice(product?.priceAmount, currency);
  const discountPrice = formatPrice(product?.discountPriceAmount, currency);

  if (discountPrice) {
    return {
      oldText: normalPrice,
      finalText: discountPrice,
      note: note && note !== "Teklif alınız" ? note : "",
    };
  }

  if (normalPrice) {
    return {
      oldText: "",
      finalText: normalPrice,
      note: note && note !== "Teklif alınız" ? note : "",
    };
  }

  return {
    oldText: "",
    finalText: note || "Teklif alınız",
    note: "",
  };
}
export default function Home() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...fallbackSettings, ...snapshot.data() });
      }
    });

    const productQuery = query(
      collection(db, "products"),
      orderBy("sortOrder", "asc"),
      limit(100)
    );

    const galleryQuery = query(
      collection(db, "gallery"),
      orderBy("sortOrder", "asc"),
      limit(100)
    );

    const unsubProducts = onSnapshot(productQuery, (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.isActive !== false);

      setProducts(data);
    });

    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.isActive !== false);

      setGalleryItems(data);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubGallery();
    };
  }, []);

  const phoneDisplay = settings.phone || fallbackSettings.phone;
  const phoneHref = `tel:+${onlyDigits(phoneDisplay)}`;
  const whatsappNumber = onlyDigits(settings.whatsapp || settings.phone);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20arac%C4%B1m%20i%C3%A7in%20teklif%20almak%20istiyorum.`;
  const emailHref = `mailto:${settings.email || fallbackSettings.email}`;

  const serviceItems = useMemo(
    () => (products.length ? products : fallbackServices),
    [products]
  );

  const galleryData = useMemo(
    () => (galleryItems.length ? galleryItems : fallbackGallery),
    [galleryItems]
  );

  return (
    <main className="site-shell">
      <nav className="navbar">
        <a className="brand" href="#top" aria-label="AKC Oto Kılıf Ana Sayfa">
          <span className="brand-mark">AKC</span>
          <span>
            <strong>{settings.businessName || "AKC Oto Kılıf"}</strong>
            <small>Özel dikim • Döşeme • Profesyonel montaj</small>
          </span>
        </a>

        <div className="nav-links" aria-label="Sayfa menüsü">
          <a href="#hizmetler">Hizmetler</a>
          <a href="#surec">Süreç</a>
          <a href="#galeri">Galeri</a>
          <a href="#kurumsal">Kurumsal</a>
          <a href="#iletisim">İletişim</a>
          <a href="/login">Giriş</a>
          <a href="/register">Üye Ol</a>
        </div>

        <a className="nav-cta" href={phoneHref}>
          Hemen Ara
        </a>
      </nav>

      <section id="top" className="hero">
        <div className="hero-content">
          <p className="eyebrow">Araç iç mekânında net işçilik, premium duruş</p>

          <h1>
            {settings.heroTitle || fallbackSettings.heroTitle}
            <span>AKC standardı.</span>
          </h1>

          <p className="hero-text">
            {settings.heroSubtitle || fallbackSettings.heroSubtitle}
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

            <a className="secondary-btn" href="#hizmetler">
              Hizmetleri İncele
            </a>

            <a className="secondary-btn" href="/register">
              Üye Ol
            </a>
          </div>

          <div className="hero-stats" aria-label="AKC öne çıkan özellikler">
            <div>
              <strong>Özel</strong>
              <span>Model uyumlu üretim</span>
            </div>
            <div>
              <strong>Temiz</strong>
              <span>Profesyonel montaj</span>
            </div>
            <div>
              <strong>Güçlü</strong>
              <span>Dayanıklı malzeme</span>
            </div>
          </div>
        </div>

        <div
          className={`hero-card ${settings.heroImageUrl ? "hero-card-photo" : ""}`}
          aria-label="AKC Oto Kılıf hizmet kartı"
        >
          <div className="card-glow" />

          {settings.heroImageUrl ? (
            <img
              className="hero-photo"
              src={settings.heroImageUrl}
              alt="AKC Oto Kılıf araç içi uygulama görseli"
            />
          ) : (
            <div className="mock-car">
              <div className="windshield" />
              <div className="seat seat-left" />
              <div className="seat seat-right" />
              <div className="console" />
            </div>
          )}

          <div className="quality-card">
            <span>Premium İç Mekân</span>
            <strong>Ölçülü dikim, net görünüm.</strong>
          </div>
        </div>
      </section>

      <section className="logos" aria-label="Araç grupları">
        {categories.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </section>

      <section id="hizmetler" className="section">
        <div className="section-head">
          <p className="eyebrow">Hizmetler</p>
          <h2>Her araca aynı kılıf olmaz. İşin raconu uyumdur.</h2>
          <p>
            Koltuk formu, kullanım amacı, araç tipi ve müşteri beklentisi
            farklıysa çözüm de farklı olmalı. AKC tarafında hedef; göze temiz
            gelen, elde sağlam duran ve uzun süre formunu koruyan işçiliktir.
          </p>
        </div>

        <div className="service-grid">
          {serviceItems.map((service, index) => (
            <article
              className={`service-card ${
                service.imageUrl ? "service-card-with-image" : ""
              }`}
              key={service.id || service.title}
            >
              {service.imageUrl ? (
                <div className="service-image">
                  <img src={service.imageUrl} alt={service.title} />
                </div>
              ) : (
                <span>{service.icon || String(index + 1).padStart(2, "0")}</span>
              )}

              <small className="service-meta">
                {service.category || "AKC"} • {service.material || "Özel üretim"}
              </small>

              <h3>{service.title}</h3>

              <p>{service.description || service.text}</p>

           {(() => {
  const price = getProductPricing(service);

  return (
    <div className="service-price-box">
      <span className="price-label">
       {price.hasRealPrice ? "Fiyat" : "Fiyat"}
      </span>

      <div className="price-line">
        {price.oldText ? <del>{price.oldText}</del> : null}

        <strong className="service-price">{price.finalText}</strong>
      </div>

      {price.note ? <small>{price.note}</small> : null}
    </div>
  );
})()}
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">Malzeme ve görünüm</p>
          <h2>Gündelik kullanıma dayanır, aracın havasını değiştirir.</h2>
          <p>
            Oto kılıfta kalite sadece ilk bakışta değil, kullanım sürecinde
            anlaşılır. Bu yüzden malzeme seçimi, dikiş dili ve montaj temizliği
            aynı standartta ilerlemelidir.
          </p>
        </div>

        <div className="feature-list">
          {advantages.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section id="surec" className="section process-section">
        <div className="section-head">
          <p className="eyebrow">Süreç</p>
          <h2>Tekliften montaja kadar net ilerleyen iş akışı.</h2>
          <p>
            Müşterinin kafasında soru kalmaması için süreç baştan sade ve net
            ilerler. Araç bilgisi alınır, beklenti anlaşılır, doğru malzeme
            seçilir ve uygulama planlanır.
          </p>
        </div>

        <div className="timeline">
          {steps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="galeri" className="section gallery-section">
        <div className="section-head">
          <p className="eyebrow">Galeri</p>
          <h2>Panelden yüklenen işler burada kurumsal vitrine dönüşür.</h2>
          <p>
            Admin panelden galeri görseli yükledikçe bu alan gerçek montaj,
            detay dikiş, koltuk yakın plan ve araç iç mekân çekimleriyle
            otomatik güncellenir.
          </p>
        </div>

        <div className="gallery-grid">
          {galleryData.map((item, index) => (
            <div
              className={`gallery-card ${item.imageUrl ? "gallery-card-image" : ""}`}
              key={item.id || item.title}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} />
              ) : null}

              <div className="gallery-card-content">
                <span>{item.tag || `0${index + 1}`}</span>
                <strong>{item.title}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="kurumsal" className="quote-section">
        <div>
          <p className="eyebrow">Kurumsal yapı</p>
          <h2>Site sadece vitrin değil, yönetilebilir bir iş altyapısıdır.</h2>
        </div>

        <div>
          <p>
            AKC Oto Kılıf web sitesi; müşteri tarafında güven veren kurumsal
            vitrin, işletme tarafında ise admin panel ile yönetilebilir dijital
            operasyon mantığıyla hazırlanmıştır.
          </p>

          <div className="hero-actions">
            <a className="primary-btn" href="/admin">
              Admin Panel
            </a>

            <a className="secondary-btn" href="/login">
              Giriş Yap
            </a>

            <a className="secondary-btn" href="/register">
              Üye Ol
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Yönetim paneli</p>
          <h2>İşletme büyüdükçe site de seninle birlikte büyür.</h2>
          <p>
            Admin tarafı; içeriklerin, taleplerin, vitrin görsellerinin ve
            iletişim bilgilerinin tek merkezden yönetilmesi için kurgulanmıştır.
          </p>
        </div>

        <div className="service-grid">
          {adminFeatures.map((item, index) => (
            <article className="service-card" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                AKC panel altyapısı bu alanı yönetilebilir hale getirmek için
                hazırlandı. Ürün, galeri, müşteri ve site ayarları panelden
                güncellenebilir.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div>
          <p className="eyebrow">AKC standardı</p>
          <h2>“Kılıf takıldı” değil, “araç yenilendi” dedirten işçilik.</h2>
        </div>

        <p>
          Oto kılıfta farkı çoğu zaman küçük detaylar belirler: dikiş çizgisi,
          köşe dönüşü, koltuğa oturuş, malzeme hissi ve montaj temizliği.
          Görünmeyen emek, görünen kaliteyi oluşturur.
        </p>
      </section>

      <section className="section faq-section">
        <div className="section-head">
          <p className="eyebrow">Sık sorulanlar</p>
          <h2>Müşterinin aklındaki ilk sorulara net cevap.</h2>
          <p>
            Karar vermeden önce en çok sorulan konular burada. Detaylı bilgi
            için WhatsApp üzerinden araç bilgisi göndererek hızlı teklif
            alınabilir.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="iletisim" className="contact-section">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2>Aracınız için hızlı teklif alın.</h2>
          <p>
            Marka, model, yıl ve istediğiniz malzeme tarzını gönderin. Fotoğraf
            varsa ekleyin; size en uygun çözüm ve fiyat için dönüş yapılsın.
          </p>
        </div>

        <div className="contact-card">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp: {phoneDisplay}
          </a>

          <a href={phoneHref}>Telefon: {phoneDisplay}</a>

          <a href={emailHref}>{settings.email || fallbackSettings.email}</a>

          <a href="/login">Giriş Yap</a>

          <p>
            {settings.address || fallbackSettings.address}
            <br />
            {settings.workingHours || fallbackSettings.workingHours}
          </p>
        </div>
      </section>

      <footer className="footer">
        <strong>{settings.businessName || "AKC Oto Kılıf"}</strong>
        <span>© 2026 • Aracınıza özel kılıf ve döşeme çözümleri</span>
      </footer>
    </main>
  );
}