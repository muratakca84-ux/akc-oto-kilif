"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isActiveAdmin } from "@/lib/customer-profile";
import { formatDate } from "@/lib/format";
import { getContact, onlyDigits } from "@/lib/site-config";
import { useSiteSettings } from "@/lib/use-site-settings";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";

const STATUS = {
  new: ["Alındı", "info"],
  contacted: ["Görüşüldü", "warning"],
  done: ["Tamamlandı", "success"],
};

function timeOf(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default function ProfilePage() {
  const router = useRouter();
  const contact = getContact(useSiteSettings());
  const [session, setSession] = useState({ loading: true, user: null, profile: null, isAdmin: false });
  const [leadSources, setLeadSources] = useState({});

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSession({ loading: false, user: null, profile: null, isAdmin: false });
        return;
      }
      const [profileSnap, admin] = await Promise.all([
        getDoc(doc(db, "users", user.uid)).catch(() => null),
        isActiveAdmin(user),
      ]);
      setSession({
        loading: false,
        user,
        profile: profileSnap?.exists() ? profileSnap.data() : null,
        isAdmin: admin,
      });
    });
  }, []);

  const { user, profile, isAdmin } = session;
  const email = String(user?.email || "").trim().toLowerCase();
  const phoneDigits = onlyDigits(profile?.phoneNumber || user?.phoneNumber || "");

  // Talepleri kullanıcı kimliği, e-posta ve telefonla eşleştirir (kurallar izin verdiği ölçüde).
  useEffect(() => {
    if (!user || isAdmin) return undefined;

    const sources = [["uid", where("userId", "==", user.uid)]];
    if (email) sources.push(["email", where("email", "==", email)]);
    if (phoneDigits) sources.push(["phone", where("phoneDigits", "==", phoneDigits)]);

    const unsubscribers = sources.map(([key, condition]) =>
      onSnapshot(
        query(collection(db, "leads"), condition),
        (snapshot) =>
          setLeadSources((current) => ({
            ...current,
            [key]: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          })),
        () => setLeadSources((current) => ({ ...current, [key]: [] }))
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user, isAdmin, email, phoneDigits]);

  const leads = useMemo(() => {
    const map = new Map();
    Object.values(leadSources)
      .flat()
      .forEach((lead) => map.set(lead.id, lead));
    return Array.from(map.values()).sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt));
  }, [leadSources]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  const displayName = profile?.displayName || user?.displayName || user?.email || "";

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="İçerik yolu">
              <Link href="/">Ana Sayfa</Link>
              <Icon name="chevron" size={14} />
              <span>Hesabım</span>
            </nav>
            <h1>{session.loading ? "Hesabım" : user ? `Merhaba, ${String(displayName).split(/[\s@]/)[0]}` : "Hesabım"}</h1>
            <p className="lead">
              {isAdmin
                ? "Yönetici hesabıyla giriş yaptınız."
                : "Hesap bilgilerinizi ve teklif taleplerinizin durumunu buradan takip edebilirsiniz."}
            </p>
          </div>
        </section>

        <section className="section section--tight">
          <div className="container">
            {session.loading ? (
              <p className="catalog-empty">Yükleniyor…</p>
            ) : !user ? (
              <div className="card empty-card">
                <h2>Hesabınıza giriş yapın</h2>
                <p className="muted">Taleplerinizi görmek için giriş yapmanız gerekir.</p>
                <div className="actions">
                  <Link className="btn btn-primary" href="/login">Giriş yap</Link>
                  <Link className="btn btn-outline" href="/register">Üye ol</Link>
                </div>
              </div>
            ) : (
              <div className="account-grid">
                <aside className="card account-card">
                  <div className="account-head">
                    <span className="avatar-lg">{String(displayName).charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{displayName}</strong>
                      <span className={`badge badge--${isAdmin ? "info" : "neutral"}`}>
                        {isAdmin ? "Yönetici" : "Müşteri"}
                      </span>
                    </div>
                  </div>
                  <dl className="definition-list">
                    <div>
                      <dt>E-posta</dt>
                      <dd>{user.email || "—"}</dd>
                    </div>
                    <div>
                      <dt>Telefon</dt>
                      <dd>{profile?.phoneNumber || user.phoneNumber || "—"}</dd>
                    </div>
                    <div>
                      <dt>Üyelik</dt>
                      <dd>{profile?.createdAt ? formatDate(profile.createdAt) : "—"}</dd>
                    </div>
                  </dl>
                  <div className="stack">
                    {isAdmin ? (
                      <Link className="btn btn-primary btn-block" href="/admin">
                        Yönetim paneline git
                      </Link>
                    ) : (
                      <Link className="btn btn-primary btn-block" href="/#iletisim">
                        Yeni teklif talebi
                      </Link>
                    )}
                    <button className="btn btn-outline btn-block" type="button" onClick={handleLogout}>
                      Çıkış yap
                    </button>
                  </div>
                </aside>

                <div className="card">
                  <div className="card-head">
                    <h2>Teklif talepleriniz</h2>
                    <span className="muted">{leads.length} kayıt</span>
                  </div>

                  {isAdmin ? (
                    <p className="muted">Tüm müşteri talepleri yönetim panelindeki “Talepler” bölümünde listelenir.</p>
                  ) : leads.length === 0 ? (
                    <div className="empty-inline">
                      <p>Henüz bir teklif talebiniz yok.</p>
                      <a className="btn btn-outline btn-sm" href={contact.whatsappHref()} target="_blank" rel="noreferrer">
                        <Icon name="whatsapp" size={16} /> WhatsApp ile yazın
                      </a>
                    </div>
                  ) : (
                    <ul className="request-list">
                      {leads.map((lead) => {
                        const [label, tone] = STATUS[lead.status] || STATUS.new;
                        return (
                          <li key={lead.id}>
                            <div>
                              <strong>{lead.vehicle || "Teklif talebi"}</strong>
                              <p>{lead.message || "—"}</p>
                              <small>{formatDate(lead.createdAt)}</small>
                            </div>
                            <span className={`badge badge--${tone}`}>{label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
