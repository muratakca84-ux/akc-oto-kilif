export function formatPrice(value, currency = "TRY") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";

  try {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(number);
  } catch {
    return `${number.toLocaleString("tr-TR")} ${currency}`;
  }
}

/** Ürün kartı ve panel önizlemesi için ortak fiyat metni üretir. */
export function getProductPricing(product) {
  const currency = product?.currency || "TRY";
  const note = String(product?.priceText || "").trim();
  const extra = note && note !== "Teklif alınız" ? note : "";

  if (product?.showPrice === false) {
    return { oldText: "", finalText: note || "Teklif alınız", note: "", hasRealPrice: false };
  }

  const normal = formatPrice(product?.priceAmount, currency);
  const discount = formatPrice(product?.discountPriceAmount, currency);

  if (discount && normal && Number(product.discountPriceAmount) < Number(product.priceAmount)) {
    return { oldText: normal, finalText: discount, note: extra, hasRealPrice: true };
  }
  if (discount || normal) {
    return { oldText: "", finalText: discount || normal, note: extra, hasRealPrice: true };
  }
  return { oldText: "", finalText: note || "Teklif alınız", note: "", hasRealPrice: false };
}
