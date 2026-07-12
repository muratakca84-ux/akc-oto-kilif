import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell page-shell">
      <section className="modern-cta-card" style={{ marginTop: 60 }}>
        <div className="modern-cta-copy">
          <p className="eyebrow">404</p>
          <h2>Aradığın sayfa taşınmış veya mevcut değil.</h2>
          <p>
            Ana sayfaya dönerek ürünleri keşfedebilir, WhatsApp üzerinden teklif
            alabilir veya giriş yaparak yönetim panelini görüntüleyebilirsin.
          </p>
        </div>

        <div className="modern-cta-actions">
          <Link className="primary-btn" href="/">
            Ana Sayfaya Dön
          </Link>
          <Link className="secondary-btn" href="/urunler">
            Ürünleri İncele
          </Link>
        </div>
      </section>
    </main>
  );
}
