"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import AdminIcon from "./AdminIcon";

export const ADMIN_TABS = [
  { key: "overview", label: "Genel Bakış", icon: "grid", group: "Panel" },
  { key: "leads", label: "Talepler", icon: "inbox", group: "Panel", count: "newLeads" },
  { key: "products", label: "Ürünler", icon: "box", group: "İçerik", count: "products" },
  { key: "gallery", label: "Galeri", icon: "image", group: "İçerik", count: "gallery" },
  { key: "homepage", label: "Site Ayarları", icon: "settings", group: "Site" },
  { key: "themes", label: "Tema", icon: "palette", group: "Site" },
  { key: "analytics", label: "Analitik & SEO", icon: "chart", group: "Site" },
];

const ROLE_LABELS = { owner: "İşletme sahibi", admin: "Yönetici", editor: "Editör" };

export default function AdminShell({
  children,
  activeTab,
  setActiveTab,
  counts = {},
  adminProfile,
  handleLogout,
  toast,
  dismissToast,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = adminProfile?.displayName || adminProfile?.name || adminProfile?.email || "Yönetici";
  const active = ADMIN_TABS.find((tab) => tab.key === activeTab) || ADMIN_TABS[0];
  const groups = [...new Set(ADMIN_TABS.map((tab) => tab.group))];

  function go(key) {
    setActiveTab(key);
    setMenuOpen(false);
  }

  return (
    <div className="adm">
      <aside className={`adm-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="adm-brand">
          <Image src="/images/akc-logo-square.png" alt="" width={36} height={36} />
          <div>
            <strong>AKC Oto Kılıf</strong>
            <span>Yönetim Paneli</span>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Yönetim menüsü">
          {groups.map((group) => (
            <div className="adm-nav-group" key={group}>
              <span className="adm-nav-title">{group}</span>
              {ADMIN_TABS.filter((tab) => tab.group === group).map((tab) => {
                const count = tab.count ? Number(counts[tab.count]) || 0 : 0;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`adm-nav-item ${activeTab === tab.key ? "is-active" : ""}`}
                    aria-current={activeTab === tab.key ? "page" : undefined}
                    onClick={() => go(tab.key)}
                  >
                    <AdminIcon name={tab.icon} />
                    <span>{tab.label}</span>
                    {count > 0 ? (
                      <em className={tab.key === "leads" ? "is-alert" : ""}>{count}</em>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-user">
          <span className="adm-avatar">{String(displayName).charAt(0).toUpperCase()}</span>
          <div className="adm-user-info">
            <strong title={displayName}>{displayName}</strong>
            <span>{ROLE_LABELS[adminProfile?.role] || "Yönetici"}</span>
          </div>
          <button type="button" className="adm-icon-btn" onClick={handleLogout} aria-label="Çıkış yap" title="Çıkış yap">
            <AdminIcon name="logout" />
          </button>
        </div>
      </aside>

      {menuOpen ? <button className="adm-scrim" type="button" aria-label="Menüyü kapat" onClick={() => setMenuOpen(false)} /> : null}

      <div className="adm-main">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-icon-btn adm-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <AdminIcon name="menu" />
          </button>
          <div className="adm-topbar-title">
            <span>{active.group}</span>
            <h1>{active.label}</h1>
          </div>
          <Link className="adm-btn adm-btn--secondary" href="/" target="_blank" rel="noreferrer">
            <AdminIcon name="external" size={16} />
            <span className="adm-hide-sm">Siteyi görüntüle</span>
          </Link>
        </header>

        <main className="adm-content">{children}</main>
      </div>

      {toast ? (
        <div className={`adm-toast adm-toast--${toast.tone}`} role="status" aria-live="polite">
          <AdminIcon name={toast.tone === "error" ? "alert" : "check"} size={18} />
          <span>{toast.text}</span>
          <button type="button" onClick={dismissToast} aria-label="Kapat">
            <AdminIcon name="close" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
