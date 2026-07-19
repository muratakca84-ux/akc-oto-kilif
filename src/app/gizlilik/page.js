import Link from "next/link";

export const metadata = {
  title: "Gizlilik ve Çerez Politikası",
  description: "AKC Oto Kılıf gizlilik, çerez ve analitik ölçüm politikası.",
  alternates: { canonical: "/gizlilik" },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page site-shell">
      <Link href="/">← Ana sayfaya dön</Link>
      <p className="eyebrow">Yasal bilgilendirme</p>
      <h1>Gizlilik ve Çerez Politikası</h1>
      <p>Son güncelleme: 19 Temmuz 2026</p>
      <section>
        <h2>Toplanan bilgiler</h2>
        <p>
          Teklif formunda paylaştığınız ad, telefon, e-posta, araç ve mesaj bilgileri
          yalnızca talebinize dönüş yapmak ve hizmet sürecini yürütmek amacıyla işlenir.
        </p>
        <h2>Çerez ve analitik kullanımı</h2>
        <p>
          Zorunlu depolama sitenin temel işlevleri için kullanılır. GA4 ve benzeri
          analitik araçlar yalnızca açık izniniz sonrasında etkinleşir. Reklam amaçlı
          depolama varsayılan olarak kapalıdır.
        </p>
        <h2>Saklama ve güvenlik</h2>
        <p>
          Veriler, hizmet ve yasal yükümlülükler için gerekli süre boyunca saklanır;
          yetkisiz erişime karşı makul teknik ve idari önlemler uygulanır.
        </p>
        <h2>İletişim</h2>
        <p>
          Gizlilik talepleriniz için <a href="mailto:info@akcotokilif.com">info@akcotokilif.com</a>
          adresinden bize ulaşabilirsiniz.
        </p>
      </section>
    </main>
  );
}
