"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import SeoStructuredData from "@/components/SeoStructuredData";
import Icon from "@/components/Icon";
import { trackEvent } from "@/lib/analytics";
import { SERVICE_PAGES } from "@/lib/seo";
import { getContact, onlyDigits, SITE_FALLBACK } from "@/lib/site-config";
import { useSiteSettings } from "@/lib/use-site-settings";

const FALLBACK_GALLERY = [
  { title: "Siyah ve konyak deri kombinasyon", tag: "Binek", imageUrl: "/images/hero-premium-seat-covers.jpg" },
  { title: "Kontrast dikiş detayı", tag: "Detay", imageUrl: "/images/seat-stitch-detail.jpg" },
  { title: "Gri ve grafit SUV uygulaması", tag: "SUV", imageUrl: "/images/suv-seat-cover-installation.jpg" },
];

const KEY_FACTS = [
  { icon: "ruler", title: "Model uyumlu ölçü", text: "Marka, model ve yıla göre kesim" },
  { icon: "shield", title: "Airbag uyumlu", text: "Güvenlik donanımına uygun dikim" },
  { icon: "wrench", title: "Atölyede montaj", text: "Karatay'da randevulu uygulama" },
  { icon: "truck", title: "Filo çözümleri", text: "Taksi, servis ve ticari araçlar" },
];

const PROMISES = [
  { title: "Araç uyumu kontrolü", text: "Marka, model, yıl ve koltuk yapısı uygulamadan önce netleştirilir." },
  { title: "Şeffaf teklif", text: "Malzeme, kapsam, süre ve fiyat işe başlamadan yazılı olarak paylaşılır." },
  { title: "Temiz montaj", text: "Koltuk formunu koruyan, gergin ve düzgün bir bitiş hedeflenir." },
  { title: "Satış sonrası destek", text: "Uygulama sonrası kullanım ve bakım konusunda destek verilir." },
];

const EMPTY_FORM = { name: "", phone: "", email: "", vehicle: "", message: "", privacyConsent: false };

function listOr(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback;
}

export default function Home() {
  const settings = useSiteSettings();
  const contact = getContact(settings);
  const [galleryItems, setGalleryItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    const galleryQuery = query(collection(db, "gallery"), orderBy("sortOrder", "asc"), limit(60));
    return onSnapshot(
      galleryQuery,
      (snapshot) =>
        setGalleryItems(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.isActive !== false)
        ),
      () => setGalleryItems([])
    );
  }, []);

  const vehicleGroups = listOr(settings.vehicleGroups, SITE_FALLBACK.vehicleGroups);
  const advantages = listOr(settings.advantages, SITE_FALLBACK.advantages);
  const processSteps = listOr(settings.processSteps, SITE_FALLBACK.processSteps);
  const faqs = listOr(settings.faqs, SITE_FALLBACK.faqs).filter((item) => item?.q && item?.a);

  const gallery = useMemo(() => {
    const uploaded = galleryItems.filter(
      (item) => item.imageUrl && !/logo/i.test(`${item.title || ""} ${item.imageUrl}`)
    );
    const seen = new Set();
    return [...uploaded, ...FALLBACK_GALLERY]
      .filter((item) => (seen.has(item.imageUrl) ? false : seen.add(item.imageUrl)))
      .slice(0, 6);
  }, [galleryItems]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status.state === "sending") return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      vehicle: form.vehicle.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.phone || !payload.message) {
      setStatus({ state: "error", message: "Ad soyad, telefon ve mesaj alanları zorunludur." });
      return;
    }
    if (onlyDigits(payload.phone).length < 10) {
      setStatus({ state: "error", message: "Lütfen geçerli bir telefon numarası girin." });
      return;
    }
    if (!form.privacyConsent) {
      setStatus({ state: "error", message: "Devam etmek için KVKK aydınlatma metnini onaylayın." });
      return;
    }

    setStatus({ state: "sending", message: "" });

    try {
      await addDoc(collection(db, "leads"), {
        ...payload,
        phoneDigits: onlyDigits(payload.phone),
        userId: auth.currentUser?.uid || "",
        source: "homepage_contact_form",
        status: "new",
        privacyConsent: true,
        privacyConsentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      trackEvent("generate_lead", {
        contact_method: "contact_form",
        vehicle_provided: Boolean(payload.vehicle),
        page_path: "/",
      });
      setForm(EMPTY_FORM);
      setStatus({ state: "success", message: "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz." });
    } catch {
      setStatus({
        state: "error",
        message: "Talep şu anda gönderilemedi. Lütfen telefon veya WhatsApp üzerinden bize ulaşın.",
      });
    }
  }

  return (
    <>
      <SiteHeader />
      <SeoStructuredData settings={settings} faqs={faqs} />
      <FloatingContactButtons />

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{settings.heroEyebrow}</p>
              <h1>{settings.heroTitle}</h1>
              <p className="lead">{settings.heroSubtitle}</p>
              <div className="actions">
                <Link className="btn btn-primary btn-lg" href="#iletisim">
                  Teklif Alın <Icon name="arrow" size={18} />
                </Link>
                <a className="btn btn-outline btn-lg" href={contact.whatsappHref()} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                </a>
              </div>
              <a className="hero-phone" href={contact.phoneHref}>
                <span>Hemen arayın</span>
                <strong>{contact.phoneDisplay}</strong>
              </a>
            </div>

            <div className="hero-media">
              <img src={settings.heroImageUrl} alt="AKC Oto Kılıf araca özel deri koltuk kılıfı uygulaması" />
            </div>
          </div>

          <div className="container">
            <ul className="facts">
              {KEY_FACTS.map((item) => (
                <li key={item.title}>
                  <span className="facts-icon">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ARAÇ GRUPLARI */}
        <section className="band" aria-label="Hizmet verilen araç grupları">
          <div className="container band-inner">
            <span className="band-label">Hizmet verdiğimiz araçlar</span>
            <ul className="band-list">
              {vehicleGroups.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* HİZMETLER */}
        <section id="hizmetler" className="section">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">{settings.servicesEyebrow}</p>
              <h2>{settings.servicesTitle}</h2>
              <p>{settings.servicesText}</p>
            </header>

            <div className="service-grid">
              {SERVICE_PAGES.map((service) => (
                <Link className="service-card" key={service.slug} href={`/hizmetler/${service.slug}`}>
                  <div className="service-card-media">
                    <img src={service.image} alt="" loading="lazy" />
                  </div>
                  <div className="service-card-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <span className="link-arrow">
                      Detaylı bilgi <Icon name="arrow" size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* NEDEN AKC */}
        <section className="section section-alt">
          <div className="container split">
            <div className="split-media">
              <img src={settings.showcaseImageUrl} alt="SUV araçta oto kılıf montajı" loading="lazy" />
            </div>
            <div className="split-copy">
              <p className="eyebrow">{settings.materialEyebrow}</p>
              <h2>{settings.materialTitle}</h2>
              <p>{settings.materialText}</p>
              <ul className="check-list">
                {advantages.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className="btn btn-dark" href="/urunler">
                Ürünleri inceleyin <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* SÜREÇ */}
        <section id="surec" className="section">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow">{settings.processEyebrow}</p>
              <h2>{settings.processTitle}</h2>
              <p>{settings.processText}</p>
            </header>

            <ol className="steps">
              {processSteps.map((step, index) => (
                <li key={step}>
                  <span className="step-no">{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* GALERİ */}
        <section id="galeri" className="section section-alt">
          <div className="container">
            <header className="section-head section-head--row">
              <div>
                <p className="eyebrow">{settings.galleryEyebrow}</p>
                <h2>{settings.galleryTitle}</h2>
              </div>
              <p>{settings.galleryText}</p>
            </header>

            <div className="gallery-grid">
              {gallery.map((item, index) => {
                const caption = String(item.title || "").trim();
                return (
                  <figure className="gallery-item" key={item.id || item.imageUrl}>
                    <img src={item.imageUrl} alt={caption || `AKC Oto Kılıf uygulama ${index + 1}`} loading="lazy" />
                    {caption.length > 2 ? (
                      <figcaption>
                        {item.tag ? <span>{item.tag}</span> : null}
                        {caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* GÜVENCE */}
        <section id="kurumsal" className="section section-dark">
          <div className="container assurance">
            <div className="assurance-copy">
              <p className="eyebrow eyebrow--light">{settings.corporateEyebrow}</p>
              <h2>{settings.corporateTitle}</h2>
              <p>{settings.corporateText}</p>
              <a className="btn btn-primary" href={contact.whatsappHref()} target="_blank" rel="noreferrer">
                Araç bilgisi gönderin <Icon name="arrow" size={18} />
              </a>
            </div>
            <div className="assurance-grid">
              {PROMISES.map((item, index) => (
                <article key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SSS */}
        <section id="sss" className="section">
          <div className="container faq-layout">
            <header className="section-head">
              <p className="eyebrow">{settings.faqEyebrow}</p>
              <h2>{settings.faqTitle}</h2>
              <p>{settings.faqText}</p>
              <a className="link-arrow" href={contact.phoneHref}>
                <Icon name="phone" size={16} /> {contact.phoneDisplay}
              </a>
            </header>

            <div className="faq-list">
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <Icon name="plus" size={18} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* İLETİŞİM */}
        <section id="iletisim" className="section section-alt">
          <div className="container contact-layout">
            <div className="contact-info">
              <p className="eyebrow">{settings.contactEyebrow}</p>
              <h2>{settings.contactTitle}</h2>
              <p>{settings.contactText}</p>

              <ul className="contact-list">
                <li>
                  <Icon name="phone" size={20} />
                  <div>
                    <span>Telefon</span>
                    <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
                  </div>
                </li>
                <li>
                  <Icon name="whatsapp" size={20} />
                  <div>
                    <span>WhatsApp</span>
                    <a href={contact.whatsappHref()} target="_blank" rel="noreferrer">
                      Mesaj gönderin
                    </a>
                  </div>
                </li>
                <li>
                  <Icon name="mail" size={20} />
                  <div>
                    <span>E-posta</span>
                    <a href={contact.emailHref}>{contact.email}</a>
                  </div>
                </li>
                <li>
                  <Icon name="pin" size={20} />
                  <div>
                    <span>Adres</span>
                    <a href={contact.mapsUrl} target="_blank" rel="noreferrer">
                      {contact.address}
                    </a>
                  </div>
                </li>
                <li>
                  <Icon name="clock" size={20} />
                  <div>
                    <span>Çalışma saatleri</span>
                    <p>{contact.workingHours}</p>
                  </div>
                </li>
              </ul>
            </div>

            <form className="card form" onSubmit={handleSubmit} noValidate>
              <h3>Teklif formu</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Ad Soyad *</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="field">
                  <span>Telefon *</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="05xx xxx xx xx"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label className="field">
                  <span>E-posta</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label className="field">
                  <span>Araç</span>
                  <input
                    value={form.vehicle}
                    onChange={(event) => updateField("vehicle", event.target.value)}
                    placeholder="Marka / model / yıl"
                  />
                </label>
                <label className="field field--full">
                  <span>Mesajınız *</span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder="İstediğiniz malzeme, renk veya uygulama detayı"
                    required
                  />
                </label>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={form.privacyConsent}
                  onChange={(event) => updateField("privacyConsent", event.target.checked)}
                />
                <span>
                  <Link href="/kvkk" target="_blank">
                    KVKK Aydınlatma Metni
                  </Link>{" "}
                  kapsamında bilgilerimin teklif talebim için işlenmesini kabul ediyorum.
                </span>
              </label>

              <button className="btn btn-primary btn-block" type="submit" disabled={status.state === "sending"}>
                {status.state === "sending" ? "Gönderiliyor…" : "Teklif talebi gönder"}
              </button>

              {status.message ? (
                <p className={`form-status form-status--${status.state}`} role="status">
                  {status.message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
