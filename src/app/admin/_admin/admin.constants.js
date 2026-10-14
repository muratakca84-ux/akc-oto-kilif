import { SITE_FALLBACK } from "@/lib/site-config";
import { defaultThemeState } from "@/lib/theme";

export const PRODUCT_CATEGORIES = ["Binek Araç", "SUV", "Hafif Ticari", "Taksi", "Servis Aracı", "Filo Araçları"];

export const PRODUCT_MATERIALS = [
  "Deri görünümlü",
  "Kumaş + deri kombin",
  "Premium deri",
  "Spor dikiş",
  "Kolay temizlenebilir",
  "Filo tipi dayanıklı",
];

export const emptyProduct = {
  title: "",
  category: PRODUCT_CATEGORIES[0],
  material: PRODUCT_MATERIALS[0],
  priceAmount: "",
  discountPriceAmount: "",
  currency: "TRY",
  priceText: "Teklif alınız",
  showPrice: true,
  imageUrl: "",
  description: "",
  isActive: true,
  isFeatured: false,
  sortOrder: 10,
};

export const emptyGallery = {
  title: "",
  tag: "Montaj",
  imageUrl: "",
  isActive: true,
  sortOrder: 10,
};

export const defaultSettings = {
  ...SITE_FALLBACK,
  ...defaultThemeState,

  trackingEnabled: true,
  trackLocalhost: false,
  siteUrl: "https://akcotokilif.com",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  googleSiteVerification: "",
  facebookDomainVerification: "",
};

export const settingsLabels = {
  businessName: "İşletme adı",
  brandSubtitle: "Logo alt yazısı",
  heroEyebrow: "Üst etiket",
  heroTitle: "Ana başlık",
  heroSubtitle: "Açıklama",
  servicesEyebrow: "Hizmetler · etiket",
  servicesTitle: "Hizmetler · başlık",
  servicesText: "Hizmetler · açıklama",
  materialEyebrow: "Neden biz · etiket",
  materialTitle: "Neden biz · başlık",
  materialText: "Neden biz · açıklama",
  processEyebrow: "Süreç · etiket",
  processTitle: "Süreç · başlık",
  processText: "Süreç · açıklama",
  galleryEyebrow: "Galeri · etiket",
  galleryTitle: "Galeri · başlık",
  galleryText: "Galeri · açıklama",
  corporateEyebrow: "Güvence · etiket",
  corporateTitle: "Güvence · başlık",
  corporateText: "Güvence · açıklama",
  faqEyebrow: "SSS · etiket",
  faqTitle: "SSS · başlık",
  faqText: "SSS · açıklama",
  contactEyebrow: "İletişim · etiket",
  contactTitle: "İletişim · başlık",
  contactText: "İletişim · açıklama",
  footerTitle: "Alt bilgi başlığı",
  footerDescription: "Alt bilgi açıklaması",
  footerCopy: "Telif metni (boşsa otomatik)",
  phone: "Telefon",
  whatsapp: "WhatsApp numarası",
  email: "E-posta",
  address: "Adres",
  instagram: "Instagram bağlantısı",
  googleMapsUrl: "Google Haritalar bağlantısı",
  workingHours: "Çalışma saatleri",
  vehicleGroupsText: "Hizmet verilen araç grupları",
  advantagesText: "“Neden biz” maddeleri",
  processStepsText: "Çalışma süreci adımları",
};
