"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
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
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const statusMap = {
  new: "Yeni",
  contacted: "Arandı",
  done: "Tamamlandı",
  pending: "Beklemede",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatDate(value) {
  if (!value) return "Yeni";

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
    return "Yeni";
  }
}

function getTimeValue(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function uniqById(items) {
  const map = new Map();

  items.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });

  return Array.from(map.values());
}

function getInitials(nameOrEmail) {
  const value = String(nameOrEmail || "Profil").trim();

  const words = value
    .replace(/@.*/, "")
    .split(" ")
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return value.charAt(0).toUpperCase() || "P";
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);

  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const isAdmin = Boolean(adminProfile?.isActive !== false && adminProfile);

  const displayName = useMemo(() => {
    return (
      profile?.displayName ||
      user?.displayName ||
      adminProfile?.displayName ||
      user?.email ||
      "Profil"
    );
  }, [profile, user, adminProfile]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const cleanEmail = useMemo(() => {
    return String(user?.email || "").toLowerCase().trim();
  }, [user]);

  const cleanPhone = useMemo(() => {
    return onlyDigits(profile?.phoneNumber || user?.phoneNumber || "");
  }, [profile, user]);

  const openRequests = useMemo(() => {
    return leads.filter((lead) => lead.status !== "done").length;
  }, [leads]);

  const completedRequests = useMemo(() => {
    return leads.filter((lead) => lead.status === "done").length;
  }, [leads]);

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.isActive !== false).length;
  }, [products]);

  const activeGallery = useMemo(() => {
    return galleryItems.filter((item) => item.isActive !== false).length;
  }, [galleryItems]);

  const latestLead = useMemo(() => leads[0], [leads]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setAdminProfile(null);
        setLeads([]);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(true);
      setPageMessage("Profil ve yetki bilgileri kontrol ediliyor...");

      try {
        const [userSnap, adminSnap] = await Promise.all([
          getDoc(doc(db, "users", currentUser.uid)),
          getDoc(doc(db, "admins", currentUser.uid)),
        ]);

        setProfile(userSnap.exists() ? userSnap.data() : null);

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          setAdminProfile(adminData?.isActive === false ? null : adminData);
        } else {
          setAdminProfile(null);
        }

        setPageMessage("");
      } catch (error) {
        setProfile(null);
        setAdminProfile(null);
        setPageMessage(error?.message || "Profil bilgileri okunamadı.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const unsubscribers = [];
    let userIdLeads = [];
    let emailLeads = [];
    let phoneLeads = [];
    let adminLeads = [];

    function publish() {
      const merged = isAdmin
        ? adminLeads
        : uniqById([...userIdLeads, ...emailLeads, ...phoneLeads]);

      const sorted = merged.sort(
        (a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt)
      );

      setLeads(sorted.slice(0, isAdmin ? 12 : 8));
    }

    if (isAdmin) {
      const adminLeadsQuery = query(
        collection(db, "leads"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      unsubscribers.push(
        onSnapshot(
          adminLeadsQuery,
          (snapshot) => {
            adminLeads = snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }));
            publish();
          },
          (error) => {
            console.error("Admin lead okuma hatası:", error);
            setLeads([]);
          }
        )
      );
    } else {
      const userIdQuery = query(
        collection(db, "leads"),
        where("userId", "==", user.uid)
      );

      unsubscribers.push(
        onSnapshot(
          userIdQuery,
          (snapshot) => {
            userIdLeads = snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }));
            publish();
          },
          () => {
            userIdLeads = [];
            publish();
          }
        )
      );

      if (cleanEmail) {
        const emailQuery = query(
          collection(db, "leads"),
          where("email", "==", cleanEmail)
        );

        unsubscribers.push(
          onSnapshot(
            emailQuery,
            (snapshot) => {
              emailLeads = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }));
              publish();
            },
            () => {
              emailLeads = [];
              publish();
            }
          )
        );
      }

      if (cleanPhone) {
        const phoneQuery = query(
          collection(db, "leads"),
          where("phoneDigits", "==", cleanPhone)
        );

        unsubscribers.push(
          onSnapshot(
            phoneQuery,
            (snapshot) => {
              phoneLeads = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }));
              publish();
            },
            () => {
              phoneLeads = [];
              publish();
            }
          )
        );
      }
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, cleanEmail, cleanPhone, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return undefined;

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
      () => setProducts([])
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
      () => setGalleryItems([])
    );

    return () => {
      unsubProducts();
      unsubGallery();
    };
  }, [isAdmin]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="site-shell page-shell">
        <section className="profile-loading-card">
          <p className="eyebrow">Profil</p>
          <h1>Profil bilgileri yükleniyor...</h1>
          <p>{pageMessage || "Hesap, yetki ve talep bilgileri hazırlanıyor."}</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="site-shell page-shell">
        <section className="modern-cta-card profile-guest-card">
          <div className="modern-cta-copy">
            <p className="eyebrow">Profil Merkezi</p>
            <h2>Hesabınıza giriş yapın.</h2>
            <p>
              Profil sayfasını görüntülemek, teklif taleplerinizi takip etmek ve
              AKC Oto Kılıf ile süreci daha düzenli yönetmek için giriş yapın.
            </p>
          </div>

          <div className="modern-cta-actions">
            <Link className="primary-btn" href="/login">
              Giriş Yap
            </Link>

            <Link className="secondary-btn" href="/register">
              Üye Ol
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell page-shell">
      <nav className="navbar navbar--compact">
        <Link className="brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
          <span className="brand-mark">AKC</span>
          <span>
            <strong>AKC Oto Kılıf</strong>
            <small>
              {isAdmin ? "Yönetici profili" : "Premium müşteri profili"}
            </small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Profil menüsü">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
          <Link href="/#iletisim">Teklif Al</Link>
          {isAdmin ? <Link href="/admin">Admin Panel</Link> : null}
        </div>
      </nav>

      <section className="profile-hero">
        <div className="profile-hero-card profile-hero-card--main">
          <div className="profile-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div>
            <p className="eyebrow">
              {isAdmin ? "Yönetici hesabı" : "Müşteri profili"}
            </p>

            <h1>{displayName}</h1>

            <p>
              {isAdmin
                ? "Admin yetkiniz aktif. Site içeriklerini, ürünleri, galeriyi, tema ayarlarını, talepleri ve analitik ekranını buradan hızlıca yönetebilirsiniz."
                : "Ürünleri inceleyin, teklif taleplerinizi takip edin ve AKC Oto Kılıf ile iletişimi tek merkezden daha düzenli yönetin."}
            </p>
          </div>
        </div>

        <div className="profile-hero-card profile-hero-card--actions">
          <span className="profile-badge">
            {isAdmin ? "Aktif Yönetici" : "Aktif Müşteri"}
          </span>

          <strong>
            {isAdmin
              ? "Yönetim merkezi hızlı erişim"
              : "Aracınız için doğru çözümü hızlıca bulun"}
          </strong>

          <div className="profile-actions-row">
            {isAdmin ? (
              <>
                <Link className="primary-btn" href="/admin">
                  Admin Panel
                </Link>

                <Link className="secondary-btn" href="/admin/analytics">
                  Analitik
                </Link>
              </>
            ) : (
              <>
                <Link className="primary-btn" href="/urunler">
                  Ürünleri İncele
                </Link>

                <Link className="secondary-btn" href="/#iletisim">
                  Teklif İste
                </Link>
              </>
            )}

            <button className="secondary-btn" type="button" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </section>

      {isAdmin ? (
        <section className="profile-admin-panel">
          <div className="section-head">
            <p className="eyebrow">Yönetici araçları</p>
            <h2>AKC operasyon merkezi.</h2>
            <p>
              İçerik yönetimi, müşteri talepleri, ürün vitrini ve analitik
              ekranlarına hızlı erişim.
            </p>
          </div>

          <div className="profile-admin-grid">
            <Link className="profile-admin-card" href="/admin">
              <span>01</span>
              <strong>Admin Panel</strong>
              <p>Ana sayfa, tema, ürünler, galeri ve talepleri yönetin.</p>
            </Link>

            <Link className="profile-admin-card" href="/admin/analytics">
              <span>02</span>
              <strong>Analitik ve SEO</strong>
              <p>GA4, GTM, Meta Pixel ve form dönüşümlerini kontrol edin.</p>
            </Link>

            <Link className="profile-admin-card" href="/urunler">
              <span>03</span>
              <strong>Ürün vitrini</strong>
              <p>Müşteri tarafındaki ürün sayfasını canlı kontrol edin.</p>
            </Link>

            <Link className="profile-admin-card" href="/#iletisim">
              <span>04</span>
              <strong>Teklif formu</strong>
              <p>Müşteri form alanının canlı görünümünü test edin.</p>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="profile-grid">
        <article className="profile-card">
          <p className="eyebrow">Hesap bilgisi</p>
          <h3>İletişim ve erişim</h3>

          <ul className="profile-list">
            <li>
              <span>E-posta</span>
              <strong>{user.email || "Belirtilmedi"}</strong>
            </li>

            <li>
              <span>Telefon</span>
              <strong>
                {profile?.phoneNumber || user.phoneNumber || "Belirtilmedi"}
              </strong>
            </li>

            <li>
              <span>Hesap tipi</span>
              <strong>{isAdmin ? "Yönetici" : "Müşteri"}</strong>
            </li>

            <li>
              <span>Durum</span>
              <strong>
                {profile?.isActive === false ? "Pasif" : "Aktif"}
              </strong>
            </li>
          </ul>
        </article>

        <article className="profile-card">
          <p className="eyebrow">Talep özeti</p>
          <h3>{isAdmin ? "Genel müşteri akışı" : "Sizin talepleriniz"}</h3>

          <div className="profile-stats">
            <div>
              <strong>{leads.length}</strong>
              <span>{isAdmin ? "Son talep" : "Toplam talep"}</span>
            </div>

            <div>
              <strong>{openRequests}</strong>
              <span>Açık talep</span>
            </div>

            <div>
              <strong>{completedRequests}</strong>
              <span>Tamamlanan</span>
            </div>
          </div>
        </article>

        {isAdmin ? (
          <article className="profile-card">
            <p className="eyebrow">Site vitrini</p>
            <h3>İçerik durumu</h3>

            <div className="profile-stats">
              <div>
                <strong>{activeProducts}</strong>
                <span>Aktif ürün</span>
              </div>

              <div>
                <strong>{activeGallery}</strong>
                <span>Galeri</span>
              </div>

              <div>
                <strong>{products.length}</strong>
                <span>Toplam kart</span>
              </div>
            </div>
          </article>
        ) : (
          <article className="profile-card">
            <p className="eyebrow">Hızlı öneri</p>
            <h3>Teklif için gereken bilgiler</h3>

            <div className="profile-mini-checklist">
              <p>✓ Araç marka, model ve yıl bilgisi</p>
              <p>✓ İstenen malzeme ve renk tercihi</p>
              <p>✓ Koltuk fotoğrafı veya kısa açıklama</p>
            </div>
          </article>
        )}
      </section>

      <section className="profile-card profile-card--wide">
        <div className="section-head section-head--centered">
          <p className="eyebrow">
            {isAdmin ? "Son müşteri talepleri" : "Son talepleriniz"}
          </p>

          <h2>
            {isAdmin
              ? "Müşteri akışı burada görünür."
              : "İletişim geçmişiniz burada görünür."}
          </h2>

          <p>
            {isAdmin
              ? "En yeni müşteri taleplerini hızlıca gözden geçirip admin panelden yönetebilirsiniz."
              : "Teklif taleplerinizin durumunu buradan takip edebilirsiniz."}
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="profile-empty-state">
            <p>
              {isAdmin
                ? "Henüz müşteri talebi yok. Form çalışmaya başladığında burada görünecek."
                : "Henüz bir sipariş veya teklif talebi oluşturulmadı."}
            </p>

            <Link
              className="secondary-btn"
              href={isAdmin ? "/admin" : "/urunler"}
            >
              {isAdmin ? "Admin panele dön" : "Ürünleri keşfet"}
            </Link>
          </div>
        ) : (
          <div className="profile-leads-list">
            {leads.map((lead) => (
              <article className="profile-lead-item" key={lead.id}>
                <div>
                  <small>
                    {statusMap[lead.status] || lead.status || "Yeni"} •{" "}
                    {formatDate(lead.createdAt)}
                  </small>

                  <h4>
                    {lead.vehicle ||
                      lead.name ||
                      lead.message ||
                      "Teklif talebi"}
                  </h4>

                  <p>{lead.message || "Açıklama yok."}</p>

                  {isAdmin ? (
                    <span>
                      {lead.name || "İsimsiz müşteri"} •{" "}
                      {lead.phone || lead.email || "İletişim bilgisi yok"}
                    </span>
                  ) : null}
                </div>

                <strong>{statusMap[lead.status] || lead.status || "Yeni"}</strong>
              </article>
            ))}
          </div>
        )}
      </section>

      {latestLead ? (
        <section className="modern-cta-card">
          <div className="modern-cta-copy">
            <p className="eyebrow">Son hareket</p>
            <h2>
              {isAdmin
                ? "En yeni müşteri talebini kaçırma."
                : "Son talebiniz sistemde görünüyor."}
            </h2>
            <p>
              {latestLead.message ||
                "Talep kaydı oluşturuldu. Süreci buradan takip edebilirsiniz."}
            </p>
          </div>

          <div className="modern-cta-actions">
            <Link className="primary-btn" href={isAdmin ? "/admin" : "/urunler"}>
              {isAdmin ? "Talebi yönet" : "Ürünlere dön"}
            </Link>

            <Link className="secondary-btn" href="/#iletisim">
              Yeni Talep Oluştur
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}