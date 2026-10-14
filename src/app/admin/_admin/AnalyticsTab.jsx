"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminIcon from "./AdminIcon";
import { Card, Field, PageHead, SaveBar, Stat, Toggle } from "./AdminUI";

const FIELDS = [
  ["siteUrl", "Site adresi", "https://akcotokilif.com"],
  ["googleTagManagerId", "Google Tag Manager", "GTM-XXXXXXX"],
  ["googleAnalyticsId", "Google Analytics 4", "G-XXXXXXXXXX"],
  ["metaPixelId", "Meta Pixel", "123456789012345"],
  ["googleSiteVerification", "Search Console doğrulama kodu", ""],
  ["facebookDomainVerification", "Meta alan adı doğrulama kodu", ""],
];

function topPaths(events) {
  const map = new Map();
  events
    .filter((item) => item.eventType === "pageview")
    .forEach((item) => {
      const path = item.path || item.pagePath || "/";
      map.set(path, (map.get(path) || 0) + 1);
    });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
}

export default function AnalyticsTab({ settingsDraft, setSettingsDraft, saveSettings, saving, settingsDirty, leads }) {
  const [events, setEvents] = useState([]);
  const [access, setAccess] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "analyticsEvents"), orderBy("createdAt", "desc"), limit(500)),
      (snapshot) => {
        setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setAccess("ready");
      },
      () => {
        setEvents([]);
        setAccess("restricted");
      }
    );
  }, []);

  const summary = useMemo(() => {
    const pageviews = events.filter((item) => item.eventType === "pageview");
    return {
      pageviews: pageviews.length,
      mobile: pageviews.filter((item) => item.deviceType === "mobile").length,
      desktop: pageviews.filter((item) => item.deviceType === "desktop").length,
      leadEvents: events.filter((item) => /lead/i.test(item.eventName || item.eventType || "")).length,
      paths: topPaths(events),
    };
  }, [events]);

  const tagReady = Boolean(settingsDraft.googleAnalyticsId || settingsDraft.googleTagManagerId);
  const checks = [
    ["Ölçüm etiketi (GA4 veya GTM) girildi", tagReady],
    ["Search Console doğrulaması girildi", Boolean(settingsDraft.googleSiteVerification)],
    ["Site adresi https ile tanımlı", /^https:\/\//.test(settingsDraft.siteUrl || "")],
    ["Ölçüm açık", settingsDraft.trackingEnabled !== false],
    ["Çerez izni ölçüme bağlı", true],
    ["Yönetim sayfaları arama motorlarına kapalı", true],
  ];

  const set = (key) => (event) => {
    const value = event.target.value;
    setSettingsDraft((draft) => ({ ...draft, [key]: value }));
  };

  return (
    <>
      <PageHead title="Analitik & SEO" description="Site içi ziyaret özeti (son 500 kayıt) ve ölçüm entegrasyonları." />

      <div className="adm-stats">
        <Stat label="Sayfa görüntüleme" value={summary.pageviews} note="Son 500 kayıt" />
        <Stat label="Mobil" value={summary.mobile} note={summary.pageviews ? `%${Math.round((summary.mobile / summary.pageviews) * 100)}` : "—"} />
        <Stat label="Masaüstü" value={summary.desktop} note={summary.pageviews ? `%${Math.round((summary.desktop / summary.pageviews) * 100)}` : "—"} />
        <Stat label="Toplam talep" value={leads.length} note="Teklif formu" />
      </div>

      {access === "restricted" ? (
        <div className="adm-notice">
          <AdminIcon name="alert" />
          <p>
            Ziyaret verilerini okumak için Firestore kurallarında yöneticilere <code>analyticsEvents</code> okuma izni
            verilmelidir. Diğer ayarlar normal çalışır.
          </p>
        </div>
      ) : null}

      <div className="adm-grid adm-grid--main">
        <Card title="Ölçüm entegrasyonları" description="Çift sayımı önlemek için GA4'ü ya doğrudan ya da GTM üzerinden kullanın.">
          <div className="adm-form">
            {FIELDS.map(([key, label, placeholder]) => (
              <Field key={key} label={label}>
                <input className="adm-input" value={settingsDraft[key] || ""} placeholder={placeholder} onChange={set(key)} />
              </Field>
            ))}
            <div className="adm-field--wide adm-toggles">
              <Toggle
                checked={settingsDraft.trackingEnabled !== false}
                onChange={(value) => setSettingsDraft((draft) => ({ ...draft, trackingEnabled: value }))}
                label="Ölçüm açık"
              />
              <Toggle
                checked={settingsDraft.trackLocalhost === true}
                onChange={(value) => setSettingsDraft((draft) => ({ ...draft, trackLocalhost: value }))}
                label="Yerel geliştirmeyi de ölç"
              />
            </div>
          </div>
        </Card>

        <div className="adm-stack">
          <Card title="Kontrol listesi">
            <ul className="adm-checklist">
              {checks.map(([label, ok]) => (
                <li key={label} className={ok ? "is-ok" : ""}>
                  <span>{ok ? <AdminIcon name="check" size={14} /> : null}</span>
                  {label}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="En çok ziyaret edilen sayfalar">
            {summary.paths.length === 0 ? (
              <p className="adm-muted">Henüz veri yok.</p>
            ) : (
              <ul className="adm-bars">
                {summary.paths.map(([path, count]) => (
                  <li key={path}>
                    <span className="adm-truncate">{path}</span>
                    <strong>{count}</strong>
                    <i style={{ width: `${(count / summary.paths[0][1]) * 100}%` }} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <SaveBar dirty={settingsDirty} saving={saving} onSave={() => saveSettings()} label="Ayarları kaydet" />
    </>
  );
}
