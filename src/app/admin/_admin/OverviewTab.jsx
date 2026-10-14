"use client";

import AdminIcon from "./AdminIcon";
import { Card, Empty, PageHead, Stat } from "./AdminUI";
import { formatDate } from "./admin.helpers";
import { LEAD_STATUS } from "./LeadsTab";

export default function OverviewTab({ counts, leads, products, setActiveTab }) {
  const recentLeads = leads.slice(0, 6);
  const missingImage = products.filter((item) => !item.imageUrl).length;
  const passive = counts.products - counts.activeProducts;

  const tasks = [
    counts.newLeads > 0 && {
      text: `${counts.newLeads} yeni talep dönüş bekliyor`,
      tab: "leads",
      tone: "alert",
    },
    missingImage > 0 && { text: `${missingImage} ürünün görseli yok`, tab: "products", tone: "warn" },
    counts.activeGallery < 3 && { text: "Galeride 3'ten az yayında görsel var", tab: "gallery", tone: "warn" },
  ].filter(Boolean);

  return (
    <>
      <PageHead title="Genel bakış" description="Talepler, katalog ve site içeriğinin güncel durumu." />

      <div className="adm-stats">
        <Stat label="Açık talep" value={counts.openLeads} note={`${counts.newLeads} yeni`} tone={counts.newLeads ? "accent" : ""} />
        <Stat label="Yayındaki ürün" value={counts.activeProducts} note={`${passive} pasif · ${counts.products} toplam`} />
        <Stat label="Öne çıkan ürün" value={counts.featuredProducts} note="Katalogda işaretli" />
        <Stat label="Galeri görseli" value={counts.activeGallery} note={`${counts.gallery} toplam`} />
      </div>

      <div className="adm-grid adm-grid--main">
        <Card
          title="Son talepler"
          actions={
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setActiveTab("leads")}>
              Tümünü gör <AdminIcon name="arrow" size={16} />
            </button>
          }
          flush
        >
          {recentLeads.length === 0 ? (
            <Empty title="Henüz talep yok" text="Sitedeki teklif formundan gelen talepler burada listelenir." />
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th className="adm-hide-sm">Araç</th>
                  <th>Durum</th>
                  <th className="adm-hide-sm">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const status = LEAD_STATUS[lead.status] || LEAD_STATUS.new;
                  return (
                    <tr key={lead.id} className="is-clickable" onClick={() => setActiveTab("leads")}>
                      <td>
                        <strong>{lead.name || "İsimsiz"}</strong>
                        <small>{lead.phone || lead.email || "—"}</small>
                      </td>
                      <td className="adm-hide-sm">{lead.vehicle || "—"}</td>
                      <td>
                        <span className={`adm-badge adm-badge--${status.tone}`}>{status.label}</span>
                      </td>
                      <td className="adm-hide-sm adm-nowrap">{formatDate(lead.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <div className="adm-stack">
          <Card title="Yapılacaklar">
            {tasks.length === 0 ? (
              <p className="adm-muted">Bekleyen bir iş yok.</p>
            ) : (
              <ul className="adm-tasks">
                {tasks.map((task) => (
                  <li key={task.text}>
                    <button type="button" onClick={() => setActiveTab(task.tab)}>
                      <span className={`adm-dot adm-dot--${task.tone}`} />
                      {task.text}
                      <AdminIcon name="arrow" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Hızlı işlemler">
            <div className="adm-quick">
              <button type="button" onClick={() => setActiveTab("products")}>
                <AdminIcon name="box" /> Ürün ekle
              </button>
              <button type="button" onClick={() => setActiveTab("gallery")}>
                <AdminIcon name="image" /> Görsel yükle
              </button>
              <button type="button" onClick={() => setActiveTab("homepage")}>
                <AdminIcon name="settings" /> İletişim bilgileri
              </button>
              <button type="button" onClick={() => setActiveTab("analytics")}>
                <AdminIcon name="chart" /> Analitik
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
