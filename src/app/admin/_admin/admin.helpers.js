import { defaultSettings } from "./admin.constants";

export function arrayToText(value) {
  if (!Array.isArray(value)) return "";
  return value.join("\n");
}

export function textToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function faqsToText(value) {
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => `${item.q || ""} | ${item.a || ""}`)
    .join("\n");
}

export function textToFaqs(value) {
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [q, ...rest] = line.split("|");

      return {
        q: String(q || "").trim(),
        a: rest.join("|").trim(),
      };
    })
    .filter((item) => item.q && item.a);
}

export function buildDraft(settings = defaultSettings) {
  return {
    ...defaultSettings,
    ...settings,
    vehicleGroupsText: arrayToText(
      settings.vehicleGroups || defaultSettings.vehicleGroups
    ),
    advantagesText: arrayToText(
      settings.advantages || defaultSettings.advantages
    ),
    processStepsText: arrayToText(
      settings.processSteps || defaultSettings.processSteps
    ),
    faqsText: faqsToText(settings.faqs || defaultSettings.faqs),
  };
}

export function formatDate(value) {
  if (!value) return "-";

  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
}

export function safeNumber(value, fallback = 10) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatPrice(value, currency = "TRY") {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
}

export function getProductPricing(product) {
  const currency = product?.currency || "TRY";
  const note = String(product?.priceText || "").trim();

  if (product?.showPrice === false) {
    return {
      oldText: "",
      finalText: note || "Teklif alınız",
      note: "",
      hasRealPrice: false,
    };
  }

  const normalPrice = formatPrice(product?.priceAmount, currency);
  const discountPrice = formatPrice(product?.discountPriceAmount, currency);

  if (discountPrice) {
    return {
      oldText: normalPrice,
      finalText: discountPrice,
      note: note && note !== "Teklif alınız" ? note : "",
      hasRealPrice: true,
    };
  }

  if (normalPrice) {
    return {
      oldText: "",
      finalText: normalPrice,
      note: note && note !== "Teklif alınız" ? note : "",
      hasRealPrice: true,
    };
  }

  return {
    oldText: "",
    finalText: note || "Teklif alınız",
    note: "",
    hasRealPrice: false,
  };
}

export function cleanObjectForEdit(item, emptyShape) {
  const cleaned = { ...emptyShape };

  Object.keys(emptyShape).forEach((key) => {
    const value = item?.[key];
    cleaned[key] =
      value === undefined || value === null ? emptyShape[key] : value;
  });

  return cleaned;
}

export function safeFileName(fileName) {
  return String(fileName || "image")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9._-]/g, "");
}