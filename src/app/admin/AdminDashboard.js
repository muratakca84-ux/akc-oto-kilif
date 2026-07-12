"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

const emptyProduct = {

  title: "",

  category: "Binek Araç",

  material: "Deri görünümlü",

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

const emptyGallery = {
  title: "",
  tag: "Montaj",
  imageUrl: "",
  isActive: true,
  sortOrder: 10,
};

const defaultSettings = {
  businessName: "AKC Oto Kılıf",
  brandSubtitle: "Özel dikim • Döşeme • Profesyonel montaj",

  heroEyebrow: "Araç iç mekânında net işçilik, premium duruş",
  heroTitle: "Aracınıza özel oto kılıf ve döşeme çözümleri.",
  heroHighlight: "AKC standardı.",
  heroSubtitle:
    "AKC Oto Kılıf; binek, SUV, hafif ticari, taksi, servis ve filo araçları için ölçülü, dayanıklı, şık ve profesyonel montajlı oto kılıf hizmeti sunar.",
  brandLogoUrl: "",
  heroImageUrl: "",
  showcaseImageUrl: "",
  qualityLabel: "Premium İç Mekân",
  qualityText: "Ölçülü dikim, net görünüm.",

  servicesEyebrow: "Hizmetler",
  servicesTitle: "Her araca aynı kılıf olmaz. İşin raconu uyumdur.",
  servicesText:
    "Koltuk formu, kullanım amacı, araç tipi ve müşteri beklentisi farklıysa çözüm de farklı olmalı.",

  materialEyebrow: "Malzeme ve görünüm",
  materialTitle: "Gündelik kullanıma dayanır, aracın havasını değiştirir.",
  materialText:
    "Oto kılıfta kalite sadece ilk bakışta değil, kullanım sürecinde anlaşılır.",

  processEyebrow: "Süreç",
  processTitle: "Tekliften montaja kadar net ilerleyen iş akışı.",
  processText:
    "Araç bilgisi alınır, beklenti anlaşılır, doğru malzeme seçilir ve uygulama planlanır.",

  galleryEyebrow: "Galeri",
  galleryTitle: "Panelden yüklenen işler burada kurumsal vitrine dönüşür.",
  galleryText:
    "Admin panelden galeri görseli yükledikçe bu alan otomatik güncellenir.",

  corporateEyebrow: "Kurumsal yapı",
  corporateTitle: "Site sadece vitrin değil, yönetilebilir bir iş altyapısıdır.",
  corporateText:
    "Müşteri tarafında güven veren kurumsal vitrin, işletme tarafında yönetilebilir dijital operasyon altyapısı.",

  quoteEyebrow: "AKC standardı",
  quoteTitle: "“Kılıf takıldı” değil, “araç yenilendi” dedirten işçilik.",
  quoteText:
    "Oto kılıfta farkı küçük detaylar belirler: dikiş çizgisi, köşe dönüşü, koltuğa oturuş, malzeme hissi ve montaj temizliği.",

  headerBannerText: "Profesyonel montaj, ölçülü kılıf, güçlü duruş.",
  footerTitle: "AKC Oto Kılıf",
  footerDescription:
    "Araç iç mekânında premium kalite, müşteri deneyiminde güven veren yaklaşım.",
  footerCopy: "© 2026 AKC Oto Kılıf. Tüm hakları saklıdır.",

  faqEyebrow: "Sık sorulanlar",
  faqTitle: "Müşterinin aklındaki ilk sorulara net cevap.",
  faqText:
    "Detaylı bilgi için WhatsApp üzerinden araç bilgisi göndererek hızlı teklif alınabilir.",

  contactEyebrow: "İletişim",
  contactTitle: "Aracınız için hızlı teklif alın.",
  contactText:
    "Marka, model, yıl ve istediğiniz malzeme tarzını gönderin. Fotoğraf varsa ekleyin; size en uygun çözüm ve fiyat için dönüş yapılsın.",

  phone: "+90 500 000 00 00",
  whatsapp: "905000000000",
  email: "info@akcotokilif.com",
  address: "Adres bilgisi eklenecek",
  instagram: "",
  googleMapsUrl: "",
  workingHours: "Hafta içi / Cumartesi",

  vehicleGroups: [
    "Binek Araç",
    "SUV",
    "Hafif Ticari",
    "Taksi",
    "Servis Aracı",
    "Filo Araçları",
  ],
  advantages: [
    "Model uyumlu ölçü mantığı",
    "Koltuğa oturan temiz görünüm",
    "Yoğun kullanıma uygun malzeme",
    "Kurumsal araçlar için filo çözümü",
    "WhatsApp üzerinden hızlı teklif",
    "Panelden yönetilebilir içerik altyapısı",
  ],
  processSteps: [
    "Araç marka, model ve yıl bilgisi alınır.",
    "Kullanım amacı ve malzeme beklentisi netleştirilir.",
    "Renk, dikiş ve tasarım seçenekleri belirlenir.",
    "Üretim ve profesyonel montaj süreci tamamlanır.",
  ],
  faqs: [
    {
      q: "Kılıflar araca özel mi hazırlanıyor?",
      a: "Evet. Hedef, universal kılıf gibi bol duran bir görüntü değil; koltuğa oturan, temiz ve profesyonel duran bir sonuçtur.",
    },
    {
      q: "Airbag uyumu önemli mi?",
      a: "Evet, çok önemli. Koltuk güvenlik yapısı dikkate alınarak uygulama yapılmalıdır.",
    },
    {
      q: "Ticari araçlara uygun üretim var mı?",
      a: "Evet. Taksi, servis, filo ve hafif ticari araçlar için yoğun kullanıma uygun çözümler hazırlanır.",
    },
  ],
};

const settingsLabels = {
  businessName: "İşletme adı",
  brandSubtitle: "Logo alt yazısı",
  heroEyebrow: "Hero küçük başlık",
  heroTitle: "Hero ana başlık",
  heroHighlight: "Hero vurgu yazısı",
  heroSubtitle: "Hero açıklama",
  brandLogoUrl: "Logo görsel URL",
  showcaseImageUrl: "Vitrin görsel URL",
  qualityLabel: "Hero kart etiketi",
  qualityText: "Hero kart yazısı",
  servicesEyebrow: "Hizmetler küçük başlık",
  servicesTitle: "Hizmetler başlık",
  servicesText: "Hizmetler açıklama",
  materialEyebrow: "Malzeme küçük başlık",
  materialTitle: "Malzeme başlık",
  materialText: "Malzeme açıklama",
  processEyebrow: "Süreç küçük başlık",
  processTitle: "Süreç başlık",
  processText: "Süreç açıklama",
  galleryEyebrow: "Galeri küçük başlık",
  galleryTitle: "Galeri başlık",
  galleryText: "Galeri açıklama",
  corporateEyebrow: "Kurumsal küçük başlık",
  corporateTitle: "Kurumsal başlık",
  corporateText: "Kurumsal açıklama",
  quoteEyebrow: "Standart küçük başlık",
  quoteTitle: "Standart başlık",
  quoteText: "Standart açıklama",
  faqEyebrow: "SSS küçük başlık",
  faqTitle: "SSS başlık",
  faqText: "SSS açıklama",
  contactEyebrow: "İletişim küçük başlık",
  contactTitle: "İletişim başlık",
  contactText: "İletişim açıklama",
  headerBannerText: "Üst başlık (header) metni",
  footerTitle: "Footer başlık",
  footerDescription: "Footer açıklama",
  footerCopy: "Footer telif hakkı metni",
  phone: "Telefon",
  whatsapp: "WhatsApp numarası",
  email: "E-posta",
  address: "Adres",
  instagram: "Instagram",
  googleMapsUrl: "Google Harita linki",
  workingHours: "Çalışma saatleri",
};

function arrayToText(value) {
  if (!Array.isArray(value)) return "";
  return value.join("\n");
}

function textToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function faqsToText(value) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => `${item.q || ""} | ${item.a || ""}`)
    .join("\n");
}

function textToFaqs(value) {
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

function buildDraft(settings) {
  return {
    ...defaultSettings,
    ...settings,
    vehicleGroupsText: arrayToText(settings.vehicleGroups || defaultSettings.vehicleGroups),
    advantagesText: arrayToText(settings.advantages || defaultSettings.advantages),
    processStepsText: arrayToText(settings.processSteps || defaultSettings.processSteps),
    faqsText: faqsToText(settings.faqs || defaultSettings.faqs),
  };
}

function formatDate(value) {
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

function safeNumber(value, fallback = 10) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
function formatPrice(value, currency = "TRY") {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
}

function getProductPricing(product) {
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
function cleanObjectForEdit(item, emptyShape) {
  const cleaned = { ...emptyShape };

  Object.keys(emptyShape).forEach((key) => {
    if (item[key] !== undefined && item[key] !== null) {
      cleaned[key] = item[key];
    }
  });

  return cleaned;
}

function safeFileName(fileName) {
  return String(fileName || "image")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function AdminDashboard() {
  const router = useRouter();

  const [authState, setAuthState] = useState("loading");
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [leads, setLeads] = useState([]);

  const [settings, setSettings] = useState(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState(buildDraft(defaultSettings));

  const [productForm, setProductForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);

  const [editingProductId, setEditingProductId] = useState("");
  const [editingGalleryId, setEditingGalleryId] = useState("");

  const [productFile, setProductFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [showcaseFile, setShowcaseFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products]
  );

  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured).length,
    [products]
  );

  const openLeads = useMemo(
    () => leads.filter((lead) => lead.status !== "done").length,
    [leads]
  );

  const lastLead = useMemo(() => leads[0], [leads]);

  function showToast(text) {
    setToast(text);
    window.clearTimeout(window.__akcToastTimer);
    window.__akcToastTimer = window.setTimeout(() => setToast(""), 3600);
  }

  async function uploadImageFile(file, folder) {
    if (!file) return "";

    if (!file.type.startsWith("image/")) {
      throw new Error("Sadece görsel dosyası yükleyebilirsin.");
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Görsel boyutu 8 MB altında olmalı.");
    }

    const fileRef = ref(
      storage,
      `public/${folder}/${Date.now()}-${safeFileName(file.name)}`
    );

    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState("guest");
        router.replace("/login");
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));

        if (!adminSnap.exists()) {
          setAuthState("blocked");
          return;
        }

        const adminData = adminSnap.data();

        if (adminData?.isActive === false) {
          setAuthState("blocked");
          return;
        }

        setAdminProfile({
          uid: user.uid,
          email: user.email,
          ...adminData,
        });

        setAuthState("admin");
      } catch (error) {
        setAuthState("blocked");
        showToast(error?.message || "Admin yetkisi kontrol edilemedi.");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authState !== "admin") return undefined;

    const productQuery = query(
      collection(db, "products"),
      orderBy("sortOrder", "asc"),
      limit(150)
    );

    const galleryQuery = query(
      collection(db, "gallery"),
      orderBy("sortOrder", "asc"),
      limit(150)
    );

    const leadsQuery = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc"),
      limit(80)
    );

    const unsubProducts = onSnapshot(
      productQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => showToast(error?.message || "Ürünler okunamadı.")
    );

    const unsubGallery = onSnapshot(
      galleryQuery,
      (snapshot) => {
        setGalleryItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => showToast(error?.message || "Galeri okunamadı.")
    );

    const unsubLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => showToast(error?.message || "Talepler okunamadı.")
    );

    const unsubSettings = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        const nextSettings = snapshot.exists()
          ? { ...defaultSettings, ...snapshot.data() }
          : defaultSettings;

        setSettings(nextSettings);
        setSettingsDraft(buildDraft(nextSettings));
      },
      (error) => showToast(error?.message || "Site ayarları okunamadı.")
    );

    return () => {
      unsubProducts();
      unsubGallery();
      unsubLeads();
      unsubSettings();
    };
  }, [authState]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  function resetProductForm() {
    setEditingProductId("");
    setProductForm(emptyProduct);
    setProductFile(null);
  }

  function resetGalleryForm() {
    setEditingGalleryId("");
    setGalleryForm(emptyGallery);
    setGalleryFile(null);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const uploadedUrl = await uploadImageFile(productFile, "products");
      const finalImageUrl = uploadedUrl || productForm.imageUrl.trim();

      const payload = {
  ...productForm,
  title: productForm.title.trim(),
  category: productForm.category.trim(),
  material: productForm.material.trim(),
  priceAmount: productForm.priceAmount ? Number(productForm.priceAmount) : null,
  discountPriceAmount: productForm.discountPriceAmount
    ? Number(productForm.discountPriceAmount)
    : null,
  currency: productForm.currency || "TRY",
  priceText: productForm.priceText.trim(),
  showPrice: Boolean(productForm.showPrice),
  imageUrl: finalImageUrl,
        description: productForm.description.trim(),
        sortOrder: safeNumber(productForm.sortOrder, 10),
        isActive: Boolean(productForm.isActive),
        isFeatured: Boolean(productForm.isFeatured),
        updatedAt: serverTimestamp(),
      };

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), payload);
        showToast("Ürün başarıyla güncellendi.");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        showToast("Ürün başarıyla eklendi.");
      }

      resetProductForm();
    } catch (error) {
      showToast(error?.message || "Ürün kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product) {
    setActiveTab("products");
    setEditingProductId(product.id);
    setProductForm(cleanObjectForEdit(product, emptyProduct));
    setProductFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateProduct(id, patch) {
    try {
      await updateDoc(doc(db, "products", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      showToast("Ürün güncellendi.");
    } catch (error) {
      showToast(error?.message || "Ürün güncellenemedi.");
    }
  }

  async function removeProduct(id) {
    const approved = window.confirm("Bu ürünü kalıcı olarak silmek istiyor musun?");
    if (!approved) return;

    try {
      await deleteDoc(doc(db, "products", id));
      showToast("Ürün silindi.");
    } catch (error) {
      showToast(error?.message || "Ürün silinemedi.");
    }
  }

  async function saveGallery(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const uploadedUrl = await uploadImageFile(galleryFile, "gallery");
      const finalImageUrl = uploadedUrl || galleryForm.imageUrl.trim();

      const payload = {
        ...galleryForm,
        title: galleryForm.title.trim(),
        tag: galleryForm.tag.trim(),
        imageUrl: finalImageUrl,
        sortOrder: safeNumber(galleryForm.sortOrder, 10),
        isActive: Boolean(galleryForm.isActive),
        updatedAt: serverTimestamp(),
      };

      if (editingGalleryId) {
        await updateDoc(doc(db, "gallery", editingGalleryId), payload);
        showToast("Galeri kartı güncellendi.");
      } else {
        await addDoc(collection(db, "gallery"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        showToast("Galeri kartı eklendi.");
      }

      resetGalleryForm();
    } catch (error) {
      showToast(error?.message || "Galeri kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function editGallery(item) {
    setActiveTab("gallery");
    setEditingGalleryId(item.id);
    setGalleryForm(cleanObjectForEdit(item, emptyGallery));
    setGalleryFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateGallery(id, patch) {
    try {
      await updateDoc(doc(db, "gallery", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      showToast("Galeri güncellendi.");
    } catch (error) {
      showToast(error?.message || "Galeri güncellenemedi.");
    }
  }

  async function removeGallery(id) {
    const approved = window.confirm("Bu galeri kartını kalıcı olarak silmek istiyor musun?");
    if (!approved) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      showToast("Galeri kartı silindi.");
    } catch (error) {
      showToast(error?.message || "Galeri kartı silinemedi.");
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const uploadedLogoUrl = await uploadImageFile(logoFile, "site");
      const uploadedHeroUrl = await uploadImageFile(heroFile, "site");
      const uploadedShowcaseUrl = await uploadImageFile(showcaseFile, "site");
      const finalBrandLogoUrl = uploadedLogoUrl || settingsDraft.brandLogoUrl || "";
      const finalHeroImageUrl = uploadedHeroUrl || settingsDraft.heroImageUrl || "";
      const finalShowcaseImageUrl = uploadedShowcaseUrl || settingsDraft.showcaseImageUrl || "";

      const payload = {
        ...settingsDraft,
        brandLogoUrl: finalBrandLogoUrl,
        heroImageUrl: finalHeroImageUrl,
        showcaseImageUrl: finalShowcaseImageUrl,
        vehicleGroups: textToArray(settingsDraft.vehicleGroupsText),
        advantages: textToArray(settingsDraft.advantagesText),
        processSteps: textToArray(settingsDraft.processStepsText),
        faqs: textToFaqs(settingsDraft.faqsText),
        updatedAt: serverTimestamp(),
      };

      delete payload.vehicleGroupsText;
      delete payload.advantagesText;
      delete payload.processStepsText;
      delete payload.faqsText;

      await setDoc(doc(db, "settings", "site"), payload, { merge: true });

      setLogoFile(null);
      setHeroFile(null);
      setShowcaseFile(null);
      showToast("Ana sayfa ve site ayarları kaydedildi.");
    } catch (error) {
      showToast(error?.message || "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function updateLeadStatus(id, status) {
    try {
      await updateDoc(doc(db, "leads", id), {
        status,
        updatedAt: serverTimestamp(),
      });

      showToast("Talep durumu güncellendi.");
    } catch (error) {
      showToast(error?.message || "Talep güncellenemedi.");
    }
  }

  async function removeLead(id) {
    const approved = window.confirm("Bu müşteri talebini silmek istiyor musun?");
    if (!approved) return;

    try {
      await deleteDoc(doc(db, "leads", id));
      showToast("Talep silindi.");
    } catch (error) {
      showToast(error?.message || "Talep silinemedi.");
    }
  }

  async function seedDemoContent() {
    const approved = window.confirm("Örnek ürün ve galeri kartları eklensin mi?");
    if (!approved) return;

    setSaving(true);

    try {
      await addDoc(collection(db, "products"), {
        title: "Premium Deri Görünümlü Oto Kılıf",
        category: "Binek Araç",
        material: "Deri görünümlü",
        priceText: "Teklif alınız",
        imageUrl: "",
        description:
          "Model uyumlu kesim, premium görünüm ve kolay temizlenebilir yüzey yapısıyla günlük kullanıma uygun oto kılıf çözümü.",
        isActive: true,
        isFeatured: true,
        sortOrder: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "gallery"), {
        title: "Spor dikiş detaylı uygulama",
        tag: "Detay",
        imageUrl: "",
        isActive: true,
        sortOrder: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "settings", "site"),
        {
          ...defaultSettings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      showToast("Örnek içerikler eklendi.");
    } catch (error) {
      showToast(error?.message || "Örnek içerikler eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    ["overview", "Özet", openLeads],
    ["homepage", "Ana Sayfa", 0],
    ["products", "Ürünler", products.length],
    ["gallery", "Galeri", galleryItems.length],
    ["leads", "Talepler", openLeads],
  ];

  if (authState === "loading") {
    return (
      <main className="admin-loading">
        <div>
          <span className="admin-spinner" />
          <h1>AKC panel hazırlanıyor...</h1>
          <p>Yetki kontrolü yapılıyor. Bir saniye, kapıdaki görevli listeye bakıyor.</p>
        </div>
      </main>
    );
  }

  if (authState === "blocked") {
    return (
      <main className="admin-loading">
        <div>
          <h1>Yetki yok.</h1>
          <p>
            Bu kullanıcı giriş yaptı ama Firestore <code>admins</code> koleksiyonunda
            aktif admin olarak tanımlı değil.
          </p>
          <button className="admin-primary-btn" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">
          <span>AKC</span>
          <strong>Admin Panel</strong>
        </Link>

        <nav className="admin-tabs" aria-label="Admin menü">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              <span>{label}</span>
              {count ? <em>{count}</em> : null}
            </button>
          ))}
        </nav>

        <div className="admin-user">
          <small>Giriş yapan</small>
          <strong>{adminProfile?.email}</strong>
          <span>{adminProfile?.role || "admin"}</span>
          <button type="button" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">AKC Oto Kılıf</p>
            <h1>Yönetim merkezi</h1>
            <span>Görseller, ana sayfa, ürünler, galeri ve müşteri talepleri tek panelde.</span>
          </div>

          <div className="topbar-actions">
            <button className="admin-secondary-btn" type="button" onClick={seedDemoContent}>
              Örnek içerik ekle
            </button>
            <Link className="admin-primary-btn" href="/" target="_blank">
              Siteyi görüntüle
            </Link>
          </div>
        </header>

        {toast ? <div className="admin-toast">{toast}</div> : null}

        {activeTab === "overview" ? (
          <section className="admin-grid">
            <article className="admin-stat">
              <span>Aktif ürün</span>
              <strong>{activeProducts}</strong>
              <p>{products.length} toplam ürün / hizmet kartı</p>
            </article>

            <article className="admin-stat">
              <span>Öne çıkan</span>
              <strong>{featuredProducts}</strong>
              <p>Ana vitrinde öne çıkarılabilecek kartlar</p>
            </article>

            <article className="admin-stat">
              <span>Açık talep</span>
              <strong>{openLeads}</strong>
              <p>Dönüş bekleyen müşteri talebi</p>
            </article>

            <article className="admin-panel wide">
              <div className="panel-head">
                <div>
                  <h2>Panel durumu</h2>
                  <p>Bu panelden ana sayfanın neredeyse tamamı yönetilir.</p>
                </div>
              </div>

              <div className="checklist">
                <p>✅ Ana sayfa metinleri <code>Ana Sayfa</code> sekmesinden düzenlenir</p>
                <p>✅ Hero görseli <code>Ana Sayfa</code> sekmesinden yüklenir</p>
                <p>✅ Hizmet / ürün görselleri <code>Ürünler</code> sekmesinden yüklenir</p>
                <p>✅ Galeri görselleri <code>Galeri</code> sekmesinden yüklenir</p>
                <p>✅ Telefon, WhatsApp, adres, çalışma saatleri panelden güncellenir</p>
              </div>
            </article>

            <article className="admin-panel wide">
              <div className="panel-head">
                <div>
                  <h2>Son müşteri talebi</h2>
                  <p>En yeni talep hızlı takip için burada görünür.</p>
                </div>
              </div>

              {lastLead ? (
                <div className="lead-preview">
                  <small>{lastLead.status || "new"} • {formatDate(lastLead.createdAt)}</small>
                  <h3>{lastLead.name || "İsimsiz müşteri"}</h3>
                  <p>{lastLead.message || "Mesaj yok."}</p>
                  <strong>{lastLead.phone || lastLead.email || "İletişim bilgisi yok"}</strong>
                </div>
              ) : (
                <div className="empty-state">Henüz müşteri talebi yok.</div>
              )}
            </article>
          </section>
        ) : null}

        {activeTab === "homepage" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>Ana Sayfa Yönetimi</h2>
                <p>Hero, bölümler, iletişim, süreç, avantajlar ve SSS alanlarını buradan yönet.</p>
              </div>
            </div>

            <form className="homepage-editor" onSubmit={saveSettings}>
              <div className="settings-block">
                <h3>Marka ve Hero</h3>

                <div className="settings-form">
                  {[
                    "businessName",
                    "brandSubtitle",
                    "heroEyebrow",
                    "heroTitle",
                    "heroHighlight",
                    "heroSubtitle",
                    "qualityLabel",
                    "qualityText",
                  ].map((key) => (
                    <label key={key}>
                      {settingsLabels[key]}
                      {key === "heroSubtitle" ? (
                        <textarea
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      ) : (
                        <input
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      )}
                    </label>
                  ))}

                  <div className="media-upload-grid">
                    <article className="media-upload-card">
                      <div className="media-upload-copy">
                        <h4>Logo görseli</h4>
                        <p>Üst menüde görünecek logo.</p>
                      </div>

                      <label>
                        Logo görsel URL
                        <input
                          value={settingsDraft.brandLogoUrl || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, brandLogoUrl: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </label>

                      <label className="file-input">
                        <span>Logo görsel seç</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                        />
                        <em>{logoFile?.name || "Logo için dosya seç"}</em>
                      </label>
                    </article>

                    <article className="media-upload-card">
                      <div className="media-upload-copy">
                        <h4>Hero görseli</h4>
                        <p>Ana sayfa hero alanında görünecek görsel.</p>
                      </div>

                      <label>
                        Hero görsel URL
                        <input
                          value={settingsDraft.heroImageUrl || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, heroImageUrl: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </label>

                      <label className="file-input">
                        <span>Hero görsel seç</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setHeroFile(event.target.files?.[0] || null)}
                        />
                        <em>{heroFile?.name || "Hero görseli seç"}</em>
                      </label>
                    </article>

                    <article className="media-upload-card">
                      <div className="media-upload-copy">
                        <h4>Vitrin / ek görsel</h4>
                        <p>Ana sayfada ekstra premium görsel alanı.</p>
                      </div>

                      <label>
                        Vitrin / ek görsel URL
                        <input
                          value={settingsDraft.showcaseImageUrl || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, showcaseImageUrl: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </label>

                      <label className="file-input">
                        <span>Vitrin görsel seç</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setShowcaseFile(event.target.files?.[0] || null)}
                        />
                        <em>{showcaseFile?.name || "Vitrin görseli seç"}</em>
                      </label>
                    </article>
                  </div>

                  <p className="media-upload-help">
                    Görsel seçtikten sonra aşağıdaki “Ana sayfayı kaydet” butonuna basarak yükleme işlemini tamamlayın.
                  </p>
                </div>

                {settingsDraft.brandLogoUrl ? (
                  <div className="preview-frame">
                    <img src={settingsDraft.brandLogoUrl} alt="Logo önizleme" />
                  </div>
                ) : null}

                {settingsDraft.heroImageUrl ? (
                  <div className="preview-frame">
                    <img src={settingsDraft.heroImageUrl} alt="Hero görsel önizleme" />
                  </div>
                ) : null}

                {settingsDraft.showcaseImageUrl ? (
                  <div className="preview-frame">
                    <img src={settingsDraft.showcaseImageUrl} alt="Vitrin görsel önizleme" />
                  </div>
                ) : null}
              </div>

              <div className="settings-block">
                <h3>Bölüm Başlıkları</h3>

                <div className="settings-form">
                  {[
                    "servicesEyebrow",
                    "servicesTitle",
                    "servicesText",
                    "materialEyebrow",
                    "materialTitle",
                    "materialText",
                    "processEyebrow",
                    "processTitle",
                    "processText",
                    "galleryEyebrow",
                    "galleryTitle",
                    "galleryText",
                    "corporateEyebrow",
                    "corporateTitle",
                    "corporateText",
                    "quoteEyebrow",
                    "quoteTitle",
                    "quoteText",
                    "faqEyebrow",
                    "faqTitle",
                    "faqText",
                    "contactEyebrow",
                    "contactTitle",
                    "contactText",
                  ].map((key) => (
                    <label key={key}>
                      {settingsLabels[key]}
                      {key.endsWith("Text") ? (
                        <textarea
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      ) : (
                        <input
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-block">
                <h3>Liste Alanları</h3>

                <div className="settings-form">
                  <label>
                    Araç grupları — her satır bir madde
                    <textarea
                      value={settingsDraft.vehicleGroupsText || ""}
                      onChange={(event) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          vehicleGroupsText: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Avantajlar — her satır bir madde
                    <textarea
                      value={settingsDraft.advantagesText || ""}
                      onChange={(event) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          advantagesText: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Süreç adımları — her satır bir madde
                    <textarea
                      value={settingsDraft.processStepsText || ""}
                      onChange={(event) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          processStepsText: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    SSS — format: Soru | Cevap
                    <textarea
                      value={settingsDraft.faqsText || ""}
                      onChange={(event) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          faqsText: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="settings-block">
                <h3>İletişim Bilgileri</h3>

                <div className="settings-form">
                  {["phone", "whatsapp", "email", "address", "instagram", "googleMapsUrl", "workingHours"].map(
                    (key) => (
                      <label key={key}>
                        {settingsLabels[key]}
                        {key === "address" ? (
                          <textarea
                            value={settingsDraft[key] || ""}
                            onChange={(event) =>
                              setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                            }
                          />
                        ) : (
                          <input
                            value={settingsDraft[key] || ""}
                            onChange={(event) =>
                              setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                            }
                          />
                        )}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="settings-block">
                <h3>Header ve Footer</h3>

                <div className="settings-form">
                  {[
                    "headerBannerText",
                    "footerTitle",
                    "footerDescription",
                    "footerCopy",
                  ].map((key) => (
                    <label key={key}>
                      {settingsLabels[key]}
                      {key === "footerDescription" ? (
                        <textarea
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      ) : (
                        <input
                          value={settingsDraft[key] || ""}
                          onChange={(event) =>
                            setSettingsDraft({ ...settingsDraft, [key]: event.target.value })
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving ? "Ana sayfa kaydediliyor..." : "Ana sayfayı kaydet"}
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>{editingProductId ? "Ürünü düzenle" : "Ürün / Hizmet Kartları"}</h2>
                <p>Ana sayfadaki hizmet ve ürün vitrini buradan yönetilir.</p>
              </div>

              {editingProductId ? (
                <button className="admin-secondary-btn" type="button" onClick={resetProductForm}>
                  Düzenlemeyi iptal et
                </button>
              ) : null}
            </div>

            <form className="admin-form-grid" onSubmit={saveProduct}>
              <input
                placeholder="Başlık"
                value={productForm.title}
                onChange={(event) => setProductForm({ ...productForm, title: event.target.value })}
                required
              />

              <input
                placeholder="Kategori"
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              />

              <input
                placeholder="Malzeme"
                value={productForm.material}
                onChange={(event) => setProductForm({ ...productForm, material: event.target.value })}
              />
<input
  type="number"
  min="0"
  placeholder="Fiyat ₺"
  value={productForm.priceAmount ?? ""}
  onChange={(event) =>
    setProductForm({ ...productForm, priceAmount: event.target.value })
  }
/>

<input
  type="number"
  min="0"
  placeholder="İndirimli fiyat ₺"
  value={productForm.discountPriceAmount ?? ""}
  onChange={(event) =>
    setProductForm({ ...productForm, discountPriceAmount: event.target.value })
  }
/>

<select
  value={productForm.currency}
  onChange={(event) =>
    setProductForm({ ...productForm, currency: event.target.value })
  }
>
  <option value="TRY">TRY</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
</select>
              <input
                placeholder="Fiyat metni"
                value={productForm.priceText}
                onChange={(event) => setProductForm({ ...productForm, priceText: event.target.value })}
              />

              <input
                type="number"
                placeholder="Sıralama"
                value={productForm.sortOrder}
                onChange={(event) => setProductForm({ ...productForm, sortOrder: event.target.value })}
              />

              <input
                className="span-2"
                placeholder="Görsel URL"
                value={productForm.imageUrl}
                onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
              />

              <label className="file-input span-2">
                <span>Ürün görseli yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProductFile(event.target.files?.[0] || null)}
                />
                <em>{productFile?.name || "Dosya seçilmedi"}</em>
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(event) =>
                    setProductForm({ ...productForm, isActive: event.target.checked })
                  }
                />
                Yayında
              </label>
<label className="admin-check">
  <input
    type="checkbox"
    checked={productForm.showPrice}
    onChange={(event) =>
      setProductForm({ ...productForm, showPrice: event.target.checked })
    }
  />
  Fiyatı göster
</label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(event) =>
                    setProductForm({ ...productForm, isFeatured: event.target.checked })
                  }
                />
                Öne çıkar
              </label>

              <textarea
                placeholder="Açıklama"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({ ...productForm, description: event.target.value })
                }
                required
              />

              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving
                  ? "Kaydediliyor..."
                  : editingProductId
                    ? "Ürünü güncelle"
                    : "Ürün ekle"}
              </button>
            </form>

            <div className="admin-list">
              {products.length === 0 ? (
                <div className="empty-state">Henüz ürün yok. İlk kartı yukarıdan ekleyebilirsin.</div>
              ) : null}

              {products.map((product) => (
                <article className="admin-list-item" key={product.id}>
                  <div className="item-main">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : null}

                    <div>
                      <small>
                        {product.category} • {product.material} • Sıra {product.sortOrder || 0}
                      </small>
                      <h3>{product.title || "Başlıksız ürün"}</h3>
                      <p>{product.description}</p>
                     {(() => {
  const price = getProductPricing(product);

  return (
    <div className="price-preview">
      {price.oldText ? <del>{price.oldText}</del> : null}

      <strong>{price.finalText}</strong>

      {price.note ? <small>{price.note}</small> : null}
    </div>
  );
})()}
                      <div className="mini-badges">
                        <span>{product.isActive ? "Yayında" : "Pasif"}</span>
                        {product.isFeatured ? <span>Öne çıkan</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button type="button" onClick={() => editProduct(product)}>
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                    >
                      {product.isActive ? "Yayından al" : "Yayına al"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProduct(product.id, { isFeatured: !product.isFeatured })
                      }
                    >
                      {product.isFeatured ? "Öne çıkarma" : "Öne çıkar"}
                    </button>
                    <button type="button" onClick={() => removeProduct(product.id)}>
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "gallery" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>{editingGalleryId ? "Galeri kartını düzenle" : "Galeri"}</h2>
                <p>Ana sayfa galeri vitrinine görsel yükle.</p>
              </div>

              {editingGalleryId ? (
                <button className="admin-secondary-btn" type="button" onClick={resetGalleryForm}>
                  Düzenlemeyi iptal et
                </button>
              ) : null}
            </div>

            <form className="admin-form-grid" onSubmit={saveGallery}>
              <input
                placeholder="Başlık"
                value={galleryForm.title}
                onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })}
                required
              />

              <input
                placeholder="Etiket"
                value={galleryForm.tag}
                onChange={(event) => setGalleryForm({ ...galleryForm, tag: event.target.value })}
              />

              <input
                type="number"
                placeholder="Sıralama"
                value={galleryForm.sortOrder}
                onChange={(event) => setGalleryForm({ ...galleryForm, sortOrder: event.target.value })}
              />

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={galleryForm.isActive}
                  onChange={(event) =>
                    setGalleryForm({ ...galleryForm, isActive: event.target.checked })
                  }
                />
                Yayında
              </label>

              <input
                className="span-2"
                placeholder="Görsel URL"
                value={galleryForm.imageUrl}
                onChange={(event) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })}
              />

              <label className="file-input span-2">
                <span>Galeri görseli yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setGalleryFile(event.target.files?.[0] || null)}
                />
                <em>{galleryFile?.name || "Dosya seçilmedi"}</em>
              </label>

              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving
                  ? "Kaydediliyor..."
                  : editingGalleryId
                    ? "Galeri kartını güncelle"
                    : "Galeri kartı ekle"}
              </button>
            </form>

            <div className="gallery-admin-grid">
              {galleryItems.length === 0 ? (
                <div className="empty-state">Henüz galeri kartı yok.</div>
              ) : null}

              {galleryItems.map((item) => (
                <article className="gallery-admin-card" key={item.id}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div />}
                  <small>{item.tag} • Sıra {item.sortOrder || 0}</small>
                  <h3>{item.title}</h3>
                  <div className="mini-badges">
                    <span>{item.isActive ? "Yayında" : "Pasif"}</span>
                  </div>
                  <div className="gallery-actions">
                    <button type="button" onClick={() => editGallery(item)}>
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGallery(item.id, { isActive: !item.isActive })}
                    >
                      {item.isActive ? "Pasife al" : "Yayına al"}
                    </button>
                    <button type="button" onClick={() => removeGallery(item.id)}>
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "leads" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>Müşteri Talepleri</h2>
                <p>İletişim formu bağlanınca gelen talepler burada yönetilir.</p>
              </div>
            </div>

            <div className="admin-list">
              {leads.length === 0 ? (
                <div className="empty-state">
                  Henüz talep yok. Form bağlanınca burası dolar.
                </div>
              ) : null}

              {leads.map((lead) => (
                <article className="admin-list-item" key={lead.id}>
                  <div>
                    <small>{lead.status || "new"} • {formatDate(lead.createdAt)}</small>
                    <h3>{lead.name || "İsimsiz müşteri"}</h3>
                    <p>{lead.message || "Mesaj yok."}</p>
                    <strong>{lead.phone || lead.email || "İletişim bilgisi yok"}</strong>
                  </div>

                  <div className="item-actions">
                    <button type="button" onClick={() => updateLeadStatus(lead.id, "new")}>
                      Yeni
                    </button>
                    <button type="button" onClick={() => updateLeadStatus(lead.id, "contacted")}>
                      Arandı
                    </button>
                    <button type="button" onClick={() => updateLeadStatus(lead.id, "done")}>
                      Tamam
                    </button>
                    <button type="button" onClick={() => removeLead(lead.id)}>
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}