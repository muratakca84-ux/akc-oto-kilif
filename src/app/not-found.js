import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="status-page">
        <div className="container container--narrow">
          <p className="eyebrow">Hata 404</p>
          <h1>Aradığınız sayfa bulunamadı.</h1>
          <p className="lead">Sayfa taşınmış veya kaldırılmış olabilir. Ana sayfadan devam edebilirsiniz.</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/">Ana sayfaya dön</Link>
            <Link className="btn btn-outline" href="/urunler">Ürünleri inceleyin</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
