"use client";

import Link from "next/link";

const tabIcons = {
  overview: "📊",
  themes: "🎨",
  homepage: "🏠",
  products: "🧵",
  gallery: "🖼️",
  leads: "📩",
  analytics: "📈",
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
            <span>AKC</span>
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
            const icon = tabIcons[key] || "•";

            return (
              <button
                key={key}
                className={isActive ? "active" : ""}
                onClick={() => setActiveTab(key)}
                type="button"
              >
                <span className="admin-tab-icon">{icon}</span>

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

          <Link className="admin-mini-action" href="/admin/analytics">
            <span>📈</span>
            Analitik
          </Link>
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

            <Link className="admin-secondary-btn" href="/admin/analytics">
              Analitik
            </Link>

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