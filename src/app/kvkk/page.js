import Link from "next/link";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "AKC Oto Kılıf kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

export default function KvkkPage() {
  return (
    <main className="legal-page site-shell">
      <Link href="/">← Ana sayfaya dön</Link>
      <p className="eyebrow">6698 sayılı Kanun</p>
      <h1>KVKK Aydınlatma Metni</h1>
      <p>Son güncelleme: 19 Temmuz 2026</p>
      <section>
        <h2>Veri sorumlusu ve amaç</h2>
        <p>
          AKC Oto Kılıf, iletişim ve teklif talepleriniz kapsamında paylaştığınız
          kimlik, iletişim ve araç bilgilerini talebinizi yanıtlamak, hizmet sunmak,
          müşteri ilişkilerini yürütmek ve yasal yükümlülükleri yerine getirmek için işler.
        </p>
        <h2>Hukuki sebep ve aktarım</h2>
        <p>
          Veriler; sözleşmenin kurulması, meşru menfaat, hukuki yükümlülük ve gerekli
          hallerde açık rıza sebeplerine dayanılarak işlenir. Yalnızca hizmetin gerektirdiği
          altyapı sağlayıcıları ve yetkili kurumlarla, mevzuata uygun biçimde paylaşılabilir.
        </p>
        <h2>Haklarınız</h2>
        <p>
          KVKK madde 11 kapsamındaki bilgi alma, düzeltme, silme ve itiraz haklarınızı
          kullanmak için <a href="mailto:info@akcotokilif.com">info@akcotokilif.com</a>
          adresine başvurabilirsiniz.
        </p>
      </section>
    </main>
  );
}
