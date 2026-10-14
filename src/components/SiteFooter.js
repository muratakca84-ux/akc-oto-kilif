"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Icon from "@/components/Icon";
import { getContact } from "@/lib/site-config";
import { SERVICE_PAGES } from "@/lib/seo";
import { useSiteSettings } from "@/lib/use-site-settings";

export default function SiteFooter() {
  const settings = useSiteSettings();
  const contact = getContact(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-cta">
        <div>
          <h2>Aracınız için net fiyat alın.</h2>
          <p>Marka, model ve yıl bilgisini paylaşın; en kısa sürede dönüş yapalım.</p>
        </div>
        <div className="footer-cta-actions">
          <a className="btn btn-primary" href={contact.whatsappHref()} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={18} /> WhatsApp
          </a>
          <a className="btn btn-on-dark" href={contact.phoneHref}>
            <Icon name="phone" size={18} /> {contact.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand--footer" href="/">
            <img className="brand-logo" src={settings.brandLogoUrl} alt="" width={44} height={44} />
            <span className="brand-text">
              <strong>{settings.footerTitle || settings.businessName}</strong>
              <small>{settings.brandSubtitle}</small>
            </span>
          </Link>
          <p>{settings.footerDescription}</p>
          {contact.instagram ? (
            <a className="footer-social" href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Icon name="instagram" size={18} /> Instagram
            </a>
          ) : null}
        </div>

        <div className="footer-col">
          <h3>Kurumsal</h3>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
          <Link href="/#surec">Çalışma Süreci</Link>
          <Link href="/#galeri">Uygulamalar</Link>
          <Link href="/#sss">Sık Sorulanlar</Link>
        </div>

        <div className="footer-col">
          <h3>Hizmetler</h3>
          {SERVICE_PAGES.map((service) => (
            <Link key={service.slug} href={`/hizmetler/${service.slug}`}>
              {service.title}
            </Link>
          ))}
        </div>

        <div className="footer-col footer-contact">
          <h3>İletişim</h3>
          <a href={contact.phoneHref}>
            <Icon name="phone" size={16} /> {contact.phoneDisplay}
          </a>
          <a href={contact.emailHref}>
            <Icon name="mail" size={16} /> {contact.email}
          </a>
          <a href={contact.mapsUrl} target="_blank" rel="noreferrer">
            <Icon name="pin" size={16} /> {contact.address}
          </a>
          <span>
            <Icon name="clock" size={16} /> {contact.workingHours}
          </span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{settings.footerCopy || `© ${year} ${settings.businessName}. Tüm hakları saklıdır.`}</span>
        <nav aria-label="Yasal bağlantılar">
          <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
          <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link>
        </nav>
      </div>
    </footer>
  );
}
