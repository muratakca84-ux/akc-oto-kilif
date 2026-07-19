import { formatDate } from "./admin.helpers";

export default function LeadsTab({
  leads,
  updateLeadStatus,
  removeLead,
}) {
  const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Müşteri Talepleri</h2>
          <p>İletişim formundan gelen talepler burada yönetilir.</p>
        </div>
      </div>

      <div className="admin-list">
        {leads.length === 0 ? (
          <div className="empty-state">
            Henüz talep yok. Form bağlanınca burası dolar.
          </div>
        ) : null}

        {leads.map((lead) => (
          <article className="admin-list-item" key={lead.id}>
            <div>
              <small>
                {lead.status || "new"} • {formatDate(lead.createdAt)}
              </small>

              <h3>{lead.name || "İsimsiz müşteri"}</h3>
              <p>{lead.message || "Mesaj yok."}</p>

              <strong>
                {lead.phone || lead.email || "İletişim bilgisi yok"}
              </strong>

              <div className="lead-quick-contact">
                {lead.phone ? (
                  <>
                    <a href={`tel:+${onlyDigits(lead.phone)}`}>Telefonla ara</a>
                    <a
                      href={`https://wa.me/${onlyDigits(lead.phone)}?text=${encodeURIComponent(`Merhaba ${lead.name || ""}, AKC Oto Kılıf teklif talebiniz için ulaşıyoruz.`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp yaz
                    </a>
                  </>
                ) : null}
                {lead.email ? <a href={`mailto:${lead.email}`}>E-posta gönder</a> : null}
              </div>
            </div>

            <div className="item-actions">
              <button
                type="button"
                onClick={() => updateLeadStatus(lead.id, "new")}
              >
                Yeni
              </button>

              <button
                type="button"
                onClick={() => updateLeadStatus(lead.id, "contacted")}
              >
                Arandı
              </button>

              <button
                type="button"
                onClick={() => updateLeadStatus(lead.id, "done")}
              >
                Tamam
              </button>

              <button type="button" onClick={() => removeLead(lead.id)}>
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
