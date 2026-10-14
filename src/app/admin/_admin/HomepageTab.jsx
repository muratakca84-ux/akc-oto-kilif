"use client";

import { useState } from "react";
import { Card, Field, ImagePicker, PageHead, SaveBar } from "./AdminUI";
import { settingsLabels } from "./admin.constants";

const SECTIONS = [
  { key: "contact", label: "İletişim" },
  { key: "brand", label: "Marka & giriş" },
  { key: "content", label: "Bölüm metinleri" },
  { key: "lists", label: "Listeler & SSS" },
  { key: "footer", label: "Alt bilgi" },
];

const CONTENT_GROUPS = [
  ["services", "Hizmetler"],
  ["material", "Neden biz"],
  ["process", "Çalışma süreci"],
  ["gallery", "Galeri"],
  ["corporate", "Güvence (koyu bölüm)"],
  ["faq", "Sık sorulan sorular"],
  ["contact", "İletişim"],
];

export default function HomepageTab({
  settingsDraft,
  setSettingsDraft,
  saveSettings,
  saving,
  settingsDirty,
  logoFile,
  setLogoFile,
  heroFile,
  setHeroFile,
  showcaseFile,
  setShowcaseFile,
}) {
  const [section, setSection] = useState("contact");
  const filesPending = Boolean(logoFile || heroFile || showcaseFile);

  const set = (key) => (event) => {
    const value = event.target.value;
    setSettingsDraft((current) => ({ ...current, [key]: value }));
  };

  const setValue = (key, value) => setSettingsDraft((current) => ({ ...current, [key]: value }));

  const input = (key, props = {}) => (
    <Field label={settingsLabels[key] || key} hint={props.hint} wide={props.wide}>
      {props.rows ? (
        <textarea className="adm-input" rows={props.rows} value={settingsDraft[key] || ""} onChange={set(key)} placeholder={props.placeholder} />
      ) : (
        <input className="adm-input" value={settingsDraft[key] || ""} onChange={set(key)} placeholder={props.placeholder} />
      )}
    </Field>
  );

  return (
    <>
      <PageHead title="Site ayarları" description="Ana sayfa metinleri, görseller ve iletişim bilgileri. Değişiklikler kaydedince sitede yayına alınır." />

      <div className="adm-segment adm-segment--scroll" role="tablist">
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={section === item.key}
            className={section === item.key ? "is-active" : ""}
            onClick={() => setSection(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "contact" ? (
        <Card title="İletişim bilgileri" description="Üst bar, iletişim bölümü, alt bilgi ve WhatsApp düğmelerinde kullanılır.">
          <div className="adm-form">
            {input("phone", { placeholder: "+90 5xx xxx xx xx" })}
            {input("whatsapp", { hint: "Ülke koduyla, yalnız rakam. Örn. 905015864284" })}
            {input("email")}
            {input("workingHours", { placeholder: "Pazartesi – Cumartesi · 09:00 – 19:00" })}
            {input("address", { wide: true, rows: 2 })}
            {input("googleMapsUrl", { wide: true, hint: "Google Haritalar'da işletmenizi açıp “Paylaş” bağlantısını yapıştırın." })}
            {input("instagram", { wide: true, placeholder: "https://www.instagram.com/…" })}
          </div>
        </Card>
      ) : null}

      {section === "brand" ? (
        <>
          <Card title="Marka ve giriş alanı" description="Sayfanın en üstünde görünen başlık ve açıklama.">
            <div className="adm-form">
              {input("businessName")}
              {input("brandSubtitle")}
              {input("heroEyebrow", { wide: true })}
              {input("heroTitle", { wide: true })}
              {input("heroSubtitle", { wide: true, rows: 3 })}
            </div>
          </Card>
          <Card title="Görseller" description="Değiştirdiğiniz görseller kaydettiğinizde yüklenir.">
            <div className="adm-media-grid">
              <ImagePicker
                label="Logo"
                url={settingsDraft.brandLogoUrl}
                onUrlChange={(value) => setValue("brandLogoUrl", value)}
                file={logoFile}
                onFileChange={setLogoFile}
                aspect="1 / 1"
                contain
                hint="Kare, en az 256×256 px"
              />
              <ImagePicker
                label="Giriş görseli"
                url={settingsDraft.heroImageUrl}
                onUrlChange={(value) => setValue("heroImageUrl", value)}
                file={heroFile}
                onFileChange={setHeroFile}
                hint="Yatay, en az 1600 px genişlik"
              />
              <ImagePicker
                label="“Neden biz” görseli"
                url={settingsDraft.showcaseImageUrl}
                onUrlChange={(value) => setValue("showcaseImageUrl", value)}
                file={showcaseFile}
                onFileChange={setShowcaseFile}
                hint="Yatay, en az 1200 px genişlik"
              />
            </div>
          </Card>
        </>
      ) : null}

      {section === "content" ? (
        <div className="adm-stack">
          {CONTENT_GROUPS.map(([prefix, title]) => (
            <Card key={prefix} title={title}>
              <div className="adm-form">
                {input(`${prefix}Eyebrow`)}
                {input(`${prefix}Title`)}
                {input(`${prefix}Text`, { wide: true, rows: 2 })}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {section === "lists" ? (
        <Card title="Listeler" description="Her satır bir madde olarak gösterilir.">
          <div className="adm-form">
            {input("vehicleGroupsText", { rows: 6 })}
            {input("advantagesText", { rows: 6 })}
            {input("processStepsText", { rows: 5, wide: true })}
            <Field label="Sık sorulan sorular" hint="Her satıra bir soru: Soru | Cevap" wide>
              <textarea className="adm-input" rows={8} value={settingsDraft.faqsText || ""} onChange={set("faqsText")} />
            </Field>
          </div>
        </Card>
      ) : null}

      {section === "footer" ? (
        <Card title="Alt bilgi">
          <div className="adm-form">
            {input("footerTitle")}
            {input("footerCopy", { placeholder: "© 2026 AKC Oto Kılıf. Tüm hakları saklıdır." })}
            {input("footerDescription", { wide: true, rows: 2 })}
          </div>
        </Card>
      ) : null}

      <SaveBar dirty={settingsDirty || filesPending} saving={saving} onSave={() => saveSettings()} />
    </>
  );
}
