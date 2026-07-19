"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const defaultTracking = {
  trackingEnabled: true,
  trackLocalhost: false,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://akcotokilif.com",
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || "",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  facebookDomainVerification:
    process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || "",
};

function cleanText(value) {
  return String(value || "").trim();
}

function maskValue(value) {
  const text = cleanText(value);
  if (!text) return "Eklenmedi";
  if (text.length <= 10) return text;
  return `${text.slice(0, 6)}••••${text.slice(-4)}`;
}

function getStatus(value) {
  return cleanText(value) ? "Aktif" : "Eksik";
}

function isValidGa4(value) {
  return !cleanText(value) || /^G-[A-Z0-9]{6,14}$/i.test(cleanText(value));
}

function isValidGtm(value) {
  return !cleanText(value) || /^GTM-[A-Z0-9]{4,12}$/i.test(cleanText(value));
}

function isValidPixel(value) {
  return !cleanText(value) || /^\d{8,20}$/.test(cleanText(value));
}

function isValidSiteUrl(value) {
  try {
    const url = new URL(cleanText(value));
    return url.protocol === "https:";
  } catch {
    return false;
  }
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

export default function AnalyticsDashboard() {
  const router = useRouter();

  const [authState, setAuthState] = useState("loading");
  const [adminProfile, setAdminProfile] = useState(null);
  const [tracking, setTracking] = useState(defaultTracking);
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [analyticsEvents, setAnalyticsEvents] = useState([]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const activeProducts = useMemo(
    () => products.filter((item) => item.isActive !== false).length,
    [products]
  );

  const openLeads = useMemo(
    () => leads.filter((item) => item.status !== "done").length,
    [leads]
  );

  const latestLead = useMemo(() => leads[0], [leads]);

  const analyticsSummary = useMemo(() => {
    const devices = analyticsEvents.reduce((accumulator, event) => {
      const key = event.deviceType || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return {
      pageviews: analyticsEvents.filter((event) => event.eventType === "pageview").length,
      mobile: devices.mobile || 0,
      desktop: devices.desktop || 0,
    };
  }, [analyticsEvents]);

  const trackingCards = useMemo(
    () => [
      {
        title: "Google Tag Manager",
        value: tracking.googleTagManagerId,
        hint: "GTM-XXXXXXX",
      },
      {
        title: "Google Analytics 4",
        value: tracking.googleAnalyticsId,
        hint: "G-XXXXXXXXXX",
      },
      {
        title: "Meta Pixel",
        value: tracking.metaPixelId,
        hint: "Pixel ID",
      },
      {
        title: "Site URL",
        value: tracking.siteUrl,
        hint: "https://akcotokilif.com",
      },
    ],
    [tracking]
  );

  function showToast(text) {
    setToast(text);
    window.clearTimeout(window.__akcAnalyticsToastTimer);
    window.__akcAnalyticsToastTimer = window.setTimeout(() => {
      setToast("");
    }, 3600);
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

        if (adminData?.isActive !== true) {
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

    const unsubSettings = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        if (!snapshot.exists()) {
          setTracking(defaultTracking);
          return;
        }

        setTracking({
          ...defaultTracking,
          ...snapshot.data(),
        });
      },
      (error) => showToast(error?.message || "Analitik ayarları okunamadı.")
    );

    const leadsQuery = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const productsQuery = query(
      collection(db, "products"),
      orderBy("sortOrder", "asc"),
      limit(150)
    );

    const galleryQuery = query(
      collection(db, "gallery"),
      orderBy("sortOrder", "asc"),
      limit(150)
    );

    const eventsQuery = query(
      collection(db, "analyticsEvents"),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => showToast(error?.message || "Talepler okunamadı.")
    );

    const unsubProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        );
      },
      (error) => showToast(error?.message || "Ürünler okunamadı.")
    );

    const unsubGallery = onSnapshot(
      galleryQuery,
      (snapshot) => {
        setGalleryItems(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        );
      },
      (error) => showToast(error?.message || "Galeri okunamadı.")
    );

    const unsubEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        setAnalyticsEvents(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        );
      },
      (error) => showToast(error?.message || "Analitik olayları okunamadı.")
    );

    return () => {
      unsubSettings();
      unsubLeads();
      unsubProducts();
      unsubGallery();
      unsubEvents();
    };
  }, [authState]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  async function saveTracking(event) {
    event.preventDefault();

    if (!isValidSiteUrl(tracking.siteUrl)) {
      showToast("Site URL https:// ile başlayan geçerli bir adres olmalı.");
      return;
    }

    if (!isValidGtm(tracking.googleTagManagerId)) {
      showToast("GTM ID formatı hatalı. Örnek: GTM-XXXXXXX");
      return;
    }

    if (!isValidGa4(tracking.googleAnalyticsId)) {
      showToast("GA4 Measurement ID formatı hatalı. Örnek: G-XXXXXXXXXX");
      return;
    }

    if (!isValidPixel(tracking.metaPixelId)) {
      showToast("Meta Pixel ID yalnızca 8-20 rakamdan oluşmalı.");
      return;
    }

    if (tracking.googleTagManagerId && tracking.googleAnalyticsId) {
      showToast("GTM ve doğrudan GA4 aynı anda girildi. Çift sayımı önlemek için birini kullanın.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        trackingEnabled: tracking.trackingEnabled !== false,
        trackLocalhost: tracking.trackLocalhost === true,
        siteUrl: cleanText(tracking.siteUrl),
        googleTagManagerId: cleanText(tracking.googleTagManagerId),
        googleAnalyticsId: cleanText(tracking.googleAnalyticsId),
        metaPixelId: cleanText(tracking.metaPixelId),
        googleSiteVerification: cleanText(tracking.googleSiteVerification),
        facebookDomainVerification: cleanText(
          tracking.facebookDomainVerification
        ),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "settings", "site"), payload, { merge: true });

      showToast("Analitik ve SEO ayarları kaydedildi.");
    } catch (error) {
      showToast(error?.message || "Analitik ayarları kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (authState === "loading") {
    return (
      <main className="admin-loading">
        <div>
          <span className="admin-spinner" />
          <h1>Analitik panel hazırlanıyor...</h1>
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
            Bu alan sadece aktif admin kullanıcılar içindir. Firestore{" "}
            <code>admins</code> koleksiyonunu kontrol et.
          </p>
          <button className="admin-primary-btn" type="button" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin">
          <span><Image src="/images/akc-logo-square.png" alt="AKC Oto Kılıf" width={52} height={52} /></span>
          <strong>Analitik</strong>
        </Link>

        <nav className="admin-tabs" aria-label="Admin analitik menü">
          <Link href="/admin">Panele dön</Link>
          <Link href="/">Siteyi görüntüle</Link>
          <Link href="/urunler">Ürünler</Link>
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
            <h1>Analitik ve SEO merkezi</h1>
            <span>
              GA4, Google Tag Manager, Meta Pixel ve temel SEO kontrolleri tek
              ekranda.
            </span>
          </div>

          <div className="topbar-actions">
            <Link className="admin-secondary-btn" href="/admin">
              Admin Panel
            </Link>
            <Link className="admin-primary-btn" href="/" target="_blank">
              Siteyi görüntüle
            </Link>
          </div>
        </header>

        {toast ? <div className="admin-toast">{toast}</div> : null}

        <section className="admin-grid">
          <article className="admin-stat">
            <span>Toplam talep</span>
            <strong>{leads.length}</strong>
            <p>{openLeads} açık müşteri talebi</p>
          </article>

          <article className="admin-stat">
            <span>Aktif ürün</span>
            <strong>{activeProducts}</strong>
            <p>{products.length} toplam ürün kartı</p>
          </article>

          <article className="admin-stat">
            <span>Galeri</span>
            <strong>{galleryItems.length}</strong>
            <p>Yayındaki portfolyo kartları</p>
          </article>

          <article className="admin-stat">
            <span>Tracking</span>
            <strong>{tracking.trackingEnabled !== false ? "Açık" : "Kapalı"}</strong>
            <p>Site geneli ölçüm durumu</p>
          </article>
        </section>

        <section className="admin-panel analytics-health-panel">
          <div className="panel-head">
            <div>
              <h2>Ölçüm özeti</h2>
              <p>Firestore üzerinde tutulan son 500 anonim sayfa görüntüleme kaydı.</p>
            </div>
          </div>
          <div className="admin-grid">
            <article className="admin-stat">
              <span>Sayfa görüntüleme</span>
              <strong>{analyticsSummary.pageviews}</strong>
              <p>Tekrarsız oturum/sayfa kayıtları</p>
            </article>
            <article className="admin-stat">
              <span>Mobil</span>
              <strong>{analyticsSummary.mobile}</strong>
              <p>Mobil cihaz görüntülemeleri</p>
            </article>
            <article className="admin-stat">
              <span>Masaüstü</span>
              <strong>{analyticsSummary.desktop}</strong>
              <p>Masaüstü cihaz görüntülemeleri</p>
            </article>
            <article className="admin-stat">
              <span>Kurulum sağlığı</span>
              <strong>{tracking.googleAnalyticsId || tracking.googleTagManagerId ? "Hazır" : "ID bekliyor"}</strong>
              <p>Çerez iznine bağlı ölçüm</p>
            </article>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>Tracking kurulum durumu</h2>
              <p>
                ID alanları doluysa layout üzerinden otomatik yüklenir. Localhost
                takibi kapalıysa sadece canlı domain ölçülür.
              </p>
            </div>
          </div>

          <div className="admin-grid">
            {trackingCards.map((card) => (
              <article className="admin-stat" key={card.title}>
                <span>{card.title}</span>
                <strong>{getStatus(card.value)}</strong>
                <p>
                  {card.value ? maskValue(card.value) : `Beklenen: ${card.hint}`}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>GA4 / GTM / Meta Pixel ayarları</h2>
              <p>
                GTM içine GA4 tag kurarsan GA4 ID alanını boş bırakman daha
                temiz olur. İkisini aynı anda kurarsan çift sayım yapabilir.
              </p>
            </div>
          </div>

          <form className="settings-form" onSubmit={saveTracking}>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={tracking.trackingEnabled !== false}
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    trackingEnabled: event.target.checked,
                  })
                }
              />
              Tracking aktif
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={tracking.trackLocalhost === true}
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    trackLocalhost: event.target.checked,
                  })
                }
              />
              Localhost üzerinde de çalıştır
            </label>

            <label>
              Site URL
              <input
                value={tracking.siteUrl || ""}
                placeholder="https://akcotokilif.com"
                onChange={(event) =>
                  setTracking({ ...tracking, siteUrl: event.target.value })
                }
              />
            </label>

            <label>
              Google Tag Manager ID
              <input
                value={tracking.googleTagManagerId || ""}
                placeholder="GTM-XXXXXXX"
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    googleTagManagerId: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Google Analytics 4 Measurement ID
              <input
                value={tracking.googleAnalyticsId || ""}
                placeholder="G-XXXXXXXXXX"
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    googleAnalyticsId: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Meta Pixel ID
              <input
                value={tracking.metaPixelId || ""}
                placeholder="123456789012345"
                onChange={(event) =>
                  setTracking({ ...tracking, metaPixelId: event.target.value })
                }
              />
            </label>

            <label>
              Google site verification
              <input
                value={tracking.googleSiteVerification || ""}
                placeholder="Google Search Console doğrulama kodu"
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    googleSiteVerification: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Facebook domain verification
              <input
                value={tracking.facebookDomainVerification || ""}
                placeholder="Meta Business doğrulama kodu"
                onChange={(event) =>
                  setTracking({
                    ...tracking,
                    facebookDomainVerification: event.target.value,
                  })
                }
              />
            </label>

            <button className="admin-primary-btn" type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Analitik ayarlarını kaydet"}
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>SEO ve reklam kontrol listesi</h2>
              <p>Canlıya çıkmadan önce burayı tek tek kontrol et.</p>
            </div>
          </div>

          <div className="checklist">
            <p>✅ Domain Firebase üzerinde Connected olmalı.</p>
            <p>✅ SSL durumu aktif olmalı.</p>
            <p>✅ GA4 veya GTM ID doğru girilmeli.</p>
            <p>✅ Meta Pixel ID doğru girilmeli.</p>
            <p>✅ Google Search Console domain doğrulaması yapılmalı.</p>
            <p>✅ Meta Business domain doğrulaması yapılmalı.</p>
            <p>✅ Admin ve analitik sayfaları noindex kalmalı.</p>
            <p>✅ Ana sayfa, ürünler ve iletişim sayfaları index açık olmalı.</p>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>Son müşteri talebi</h2>
              <p>Form dönüşümü takibi için son talep burada görünür.</p>
            </div>
          </div>

          {latestLead ? (
            <div className="lead-preview">
              <small>
                {latestLead.status || "new"} • {formatDate(latestLead.createdAt)}
              </small>
              <h3>{latestLead.name || "İsimsiz müşteri"}</h3>
              <p>{latestLead.message || "Mesaj yok."}</p>
              <strong>
                {latestLead.phone || latestLead.email || "İletişim bilgisi yok"}
              </strong>
            </div>
          ) : (
            <div className="empty-state">Henüz müşteri talebi yok.</div>
          )}
        </section>
      </section>
    </main>
  );
}
