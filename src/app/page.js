const PHONE_DISPLAY = "+90 500 000 00 00";
const PHONE_HREF = "tel:+905000000000";

const WHATSAPP_NUMBER = "905000000000";

const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20arac%C4%B1m%20i%C3%A7in%20teklif%20almak%20istiyorum.`;

const REGISTER_REQUEST_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20yetkili%20kullan%C4%B1c%C4%B1%20kay%C4%B1t%20talebi%20olu%C5%9Fturmak%20istiyorum.`;

const EMAIL_HREF = "mailto:info@akcotokilif.com";

const services = [
  {
    title: "Araca Özel Oto Kılıf",
    text: "Araç marka, model, yıl ve koltuk yapısına göre hazırlanan; koltuğa net oturan, potluk yapmayan özel dikim kılıf çözümleri.",
    icon: "✦",
  },
  {
    title: "Profesyonel Montaj",
    text: "Koltuk formunu bozmadan, airbag ve emniyet detaylarına dikkat edilerek yapılan temiz, kontrollü ve özenli montaj.",
    icon: "◆",
  },
  {
    title: "Koltuk Döşeme Yenileme",
    text: "Yıpranmış, solmuş veya eskimiş koltuklar için deri, kumaş ve kombin malzeme seçenekleriyle yenileme hizmeti.",
    icon: "◈",
  },
  {
    title: "Ticari Araç Çözümleri",
    text: "Taksi, servis, filo ve hafif ticari araçlar için uzun ömürlü, kolay temizlenebilir ve yoğun kullanıma uygun çözümler.",
    icon: "⬢",
  },
];

const categories = [
  "Binek Araç",
  "SUV",
  "Hafif Ticari",
  "Taksi",
  "Servis Aracı",
  "Filo Araçları",
];

const steps = [
  "Araç marka, model ve yıl bilgisi alınır.",
  "Kullanım amacı ve malzeme beklentisi netleştirilir.",
  "Renk, dikiş ve tasarım seçenekleri belirlenir.",
  "Üretim ve profesyonel montaj süreci tamamlanır.",
];

const gallery = [
  "Premium deri görünüm",
  "Spor dikiş detayları",
  "Kumaş + deri kombin",
  "Filo tipi dayanıklı kullanım",
  "Araç içi yenileme",
  "Özel renk uygulamaları",
];

const advantages = [
  "Model uyumlu ölçü mantığı",
  "Koltuğa oturan temiz görünüm",
  "Yoğun kullanıma uygun malzeme",
  "Kurumsal araçlar için filo çözümü",
  "WhatsApp üzerinden hızlı teklif",
  "Admin panel ile yönetilebilir altyapı",
];

const adminFeatures = [
  "Ürün ve hizmet kartları yönetimi",
  "Galeri ve portfolyo alanı yönetimi",
  "Müşteri taleplerini takip etme",
  "Telefon, WhatsApp, adres ve site metinlerini düzenleme",
];

const faqs = [
  {
    q: "Kılıflar araca özel mi hazırlanıyor?",
    a: "Evet. AKC Oto Kılıf tarafında hedef, universal kılıf gibi bol duran bir görüntü değil; koltuğa oturan, temiz ve profesyonel duran bir sonuçtur.",
  },
  {
    q: "Airbag uyumu önemli mi?",
    a: "Evet, çok önemli. Koltuk güvenlik yapısı dikkate alınmadan yapılan uygulamalar doğru değildir. Montaj ve dikim planı bu hassasiyetle yapılmalıdır.",
  },
  {
    q: "Ticari araçlara uygun üretim var mı?",
    a: "Evet. Taksi, servis, filo ve hafif ticari araçlarda dayanıklı, kolay temizlenebilir ve yoğun kullanıma uygun malzemeler tercih edilir.",
  },
  {
    q: "Teklif almak için hangi bilgiler gerekir?",
    a: "Araç marka, model, yıl, koltuk tipi ve istenen malzeme tarzı yeterlidir. Fotoğraf gönderilirse daha net değerlendirme yapılabilir.",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="navbar">
        <a className="brand" href="#top" aria-label="AKC Oto Kılıf Ana Sayfa">
          <span className="brand-mark">AKC</span>
          <span>
            <strong>AKC Oto Kılıf</strong>
            <small>Özel dikim • Döşeme • Profesyonel montaj</small>
          </span>
        </a>

        <div className="nav-links" aria-label="Sayfa menüsü">
          <a href="#hizmetler">Hizmetler</a>
          <a href="#surec">Süreç</a>
          <a href="#galeri">Galeri</a>
          <a href="#kurumsal">Kurumsal</a>
          <a href="#iletisim">İletişim</a>
          <a href="/login">Giriş Yap</a>
        </div>

        <a className="nav-cta" href={PHONE_HREF}>
          Hemen Ara
        </a>
      </nav>

      <section id="top" className="hero">
        <div className="hero-content">
          <p className="eyebrow">Araç iç mekânında net işçilik, premium duruş</p>

          <h1>
            Aracınıza özel
            <span>oto kılıf ve döşeme</span>
            çözümleri.
          </h1>

          <p className="hero-text">
            AKC Oto Kılıf; binek, SUV, hafif ticari, taksi, servis ve filo
            araçları için ölçülü, dayanıklı, şık ve profesyonel montajlı oto
            kılıf hizmeti sunar. Amaç sadece kılıf takmak değil; aracın iç
            mekânını daha temiz, daha güçlü ve daha kullanışlı hale getirmektir.
          </p>

          <div className="hero-actions">
            <a
              className="primary-btn"
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Teklif Al
            </a>

            <a className="secondary-btn" href="#hizmetler">
              Hizmetleri İncele
            </a>

            <a className="secondary-btn" href="/login">
              Yetkili Girişi
            </a>
          </div>

          <div className="hero-stats" aria-label="AKC öne çıkan özellikler">
            <div>
              <strong>Özel</strong>
              <span>Model uyumlu üretim</span>
            </div>
            <div>
              <strong>Temiz</strong>
              <span>Profesyonel montaj</span>
            </div>
            <div>
              <strong>Güçlü</strong>
              <span>Dayanıklı malzeme</span>
            </div>
          </div>
        </div>

        <div className="hero-card" aria-label="AKC Oto Kılıf hizmet kartı">
          <div className="card-glow" />

          <div className="mock-car">
            <div className="windshield" />
            <div className="seat seat-left" />
            <div className="seat seat-right" />
            <div className="console" />
          </div>

          <div className="quality-card">
            <span>Premium İç Mekân</span>
            <strong>Ölçülü dikim, net görünüm.</strong>
          </div>
        </div>
      </section>

      <section className="logos" aria-label="Araç grupları">
        {categories.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </section>

      <section id="hizmetler" className="section">
        <div className="section-head">
          <p className="eyebrow">Hizmetler</p>
          <h2>Her araca aynı kılıf olmaz. İşin raconu uyumdur.</h2>
          <p>
            Koltuk formu, kullanım amacı, araç tipi ve müşteri beklentisi
            farklıysa çözüm de farklı olmalı. AKC tarafında hedef; göze temiz
            gelen, elde sağlam duran ve uzun süre formunu koruyan işçiliktir.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <span>{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">Malzeme ve görünüm</p>
          <h2>Gündelik kullanıma dayanır, aracın havasını değiştirir.</h2>
          <p>
            Oto kılıfta kalite sadece ilk bakışta değil, kullanım sürecinde
            anlaşılır. Bu yüzden malzeme seçimi, dikiş dili ve montaj temizliği
            aynı standartta ilerlemelidir.
          </p>
        </div>

        <div className="feature-list">
          {advantages.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section id="surec" className="section process-section">
        <div className="section-head">
          <p className="eyebrow">Süreç</p>
          <h2>Tekliften montaja kadar net ilerleyen iş akışı.</h2>
          <p>
            Müşterinin kafasında soru kalmaması için süreç baştan sade ve net
            ilerler. Araç bilgisi alınır, beklenti anlaşılır, doğru malzeme
            seçilir ve uygulama planlanır.
          </p>
        </div>

        <div className="timeline">
          {steps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="galeri" className="section gallery-section">
        <div className="section-head">
          <p className="eyebrow">Galeri</p>
          <h2>Gerçek işler geldikçe burası AKC’nin vitrini olacak.</h2>
          <p>
            Bu alan portfolyo düzeni için hazırlandı. Montaj öncesi-sonrası,
            detay dikiş, koltuk yakın plan ve araç iç mekân çekimleri
            eklendikçe site çok daha güçlü bir satış vitrini haline gelir.
          </p>
        </div>

        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <div className="gallery-card" key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="kurumsal" className="quote-section">
        <div>
          <p className="eyebrow">Kurumsal yapı</p>
          <h2>Site sadece vitrin değil, yönetilebilir bir iş altyapısıdır.</h2>
        </div>

        <div>
          <p>
            AKC Oto Kılıf web sitesi; müşteri tarafında güven veren kurumsal
            vitrin, işletme tarafında ise admin panel ile yönetilebilir dijital
            operasyon mantığıyla hazırlanmıştır.
          </p>

          <div className="hero-actions">
            <a className="primary-btn" href="/admin">
              Admin Panel
            </a>

            <a className="secondary-btn" href="/login">
              Giriş Yap
            </a>

            <a
              className="secondary-btn"
              href={REGISTER_REQUEST_HREF}
              target="_blank"
              rel="noreferrer"
            >
              Kayıt Talebi
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Yönetim paneli</p>
          <h2>İşletme büyüdükçe site de seninle birlikte büyür.</h2>
          <p>
            Admin tarafı; içeriklerin, taleplerin ve vitrin alanlarının tek
            merkezden yönetilmesi için kurgulanmıştır. Her şeyi koda dokunmadan
            yönetilebilir hale getirmek hedeflenir.
          </p>
        </div>

        <div className="service-grid">
          {adminFeatures.map((item, index) => (
            <article className="service-card" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                AKC panel altyapısı bu alanı yönetilebilir hale getirmek için
                hazırlandı. Sonraki aşamada görsel yükleme, ürün düzenleme ve
                müşteri takip ekranları daha da güçlendirilebilir.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div>
          <p className="eyebrow">AKC standardı</p>
          <h2>“Kılıf takıldı” değil, “araç yenilendi” dedirten işçilik.</h2>
        </div>

        <p>
          Oto kılıfta farkı çoğu zaman küçük detaylar belirler: dikiş çizgisi,
          köşe dönüşü, koltuğa oturuş, malzeme hissi ve montaj temizliği.
          Görünmeyen emek, görünen kaliteyi oluşturur.
        </p>
      </section>

      <section className="section faq-section">
        <div className="section-head">
          <p className="eyebrow">Sık sorulanlar</p>
          <h2>Müşterinin aklındaki ilk sorulara net cevap.</h2>
          <p>
            Karar vermeden önce en çok sorulan konular burada. Detaylı bilgi
            için WhatsApp üzerinden araç bilgisi göndererek hızlı teklif
            alınabilir.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="iletisim" className="contact-section">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2>Aracınız için hızlı teklif alın.</h2>
          <p>
            Marka, model, yıl ve istediğiniz malzeme tarzını gönderin. Fotoğraf
            varsa ekleyin; size en uygun çözüm ve fiyat için dönüş yapılsın.
          </p>
        </div>

        <div className="contact-card">
          <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">
            WhatsApp: {PHONE_DISPLAY}
          </a>

          <a href={PHONE_HREF}>Telefon: {PHONE_DISPLAY}</a>

          <a href={EMAIL_HREF}>info@akcotokilif.com</a>

          <a href="/login">Yetkili Girişi</a>

          <p>
            Adres, çalışma saatleri, Instagram ve Google Harita bağlantıları
            daha sonra buraya eklenecek. Admin panel aktif olduğunda bu alanlar
            panelden yönetilebilir hale getirilebilir.
          </p>
        </div>
      </section>

      <footer className="footer">
        <strong>AKC Oto Kılıf</strong>
        <span>© 2026 • Aracınıza özel kılıf ve döşeme çözümleri</span>
      </footer>
    </main>
  );
}