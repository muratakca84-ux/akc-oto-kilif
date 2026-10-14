import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCatalog from "@/components/ProductCatalog";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import Icon from "@/components/Icon";
import { getServisHazirProducts } from "@/lib/servishazir";

// Servis Hazır ürünleri 5 dakikada bir tazelenir.
export const revalidate = 300;

export default async function ProductsPage() {
  const externalProducts = await getServisHazirProducts();
  return (
    <>
      <SiteHeader />
      <FloatingContactButtons />

      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="İçerik yolu">
              <Link href="/">Ana Sayfa</Link>
              <Icon name="chevron" size={14} />
              <span>Ürünler</span>
            </nav>
            <h1>Oto kılıf ve döşeme ürünleri</h1>
            <p className="lead">
              Araç tipinize uygun kılıf ve döşeme seçeneklerini inceleyin. Fiyatı belirtilmeyen ürünlerde
              aracınızın marka, model ve yıl bilgisiyle net fiyat veriyoruz.
            </p>
          </div>
        </section>

        <section className="section section--tight">
          <div className="container">
            <ProductCatalog externalProducts={externalProducts} />
          </div>
        </section>

        <section className="section section-alt section--tight">
          <div className="container note-grid">
            <div>
              <Icon name="ruler" size={24} />
              <h3>Araca özel ölçü</h3>
              <p>Tüm ürünler aracınızın koltuk yapısına göre hazırlanır.</p>
            </div>
            <div>
              <Icon name="wrench" size={24} />
              <h3>Montaj dahil</h3>
              <p>Uygulama Karatay&apos;daki atölyemizde randevu ile yapılır.</p>
            </div>
            <div>
              <Icon name="shield" size={24} />
              <h3>Net teklif</h3>
              <p>Malzeme, süre ve fiyat işe başlamadan paylaşılır.</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
