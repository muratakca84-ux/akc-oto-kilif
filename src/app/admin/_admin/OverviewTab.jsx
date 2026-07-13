import Link from "next/link";
import { formatDate } from "./admin.helpers";

function getLeadStatusLabel(status) {
  if (status === "done") return "Tamamlandı";
  if (status === "contacted") return "Arandı";
  if (status === "new") return "Yeni";
  return status || "Yeni";
}

function getLeadStatusClass(status) {
  if (status === "done") return "done";
  if (status === "contacted") return "contacted";
  return "new";
}

export default function OverviewTab({
  products = [],
  activeProducts = 0,
  featuredProducts = 0,
  openLeads = 0,
  lastLead,
}) {
  const totalProducts = products.length;
  const passiveProducts = Math.max(totalProducts - activeProducts, 0);
  const activeRate =
    totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

  const stats = [
    {
      label: "Aktif ürün",
      value: activeProducts,
      text: `${totalProducts} toplam ürün / hizmet kartı`,
      icon: "🧵",
      tone: "success",
    },
    {
      label: "Öne çıkan",
      value: featuredProducts,
      text: "Vitrinde öne çıkarılan ürünler",
      icon: "⭐",
      tone: "gold",
    },
    {
      label: "Açık talep",
      value: openLeads,
      text: "Dönüş bekleyen müşteri talebi",
      icon: "📩",
      tone: openLeads > 0 ? "warning" : "success",
    },
    {
      label: "Yayın oranı",
      value: `%${activeRate}`,
      text: `${passiveProducts} pasif ürün bulunuyor`,
      icon: "📈",
      tone: "info",
    },
  ];

  const quickActions = [
    {
      title: "Ana sayfa yönetimi",
      text: "Hero, vitrin görseli, iletişim ve bölüm metinlerini güncelle.",
      href: "#homepage",
      icon: "🏠",
    },
    {
      title: "Ürün vitrini",
      text: "Ürün ekle, fiyat düzenle, görsel yükle ve yayına al.",
      href: "#products",
      icon: "🧵",
    },
    {
      title: "Galeri yönetimi",
      text: "Montaj ve uygulama görsellerini kurumsal vitrine ekle.",
      href: "#gallery",
      icon: "🖼️",
    },
    {
      title: "Analitik kontrol",
      text: "GA4, GTM, Meta Pixel ve dönüşüm takibini incele.",
      href: "/admin/analytics",
      icon: "📊",
    },
  ];

  const checklist = [
    {
      title: "Ana sayfa içerikleri",
      text: "Başlıklar, açıklamalar, CTA alanları ve iletişim bilgileri panelden yönetilir.",
    },
    {
      title: "Ürün ve fiyat yönetimi",
      text: "Ürün kartları, görseller, indirimli fiyat ve teklif metinleri güncellenir.",
    },
    {
      title: "Galeri vitrini",
      text: "Gerçek işçilik ve montaj görselleri siteye kurumsal görünüm kazandırır.",
    },
    {
      title: "Müşteri talepleri",
      text: "Teklif formlarından gelen talepler durumlarına göre takip edilir.",
    },
  ];

  return (
    <section className="overview-dashboard">
      <div className="overview-hero-panel">
        <div>
          <p className="eyebrow">Operasyon özeti</p>
          <h2>AKC yönetim paneli aktif.</h2>
          <p>
            Ürün vitrini, müşteri talepleri, galeri görselleri, tema ve ana sayfa
            içerikleri tek merkezden kontrol edilir.
          </p>
        </div>

        <div className="overview-hero-actions">
          <Link className="admin-primary-btn" href="/" target="_blank">
            Siteyi görüntüle
          </Link>
          <Link className="admin-secondary-btn" href="/admin/analytics">
            Analitik ekranı
          </Link>
        </div>
      </div>

      <div className="overview-stat-grid">
        {stats.map((item) => (
          <article className={`overview-stat-card ${item.tone}`} key={item.label}>
            <div className="overview-stat-icon">{item.icon}</div>

            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="overview-main-grid">
        <article className="admin-panel overview-panel overview-panel-large">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Hızlı aksiyonlar</p>
              <h2>En çok kullanılan yönetim alanları</h2>
              <p>Günlük kullanımda ihtiyaç duyulan ekranlara buradan hızlıca geç.</p>
            </div>
          </div>

          <div className="overview-action-grid">
            {quickActions.map((item) => (
              <Link className="overview-action-card" href={item.href} key={item.title}>
                <span>{item.icon}</span>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-panel overview-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Son müşteri talebi</p>
              <h2>Hızlı takip</h2>
              <p>En yeni talep burada görünür.</p>
            </div>
          </div>

          {lastLead ? (
            <div className="overview-lead-card">
              <div className="overview-lead-top">
                <span className={`lead-status ${getLeadStatusClass(lastLead.status)}`}>
                  {getLeadStatusLabel(lastLead.status)}
                </span>
                <small>{formatDate(lastLead.createdAt)}</small>
              </div>

              <h3>{lastLead.name || "İsimsiz müşteri"}</h3>
              <p>{lastLead.message || "Mesaj yok."}</p>

              <div className="overview-lead-contact">
                <strong>{lastLead.phone || lastLead.email || "İletişim bilgisi yok"}</strong>
                {lastLead.vehicle ? <span>{lastLead.vehicle}</span> : null}
              </div>
            </div>
          ) : (
            <div className="empty-state overview-empty">
              Henüz müşteri talebi yok. İletişim formundan gelen ilk kayıt burada
              görünecek.
            </div>
          )}
        </article>
      </div>

      <div className="overview-main-grid">
        <article className="admin-panel overview-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Panel sağlığı</p>
              <h2>Sistem durumu</h2>
              <p>Temel yönetim bölümleri hazır durumda.</p>
            </div>
          </div>

          <div className="overview-health-list">
            {checklist.map((item, index) => (
              <div className="overview-health-item" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel overview-panel overview-panel-accent">
          <p className="eyebrow">AKC standardı</p>
          <h2>İçerik düzeni güçlendikçe site daha kurumsal görünür.</h2>
          <p>
            Ürün fotoğraflarını düzenli yüklemek, açıklamaları net tutmak ve müşteri
            taleplerini hızlı takip etmek markanın güven hissini artırır.
          </p>

          <div className="overview-mini-metrics">
            <div>
              <strong>{totalProducts}</strong>
              <span>Toplam ürün</span>
            </div>
            <div>
              <strong>{featuredProducts}</strong>
              <span>Vitrin ürünü</span>
            </div>
            <div>
              <strong>{openLeads}</strong>
              <span>Bekleyen talep</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}