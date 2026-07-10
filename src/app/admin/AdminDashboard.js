"use client";

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
import { auth, db } from "@/lib/firebase";

const emptyProduct = {
  title: "",
  category: "Binek Araç",
  material: "Deri görünümlü",
  priceText: "Teklif alınız",
  description: "",
  isActive: true,
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
  heroTitle: "Aracınıza özel oto kılıf ve döşeme çözümleri.",
  heroSubtitle:
    "Binek, SUV, hafif ticari ve filo araçları için ölçülü, şık ve dayanıklı oto kılıf hizmeti.",
  phone: "+90 500 000 00 00",
  whatsapp: "905000000000",
  email: "info@akcotokilif.com",
  address: "Adres bilgisi eklenecek",
  instagram: "",
};

export default function AdminDashboard() {
  const router = useRouter();

  const [authState, setAuthState] = useState("loading");
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products]
  );

  const unreadLeads = useMemo(
    () => leads.filter((lead) => lead.status !== "done").length,
    [leads]
  );

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

        setAdminProfile({
          uid: user.uid,
          email: user.email,
          ...adminSnap.data(),
        });
        setAuthState("admin");
      } catch (error) {
        setAuthState("blocked");
        setToast(error.message || "Admin yetkisi kontrol edilemedi.");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authState !== "admin") return undefined;

    const productQuery = query(collection(db, "products"), orderBy("sortOrder", "asc"), limit(100));
    const galleryQuery = query(collection(db, "gallery"), orderBy("sortOrder", "asc"), limit(100));
    const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(50));

    const unsubProducts = onSnapshot(productQuery, (snapshot) => {
      setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      setGalleryItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
      setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.data() });
      }
    });

    return () => {
      unsubProducts();
      unsubGallery();
      unsubLeads();
      unsubSettings();
    };
  }, [authState]);

  function showToast(text) {
    setToast(text);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "products"), {
        ...productForm,
        sortOrder: Number(productForm.sortOrder || 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setProductForm(emptyProduct);
      showToast("Ürün başarıyla eklendi.");
    } catch (error) {
      showToast(error.message || "Ürün eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function updateProduct(id, patch) {
    try {
      await updateDoc(doc(db, "products", id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      showToast("Ürün güncellendi.");
    } catch (error) {
      showToast(error.message || "Ürün güncellenemedi.");
    }
  }

  async function removeProduct(id) {
    const approved = window.confirm("Bu ürünü silmek istiyor musun?");
    if (!approved) return;

    try {
      await deleteDoc(doc(db, "products", id));
      showToast("Ürün silindi.");
    } catch (error) {
      showToast(error.message || "Ürün silinemedi.");
    }
  }

  async function saveGallery(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "gallery"), {
        ...galleryForm,
        sortOrder: Number(galleryForm.sortOrder || 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setGalleryForm(emptyGallery);
      showToast("Galeri görseli eklendi.");
    } catch (error) {
      showToast(error.message || "Galeri eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function removeGallery(id) {
    const approved = window.confirm("Bu galeri kartını silmek istiyor musun?");
    if (!approved) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      showToast("Galeri kartı silindi.");
    } catch (error) {
      showToast(error.message || "Galeri kartı silinemedi.");
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await setDoc(
        doc(db, "settings", "site"),
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast("Site ayarları kaydedildi.");
    } catch (error) {
      showToast(error.message || "Ayarlar kaydedilemedi.");
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
      showToast(error.message || "Talep güncellenemedi.");
    }
  }

  if (authState === "loading") {
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
          <h1>Yetki yok kanka.</h1>
          <p>
            Bu kullanıcı giriş yaptı ama Firestore <code>admins</code> koleksiyonunda
            admin olarak tanımlı değil.
          </p>
          <button className="admin-primary-btn" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </main>
    );
  }

  const tabs = [
    ["overview", "Özet"],
    ["products", "Ürünler"],
    ["gallery", "Galeri"],
    ["leads", "Talepler"],
    ["settings", "Ayarlar"],
  ];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/">
          <span>AKC</span>
          <strong>Admin Panel</strong>
        </a>

        <nav className="admin-tabs">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-user">
          <small>Giriş yapan</small>
          <strong>{adminProfile?.email}</strong>
          <button onClick={handleLogout}>Çıkış yap</button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">AKC Oto Kılıf</p>
            <h1>Yönetim merkezi</h1>
          </div>
          <a className="admin-secondary-btn" href="/" target="_blank">
            Siteyi görüntüle
          </a>
        </header>

        {toast ? <div className="admin-toast">{toast}</div> : null}

        {activeTab === "overview" ? (
          <section className="admin-grid">
            <article className="admin-stat">
              <span>Aktif ürün</span>
              <strong>{activeProducts}</strong>
              <p>Yayındaki ürün/hizmet kartı</p>
            </article>
            <article className="admin-stat">
              <span>Galeri</span>
              <strong>{galleryItems.length}</strong>
              <p>Portfolyo görünüm kartı</p>
            </article>
            <article className="admin-stat">
              <span>Açık talep</span>
              <strong>{unreadLeads}</strong>
              <p>Dönüş bekleyen müşteri talebi</p>
            </article>
            <article className="admin-panel wide">
              <h2>Kurulum kontrol listesi</h2>
              <div className="checklist">
                <p>✅ Firebase Authentication Email/Password aktif edilmeli</p>
                <p>✅ Firestore içinde admins/UID dokümanı oluşturulmalı</p>
                <p>✅ Firestore Rules bu paketteki kurallarla güncellenmeli</p>
                <p>✅ WhatsApp, telefon ve adres gerçek bilgilerle değiştirilmeli</p>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>Ürün / Hizmet Kartları</h2>
                <p>Ana sayfadaki ürün ve hizmet vitrinini buradan yönet.</p>
              </div>
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
              <textarea
                placeholder="Açıklama"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({ ...productForm, description: event.target.value })
                }
                required
              />
              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Ürün ekle"}
              </button>
            </form>

            <div className="admin-list">
              {products.map((product) => (
                <article className="admin-list-item" key={product.id}>
                  <div>
                    <small>{product.category} • {product.material}</small>
                    <h3>{product.title || "Başlıksız ürün"}</h3>
                    <p>{product.description}</p>
                    <strong>{product.priceText}</strong>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                    >
                      {product.isActive ? "Yayından al" : "Yayına al"}
                    </button>
                    <button onClick={() => removeProduct(product.id)}>Sil</button>
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
                <h2>Galeri</h2>
                <p>Şimdilik görsel URL ile çalışır. Sonraki aşamada Storage upload ekleriz.</p>
              </div>
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
                placeholder="Görsel URL"
                value={galleryForm.imageUrl}
                onChange={(event) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })}
              />
              <input
                type="number"
                placeholder="Sıralama"
                value={galleryForm.sortOrder}
                onChange={(event) => setGalleryForm({ ...galleryForm, sortOrder: event.target.value })}
              />
              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Galeri kartı ekle"}
              </button>
            </form>

            <div className="gallery-admin-grid">
              {galleryItems.map((item) => (
                <article className="gallery-admin-card" key={item.id}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div />}
                  <small>{item.tag}</small>
                  <h3>{item.title}</h3>
                  <button onClick={() => removeGallery(item.id)}>Sil</button>
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
                <p>İletişim formu bağlanınca gelen talepler burada görünecek.</p>
              </div>
            </div>

            <div className="admin-list">
              {leads.length === 0 ? (
                <div className="empty-state">Henüz talep yok. Sessizlik bazen altın, ama formu bağlayınca burası dolar.</div>
              ) : null}

              {leads.map((lead) => (
                <article className="admin-list-item" key={lead.id}>
                  <div>
                    <small>{lead.status || "new"}</small>
                    <h3>{lead.name || "İsimsiz müşteri"}</h3>
                    <p>{lead.message}</p>
                    <strong>{lead.phone || lead.email}</strong>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => updateLeadStatus(lead.id, "new")}>Yeni</button>
                    <button onClick={() => updateLeadStatus(lead.id, "contacted")}>Arandı</button>
                    <button onClick={() => updateLeadStatus(lead.id, "done")}>Tamam</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>Site Ayarları</h2>
                <p>Marka metinleri ve iletişim bilgilerini tek yerden yönet.</p>
              </div>
            </div>

            <form className="settings-form" onSubmit={saveSettings}>
              {Object.entries(defaultSettings).map(([key]) => (
                <label key={key}>
                  {key}
                  {key === "heroSubtitle" ? (
                    <textarea
                      value={settings[key] || ""}
                      onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                    />
                  ) : (
                    <input
                      value={settings[key] || ""}
                      onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                    />
                  )}
                </label>
              ))}
              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Ayarları kaydet"}
              </button>
            </form>
          </section>
        ) : null}
      </section>
    </main>
  );
}
