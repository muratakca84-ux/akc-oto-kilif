import { useEffect, useMemo } from "react";
import { mergeSiteSettings } from "@/lib/site-config";
import { resolveTheme, THEME_VERSION } from "@/lib/theme";
import { defaultSettings } from "./admin.constants";

export { formatPrice, getProductPricing } from "@/lib/pricing";

export function arrayToText(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function textToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function faqsToText(value) {
  if (!Array.isArray(value)) return "";
  return value.map((item) => `${item.q || ""} | ${item.a || ""}`).join("\n");
}

export function textToFaqs(value) {
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [q, ...rest] = line.split("|");
      return { q: String(q || "").trim(), a: rest.join("|").trim() };
    })
    .filter((item) => item.q && item.a);
}

/** Firestore ayarlarından düzenlenebilir taslak üretir. Tema, sitede görünen haliyle gelir. */
export function buildDraft(settings = defaultSettings) {
  // Boş veya panel-içi kalıntı metinler yerine sitede gerçekte görünen değerler düzenlenir.
  const merged = { ...defaultSettings, ...mergeSiteSettings(settings) };
  return {
    ...merged,
    ...resolveTheme(settings),
    themeVersion: THEME_VERSION,
    vehicleGroupsText: arrayToText(merged.vehicleGroups),
    advantagesText: arrayToText(merged.advantages),
    processStepsText: arrayToText(merged.processSteps),
    faqsText: faqsToText(merged.faqs),
  };
}

export function formatDate(value) {
  if (!value) return "—";
  try {
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

export function safeNumber(value, fallback = 10) {
  const number = Number(value);
  return value === "" || value === null || !Number.isFinite(number) ? fallback : number;
}

export function cleanObjectForEdit(item, emptyShape) {
  const cleaned = { ...emptyShape };
  Object.keys(emptyShape).forEach((key) => {
    const value = item?.[key];
    cleaned[key] = value === undefined || value === null ? emptyShape[key] : value;
  });
  return cleaned;
}

export function safeFileName(fileName) {
  return String(fileName || "image")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9._-]/g, "");
}

/** Seçilen dosya için önizleme adresi üretir ve bellekten temizler. */
export function useFilePreview(file, fallbackUrl = "") {
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return objectUrl || fallbackUrl || "";
}
