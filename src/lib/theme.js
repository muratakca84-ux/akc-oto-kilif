// Tema sürümü: yalnızca yeni panelden kaydedilmiş temalar canlı siteye uygulanır.
// Eski (v1) panelden kalan özel renkler kurumsal varsayılanı bozmasın diye yok sayılır.
export const THEME_VERSION = 2;

export const themePresets = [
  {
    id: "classic",
    name: "Kurumsal Mavi",
    description: "Logo ile uyumlu açık zemin, lacivert metin ve AKC mavisi vurgu.",
    colors: {
      themeBackground: "#f4f6f9",
      themeForeground: "#0b1626",
      themeMuted: "#566173",
      themeAccent: "#1572c9",
      themeAccentSoft: "#e3effb",
      themeAccentDark: "#0c4f91",
      themeSurface: "#ffffff",
      themeLine: "rgba(11,22,38,0.10)",
      themeLineStrong: "rgba(11,22,38,0.18)",
      themeButtonText: "#ffffff",
    },
  },
  {
    id: "marine",
    name: "Gece Mavisi",
    description: "Koyu lacivert zemin, parlak mavi vurgu. Logo ile bire bir uyumlu.",
    colors: {
      themeBackground: "#08111e",
      themeForeground: "#eef3f9",
      themeMuted: "#97a3b6",
      themeAccent: "#2b94ec",
      themeAccentSoft: "#12243b",
      themeAccentDark: "#8cc6f7",
      themeSurface: "#0f1a2b",
      themeLine: "rgba(255,255,255,0.10)",
      themeLineStrong: "rgba(255,255,255,0.18)",
      themeButtonText: "#ffffff",
    },
  },
  {
    id: "luxury",
    name: "Grafit",
    description: "Antrasit zemin ve ölçülü mavi vurgu; sade ve ağırbaşlı.",
    colors: {
      themeBackground: "#0f1114",
      themeForeground: "#f1f2f4",
      themeMuted: "#9aa0a8",
      themeAccent: "#3a9be8",
      themeAccentSoft: "#1a2230",
      themeAccentDark: "#9ccdf5",
      themeSurface: "#171a1f",
      themeLine: "rgba(255,255,255,0.09)",
      themeLineStrong: "rgba(255,255,255,0.16)",
      themeButtonText: "#ffffff",
    },
  },
  {
    id: "oak",
    name: "Kum Beji",
    description: "Sıcak açık zemin ve konyak vurgu; deri döşeme hissi.",
    colors: {
      themeBackground: "#f6f4f0",
      themeForeground: "#1d1813",
      themeMuted: "#685f55",
      themeAccent: "#9a5b26",
      themeAccentSoft: "#f1e6da",
      themeAccentDark: "#6b3d17",
      themeSurface: "#ffffff",
      themeLine: "rgba(29,24,19,0.10)",
      themeLineStrong: "rgba(29,24,19,0.18)",
      themeButtonText: "#ffffff",
    },
  },
  {
    id: "forest",
    name: "Kurumsal Yeşil",
    description: "Açık zemin, koyu yeşil vurgu; sakin ve güven veren.",
    colors: {
      themeBackground: "#f4f6f5",
      themeForeground: "#0f1d17",
      themeMuted: "#56645d",
      themeAccent: "#1d7a52",
      themeAccentSoft: "#e2f1ea",
      themeAccentDark: "#11553a",
      themeSurface: "#ffffff",
      themeLine: "rgba(15,29,23,0.10)",
      themeLineStrong: "rgba(15,29,23,0.18)",
      themeButtonText: "#ffffff",
    },
  },
];

export const defaultThemeState = {
  themePreset: "classic",
  themeName: themePresets[0].name,
  themeDescription: themePresets[0].description,
  ...themePresets[0].colors,
};

export function getPresetById(id) {
  return themePresets.find((preset) => preset.id === id) || themePresets[0];
}

function pick(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

/** Firestore'daki tema alanlarını güvenli bir tema durumuna çevirir. */
export function resolveTheme(settings = {}) {
  if (Number(settings.themeVersion) !== THEME_VERSION) return defaultThemeState;

  if (settings.themePreset && settings.themePreset !== "custom") {
    const preset = getPresetById(settings.themePreset);
    return { ...defaultThemeState, themePreset: preset.id, ...preset.colors };
  }

  const resolved = { ...defaultThemeState };
  Object.keys(themePresets[0].colors).forEach((key) => {
    resolved[key] = pick(settings[key], defaultThemeState[key]);
  });
  resolved.themePreset = "custom";
  return resolved;
}

function isDarkColor(hex) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

/** Tema durumunu CSS değişkenlerine çevirir. */
export function buildThemePalette(theme = defaultThemeState) {
  const t = { ...defaultThemeState, ...theme };

  return {
    "--bg": t.themeBackground,
    "--text": t.themeForeground,
    "--muted": t.themeMuted,
    "--accent": t.themeAccent,
    "--accent-soft": t.themeAccentSoft,
    "--accent-strong": t.themeAccentDark,
    "--surface": t.themeSurface,
    "--line": t.themeLine,
    "--line-strong": t.themeLineStrong,
    "--on-accent": t.themeButtonText,
    "color-scheme": isDarkColor(t.themeBackground) ? "dark" : "light",
  };
}
