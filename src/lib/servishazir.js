import "server-only";

/**
 * Servis Hazır (ServisKanıt) uygulamasında "Web sitesinde ve vitrinde göster"
 * açık ürünleri sunucu tarafında çeker. SERVISHAZIR_BUSINESS_ID yoksa veya
 * uç erişilemezse boş liste döner; katalog yalnız admin ürünleriyle devam eder.
 */
const DEFAULT_API_BASE = "https://dromocob.tr";
const REVALIDATE_SECONDS = 300;

function apiBase() {
  const value = (process.env.SERVISHAZIR_API_BASE || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
  // Yerel deneme için http://localhost izinli; diğer her şey HTTPS olmalı.
  return /^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value) ? value : DEFAULT_API_BASE;
}

function toCatalogProduct(item) {
  const priceAmount = Number(item?.price);
  const showPrice = item?.priceOnRequest !== true && Number.isFinite(priceAmount) && priceAmount > 0;
  return {
    id: `servishazir-${item.id}`,
    source: "servishazir",
    title: String(item.name || "").trim(),
    category: String(item.category || "").trim() || "Genel",
    description: item.description ? String(item.description) : "",
    brand: item.brand ? String(item.brand) : "",
    imageUrl: typeof item.photoUrl === "string" && item.photoUrl.startsWith("https://") ? item.photoUrl : "",
    showPrice,
    ...(showPrice ? { priceAmount } : {}),
    currency: /^[A-Z]{3}$/.test(item.currency || "") ? item.currency : "TRY",
    inStock: item.inStock === true,
  };
}

export async function getServisHazirProducts() {
  const businessId = (process.env.SERVISHAZIR_BUSINESS_ID || "").trim();
  if (!businessId) return [];
  const url = `${apiBase()}/api/serviskanit/public/businesses/${encodeURIComponent(businessId)}/products`;
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["servishazir-products"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn(`[servishazir] ürünler alınamadı: HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data?.products)
      ? data.products.filter((item) => item?.id && item?.name).map(toCatalogProduct)
      : [];
  } catch (error) {
    console.warn("[servishazir] ürünler alınamadı:", error instanceof Error ? error.message : error);
    return [];
  }
}
