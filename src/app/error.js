"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <main className="status-page">
      <div className="container container--narrow">
        <p className="eyebrow">Beklenmeyen hata</p>
        <h1>Sayfa yüklenirken bir sorun oluştu.</h1>
        <p className="lead">Lütfen tekrar deneyin. Sorun devam ederse bizi telefonla arayabilirsiniz.</p>
        <div className="actions">
          <button className="btn btn-primary" type="button" onClick={() => reset()}>Tekrar dene</button>
          <Link className="btn btn-outline" href="/">Ana sayfaya dön</Link>
        </div>
      </div>
    </main>
  );
}
