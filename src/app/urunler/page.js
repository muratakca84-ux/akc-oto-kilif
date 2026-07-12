"use client";

import Link from "next/link";
import AuthNavMenu from "@/components/AuthNavMenu";
import ProductCatalog from "@/components/ProductCatalog";

export default function ProductsPage() {
  return (
    <main className="site-shell page-shell">
      <nav className="navbar navbar--compact">
        <Link className="brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
          <span className="brand-mark">AKC</span>
          <span>
            <strong>AKC Oto Kılıf</strong>
            <small>Premium ürünler • Sipariş merkezi</small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Sayfa menüsü">
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
        </div>

        <div className="nav-actions">
          <AuthNavMenu />
        </div>
      </nav>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Ürünler</p>
          <h1>Modern ve premium oto kılıf çözümleri burada.</h1>
          <p>
            Aracınıza uygun özel üretim ürünleri inceleyin, fiyat bilgilerini
            görün ve bir tıkla WhatsApp üzerinden sipariş verin.
          </p>
        </div>

        <div className="page-hero-card">
          <span>Özel ölçü</span>
          <strong>Detay odaklı, şık ve dayanıklı</strong>
          <Link className="primary-btn" href="/">
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>

      <ProductCatalog />
    </main>
  );
}
