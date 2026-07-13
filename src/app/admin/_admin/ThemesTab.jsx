import { defaultThemeState, themePresets } from "@/lib/theme";

export default function ThemesTab({
  settingsDraft,
  setSettingsDraft,
  saveSettings,
  saving,
}) {
  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Tema yönetimi</h2>
          <p>
            Hazır temalar seçin, özel renkler tanımlayın ve sitenin görünümünü
            anında kaydedin.
          </p>
        </div>
      </div>

      <div className="theme-grid">
        {themePresets.map((preset) => (
          <article
            key={preset.id}
            className={`theme-card ${
              settingsDraft.themePreset === preset.id ? "active" : ""
            }`}
          >
            <div>
              <h3>{preset.name}</h3>
              <p>{preset.description}</p>
            </div>

            <div className="theme-color-row">
              {Object.values(preset.colors)
                .slice(0, 6)
                .map((color) => (
                  <span
                    key={`${preset.id}-${color}`}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: color,
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
            </div>

            <button
              className="admin-secondary-btn"
              type="button"
              onClick={() =>
                setSettingsDraft({
                  ...settingsDraft,
                  themePreset: preset.id,
                  themeName: preset.name,
                  themeDescription: preset.description,
                  ...preset.colors,
                })
              }
            >
              Bu temayı uygula
            </button>
          </article>
        ))}
      </div>

      <form className="theme-form" onSubmit={saveSettings}>
        <div className="theme-form-grid">
          <label>
            Tema adı
            <input
              value={settingsDraft.themeName || ""}
              onChange={(event) =>
                setSettingsDraft({
                  ...settingsDraft,
                  themePreset: "custom",
                  themeName: event.target.value,
                })
              }
            />
          </label>

          <label>
            Tema açıklaması
            <input
              value={settingsDraft.themeDescription || ""}
              onChange={(event) =>
                setSettingsDraft({
                  ...settingsDraft,
                  themePreset: "custom",
                  themeDescription: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="theme-color-row">
          {[
            ["themeBackground", "Arka plan"],
            ["themeForeground", "Ana yazı"],
            ["themeMuted", "İkincil yazı"],
            ["themeAccent", "Vurgu rengi"],
            ["themeAccentSoft", "Yumuşak vurgu"],
            ["themeAccentDark", "Koyu vurgu"],
            ["themeSurface", "Kart / yüzey"],
            ["themeButtonText", "Düğme yazısı"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="color"
                value={settingsDraft[key] || defaultThemeState[key] || "#ffffff"}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    themePreset: "custom",
                    [key]: event.target.value,
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className="topbar-actions">
          <button
            className="admin-secondary-btn"
            type="button"
            onClick={() =>
              setSettingsDraft({
                ...settingsDraft,
                ...defaultThemeState,
              })
            }
          >
            Varsayılan temaya dön
          </button>

          <button className="admin-primary-btn" type="submit" disabled={saving}>
            {saving ? "Tema kaydediliyor..." : "Temayı kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}