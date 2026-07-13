"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { settingsLabels } from "./admin.constants";

const sectionGroups = [
  {
    id: "brand",
    title: "Marka ve Hero Alanı",
    description:
      "Sitenin ilk izlenimini oluşturan logo, ana başlık, açıklama ve vitrin görselleri.",
    badge: "En önemli alan",
  },
  {
    id: "content",
    title: "Bölüm Başlıkları",
    description:
      "Ana sayfadaki hizmet, süreç, galeri, kurumsal yapı, SSS ve iletişim bölümlerinin metinleri.",
    badge: "İçerik",
  },
  {
    id: "lists",
    title: "Liste Alanları",
    description:
      "Araç grupları, avantajlar, süreç adımları ve sık sorulan sorular.",
    badge: "Dinamik liste",
  },
  {
    id: "contact",
    title: "İletişim Bilgileri",
    description:
      "Telefon, WhatsApp, e-posta, adres, Instagram, harita ve çalışma saatleri.",
    badge: "Müşteri dönüşümü",
  },
  {
    id: "footer",
    title: "Header ve Footer",
    description:
      "Üst duyuru şeridi, footer açıklaması ve telif hakkı alanları.",
    badge: "Kurumsal detay",
  },
];

const brandFields = [
  "businessName",
  "brandSubtitle",
  "heroEyebrow",
  "heroTitle",
  "heroHighlight",
  "qualityLabel",
  "qualityText",
];

const sectionFields = [
  "servicesEyebrow",
  "servicesTitle",
  "servicesText",
  "materialEyebrow",
  "materialTitle",
  "materialText",
  "processEyebrow",
  "processTitle",
  "processText",
  "galleryEyebrow",
  "galleryTitle",
  "galleryText",
  "corporateEyebrow",
  "corporateTitle",
  "corporateText",
  "quoteEyebrow",
  "quoteTitle",
  "quoteText",
  "faqEyebrow",
  "faqTitle",
  "faqText",
  "contactEyebrow",
  "contactTitle",
  "contactText",
];

const contactFields = [
  "phone",
  "whatsapp",
  "email",
  "address",
  "instagram",
  "googleMapsUrl",
  "workingHours",
];

const footerFields = [
  "headerBannerText",
  "footerTitle",
  "footerDescription",
  "footerCopy",
];

const longTextFields = new Set([
  "heroSubtitle",
  "servicesText",
  "materialText",
  "processText",
  "galleryText",
  "corporateText",
  "quoteText",
  "faqText",
  "contactText",
  "address",
  "footerDescription",
]);

function getFieldLabel(key) {
  return settingsLabels[key] || key;
}

function TextField({
  fieldKey,
  value,
  onChange,
  textarea = false,
  placeholder = "",
  helper = "",
}) {
  const isTextarea = textarea || longTextFields.has(fieldKey);

  return (
    <label className={isTextarea ? "admin-field admin-field--wide" : "admin-field"}>
      <span>{getFieldLabel(fieldKey)}</span>

      {isTextarea ? (
        <textarea
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={fieldKey === "heroSubtitle" ? 5 : 4}
        />
      ) : (
        <input value={value || ""} onChange={onChange} placeholder={placeholder} />
      )}

      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function MediaUploadCard({
  title,
  description,
  urlLabel,
  urlValue,
  onUrlChange,
  file,
  setFile,
  fileLabel,
  previewAlt,
}) {
  const previewUrl = file ? URL.createObjectURL(file) : urlValue || "";

  return (
    <article className="admin-media-card">
      <div className="admin-media-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={previewAlt || title} />
        ) : (
          <div className="admin-media-empty">
            <strong>Görsel yok</strong>
            <span>URL gir veya dosya seç</span>
          </div>
        )}
      </div>

      <div className="admin-media-content">
        <div className="admin-media-copy">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>

        <label className="admin-field">
          <span>{urlLabel}</span>
          <input
            value={urlValue || ""}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://..."
          />
          <small>Hazır görsel linki varsa buraya yapıştırabilirsin.</small>
        </label>

        <label className="file-input">
          <span>{fileLabel}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <em>{file?.name || "Dosya seçilmedi"}</em>
        </label>
      </div>
    </article>
  );
}

function AdminSection({ id, activeSection, setActiveSection, title, description, badge, children }) {
  const isOpen = activeSection === id;

  return (
    <section className={`admin-home-section ${isOpen ? "is-open" : ""}`}>
      <button
        className="admin-home-section-head"
        type="button"
        onClick={() => setActiveSection(isOpen ? "" : id)}
      >
        <div>
          <span>{badge}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>

        <em>{isOpen ? "Kapat" : "Düzenle"}</em>
      </button>

      {isOpen ? <div className="admin-home-section-body">{children}</div> : null}
    </section>
  );
}

function QuickStat({ label, value }) {
  return (
    <article className="admin-home-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function HomepageTab({
  settingsDraft,
  setSettingsDraft,
  saveSettings,
  saving,
  logoFile,
  setLogoFile,
  heroFile,
  setHeroFile,
  showcaseFile,
  setShowcaseFile,
}) {
  const [activeSection, setActiveSection] = useState("brand");

  const filledCount = useMemo(() => {
    return Object.entries(settingsDraft || {}).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return String(value || "").trim().length > 0;
    }).length;
  }, [settingsDraft]);

  const updateField = (key, value) => {
    setSettingsDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyStarterContent = () => {
    setSettingsDraft((current) => ({
      ...current,
      businessName: current.businessName || "AKC Oto Kılıf",
      brandSubtitle: current.brandSubtitle || "Özel dikim • Döşeme • Profesyonel montaj",
      heroEyebrow: current.heroEyebrow || "Araç iç mekânında premium işçilik",
      heroTitle: current.heroTitle || "Aracınıza özel oto kılıf ve döşeme çözümleri.",
      heroHighlight: current.heroHighlight || "AKC standardı.",
      heroSubtitle:
        current.heroSubtitle ||
        "Aracınızın modeline, kullanım amacına ve tarzına uygun ölçülü oto kılıf çözümleri. Temiz montaj, güçlü malzeme ve kurumsal hizmet anlayışı.",
      headerBannerText:
        current.headerBannerText || "Profesyonel montaj, ölçülü kılıf, güçlü duruş.",
      contactTitle: current.contactTitle || "Aracınız için hızlı teklif alın.",
      footerTitle: current.footerTitle || "AKC Oto Kılıf",
    }));
  };

  return (
    <section className="admin-panel admin-homepage-panel">
      <div className="panel-head admin-homepage-head">
        <div>
          <p className="eyebrow">Ana Sayfa Yönetimi</p>
          <h2>Site vitrininin tüm kurumsal düzeni.</h2>
          <p>
            Hero alanı, marka metinleri, görseller, iletişim bilgileri, listeler,
            SSS ve footer içerikleri bu ekrandan yönetilir.
          </p>
        </div>

        <div className="admin-home-actions">
          <button
            className="admin-secondary-btn"
            type="button"
            onClick={applyStarterContent}
          >
            Eksikleri Otomatik Tamamla
          </button>

          <button
            className="admin-primary-btn"
            type="button"
            disabled={saving}
            onClick={(event) => {
              const fakeEvent = {
                ...event,
                preventDefault: () => {},
              };
              saveSettings(fakeEvent);
            }}
          >
            {saving ? "Kaydediliyor..." : "Hızlı Kaydet"}
          </button>
        </div>
      </div>

      <div className="admin-home-stats">
        <QuickStat label="Dolu alan" value={filledCount} />
        <QuickStat label="Logo" value={settingsDraft.brandLogoUrl || logoFile ? "Hazır" : "Eksik"} />
        <QuickStat label="Hero görsel" value={settingsDraft.heroImageUrl || heroFile ? "Hazır" : "Eksik"} />
        <QuickStat label="İletişim" value={settingsDraft.phone ? "Aktif" : "Eksik"} />
      </div>

      <div className="admin-home-navigation">
        {sectionGroups.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeSection === section.id ? "active" : ""}
            onClick={() => setActiveSection(section.id)}
          >
            <span>{section.badge}</span>
            <strong>{section.title}</strong>
          </button>
        ))}
      </div>

      <form className="homepage-editor admin-home-form" onSubmit={saveSettings}>
        <AdminSection
          id="brand"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Marka ve Hero Alanı"
          description="Ana sayfanın en üst kısmındaki marka algısı, büyük başlık ve görsel vitrin."
          badge="En önemli alan"
        >
          <div className="admin-home-two-column">
            <div className="settings-form admin-form-premium">
              {brandFields.map((key) => (
                <TextField
                  key={key}
                  fieldKey={key}
                  value={settingsDraft[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              ))}

              <TextField
                fieldKey="heroSubtitle"
                value={settingsDraft.heroSubtitle}
                textarea
                helper="Bu metin müşterinin ilk okuyacağı açıklama. Kısa, net ve güven veren olmalı."
                onChange={(event) => updateField("heroSubtitle", event.target.value)}
              />
            </div>

            <aside className="admin-live-preview-card">
              <span>Canlı hero önizleme</span>
              <h3>{settingsDraft.heroTitle || "Hero başlığı girilmedi"}</h3>
              <strong>{settingsDraft.heroHighlight || "Vurgu metni"}</strong>
              <p>{settingsDraft.heroSubtitle || "Hero açıklaması burada görünecek."}</p>
            </aside>
          </div>

          <div className="admin-media-grid">
            <MediaUploadCard
              title="Logo görseli"
              description="Üst menüde marka görseli olarak görünür."
              urlLabel="Logo görsel URL"
              urlValue={settingsDraft.brandLogoUrl}
              onUrlChange={(value) => updateField("brandLogoUrl", value)}
              file={logoFile}
              setFile={setLogoFile}
              fileLabel="Logo görsel seç"
              previewAlt="AKC logo önizleme"
            />

            <MediaUploadCard
              title="Hero görseli"
              description="Ana sayfanın sağ tarafındaki büyük görsel alan."
              urlLabel="Hero görsel URL"
              urlValue={settingsDraft.heroImageUrl}
              onUrlChange={(value) => updateField("heroImageUrl", value)}
              file={heroFile}
              setFile={setHeroFile}
              fileLabel="Hero görsel seç"
              previewAlt="Hero görsel önizleme"
            />

            <MediaUploadCard
              title="Vitrin / ek görsel"
              description="Hero altında ekstra premium görsel alanı."
              urlLabel="Vitrin / ek görsel URL"
              urlValue={settingsDraft.showcaseImageUrl}
              onUrlChange={(value) => updateField("showcaseImageUrl", value)}
              file={showcaseFile}
              setFile={setShowcaseFile}
              fileLabel="Vitrin görsel seç"
              previewAlt="Vitrin görsel önizleme"
            />
          </div>
        </AdminSection>

        <AdminSection
          id="content"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Bölüm Başlıkları"
          description="Ana sayfadaki tüm kurumsal bölümlerin başlık ve açıklama metinleri."
          badge="İçerik"
        >
          <div className="settings-form admin-form-premium">
            {sectionFields.map((key) => (
              <TextField
                key={key}
                fieldKey={key}
                value={settingsDraft[key]}
                textarea={key.endsWith("Text")}
                onChange={(event) => updateField(key, event.target.value)}
              />
            ))}
          </div>
        </AdminSection>

        <AdminSection
          id="lists"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Liste Alanları"
          description="Her satır ayrı madde olacak şekilde araç grupları, avantajlar, süreç ve SSS düzeni."
          badge="Dinamik liste"
        >
          <div className="settings-form admin-form-premium">
            <label className="admin-field admin-field--wide">
              <span>Araç grupları — her satır bir madde</span>
              <textarea
                value={settingsDraft.vehicleGroupsText || ""}
                onChange={(event) => updateField("vehicleGroupsText", event.target.value)}
                rows={6}
                placeholder={"Binek Araç\nSUV\nHafif Ticari\nTaksi"}
              />
              <small>Ana sayfadaki araç grubu şeridini besler.</small>
            </label>

            <label className="admin-field admin-field--wide">
              <span>Avantajlar — her satır bir madde</span>
              <textarea
                value={settingsDraft.advantagesText || ""}
                onChange={(event) => updateField("advantagesText", event.target.value)}
                rows={7}
                placeholder={"Model uyumlu ölçü mantığı\nProfesyonel montaj\nYoğun kullanıma uygun malzeme"}
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>Süreç adımları — her satır bir madde</span>
              <textarea
                value={settingsDraft.processStepsText || ""}
                onChange={(event) => updateField("processStepsText", event.target.value)}
                rows={7}
                placeholder={"Araç bilgisi alınır\nMalzeme seçilir\nÜretim planlanır\nMontaj tamamlanır"}
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>SSS — format: Soru | Cevap</span>
              <textarea
                value={settingsDraft.faqsText || ""}
                onChange={(event) => updateField("faqsText", event.target.value)}
                rows={8}
                placeholder={"Kılıflar araca özel mi? | Evet, araç modeline göre hazırlanır.\nTeklif için ne gerekir? | Marka, model, yıl ve koltuk fotoğrafı yeterlidir."}
              />
              <small>Her satırda soru ve cevabı dikey çizgi ile ayır.</small>
            </label>
          </div>
        </AdminSection>

        <AdminSection
          id="contact"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="İletişim Bilgileri"
          description="Müşterinin arama, WhatsApp, mail, harita ve sosyal medya bağlantıları."
          badge="Müşteri dönüşümü"
        >
          <div className="settings-form admin-form-premium">
            {contactFields.map((key) => (
              <TextField
                key={key}
                fieldKey={key}
                value={settingsDraft[key]}
                textarea={key === "address"}
                helper={
                  key === "whatsapp"
                    ? "Başında ülke kodu olsun. Örnek: 905xxxxxxxxx"
                    : key === "googleMapsUrl"
                      ? "Google Haritalar paylaş bağlantısını buraya ekleyebilirsin."
                      : ""
                }
                onChange={(event) => updateField(key, event.target.value)}
              />
            ))}
          </div>
        </AdminSection>

        <AdminSection
          id="footer"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Header ve Footer"
          description="Üst duyuru metni, footer marka açıklaması ve telif hakkı."
          badge="Kurumsal detay"
        >
          <div className="settings-form admin-form-premium">
            {footerFields.map((key) => (
              <TextField
                key={key}
                fieldKey={key}
                value={settingsDraft[key]}
                textarea={key === "footerDescription"}
                onChange={(event) => updateField(key, event.target.value)}
              />
            ))}
          </div>
        </AdminSection>

        <div className="admin-save-dock">
          <div>
            <strong>Ana sayfa değişiklikleri</strong>
            <span>Kaydetmeden canlı sitede görünmez.</span>
          </div>

          <button className="admin-primary-btn" type="submit" disabled={saving}>
            {saving ? "Ana sayfa kaydediliyor..." : "Ana sayfayı kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}