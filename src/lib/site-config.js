// Herkese açık sayfaların ortak varsayılanları ve iletişim bilgisi yardımcıları.
// Firestore'daki settings/site belgesi bu değerlerin üzerine yazılır.

export const SITE_FALLBACK = {
  businessName: "AKC Oto Kılıf",
  brandSubtitle: "Oto kılıf uygulama merkezi",

  heroEyebrow: "Konya · Karatay oto kılıf uygulama merkezi",
  heroTitle: "Aracınıza özel oto kılıf ve koltuk döşeme.",
  heroHighlight: "",
  heroSubtitle:
    "Binek, SUV, hafif ticari, taksi, servis ve filo araçları için model uyumlu ölçü, dayanıklı malzeme ve atölyemizde profesyonel montaj.",

  phone: "+90 501 586 42 84",
  whatsapp: "905015864284",
  email: "info@akcotokilif.com",
  address: "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya",
  workingHours: "Pazartesi – Cumartesi · 09:00 – 19:00",
  instagram: "",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=AKC+Oto+K%C4%B1l%C4%B1f+Karatay+Konya",

  brandLogoUrl: "/images/akc-logo-square.png",
  heroImageUrl: "/images/hero-premium-seat-covers.jpg",
  showcaseImageUrl: "/images/suv-seat-cover-installation.jpg",

  servicesEyebrow: "Hizmetler",
  servicesTitle: "Araç tipine ve kullanım amacına göre çözüm.",
  servicesText:
    "Koltuk formu, kullanım yoğunluğu ve beklenti her araçta farklıdır. Uygulamayı buna göre planlıyoruz.",

  materialEyebrow: "Neden AKC",
  materialTitle: "Ölçü, malzeme ve montajda tek standart.",
  materialText:
    "Kalite ilk günden çok, aylar sonraki görünümde anlaşılır. Bu yüzden malzeme seçimi, dikiş ve montaj aynı özenle yürütülür.",

  processEyebrow: "Çalışma süreci",
  processTitle: "Tekliften teslime dört adım.",
  processText:
    "Araç bilgisi alınır, beklenti netleştirilir, uygun malzeme seçilir ve uygulama randevulu olarak tamamlanır.",

  galleryEyebrow: "Uygulamalar",
  galleryTitle: "Atölyemizden tamamlanmış işler.",
  galleryText: "Montaj, dikiş ve malzeme detaylarıyla gerçek uygulamalarımızdan örnekler.",

  corporateEyebrow: "Güvenli uygulama",
  corporateTitle: "Koltuk yapısına ve güvenlik donanımına uygun işçilik.",
  corporateText:
    "Koltuk formu, dikiş hatları ve yan hava yastığı bölgeleri uygulama öncesinde kontrol edilir. Malzeme ve tasarım netleştikten sonra üretim ve montaj planlı şekilde tamamlanır.",

  faqEyebrow: "Sık sorulan sorular",
  faqTitle: "Karar vermeden önce merak edilenler.",
  faqText: "Aradığınız cevap burada yoksa bizi arayın veya WhatsApp'tan yazın.",

  contactEyebrow: "İletişim",
  contactTitle: "Aracınız için teklif alın.",
  contactText:
    "Marka, model, yıl ve tercih ettiğiniz malzemeyi paylaşın. Fotoğraf eklerseniz daha net fiyat verebiliriz.",

  footerTitle: "AKC Oto Kılıf",
  footerDescription:
    "Konya Karatay'da araca özel oto kılıf, koltuk döşeme ve profesyonel montaj hizmeti.",
  footerCopy: "",

  vehicleGroups: ["Binek Araç", "SUV", "Hafif Ticari", "Taksi", "Servis Aracı", "Filo Araçları"],

  advantages: [
    "Model uyumlu ölçü ve kesim",
    "Koltuğa oturan, gergin görünüm",
    "Yoğun kullanıma uygun malzeme",
    "Filo ve kurumsal araçlara toplu çözüm",
    "Uygulama öncesi net fiyat ve süre",
    "Karatay'daki atölyemizde montaj",
  ],

  processSteps: [
    "Araç marka, model ve yıl bilgisi alınır.",
    "Kullanım amacı ve malzeme beklentisi netleştirilir.",
    "Renk, dikiş ve tasarım seçenekleri belirlenir.",
    "Üretim ve profesyonel montaj tamamlanır.",
  ],

  faqs: [
    {
      q: "Kılıflar araca özel mi hazırlanıyor?",
      a: "Evet. Universal kılıflardaki bolluk ve kayma yerine koltuğa oturan, düzgün bir sonuç hedeflenir.",
    },
    {
      q: "Yan hava yastığı (airbag) olan koltuklara uygulama yapılıyor mu?",
      a: "Evet. Koltuk güvenlik yapısı dikkate alınarak, hava yastığının açılmasını engellemeyecek şekilde uygulama yapılır.",
    },
    {
      q: "Ticari araçlar için uygun çözüm var mı?",
      a: "Taksi, servis, filo ve hafif ticari araçlar için yoğun kullanıma dayanıklı, kolay temizlenen malzemeler sunuyoruz.",
    },
    {
      q: "Teklif almak için hangi bilgiler gerekir?",
      a: "Araç marka, model, yıl, koltuk tipi ve istenen malzeme yeterlidir. Fotoğraf gönderirseniz değerlendirme daha net olur.",
    },
    {
      q: "Montaj ne kadar sürer?",
      a: "Süre araç ve uygulama kapsamına göre değişir; tahmini süre teklif ile birlikte paylaşılır.",
    },
    {
      q: "Konya dışından hizmet alabilir miyim?",
      a: "Atölyemiz Karatay/Konya'dadır. Filo ve toplu uygulamalar için hizmet kapsamı ayrıca planlanabilir.",
    },
  ],
};

// Herkese açık sayfada asla görünmemesi gereken, panelden kalma iç metinler.
const INTERNAL_COPY = /admin|panelden|panel üzerinden|yönetilebilir|site sadece vitrin|eklenecek|lorem/i;

function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
}

/** Boş veya panel-içi metinleri yok sayarak Firestore ayarlarını varsayılanlarla birleştirir. */
export function mergeSiteSettings(data = {}) {
  const merged = { ...SITE_FALLBACK };

  Object.entries(data || {}).forEach(([key, value]) => {
    if (isBlank(value)) return;
    if (typeof value === "string" && key in SITE_FALLBACK && INTERNAL_COPY.test(value)) return;
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      const clean = value.filter((item) => !INTERNAL_COPY.test(item));
      if (clean.length) merged[key] = clean;
      return;
    }
    merged[key] = value;
  });

  return merged;
}

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isPlaceholderNumber(digits) {
  return !digits || /0{6,}$/.test(digits);
}

/** Telefon/WhatsApp/e-posta bağlantılarını tek yerden üretir. */
export function getContact(settings = SITE_FALLBACK) {
  const rawPhoneDigits = onlyDigits(settings.phone);
  const phoneDisplay = isPlaceholderNumber(rawPhoneDigits) ? SITE_FALLBACK.phone : settings.phone;
  const phoneDigits = onlyDigits(phoneDisplay);

  const rawWhatsapp = onlyDigits(settings.whatsapp);
  const whatsappNumber = isPlaceholderNumber(rawWhatsapp) ? phoneDigits : rawWhatsapp;

  const email = settings.email || SITE_FALLBACK.email;

  return {
    phoneDisplay,
    phoneHref: `tel:+${phoneDigits}`,
    whatsappNumber,
    whatsappHref: (text = "Merhaba AKC Oto Kılıf, aracım için teklif almak istiyorum.") =>
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
    email,
    emailHref: `mailto:${email}`,
    address: settings.address || SITE_FALLBACK.address,
    workingHours: settings.workingHours || SITE_FALLBACK.workingHours,
    mapsUrl: settings.googleMapsUrl || SITE_FALLBACK.googleMapsUrl,
    instagram: settings.instagram || "",
  };
}
