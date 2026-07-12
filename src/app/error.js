"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <main className="site-shell page-shell">
      <section className="modern-cta-card" style={{ marginTop: 60 }}>
        <div className="modern-cta-copy">
          <p className="eyebrow">Hata</p>
          <h2>Bir şeyler yanlış gitti.</h2>
          <p>
            Sayfa yüklenirken beklenmeyen bir sorun oluştu. Yeniden denemek
            veya ana sayfaya dönmek için aşağıdaki butonları kullanabilirsin.
          </p>
        </div>

        <div className="modern-cta-actions">
          <button className="primary-btn" type="button" onClick={() => reset()}>
            Yeniden Dene
          </button>
          <Link className="secondary-btn" href="/">
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </main>
  );
}
