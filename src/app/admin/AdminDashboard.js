"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { buildThemePalette } from "@/lib/theme";

import AdminShell from "./_admin/AdminShell";
import OverviewTab from "./_admin/OverviewTab";
import ThemesTab from "./_admin/ThemesTab";
import HomepageTab from "./_admin/HomepageTab";
import ProductsTab from "./_admin/ProductsTab";
import GalleryTab from "./_admin/GalleryTab";
import LeadsTab from "./_admin/LeadsTab";

import {
  defaultSettings,
  emptyGallery,
  emptyProduct,
} from "./_admin/admin.constants";

import {
  buildDraft,
  cleanObjectForEdit,
  safeFileName,
  safeNumber,
  textToArray,
  textToFaqs,
} from "./_admin/admin.helpers";

function applyThemeToDocument(themeState = {}) {
  const palette = buildThemePalette(themeState);

  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.documentElement.dataset.theme = themeState.themePreset || "classic";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [authState, setAuthState] = useState("loading");
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [leads, setLeads] = useState([]);

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
    () => products.filter((product) => product.isActive !== false).length,
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

  const showToast = useCallback((text) => {
    setToast(text);
    window.clearTimeout(window.__akcToastTimer);
    window.__akcToastTimer = window.setTimeout(() => setToast(""), 3600);
  }, []);

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
    applyThemeToDocument(settingsDraft);
  }, [settingsDraft]);

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
  }, [router, showToast]);

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
        setProducts(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => showToast(error?.message || "Ürünler okunamadı.")
    );

    const unsubGallery = onSnapshot(
      galleryQuery,
      (snapshot) => {
        setGalleryItems(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => showToast(error?.message || "Galeri okunamadı.")
    );

    const unsubLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        setLeads(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => showToast(error?.message || "Talepler okunamadı.")
    );

    const unsubSettings = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        const nextSettings = snapshot.exists()
          ? { ...defaultSettings, ...snapshot.data() }
          : defaultSettings;

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
  }, [authState, showToast]);

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
      const finalImageUrl = uploadedUrl || String(productForm.imageUrl || "").trim();

      const payload = {
        ...productForm,
        title: String(productForm.title || "").trim(),
        category: String(productForm.category || "").trim(),
        material: String(productForm.material || "").trim(),
        priceAmount:
          productForm.priceAmount !== "" && productForm.priceAmount !== null
            ? Number(productForm.priceAmount)
            : null,
        discountPriceAmount:
          productForm.discountPriceAmount !== "" &&
          productForm.discountPriceAmount !== null
            ? Number(productForm.discountPriceAmount)
            : null,
        currency: productForm.currency || "TRY",
        priceText: String(productForm.priceText || "").trim(),
        showPrice: Boolean(productForm.showPrice),
        imageUrl: finalImageUrl,
        description: String(productForm.description || "").trim(),
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
      const finalImageUrl = uploadedUrl || String(galleryForm.imageUrl || "").trim();

      const payload = {
        ...galleryForm,
        title: String(galleryForm.title || "").trim(),
        tag: String(galleryForm.tag || "").trim(),
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
    const approved = window.confirm(
      "Bu galeri kartını kalıcı olarak silmek istiyor musun?"
    );

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

      const payload = {
        ...settingsDraft,
        brandLogoUrl: uploadedLogoUrl || settingsDraft.brandLogoUrl || "",
        heroImageUrl: uploadedHeroUrl || settingsDraft.heroImageUrl || "",
        showcaseImageUrl:
          uploadedShowcaseUrl || settingsDraft.showcaseImageUrl || "",
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

      showToast("Tema ve ana sayfa ayarları kaydedildi.");
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
        priceAmount: null,
        discountPriceAmount: null,
        currency: "TRY",
        priceText: "Teklif alınız",
        showPrice: true,
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
    ["themes", "Tema", 0],
    ["homepage", "Ana Sayfa", 0],
    ["products", "Ürünler", products.length],
    ["gallery", "Galeri", galleryItems.length],
    ["leads", "Talepler", openLeads],
  ];

  if (authState === "loading" || authState === "guest") {
    return (
      <main className="admin-loading">
        <div>
          <span className="admin-spinner" />
          <h1>AKC panel hazırlanıyor...</h1>
          <p>Yetki kontrolü yapılıyor.</p>
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
            Bu kullanıcı giriş yaptı ama Firestore <code>admins</code>{" "}
            koleksiyonunda aktif admin olarak tanımlı değil.
          </p>

          <button className="admin-primary-btn" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <AdminShell
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminProfile={adminProfile}
      handleLogout={handleLogout}
      toast={toast}
      seedDemoContent={seedDemoContent}
    >
      {activeTab === "overview" ? (
        <OverviewTab
          products={products}
          activeProducts={activeProducts}
          featuredProducts={featuredProducts}
          openLeads={openLeads}
          lastLead={lastLead}
        />
      ) : null}

      {activeTab === "themes" ? (
        <ThemesTab
          settingsDraft={settingsDraft}
          setSettingsDraft={setSettingsDraft}
          saveSettings={saveSettings}
          saving={saving}
        />
      ) : null}

      {activeTab === "homepage" ? (
        <HomepageTab
          settingsDraft={settingsDraft}
          setSettingsDraft={setSettingsDraft}
          saveSettings={saveSettings}
          saving={saving}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          heroFile={heroFile}
          setHeroFile={setHeroFile}
          showcaseFile={showcaseFile}
          setShowcaseFile={setShowcaseFile}
        />
      ) : null}

      {activeTab === "products" ? (
        <ProductsTab
          products={products}
          productForm={productForm}
          setProductForm={setProductForm}
          productFile={productFile}
          setProductFile={setProductFile}
          saveProduct={saveProduct}
          saving={saving}
          editingProductId={editingProductId}
          resetProductForm={resetProductForm}
          editProduct={editProduct}
          updateProduct={updateProduct}
          removeProduct={removeProduct}
        />
      ) : null}

      {activeTab === "gallery" ? (
        <GalleryTab
          galleryItems={galleryItems}
          galleryForm={galleryForm}
          setGalleryForm={setGalleryForm}
          galleryFile={galleryFile}
          setGalleryFile={setGalleryFile}
          saveGallery={saveGallery}
          saving={saving}
          editingGalleryId={editingGalleryId}
          resetGalleryForm={resetGalleryForm}
          editGallery={editGallery}
          updateGallery={updateGallery}
          removeGallery={removeGallery}
        />
      ) : null}

      {activeTab === "leads" ? (
        <LeadsTab
          leads={leads}
          updateLeadStatus={updateLeadStatus}
          removeLead={removeLead}
        />
      ) : null}
    </AdminShell>
  );
}