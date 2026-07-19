"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fields = [
  ["siteUrl", "Canlı site adresi", "https://akcotokilif.com"],
  ["googleAnalyticsId", "Google Analytics 4", "G-XXXXXXXXXX"],
  ["googleTagManagerId", "Google Tag Manager", "GTM-XXXXXXX"],
  ["metaPixelId", "Meta Pixel", "123456789012345"],
  ["googleSiteVerification", "Google Search Console doğrulaması", "Doğrulama kodu"],
  ["facebookDomainVerification", "Meta domain doğrulaması", "Doğrulama kodu"],
];

export default function AnalyticsTab({ settingsDraft, setSettingsDraft, saveSettings, saving, products, galleryItems, leads }) {
  const [events, setEvents] = useState([]);
  const [eventsAccess, setEventsAccess] = useState("loading");

  useEffect(() => {
    const eventsQuery = query(collection(db, "analyticsEvents"), orderBy("createdAt", "desc"), limit(500));
    return onSnapshot(
      eventsQuery,
      (snapshot) => {
        setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setEventsAccess("ready");
      },
      () => {
        setEvents([]);
        setEventsAccess("restricted");
      },
    );
  }, []);

  const summary = useMemo(() => ({
    pageviews: events.filter((item) => item.eventType === "pageview").length,
    mobile: events.filter((item) => item.deviceType === "mobile").length,
    desktop: events.filter((item) => item.deviceType === "desktop").length,
    openLeads: leads.filter((item) => item.status !== "done").length,
  }), [events, leads]);

  const trackingReady = Boolean(settingsDraft.googleAnalyticsId || settingsDraft.googleTagManagerId);

  return (
    <div className="admin-tab-stack analytics-tab-modern">
      <section className="admin-panel admin-section-hero">
        <div>
          <span className="admin-kicker">Ölçüm merkezi</span>
          <h2>Analitik, reklam ve SEO sağlığı</h2>
          <p>Son 500 anonim etkinliği izle; GA4, GTM, Meta Pixel ve doğrulama kodlarını tek yerden yönet.</p>
        </div>
        <span className={`admin-health-badge ${trackingReady ? "is-ready" : ""}`}>
          <i /> {trackingReady ? "Ölçüm hazır" : "Kurulum bekliyor"}
        </span>
      </section>

      <section className="admin-grid analytics-metric-grid">
        {[
          ["Sayfa görüntüleme", summary.pageviews, "Son 500 kayıt"],
          ["Mobil ziyaret", summary.mobile, "Cihaz dağılımı"],
          ["Masaüstü ziyaret", summary.desktop, "Cihaz dağılımı"],
          ["Açık talep", summary.openLeads, `${leads.length} toplam talep`],
          ["Aktif ürün", products.filter((item) => item.isActive !== false).length, `${products.length} toplam kart`],
          ["Galeri", galleryItems.length, "Yayındaki çalışmalar"],
        ].map(([label, value, note]) => (
          <article className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong><p>{note}</p></article>
        ))}
      </section>

      {eventsAccess === "restricted" ? (
        <section className="admin-data-notice" role="status">
          <span>i</span>
          <div><strong>Ziyaret verileri için okuma izni gerekiyor</strong><p>Panel çalışmaya devam ediyor. Firestore kurallarında aktif admin kullanıcısına <code>analyticsEvents</code> okuma yetkisi verildiğinde metrikler otomatik görünür.</p></div>
        </section>
      ) : null}

      <section className="admin-panel">
        <div className="panel-head"><div><span className="admin-kicker">Entegrasyonlar</span><h2>Takip ve doğrulama ayarları</h2><p>Çift sayımı önlemek için GA4’ü doğrudan veya GTM üzerinden çalıştır; ikisini birlikte kullanma.</p></div></div>
        <form className="settings-form analytics-settings-form" onSubmit={saveSettings}>
          <div className="analytics-switches">
            <label className="admin-switch"><input type="checkbox" checked={settingsDraft.trackingEnabled !== false} onChange={(event) => setSettingsDraft({ ...settingsDraft, trackingEnabled: event.target.checked })} /><span /><b>Ölçüm aktif</b></label>
            <label className="admin-switch"><input type="checkbox" checked={settingsDraft.trackLocalhost === true} onChange={(event) => setSettingsDraft({ ...settingsDraft, trackLocalhost: event.target.checked })} /><span /><b>Localhost takibi</b></label>
          </div>
          <div className="admin-form-grid analytics-form-grid">
            {fields.map(([key, label, placeholder]) => (
              <label key={key}><span>{label}</span><input value={settingsDraft[key] || ""} placeholder={placeholder} onChange={(event) => setSettingsDraft({ ...settingsDraft, [key]: event.target.value })} /><small>{settingsDraft[key] ? "Bağlantı bilgisi girildi" : "Henüz yapılandırılmadı"}</small></label>
            ))}
          </div>
          <button className="admin-primary-btn" type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Analitik ayarlarını kaydet"}</button>
        </form>
      </section>

      <section className="admin-panel admin-checklist-panel">
        <div className="panel-head"><div><span className="admin-kicker">Yayın kontrolü</span><h2>SEO kontrol listesi</h2></div></div>
        <div className="admin-checklist-grid">
          {["Canlı domain ve SSL aktif", "GA4 veya GTM kimliği girildi", "Search Console doğrulandı", "Meta domain doğrulandı", "Admin sayfaları noindex", "Çerez izni ölçümle bağlı"].map((item, index) => <div key={item}><span>{index < 2 && trackingReady ? "✓" : "○"}</span><p>{item}</p></div>)}
        </div>
      </section>
    </div>
  );
}
