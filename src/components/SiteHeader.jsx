"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthNavMenu from "@/components/AuthNavMenu";
import Icon from "@/components/Icon";
import { getContact } from "@/lib/site-config";
import { useSiteSettings } from "@/lib/use-site-settings";

const NAV = [
  ["/#hizmetler", "Hizmetler"],
  ["/urunler", "Ürünler"],
  ["/#surec", "Süreç"],
  ["/#galeri", "Uygulamalar"],
  ["/#sss", "SSS"],
  ["/#iletisim", "İletişim"],
];

export default function SiteHeader() {
  const settings = useSiteSettings();
  const contact = getContact(settings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="topbar-item">
            <Icon name="pin" size={15} />
            {contact.address}
          </span>
          <span className="topbar-item topbar-hours">
            <Icon name="clock" size={15} />
            {contact.workingHours}
          </span>
          <span className="topbar-spacer" />
          <a className="topbar-item" href={contact.emailHref}>
            <Icon name="mail" size={15} />
            {contact.email}
          </a>
          <a className="topbar-item topbar-strong" href={contact.phoneHref}>
            <Icon name="phone" size={15} />
            {contact.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="navbar">
        <div className="container navbar-inner">
          <Link className="brand" href="/" aria-label={`${settings.businessName} ana sayfa`}>
            <img className="brand-logo" src={settings.brandLogoUrl} alt="" width={44} height={44} />
            <span className="brand-text">
              <strong>{settings.businessName}</strong>
              <small>{settings.brandSubtitle}</small>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Ana menü">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <AuthNavMenu />
            <Link className="btn btn-primary btn-sm nav-cta" href="/#iletisim">
              Teklif Al
            </Link>
            <button
              type="button"
              className="nav-icon-btn nav-toggle"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobil menü">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <Icon name="chevron" size={18} />
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-actions">
          <a className="btn btn-primary" href={contact.phoneHref}>
            <Icon name="phone" size={18} /> {contact.phoneDisplay}
          </a>
          <a className="btn btn-outline" href={contact.whatsappHref()} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={18} /> WhatsApp ile yazın
          </a>
        </div>
      </div>
    </header>
  );
}
