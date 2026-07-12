"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setAdminProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(true);

      try {
        const [userSnap, adminSnap] = await Promise.all([
          getDoc(doc(db, "users", currentUser.uid)),
          getDoc(doc(db, "admins", currentUser.uid)),
        ]);

        setProfile(userSnap.exists() ? userSnap.data() : null);
        setAdminProfile(adminSnap.exists() ? adminSnap.data() : null);
      } catch {
        setProfile(null);
        setAdminProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const currentEmail = String(user.email || "").toLowerCase().trim();
    const currentPhone = String(user.phoneNumber || "").replace(/\D/g, "");

    let leadsQuery = null;
    if (currentEmail) {
      leadsQuery = query(collection(db, "leads"), where("email", "==", currentEmail));
    } else if (currentPhone) {
      leadsQuery = query(collection(db, "leads"), where("phone", "==", currentPhone));
    }

    if (!leadsQuery) {
      setLeads([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const sortedItems = items.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

        setLeads(sortedItems.slice(0, 6));
      },
      (error) => {
        console.error("Profil sayfası Firestore hatası:", error);
        setLeads([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const displayName = useMemo(() => {
    return profile?.displayName || user?.displayName || user?.email || "Profil";
  }, [profile, user]);

  const initials = useMemo(() => {
    return String(displayName).trim().charAt(0).toUpperCase() || "P";
  }, [displayName]);

  const openRequests = useMemo(() => leads.filter((lead) => lead.status !== "done").length, [leads]);

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
          <p>Bir an bekleyin, hesabınız ve talepleriniz hazırlanıyor.</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="site-shell page-shell">
        <section className="modern-cta-card profile-guest-card">
          <div className="modern-cta-copy">
            <p className="eyebrow">Profil</p>
            <h2>Hesabınıza giriş yapın.</h2>
            <p>Profil sayfasını görüntülemek, sipariş geçmişinizi incelemek ve hızlı teklif taleplerinizi takip etmek için giriş yapın.</p>
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
            <small>Premium müşteri profili</small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Profil menüsü">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
          {adminProfile ? <Link href="/admin">Admin Panel</Link> : null}
        </div>
      </nav>

      <section className="profile-hero">
        <div className="profile-hero-card profile-hero-card--main">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="eyebrow">Müşteri profili</p>
            <h1>{displayName}</h1>
            <p>
              {profile?.role === "admin"
                ? "Admin hesabı aktif. Yönetim paneline hızlı erişim sağlayabilirsiniz."
                : "Ürünleri inceleyin, taleplerinizi takip edin ve AKC ile iletişimi sorunsuz yönetin."}
            </p>
          </div>
        </div>

        <div className="profile-hero-card profile-hero-card--actions">
          <span className="profile-badge">{profile?.role === "admin" ? "Yönetici" : "Müşteri"}</span>
          <strong>İşinizin akışını tek merkezden takip edin.</strong>
          <div className="profile-actions-row">
            <Link className="primary-btn" href="/urunler">
              Ürünleri İncele
            </Link>
            <button className="secondary-btn" type="button" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <p className="eyebrow">Hesap bilgisi</p>
          <h3>İletişim ve durum</h3>
          <ul className="profile-list">
            <li>
              <span>E-posta</span>
              <strong>{user.email || "Belirtilmedi"}</strong>
            </li>
            <li>
              <span>Telefon</span>
              <strong>{profile?.phoneNumber || user.phoneNumber || "Belirtilmedi"}</strong>
            </li>
            <li>
              <span>Durum</span>
              <strong>{adminProfile ? "Admin erişimi aktif" : "Müşteri hesabı aktif"}</strong>
            </li>
          </ul>
        </article>

        <article className="profile-card">
          <p className="eyebrow">Özet</p>
          <h3>Aktif talepler</h3>
          <div className="profile-stats">
            <div>
              <strong>{leads.length}</strong>
              <span>Toplam talep</span>
            </div>
            <div>
              <strong>{openRequests}</strong>
              <span>Açık talep</span>
            </div>
            <div>
              <strong>{profile?.isActive === false ? "Pasif" : "Aktif"}</strong>
              <span>Hesap</span>
            </div>
          </div>
        </article>
      </section>

      <section className="profile-card profile-card--wide">
        <div className="section-head section-head--centered">
          <p className="eyebrow">Son talepler</p>
          <h2>İletişim geçmişiniz burada görünür.</h2>
        </div>

        {leads.length === 0 ? (
          <div className="profile-empty-state">
            <p>Henüz bir sipariş veya teklif talebi oluşturulmadı.</p>
            <Link className="secondary-btn" href="/urunler">
              Ürünleri keşfet
            </Link>
          </div>
        ) : (
          <div className="profile-leads-list">
            {leads.map((lead) => (
              <article className="profile-lead-item" key={lead.id}>
                <div>
                  <small>{lead.status || "new"}</small>
                  <h4>{lead.vehicle || lead.message || "Teklif talebi"}</h4>
                  <p>{lead.message || "Açıklama yok."}</p>
                </div>
                <strong>{lead.createdAt?.toDate ? new Date(lead.createdAt.toDate()).toLocaleDateString("tr-TR") : "Yeni"}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
