"use client";

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildThemePalette, defaultThemeState, resolveTheme } from "@/lib/theme";

export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(buildThemePalette(theme)).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.dataset.theme = theme.themePreset || "classic";
}

/** Panelden seçilen temayı canlı siteye uygular (yönetim paneli kendi sabit temasını kullanır). */
export default function ThemeProvider() {
  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => applyTheme(resolveTheme(snapshot.data() || {})),
      () => applyTheme(defaultThemeState)
    );
  }, []);

  return null;
}
