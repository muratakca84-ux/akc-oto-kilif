export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://akcotokilif.com").replace(/\/$/, "");

export const BUSINESS = {
  name: "AKC Oto Kılıf",
  phone: "+90 501 586 42 84",
  whatsapp: "905015864284",
  address: "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya",
  locality: "Karatay",
  region: "Konya",
  postalCode: "42030",
};

export const SERVICE_PAGES = [
  {
    slug: "konya-oto-kilif",
    title: "Konya Oto Kılıf",
    seoTitle: "Konya Oto Kılıf | Araca Özel Dikim ve Montaj",
    description: "Konya'da araca özel oto kılıf, model uyumlu ölçü, premium malzeme ve profesyonel montaj. AKC Oto Kılıf'tan hızlı teklif alın.",
    eyebrow: "Konya'da araca özel uygulama",
    heading: "Konya oto kılıf uygulamasında ölçülü dikim ve temiz montaj",
    intro: "AKC Oto Kılıf, aracın marka, model, yıl ve koltuk yapısını değerlendirerek Konya'da araca özel kılıf çözümleri hazırlar. Amaç yalnızca koltuğu korumak değil; koltuğa oturan, düzenli ve aracın iç mekânıyla bütünleşen bir sonuç üretmektir.",
    benefits: ["Marka ve modele göre uyum kontrolü", "Renk, dikiş ve malzeme seçeneği", "Karatay'da profesyonel montaj", "Binek, SUV ve ticari araç çözümleri"],
    image: "/images/hero-premium-seat-covers.jpg",
  },
  {
    slug: "araca-ozel-oto-kilif",
    title: "Araca Özel Oto Kılıf",
    seoTitle: "Araca Özel Oto Kılıf | Model Uyumlu Üretim",
    description: "Aracınızın koltuk yapısına göre özel dikim oto kılıf seçenekleri. Malzeme seçimi, ölçülü üretim ve Konya'da profesyonel montaj.",
    eyebrow: "Model uyumlu üretim",
    heading: "Araca özel oto kılıf ile fabrika çıkışına yakın görünüm",
    intro: "Universal ürünlerde görülen potluk ve kayma sorunlarını azaltmak için koltuk formu, başlıklar, kolçaklar ve kullanım detayları uygulama öncesinde kontrol edilir. Seçilen tasarım aracın iç rengine ve kullanım yoğunluğuna göre planlanır.",
    benefits: ["Koltuk formuna uygun ölçülendirme", "Başlık ve kolçak detaylarının kontrolü", "Yoğun kullanıma uygun yüzey seçenekleri", "Düzenli dikiş ve gergin görünüm"],
    image: "/images/seat-stitch-detail.jpg",
  },
  {
    slug: "oto-koltuk-doseme",
    title: "Oto Koltuk Döşeme",
    seoTitle: "Konya Oto Koltuk Döşeme ve Yenileme",
    description: "Konya oto koltuk döşeme, yıpranmış koltuk yenileme ve araç içi döşeme çözümleri. Uygun malzeme ve temiz işçilik için bilgi alın.",
    eyebrow: "Araç içi yenileme",
    heading: "Oto koltuk döşeme ve yıpranmış yüzey yenileme",
    intro: "Yıpranma, çatlama veya görünüm değişikliği ihtiyacında koltukların mevcut durumu incelenir. Kullanım biçimine uygun malzeme, renk ve dikiş kombinasyonu belirlenerek araç iç mekânında dengeli bir yenileme hedeflenir.",
    benefits: ["Mevcut döşeme durumunun incelenmesi", "Deri ve kumaş alternatifleri", "Renk ve dikiş kombinasyonu", "Binek ve ticari araç uygulamaları"],
    image: "/images/suv-seat-cover-installation.jpg",
  },
  {
    slug: "ticari-arac-koltuk-kilifi",
    title: "Ticari Araç Koltuk Kılıfı",
    seoTitle: "Ticari Araç Koltuk Kılıfı | Konya",
    description: "Taksi, servis, hafif ticari ve filo araçları için dayanıklı koltuk kılıfı. Konya'da ölçülü üretim ve profesyonel montaj.",
    eyebrow: "Yoğun kullanıma dayanıklı",
    heading: "Ticari araç ve filo için dayanıklı koltuk kılıfı",
    intro: "Taksi, servis, hafif ticari ve filo araçlarında kolay bakım, dayanıklılık ve araçlar arasında tutarlı görünüm önceliklidir. Araç adedi ve kullanım planına göre malzeme ve uygulama süreci netleştirilir.",
    benefits: ["Yoğun kullanıma uygun malzeme", "Kolay temizlenebilir yüzey seçimi", "Filo araçlarında tutarlı tasarım", "Planlı üretim ve montaj süreci"],
    image: "/images/suv-seat-cover-installation.jpg",
  },
];

export function absoluteUrl(path = "") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
