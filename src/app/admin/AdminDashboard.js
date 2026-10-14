"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

import AdminShell, { ADMIN_TABS } from "./_admin/AdminShell";
import OverviewTab from "./_admin/OverviewTab";
import ThemesTab from "./_admin/ThemesTab";
import HomepageTab from "./_admin/HomepageTab";
import ProductsTab from "./_admin/ProductsTab";
import GalleryTab from "./_admin/GalleryTab";
import LeadsTab from "./_admin/LeadsTab";
import AnalyticsTab from "./_admin/AnalyticsTab";

import { compressImage } from "./_admin/compress-image";
import { defaultSettings, emptyGallery, emptyProduct } from "./_admin/admin.constants";
import {
  buildDraft,
  cleanObjectForEdit,
  safeFileName,
  safeNumber,
  textToArray,
  textToFaqs,
} from "./_admin/admin.helpers";

const TAB_KEYS = ADMIN_TABS.map((tab) => tab.key);
const MAX_UPLOAD = 20 * 1024 * 1024;

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [authState, setAuthState] = useState("loading");
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTabState] = useState("overview");

  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [leads, setLeads] = useState([]);

  const [settingsDraft, setSettingsDraft] = useState(() => buildDraft(defaultSettings));
  const [settingsDirty, setSettingsDirty] = useState(false);
  const dirtyRef = useRef(false);

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
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(0);

  const showToast = useCallback((text, tone = "success") => {
    setToast({ text, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const showError = useCallback((error, fallback) => showToast(error?.message || fallback, "error"), [showToast]);

  /* ---------- Sekme ↔ URL hash ---------- */

  const setActiveTab = useCallback((key) => {
    if (!TAB_KEYS.includes(key)) return;
    setActiveTabState(key);
    if (window.location.hash !== `#${key}`) {
      window.history.replaceState(null, "", `#${key}`);
    }
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    function syncFromHash() {
      const key = window.location.hash.replace("#", "");
      if (TAB_KEYS.includes(key)) setActiveTabState(key);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  /* ---------- Ayar taslağı ---------- */

  const updateSettings = useCallback((updater) => {
    dirtyRef.current = true;
    setSettingsDirty(true);
    setSettingsDraft((current) => (typeof updater === "function" ? updater(current) : updater));
  }, []);

  useEffect(() => {
    if (!settingsDirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [settingsDirty]);

  /* ---------- Yetki ---------- */

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState("guest");
        router.replace("/login");
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));
        const adminData = adminSnap.exists() ? adminSnap.data() : null;

        if (!adminData || adminData.isActive === false) {
          setAuthState("blocked");
          return;
        }

        setAdminProfile({ uid: user.uid, email: user.email, ...adminData });
        setAuthState("admin");
      } catch {
        setAuthState("blocked");
      }
    });
  }, [router]);

  /* ---------- Veriler ---------- */

  useEffect(() => {
    if (authState !== "admin") return undefined;

    const listen = (q, setter, label) =>
      onSnapshot(
        q,
        (snapshot) => setter(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        (error) => showError(error, `${label} okunamadı.`)
      );

    const unsubscribers = [
      listen(query(collection(db, "products"), orderBy("sortOrder", "asc"), limit(200)), setProducts, "Ürünler"),
      listen(query(collection(db, "gallery"), orderBy("sortOrder", "asc"), limit(200)), setGalleryItems, "Galeri"),
      listen(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(200)), setLeads, "Talepler"),
      onSnapshot(
        doc(db, "settings", "site"),
        (snapshot) => {
          // Kaydedilmemiş düzenlemeler varken gelen güncellemeler taslağı ezmesin.
          if (dirtyRef.current) return;
          setSettingsDraft(buildDraft(snapshot.exists() ? snapshot.data() : {}));
        },
        (error) => showError(error, "Site ayarları okunamadı.")
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [authState, showError]);

  const counts = useMemo(
    () => ({
      products: products.length,
      activeProducts: products.filter((item) => item.isActive !== false).length,
      featuredProducts: products.filter((item) => item.isFeatured).length,
      gallery: galleryItems.length,
      activeGallery: galleryItems.filter((item) => item.isActive !== false).length,
      openLeads: leads.filter((item) => item.status !== "done").length,
      newLeads: leads.filter((item) => !item.status || item.status === "new").length,
    }),
    [products, galleryItems, leads]
  );

  /* ---------- Yardımcılar ---------- */

  async function uploadImageFile(file, folder) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) throw new Error("Yalnızca görsel dosyası yüklenebilir.");
    if (file.size > MAX_UPLOAD) throw new Error("Görsel boyutu 20 MB'tan küçük olmalı.");

    const optimized = await compressImage(file);
    const fileRef = ref(storage, `public/${folder}/${Date.now()}-${safeFileName(optimized.name)}`);
    await uploadBytes(fileRef, optimized, { contentType: optimized.type });
    return getDownloadURL(fileRef);
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  /* ---------- Ürünler ---------- */

  function resetProductForm() {
    setEditingProductId("");
    setProductForm(emptyProduct);
    setProductFile(null);
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm(cleanObjectForEdit(product, emptyProduct));
    setProductFile(null);
  }

  async function saveProduct() {
    const title = String(productForm.title || "").trim();
    if (!title) {
      showToast("Ürün adı zorunludur.", "error");
      return false;
    }

    const priceAmount = numberOrNull(productForm.priceAmount);
    const discountPriceAmount = numberOrNull(productForm.discountPriceAmount);
    if (discountPriceAmount !== null && priceAmount !== null && discountPriceAmount >= priceAmount) {
      showToast("İndirimli fiyat normal fiyattan düşük olmalı.", "error");
      return false;
    }

    setSaving(true);
    try {
      const uploadedUrl = await uploadImageFile(productFile, "products");
      const payload = {
        title,
        category: String(productForm.category || "").trim(),
        material: String(productForm.material || "").trim(),
        priceAmount,
        discountPriceAmount,
        currency: productForm.currency || "TRY",
        priceText: String(productForm.priceText || "").trim(),
        showPrice: Boolean(productForm.showPrice),
        imageUrl: uploadedUrl || String(productForm.imageUrl || "").trim(),
        description: String(productForm.description || "").trim(),
        sortOrder: safeNumber(productForm.sortOrder, 10),
        isActive: Boolean(productForm.isActive),
        isFeatured: Boolean(productForm.isFeatured),
        updatedAt: serverTimestamp(),
      };

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), payload);
        showToast("Ürün güncellendi.");
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp() });
        showToast("Ürün eklendi.");
      }

      resetProductForm();
      return true;
    } catch (error) {
      showError(error, "Ürün kaydedilemedi.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateProduct(id, patch, message = "Ürün güncellendi.") {
    try {
      await updateDoc(doc(db, "products", id), { ...patch, updatedAt: serverTimestamp() });
      showToast(message);
    } catch (error) {
      showError(error, "Ürün güncellenemedi.");
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`“${product.title || "Ürün"}” kalıcı olarak silinsin mi?`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      showToast("Ürün silindi.");
    } catch (error) {
      showError(error, "Ürün silinemedi.");
    }
  }

  /* ---------- Galeri ---------- */

  function resetGalleryForm() {
    setEditingGalleryId("");
    setGalleryForm(emptyGallery);
    setGalleryFile(null);
  }

  function editGallery(item) {
    setEditingGalleryId(item.id);
    setGalleryForm(cleanObjectForEdit(item, emptyGallery));
    setGalleryFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGallery(event) {
    event.preventDefault();

    if (!String(galleryForm.title || "").trim()) {
      showToast("Görsel başlığı zorunludur.", "error");
      return;
    }
    if (!galleryFile && !String(galleryForm.imageUrl || "").trim()) {
      showToast("Bir görsel dosyası seçin veya görsel bağlantısı girin.", "error");
      return;
    }

    setSaving(true);
    try {
      const uploadedUrl = await uploadImageFile(galleryFile, "gallery");
      const payload = {
        title: String(galleryForm.title || "").trim(),
        tag: String(galleryForm.tag || "").trim(),
        imageUrl: uploadedUrl || String(galleryForm.imageUrl || "").trim(),
        sortOrder: safeNumber(galleryForm.sortOrder, 10),
        isActive: Boolean(galleryForm.isActive),
        updatedAt: serverTimestamp(),
      };

      if (editingGalleryId) {
        await updateDoc(doc(db, "gallery", editingGalleryId), payload);
        showToast("Görsel güncellendi.");
      } else {
        await addDoc(collection(db, "gallery"), { ...payload, createdAt: serverTimestamp() });
        showToast("Görsel eklendi.");
      }
      resetGalleryForm();
    } catch (error) {
      showError(error, "Görsel kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function updateGallery(id, patch) {
    try {
      await updateDoc(doc(db, "gallery", id), { ...patch, updatedAt: serverTimestamp() });
      showToast("Galeri güncellendi.");
    } catch (error) {
      showError(error, "Galeri güncellenemedi.");
    }
  }

  async function removeGallery(item) {
    if (!window.confirm(`“${item.title || "Görsel"}” galeriden kalıcı olarak silinsin mi?`)) return;
    try {
      await deleteDoc(doc(db, "gallery", item.id));
      if (editingGalleryId === item.id) resetGalleryForm();
      showToast("Görsel silindi.");
    } catch (error) {
      showError(error, "Görsel silinemedi.");
    }
  }

  /* ---------- Site ayarları ---------- */

  async function saveSettings(event) {
    event?.preventDefault?.();

    const fail = (text) => {
      showToast(text, "error");
      return false;
    };

    if (!String(settingsDraft.phone || "").trim()) return fail("Telefon numarası zorunludur.");
    if (!String(settingsDraft.address || "").trim()) return fail("Adres zorunludur.");

    const siteUrl = String(settingsDraft.siteUrl || "").trim();
    const ga4Id = String(settingsDraft.googleAnalyticsId || "").trim();
    const gtmId = String(settingsDraft.googleTagManagerId || "").trim();
    const pixelId = String(settingsDraft.metaPixelId || "").trim();

    if (siteUrl && !/^https:\/\/\S+$/i.test(siteUrl)) return fail("Site adresi https:// ile başlamalı.");
    if (ga4Id && !/^G-[A-Z0-9]{6,14}$/i.test(ga4Id)) return fail("GA4 kimliği hatalı. Örnek: G-XXXXXXXXXX");
    if (gtmId && !/^GTM-[A-Z0-9]{4,12}$/i.test(gtmId)) return fail("GTM kimliği hatalı. Örnek: GTM-XXXXXXX");
    if (pixelId && !/^\d{8,20}$/.test(pixelId)) return fail("Meta Pixel kimliği 8–20 rakamdan oluşmalı.");
    if (ga4Id && gtmId) return fail("Çift sayımı önlemek için GA4 veya GTM'den yalnızca birini kullanın.");

    setSaving(true);
    try {
      const [logoUrl, heroUrl, showcaseUrl] = await Promise.all([
        uploadImageFile(logoFile, "site"),
        uploadImageFile(heroFile, "site"),
        uploadImageFile(showcaseFile, "site"),
      ]);

      const payload = {
        ...settingsDraft,
        brandLogoUrl: logoUrl || settingsDraft.brandLogoUrl || "",
        heroImageUrl: heroUrl || settingsDraft.heroImageUrl || "",
        showcaseImageUrl: showcaseUrl || settingsDraft.showcaseImageUrl || "",
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
      dirtyRef.current = false;
      setSettingsDirty(false);
      setSettingsDraft(buildDraft(payload));
      showToast("Ayarlar kaydedildi ve sitede yayına alındı.");
      return true;
    } catch (error) {
      showError(error, "Ayarlar kaydedilemedi.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Talepler ---------- */

  async function updateLeadStatus(id, status) {
    try {
      await updateDoc(doc(db, "leads", id), { status, updatedAt: serverTimestamp() });
      showToast("Talep durumu güncellendi.");
    } catch (error) {
      showError(error, "Talep güncellenemedi.");
    }
  }

  async function removeLead(lead) {
    if (!window.confirm(`${lead.name || "Bu müşteri"} talebi kalıcı olarak silinsin mi?`)) return;
    try {
      await deleteDoc(doc(db, "leads", lead.id));
      showToast("Talep silindi.");
    } catch (error) {
      showError(error, "Talep silinemedi.");
    }
  }

  /* ---------- Görünüm ---------- */

  if (authState === "loading" || authState === "guest") {
    return (
      <main className="adm-gate">
        <div className="adm-gate-card">
          <span className="adm-spinner" aria-hidden="true" />
          <p>Yetki kontrol ediliyor…</p>
        </div>
      </main>
    );
  }

  if (authState === "blocked") {
    return (
      <main className="adm-gate">
        <div className="adm-gate-card">
          <h1>Erişim yetkiniz yok</h1>
          <p>Bu hesap yönetim paneli için yetkilendirilmemiş. Yetki için işletme sahibiyle iletişime geçin.</p>
          <div className="adm-row">
            <Link className="adm-btn adm-btn--secondary" href="/">
              Siteye dön
            </Link>
            <button className="adm-btn adm-btn--primary" type="button" onClick={handleLogout}>
              Farklı hesapla giriş
            </button>
          </div>
        </div>
      </main>
    );
  }

  const settingsProps = { settingsDraft, setSettingsDraft: updateSettings, saveSettings, saving, settingsDirty };

  return (
    <AdminShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      counts={counts}
      adminProfile={adminProfile}
      handleLogout={handleLogout}
      toast={toast}
      dismissToast={() => setToast(null)}
    >
      {activeTab === "overview" ? (
        <OverviewTab counts={counts} leads={leads} products={products} setActiveTab={setActiveTab} />
      ) : null}

      {activeTab === "homepage" ? (
        <HomepageTab
          {...settingsProps}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          heroFile={heroFile}
          setHeroFile={setHeroFile}
          showcaseFile={showcaseFile}
          setShowcaseFile={setShowcaseFile}
        />
      ) : null}

      {activeTab === "themes" ? <ThemesTab {...settingsProps} /> : null}

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
        <LeadsTab leads={leads} updateLeadStatus={updateLeadStatus} removeLead={removeLead} />
      ) : null}

      {activeTab === "analytics" ? (
        <AnalyticsTab {...settingsProps} products={products} galleryItems={galleryItems} leads={leads} />
      ) : null}
    </AdminShell>
  );
}
