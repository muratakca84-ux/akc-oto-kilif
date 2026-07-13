export const themePresets = [
  {
    id: "classic",
    name: "Altın Klasik",
    description: "Premium koyu zemin ve altın vurgu ile klasik AKC hissi.",
    colors: {
      themeBackground: "#070707",
      themeForeground: "#f8f3ea",
      themeMuted: "#b9b0a3",
      themeAccent: "#d6a54b",
      themeAccentSoft: "#f0d28a",
      themeAccentDark: "#8f6420",
      themeSurface: "#0b0a08",
      themeLine: "rgba(255,255,255,0.12)",
      themeLineStrong: "rgba(240,210,138,0.3)",
      themeButtonText: "#171006",
    },
  },
  {
    id: "luxury",
    name: "Lüks Koyu",
    description: "Daha koyu, sofistike ve modern görünüm.",
    colors: {
      themeBackground: "#05070d",
      themeForeground: "#f5f7ff",
      themeMuted: "#aab3c6",
      themeAccent: "#8f6dff",
      themeAccentSoft: "#c5b4ff",
      themeAccentDark: "#5738aa",
      themeSurface: "#0f1324",
      themeLine: "rgba(255,255,255,0.12)",
      themeLineStrong: "rgba(143,109,255,0.28)",
      themeButtonText: "#f7f5ff",
    },
  },
  {
    id: "oak",
    name: "Doğal Ahşap",
    description: "Toprak tonlarıyla sıcak ve doğal bir his.",
    colors: {
      themeBackground: "#17110c",
      themeForeground: "#f6ece1",
      themeMuted: "#c29c76",
      themeAccent: "#b96d2b",
      themeAccentSoft: "#e4b07a",
      themeAccentDark: "#7b4015",
      themeSurface: "#24190f",
      themeLine: "rgba(255,255,255,0.13)",
      themeLineStrong: "rgba(185,109,43,0.28)",
      themeButtonText: "#1a120c",
    },
  },
  {
    id: "marine",
    name: "Deniz Mavisi",
    description: "Serin ve profesyonel bir tema, modern marka hissi verir.",
    colors: {
      themeBackground: "#07131b",
      themeForeground: "#eef7ff",
      themeMuted: "#8eb0c8",
      themeAccent: "#2f8ac7",
      themeAccentSoft: "#8ed2ff",
      themeAccentDark: "#125a8b",
      themeSurface: "#102534",
      themeLine: "rgba(255,255,255,0.12)",
      themeLineStrong: "rgba(47,138,199,0.28)",
      themeButtonText: "#07131b",
    },
  },
  {
    id: "forest",
    name: "Yeşil Konfor",
    description: "Sakin, temiz ve doğal bir marka görünümü.",
    colors: {
      themeBackground: "#08140f",
      themeForeground: "#ecf7ef",
      themeMuted: "#8fb49a",
      themeAccent: "#2f8b5e",
      themeAccentSoft: "#8ed2a8",
      themeAccentDark: "#165238",
      themeSurface: "#11261d",
      themeLine: "rgba(255,255,255,0.12)",
      themeLineStrong: "rgba(47,139,94,0.28)",
      themeButtonText: "#06120d",
    },
  },
];

export const defaultThemeState = {
  themePreset: "classic",
  themeName: "Altın Klasik",
  themeDescription: "Premium görünüm ve güçlü marka hissi.",
  themeBackground: "#070707",
  themeForeground: "#f8f3ea",
  themeMuted: "#b9b0a3",
  themeAccent: "#d6a54b",
  themeAccentSoft: "#f0d28a",
  themeAccentDark: "#8f6420",
  themeSurface: "#0b0a08",
  themeLine: "rgba(255,255,255,0.12)",
  themeLineStrong: "rgba(240,210,138,0.3)",
  themeButtonText: "#171006",
};

export function getPresetById(id) {
  return themePresets.find((preset) => preset.id === id) || themePresets[0];
}

function safeValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

export function buildThemePalette(theme = {}) {
  const resolved = {
    ...defaultThemeState,
    ...theme,
  };

  const background = safeValue(
    resolved.themeBackground,
    defaultThemeState.themeBackground
  );

  const foreground = safeValue(
    resolved.themeForeground,
    defaultThemeState.themeForeground
  );

  const muted = safeValue(resolved.themeMuted, defaultThemeState.themeMuted);

  const accent = safeValue(resolved.themeAccent, defaultThemeState.themeAccent);

  const accentSoft = safeValue(
    resolved.themeAccentSoft,
    defaultThemeState.themeAccentSoft
  );

  const accentDark = safeValue(
    resolved.themeAccentDark,
    defaultThemeState.themeAccentDark
  );

  const surface = safeValue(
    resolved.themeSurface,
    defaultThemeState.themeSurface
  );

  const line = safeValue(resolved.themeLine, defaultThemeState.themeLine);

  const lineStrong = safeValue(
    resolved.themeLineStrong,
    defaultThemeState.themeLineStrong
  );

  const buttonText = safeValue(
    resolved.themeButtonText,
    defaultThemeState.themeButtonText
  );

  return {
    "--background": background,
    "--foreground": foreground,
    "--muted": muted,

    "--gold": accent,
    "--gold-soft": accentSoft,
    "--gold-dark": accentDark,

    "--black": surface,
    "--black-2": surface,
    "--brown": surface,
    "--green": accentDark,

    "--line": line,
    "--line-strong": lineStrong,

    "--glass": "rgba(255, 255, 255, 0.065)",
    "--glass-strong": "rgba(255, 255, 255, 0.105)",

    "--shadow-soft": "0 24px 80px rgba(0, 0, 0, 0.26)",
    "--shadow-strong": "0 44px 120px rgba(0, 0, 0, 0.52)",

    "--accent": accent,
    "--accent-soft": accentSoft,
    "--surface": surface,
    "--button-text": buttonText,
  };
}