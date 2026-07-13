"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthNavMenu from "@/components/AuthNavMenu";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SiteFooter from "@/components/SiteFooter";
const fallbackSettings = {
  businessName: "AKC Oto Kılıf",
  brandSubtitle: "Özel dikim • Döşeme • Profesyonel montaj",

  heroEyebrow: "Araç iç mekânında premium işçilik",
  heroTitle: "Aracınıza özel oto kılıf ve döşeme çözümleri.",
  heroHighlight: "AKC standardı.",
  heroSubtitle:
    "AKC Oto Kılıf; binek, SUV, hafif ticari, taksi, servis ve filo araçları için ölçülü, dayanıklı, şık ve profesyonel montajlı oto kılıf hizmeti sunar.",

  qualityLabel: "Premium İç Mekân",
  qualityText: "Ölçülü dikim, net görünüm.",

  phone: "+90 500 000 00 00",
  whatsapp: "905000000000",
  email: "info@akcotokilif.com",
  address: "Adres bilgisi eklenecek",
  instagram: "",
  workingHours: "Hafta içi / Cumartesi",
  googleMapsUrl: "",

  brandLogoUrl: "",
  heroImageUrl: "",
  showcaseImageUrl: "",

  headerBannerText: "Profesyonel montaj, ölçülü kılıf, güçlü duruş.",

  materialEyebrow: "Malzeme ve görünüm",
  materialTitle: "Gündelik kullanıma dayanır, aracın havasını değiştirir.",
  materialText:
    "Oto kılıfta kalite sadece ilk bakışta değil, kullanım sürecinde anlaşılır. Bu yüzden malzeme seçimi, dikiş dili ve montaj temizliği aynı standartta ilerlemelidir.",

  processEyebrow: "Süreç",
  processTitle: "Tekliften montaja kadar net ilerleyen iş akışı.",
  processText:
    "Müşterinin kafasında soru kalmaması için süreç baştan sade ve net ilerler. Araç bilgisi alınır, beklenti anlaşılır, doğru malzeme seçilir ve uygulama planlanır.",

  galleryEyebrow: "Galeri",
  galleryTitle: "Panelden yüklenen işler burada kurumsal vitrine dönüşür.",
  galleryText:
    "Gerçek montaj, detay dikiş, koltuk yakın plan ve araç iç mekân çekimleriyle güven veren bir vitrin oluşturulur.",

  corporateEyebrow: "Kurumsal yapı",
  corporateTitle: "Site sadece vitrin değil, yönetilebilir bir iş altyapısıdır.",
  corporateText:
    "AKC Oto Kılıf web sitesi; müşteri tarafında güven veren kurumsal vitrin, işletme tarafında ise admin panel ile yönetilebilir dijital operasyon mantığıyla hazırlanmıştır.",

  quoteEyebrow: "AKC standardı",
  quoteTitle: "“Kılıf takıldı” değil, “araç yenilendi” dedirten işçilik.",
  quoteText:
    "Oto kılıfta farkı çoğu zaman küçük detaylar belirler: dikiş çizgisi, köşe dönüşü, koltuğa oturuş, malzeme hissi ve montaj temizliği.",

  faqEyebrow: "Sık sorulanlar",
  faqTitle: "Müşterinin aklındaki ilk sorulara net cevap.",
  faqText:
    "Karar vermeden önce en çok sorulan konular burada. Detaylı bilgi için WhatsApp üzerinden araç bilgisi göndererek hızlı teklif alınabilir.",

  contactEyebrow: "İletişim",
  contactTitle: "Aracınız için hızlı teklif alın.",
  contactText:
    "Marka, model, yıl ve istediğiniz malzeme tarzını gönderin. Fotoğraf varsa ekleyin; size en uygun çözüm ve fiyat için dönüş yapılsın.",

  footerTitle: "AKC Oto Kılıf",
  footerDescription:
    "Araç iç mekânında premium kalite, müşteri deneyiminde güven veren yaklaşım.",
  footerCopy: "© 2026 AKC Oto Kılıf. Tüm hakları saklıdır.",

  vehicleGroups: [
    "Binek Araç",
    "SUV",
    "Hafif Ticari",
    "Taksi",
    "Servis Aracı",
    "Filo Araçları",
  ],

  advantages: [
    "Model uyumlu ölçü mantığı",
    "Koltuğa oturan temiz görünüm",
    "Yoğun kullanıma uygun malzeme",
    "Kurumsal araçlar için filo çözümü",
    "WhatsApp üzerinden hızlı teklif",
    "Panelden yönetilebilir içerik altyapısı",
  ],

  processSteps: [
    "Araç marka, model ve yıl bilgisi alınır.",
    "Kullanım amacı ve malzeme beklentisi netleştirilir.",
    "Renk, dikiş ve tasarım seçenekleri belirlenir.",
    "Üretim ve profesyonel montaj süreci tamamlanır.",
  ],

  faqs: [
    {
      q: "Kılıflar araca özel mi hazırlanıyor?",
      a: "Evet. Hedef, universal kılıf gibi bol duran bir görüntü değil; koltuğa oturan, temiz ve profesyonel duran bir sonuçtur.",
    },
    {
      q: "Airbag uyumu önemli mi?",
      a: "Evet, çok önemli. Koltuk güvenlik yapısı dikkate alınarak uygulama yapılmalıdır.",
    },
    {
      q: "Ticari araçlara uygun üretim var mı?",
      a: "Evet. Taksi, servis, filo ve hafif ticari araçlar için yoğun kullanıma uygun çözümler hazırlanır.",
    },
    {
      q: "Teklif almak için hangi bilgiler gerekir?",
      a: "Araç marka, model, yıl, koltuk tipi ve istenen malzeme tarzı yeterlidir. Fotoğraf gönderilirse daha net değerlendirme yapılabilir.",
    },
  ],
};

const fallbackGallery = [
  { title: "Premium deri görünüm", tag: "Premium", imageUrl: "" },
  { title: "Spor dikiş detayları", tag: "Detay", imageUrl: "" },
  { title: "Kumaş + deri kombin", tag: "Kombin", imageUrl: "" },
  { title: "Filo tipi dayanıklı kullanım", tag: "Filo", imageUrl: "" },
  { title: "Araç içi yenileme", tag: "Yenileme", imageUrl: "" },
  { title: "Özel renk uygulamaları", tag: "Tasarım", imageUrl: "" },
];

const adminFeatures = [
  "Ürün ve hizmet kartları yönetimi",
  "Galeri ve portfolyo görsel yönetimi",
  "Müşteri taleplerini takip etme",
  "Telefon, WhatsApp, adres ve site metinlerini düzenleme",
];

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function safeArray(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback;
}

export default function Home() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [galleryItems, setGalleryItems] = useState([]);

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    message: "",
  });

  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState("");

  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings({ ...fallbackSettings, ...snapshot.data() });
        }
      },
      () => setSettings(fallbackSettings)
    );

    const galleryQuery = query(
      collection(db, "gallery"),
      orderBy("sortOrder", "asc"),
      limit(100)
    );

    const unsubGallery = onSnapshot(
      galleryQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((item) => item.isActive !== false);

        setGalleryItems(data);
      },
      () => setGalleryItems([])
    );

    return () => {
      unsubSettings();
      unsubGallery();
    };
  }, []);

  const phoneDisplay = settings.phone || fallbackSettings.phone;
  const phoneHref = `tel:+${onlyDigits(phoneDisplay)}`;
  const whatsappNumber = onlyDigits(settings.whatsapp || settings.phone);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20arac%C4%B1m%20i%C3%A7in%20teklif%20almak%20istiyorum.`;
  const emailHref = `mailto:${settings.email || fallbackSettings.email}`;

  const vehicleGroups = useMemo(
    () => safeArray(settings.vehicleGroups, fallbackSettings.vehicleGroups),
    [settings.vehicleGroups]
  );

  const advantages = useMemo(
    () => safeArray(settings.advantages, fallbackSettings.advantages),
    [settings.advantages]
  );

  const processSteps = useMemo(
    () => safeArray(settings.processSteps, fallbackSettings.processSteps),
    [settings.processSteps]
  );

  const faqData = useMemo(
    () => safeArray(settings.faqs, fallbackSettings.faqs),
    [settings.faqs]
  );

  const galleryData = useMemo(
    () => (galleryItems.length ? galleryItems : fallbackGallery),
    [galleryItems]
  );

  async function handleLeadSubmit(event) {
    event.preventDefault();

    const cleanName = leadForm.name.trim();
    const cleanPhone = leadForm.phone.trim();
    const cleanEmail = normalizeEmail(leadForm.email);
    const cleanVehicle = leadForm.vehicle.trim();
    const cleanMessage = leadForm.message.trim();

    if (!cleanName || !cleanPhone || !cleanMessage) {
      setLeadFeedback("Ad soyad, telefon ve mesaj alanları zorunludur.");
      return;
    }

    setLeadSubmitting(true);
    setLeadFeedback("");

    try {
      await addDoc(collection(db, "leads"), {
        name: cleanName,
        phone: cleanPhone,
        phoneDigits: onlyDigits(cleanPhone),
        email: cleanEmail,
        vehicle: cleanVehicle,
        message: cleanMessage,
        userId: auth.currentUser?.uid || "",
        source: "homepage_contact_form",
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLeadFeedback("Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.");
      setLeadForm({ name: "", phone: "", email: "", vehicle: "", message: "" });
    } catch (error) {
      setLeadFeedback(error?.message || "Talep gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <nav className="navbar">
        <a className="brand" href="#top" aria-label="AKC Oto Kılıf Ana Sayfa">
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
        </a>

        <div className="nav-links" aria-label="Sayfa menüsü">
          <Link href="/urunler">Ürünler</Link>
          <Link href="#surec">Süreç</Link>
          <Link href="#galeri">Galeri</Link>
          <Link href="#kurumsal">Kurumsal</Link>
          <Link href="#iletisim">İletişim</Link>
        </div>

        <div className="nav-actions">
          <AuthNavMenu />
          <a className="nav-cta" href={phoneHref}>
            Hemen Ara
          </a>
        </div>
      </nav>

      <section className="home-premium-banner">
        <div>
          <span>AKC Oto Kılıf</span>
          <strong>{settings.headerBannerText || fallbackSettings.headerBannerText}</strong>
          <p>Hızlı teklif, temiz montaj ve araca özel premium görünüm.</p>
        </div>

        <div className="header-banner-actions">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="primary-btn">
            WhatsApp ile Teklif Al
          </a>
          <a href={phoneHref} className="secondary-btn">
            Bizi Ara
          </a>
        </div>
      </section>

      {settings.showcaseImageUrl ? (
        <section className="showcase-panel showcase-panel-premium">
          <img src={settings.showcaseImageUrl} alt="AKC Oto Kılıf vitrin görseli" />
          <div>
            <p className="eyebrow">Premium vitrin</p>
            <h3>İşçilik, malzeme ve detayların birleştiği güçlü bir görünüm.</h3>
            <p>
              Gerçek uygulama görselleri, müşterinin güvenini artıran en güçlü
              alanlardan biridir. Bu bölüm panelden yönetilir.
            </p>
          </div>
        </section>
      ) : null}

      <section id="top" className="hero hero-premium">
        <div className="hero-content">
          <p className="eyebrow">{settings.heroEyebrow || fallbackSettings.heroEyebrow}</p>

          <h1>
            {settings.heroTitle || fallbackSettings.heroTitle}
            <span>{settings.heroHighlight || fallbackSettings.heroHighlight}</span>
          </h1>

          <p className="hero-text">
            {settings.heroSubtitle || fallbackSettings.heroSubtitle}
          </p>

          <div className="hero-actions">
            <a className="primary-btn" href={whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp Teklif Al
            </a>

            <Link className="secondary-btn" href="/urunler">
              Ürünleri İncele
            </Link>

            <Link className="secondary-btn" href="/register">
              Üye Ol
            </Link>
          </div>

          <div className="hero-trust-row">
            <span>✓ Ölçülü uygulama</span>
            <span>✓ Profesyonel montaj</span>
            <span>✓ Kurumsal takip</span>
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

        <div className={`hero-card ${settings.heroImageUrl ? "hero-card-photo" : ""}`}>
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
            <span>{settings.qualityLabel || fallbackSettings.qualityLabel}</span>
            <strong>{settings.qualityText || fallbackSettings.qualityText}</strong>
          </div>
        </div>
      </section>

      <section className="logos" aria-label="Araç grupları">
        {vehicleGroups.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </section>

      <section id="hizmetler" className="section">
        <div className="modern-cta-card modern-cta-card-premium">
          <div className="modern-cta-copy">
            <p className="eyebrow">Yeni ürün kataloğu</p>
            <h2>Ürünler ayrı sayfada, daha modern ve hızlı erişilebilir.</h2>
            <p>
              Kılıf, döşeme ve premium detay seçeneklerini ayrı katalogda keşfedin.
              Fiyat bilgisi, ürün görseli ve WhatsApp sipariş butonu ile hızlı
              iletişime geçin.
            </p>
          </div>

          <div className="modern-cta-actions">
            <Link className="primary-btn" href="/urunler">
              Tüm Ürünleri Gör
            </Link>
            <a className="secondary-btn" href={whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp ile Teklif Al
            </a>
          </div>
        </div>
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">{settings.materialEyebrow}</p>
          <h2>{settings.materialTitle}</h2>
          <p>{settings.materialText}</p>
        </div>

        <div className="feature-list">
          {advantages.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section id="surec" className="section process-section">
        <div className="section-head">
          <p className="eyebrow">{settings.processEyebrow}</p>
          <h2>{settings.processTitle}</h2>
          <p>{settings.processText}</p>
        </div>

        <div className="timeline">
          {processSteps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="galeri" className="section gallery-section">
        <div className="section-head">
          <p className="eyebrow">{settings.galleryEyebrow}</p>
          <h2>{settings.galleryTitle}</h2>
          <p>{settings.galleryText}</p>
        </div>

        <div className="gallery-grid">
          {galleryData.map((item, index) => (
            <div
              className={`gallery-card ${item.imageUrl ? "gallery-card-image" : ""}`}
              key={item.id || item.title}
            >
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : null}

              <div className="gallery-card-content">
                <span>{item.tag || `0${index + 1}`}</span>
                <strong>{item.title}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="kurumsal" className="quote-section quote-section-premium">
        <div>
          <p className="eyebrow">{settings.corporateEyebrow}</p>
          <h2>{settings.corporateTitle}</h2>
        </div>

        <div>
          <p>{settings.corporateText}</p>

          <div className="hero-actions">
            <Link className="primary-btn" href="/admin">
              Admin Panel
            </Link>

            <Link className="secondary-btn" href="/login">
              Giriş Yap
            </Link>

            <Link className="secondary-btn" href="/register">
              Üye Ol
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Yönetim paneli</p>
          <h2>İşletme büyüdükçe site de seninle birlikte büyür.</h2>
          <p>
            Admin tarafı; içeriklerin, taleplerin, vitrin görsellerinin ve iletişim
            bilgilerinin tek merkezden yönetilmesi için kurgulanmıştır.
          </p>
        </div>

        <div className="service-grid">
          {adminFeatures.map((item, index) => (
            <article className="service-card" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                Ürün, galeri, müşteri talepleri ve site ayarları panelden
                güncellenebilir.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div>
          <p className="eyebrow">{settings.quoteEyebrow}</p>
          <h2>{settings.quoteTitle}</h2>
        </div>

        <p>{settings.quoteText}</p>
      </section>

      <section className="section faq-section">
        <div className="section-head">
          <p className="eyebrow">{settings.faqEyebrow}</p>
          <h2>{settings.faqTitle}</h2>
          <p>{settings.faqText}</p>
        </div>

        <div className="faq-grid">
          {faqData.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="iletisim" className="contact-section">
        <div>
          <p className="eyebrow">{settings.contactEyebrow}</p>
          <h2>{settings.contactTitle}</h2>
          <p>{settings.contactText}</p>
        </div>

        <div className="contact-card contact-card--stacked">
          <form className="lead-form" onSubmit={handleLeadSubmit}>
            <label>
              <span>Ad Soyad</span>
              <input
                value={leadForm.name}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Adınız Soyadınız"
                required
              />
            </label>

            <label>
              <span>Telefon</span>
              <input
                value={leadForm.phone}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="05xx xxx xx xx"
                required
              />
            </label>

            <label>
              <span>E-posta</span>
              <input
                value={leadForm.email}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, email: event.target.value }))
                }
                type="email"
                placeholder="ornek@mail.com"
              />
            </label>

            <label>
              <span>Araç</span>
              <input
                value={leadForm.vehicle}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, vehicle: event.target.value }))
                }
                placeholder="Marka / model / yıl"
              />
            </label>

            <label>
              <span>Mesaj</span>
              <textarea
                value={leadForm.message}
                onChange={(event) =>
                  setLeadForm((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="İstenen malzeme, renk, tarih veya detay"
                rows={4}
                required
              />
            </label>

            <button className="primary-btn" type="submit" disabled={leadSubmitting}>
              {leadSubmitting ? "Gönderiliyor..." : "Teklif İste"}
            </button>

            {leadFeedback ? <p className="lead-feedback">{leadFeedback}</p> : null}
          </form>

          <div className="contact-links">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp: {phoneDisplay}
            </a>

            <a href={phoneHref}>Telefon: {phoneDisplay}</a>
            <a href={emailHref}>{settings.email || fallbackSettings.email}</a>

            {settings.googleMapsUrl ? (
              <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer">
                Haritaya bak
              </a>
            ) : null}

            <Link href="/login">Giriş Yap</Link>

            <p>
              {settings.address || fallbackSettings.address}
              <br />
              {settings.workingHours || fallbackSettings.workingHours}
            </p>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}