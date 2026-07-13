import Link from "next/link";

const footerFallback = {
  businessName: "AKC Oto Kılıf",
  footerTitle: "AKC Oto Kılıf",
  footerDescription:
    "Araç iç mekânında premium kalite, temiz montaj ve güven veren müşteri deneyimi.",
  footerCopy: "© 2026 AKC Oto Kılıf. Tüm hakları saklıdır.",
  phone: "+90 501 586 42 84",
  whatsapp: "905015864284",
  email: "info@akcotokilif.com",
  address: "Hacıveyiszade, Fetih Cd. No:145 D:B, 42030 Karatay/Konya",
  workingHours: "Hafta içi / Hafta Sonu: 11:00 - 18:00",
  instagram: "https://www.instagram.com/akcotokilif/",
  googleMapsUrl: "https://www.google.com/maps/place/AKC+Oto+K%C4%B1l%C4%B1f/@37.872099,32.481234,15z/data=!4m2!3m1!1s0x14c5c65d8f8f8f8f:0x1b1b1b1b1b1b1b1b?hl=tr",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function SiteFooter({ settings = {} }) {
  const data = { ...footerFallback, ...settings };

  const businessName = data.footerTitle || data.businessName || "AKC Oto Kılıf";
  const phoneDisplay = data.phone || footerFallback.phone;
  const phoneHref = `tel:+${onlyDigits(phoneDisplay)}`;
  const whatsappNumber = onlyDigits(data.whatsapp || data.phone);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=Merhaba%20AKC%20Oto%20K%C4%B1l%C4%B1f%2C%20arac%C4%B1m%20i%C3%A7in%20teklif%20almak%20istiyorum.`;
  const emailHref = `mailto:${data.email || footerFallback.email}`;

  return (
    <footer className="akc-footer">
      <div className="akc-footer-glow" />

      <div className="akc-footer-top">
        <div>
          <p className="eyebrow">AKC Oto Kılıf</p>
          <h2>Aracınız için premium iç mekân çözümleri.</h2>
          <p>
            Özel dikim oto kılıf, döşeme, montaj ve araç içi yenileme
            süreçlerinde hızlı teklif ve profesyonel hizmet.
          </p>
        </div>

        <div className="akc-footer-actions">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="primary-btn">
            WhatsApp Teklif Al
          </a>

          <a href={phoneHref} className="secondary-btn">
            Hemen Ara
          </a>
        </div>
      </div>

      <div className="akc-footer-grid">
        <div className="akc-footer-brand">
          <div className="akc-footer-mark">AKC</div>

          <div>
            <strong>{businessName}</strong>
            <p>{data.footerDescription || footerFallback.footerDescription}</p>
          </div>
        </div>

        <div className="akc-footer-column">
          <h3>Hızlı Bağlantılar</h3>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/urunler">Ürünler</Link>
          <Link href="/login">Giriş Yap</Link>
          <Link href="/register">Üye Ol</Link>
        </div>

        <div className="akc-footer-column">
          <h3>Hizmet Alanları</h3>
          <span>Özel dikim oto kılıf</span>
          <span>Koltuk döşeme</span>
          <span>Premium montaj</span>
          <span>Filo ve ticari araç çözümleri</span>
        </div>

        <div className="akc-footer-contact">
          <h3>İletişim</h3>

          <a href={phoneHref}>Telefon: {phoneDisplay}</a>
          <a href={emailHref}>{data.email || footerFallback.email}</a>

          {data.googleMapsUrl ? (
            <a href={data.googleMapsUrl} target="_blank" rel="noreferrer">
              Haritada Gör
            </a>
          ) : null}

          {data.instagram ? (
            <a href={data.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          ) : null}

          <p>
            {data.address || footerFallback.address}
            <br />
            {data.workingHours || footerFallback.workingHours}
          </p>
        </div>
      </div>

      <div className="akc-footer-bottom">
        <span>{data.footerCopy || footerFallback.footerCopy}</span>

        <div>
          <span>Premium oto kılıf</span>
          <span>Profesyonel montaj</span>
          <span>Hızlı teklif</span>
        </div>
      </div>
    </footer>
  );
}