"use client";

import { Card, Field, PageHead, SaveBar } from "./AdminUI";
import { defaultThemeState, themePresets } from "@/lib/theme";

const COLOR_FIELDS = [
  ["themeBackground", "Bölüm arka planı"],
  ["themeSurface", "Sayfa / kart zemini"],
  ["themeForeground", "Ana metin"],
  ["themeMuted", "İkincil metin"],
  ["themeAccent", "Vurgu (butonlar)"],
  ["themeAccentSoft", "Vurgu açık ton"],
  ["themeButtonText", "Buton yazısı"],
];

function ThemePreview({ colors }) {
  return (
    <div className="adm-theme-preview" style={{ background: colors.themeSurface, color: colors.themeForeground }}>
      <div className="adm-theme-preview-bar" style={{ borderColor: colors.themeLine }}>
        <span style={{ background: colors.themeForeground }} />
        <i style={{ background: colors.themeAccent }} />
      </div>
      <div className="adm-theme-preview-body" style={{ background: colors.themeBackground }}>
        <b style={{ background: colors.themeForeground }} />
        <em style={{ background: colors.themeMuted }} />
        <em style={{ background: colors.themeMuted, width: "60%" }} />
        <span style={{ background: colors.themeAccent }} />
      </div>
    </div>
  );
}

export default function ThemesTab({ settingsDraft, setSettingsDraft, saveSettings, saving, settingsDirty }) {
  const current = settingsDraft.themePreset || "classic";

  function applyPreset(preset) {
    setSettingsDraft((draft) => ({
      ...draft,
      themePreset: preset.id,
      themeName: preset.name,
      themeDescription: preset.description,
      ...preset.colors,
    }));
  }

  function setColor(key, value) {
    setSettingsDraft((draft) => ({ ...draft, themePreset: "custom", themeName: "Özel tema", [key]: value }));
  }

  const draftColors = Object.fromEntries(
    Object.keys(defaultThemeState).map((key) => [key, settingsDraft[key] || defaultThemeState[key]])
  );

  return (
    <>
      <PageHead
        title="Tema"
        description="Sitenin renk düzenini seçin. Kaydettiğinizde tüm sayfalara uygulanır; yönetim paneli değişmez."
      />

      <Card title="Hazır temalar">
        <div className="adm-themes">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`adm-theme ${current === preset.id ? "is-active" : ""}`}
              onClick={() => applyPreset(preset)}
              aria-pressed={current === preset.id}
            >
              <ThemePreview colors={preset.colors} />
              <strong>{preset.name}</strong>
              <small>{preset.description}</small>
            </button>
          ))}
        </div>
      </Card>

      <Card
        title="Özel renkler"
        description={current === "custom" ? "Özel renkler kullanılıyor." : "Bir rengi değiştirdiğinizde tema “Özel” olarak kaydedilir."}
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => applyPreset(themePresets[0])}
          >
            Varsayılana dön
          </button>
        }
      >
        <div className="adm-colors-layout">
          <div className="adm-colors">
            {COLOR_FIELDS.map(([key, label]) => (
              <Field key={key} label={label}>
                <span className="adm-color">
                  <input type="color" value={draftColors[key]} onChange={(event) => setColor(key, event.target.value)} />
                  <code>{draftColors[key]}</code>
                </span>
              </Field>
            ))}
          </div>
          <ThemePreview colors={draftColors} />
        </div>
      </Card>

      <SaveBar dirty={settingsDirty} saving={saving} onSave={() => saveSettings()} label="Temayı kaydet" />
    </>
  );
}
