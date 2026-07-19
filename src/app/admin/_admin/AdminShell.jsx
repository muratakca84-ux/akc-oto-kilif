"use client";

import Link from "next/link";
import Image from "next/image";

const tabIcons = {
  overview: "M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-13h6V4h-6v3Z",
  themes: "M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0-2-12ZM7.5 12a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm2-4a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm2 4a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z",
  homepage: "M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 3.5h-4L10.7 6A8 8 0 0 0 9 7L6.6 6 4.6 9.5l2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.3 2.5h4l.3-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z",
  products: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Zm8 4.5 7.5-4.2M12 12 4.5 7.8M12 12v8.5",
  gallery: "M4 5h16v14H4V5Zm2 11 4-4 3 3 2-2 3 3M8 9h.01",
  leads: "M4 6h16v12H4V6Zm1 1 7 6 7-6",
  analytics: "M5 19V9m7 10V5m7 14v-7",
};

function getDisplayName(adminProfile) {
  return (
    adminProfile?.displayName ||
    adminProfile?.name ||
    adminProfile?.email ||
    "Yetkili kullanıcı"
  );
}

function getRoleLabel(role) {
  if (!role) return "Admin";
  if (role === "owner") return "İşletme Sahibi";
  if (role === "admin") return "Yönetici";
  if (role === "editor") return "Editör";
  return role;
}

export default function AdminShell({
  children,
  tabs = [],
  activeTab,
  setActiveTab,
  adminProfile,
  handleLogout,
  toast,
  seedDemoContent,
}) {
  const displayName = getDisplayName(adminProfile);
  const roleLabel = getRoleLabel(adminProfile?.role);
  const initial = String(displayName).trim().charAt(0).toUpperCase() || "A";

  const totalTabCount = tabs.reduce((total, [, , count]) => {
    const number = Number(count);
    return Number.isFinite(number) ? total + number : total;
  }, 0);

  const activeTabLabel =
    tabs.find(([key]) => key === activeTab)?.[1] || "Yönetim";

  return (
    <main className="admin-shell admin-shell-pro">
      <aside className="admin-sidebar admin-sidebar-pro">
        <div className="admin-sidebar-head">
          <Link className="admin-logo admin-logo-pro" href="/">
            <span><Image src="/images/akc-logo-square.png" alt="AKC Oto Kılıf" width={52} height={52} /></span>
            <div>
              <strong>AKC Admin</strong>
              <small>Operasyon Merkezi</small>
            </div>
          </Link>

          <div className="admin-live-badge">
            <span />
            Canlı panel
          </div>
        </div>

        <div className="admin-sidebar-summary">
          <small>Aktif bölüm</small>
          <strong>{activeTabLabel}</strong>
          <p>İçerik, ürün, galeri ve müşteri taleplerini tek merkezden yönet.</p>
        </div>

        <nav className="admin-tabs admin-tabs-pro" aria-label="Admin menü">
          {tabs.map(([key, label, count]) => {
            const isActive = activeTab === key;
            const icon = tabIcons[key] || tabIcons.overview;

            return (
              <button
                key={key}
                className={isActive ? "active" : ""}
                onClick={() => setActiveTab(key)}
                type="button"
              >
                <span className="admin-tab-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon} /></svg></span>

                <span className="admin-tab-copy">
                  <strong>{label}</strong>
                  <small>{isActive ? "Şu an açık" : "Yönet"}</small>
                </span>

                {Number(count) > 0 ? <em>{count}</em> : null}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-actions">
          <Link className="admin-mini-action" href="/" target="_blank" rel="noreferrer">
            <span>↗</span>
            Siteyi aç
          </Link>

          <button className="admin-mini-action" type="button" onClick={() => setActiveTab("analytics")}>
            <span>📈</span> Analitik merkezi
          </button>
        </div>

        <div className="admin-user admin-user-pro">
          <div className="admin-user-avatar">{initial}</div>

          <div className="admin-user-info">
            <small>Giriş yapan</small>
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>

          <button type="button" onClick={handleLogout}>
            Çıkış yap
          </button>
        </div>
      </aside>

      <section className="admin-content admin-content-pro">
        <header className="admin-topbar admin-topbar-pro">
          <div className="admin-topbar-copy">
            <p className="eyebrow">AKC Oto Kılıf</p>
            <h1>Yönetim merkezi</h1>
            <span>
              Ana sayfa, tema, ürünler, galeri, müşteri talepleri ve analitik
              ekranları kurumsal panel üzerinden yönetilir.
            </span>
          </div>

          <div className="admin-topbar-status">
            <div>
              <small>Panel durumu</small>
              <strong>Aktif</strong>
            </div>

            <div>
              <small>Toplam kayıt</small>
              <strong>{totalTabCount}</strong>
            </div>

            <div>
              <small>Yetki</small>
              <strong>{roleLabel}</strong>
            </div>
          </div>

          <div className="topbar-actions topbar-actions-pro">
            <button
              className="admin-secondary-btn"
              type="button"
              onClick={seedDemoContent}
              disabled={!seedDemoContent}
            >
              Örnek içerik
            </button>

            <button className="admin-secondary-btn" type="button" onClick={() => setActiveTab("homepage")}>
              Site ayarları
            </button>

            <Link className="admin-primary-btn" href="/" target="_blank" rel="noreferrer">
              Siteyi görüntüle
            </Link>
          </div>
        </header>

        {toast ? (
          <div className="admin-toast admin-toast-pro" role="status">
            <span>✓</span>
            {toast}
          </div>
        ) : null}

        <div className="admin-page-body">{children}</div>
      </section>
    </main>
  );
}
