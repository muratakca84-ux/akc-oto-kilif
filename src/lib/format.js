export function formatDate(value) {
  if (!value) return "-";

  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
}

export function cleanText(value) {
  if (!value) return "";
  return String(value).trim();
}

export function getInitials(text) {
  if (!text) return "AKC";

  return String(text)
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}