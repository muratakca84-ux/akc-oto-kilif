"use client";

import { useMemo, useState } from "react";
import AdminIcon from "./AdminIcon";
import { Card, Empty, PageHead } from "./AdminUI";
import { formatDate } from "./admin.helpers";

export const LEAD_STATUS = {
  new: { label: "Yeni", tone: "info" },
  contacted: { label: "Görüşüldü", tone: "warning" },
  done: { label: "Tamamlandı", tone: "success" },
};

const FILTERS = [
  ["open", "Açık"],
  ["new", "Yeni"],
  ["contacted", "Görüşüldü"],
  ["done", "Tamamlandı"],
  ["all", "Tümü"],
];

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

function waNumber(phone) {
  const digits = onlyDigits(phone);
  if (digits.startsWith("0")) return `9${digits}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export default function LeadsTab({ leads, updateLeadStatus, removeLead }) {
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    return leads.filter((lead) => {
      const status = lead.status || "new";
      if (filter === "open" && status === "done") return false;
      if (!["open", "all"].includes(filter) && status !== filter) return false;
      if (!q) return true;
      return [lead.name, lead.phone, lead.email, lead.vehicle, lead.message]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(q);
    });
  }, [leads, filter, search]);

  return (
    <>
      <PageHead title="Müşteri talepleri" description="Teklif formundan gelen talepleri takip edin ve durumlarını güncelleyin." />

      <Card flush>
        <div className="adm-toolbar">
          <div className="adm-segment" role="tablist">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? "is-active" : ""}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="adm-search">
            <AdminIcon name="search" size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="İsim, telefon, araç ara" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Empty title="Talep bulunamadı" text="Seçili filtreye uygun talep yok." />
        ) : (
          <ul className="adm-leads">
            {filtered.map((lead) => {
              const status = LEAD_STATUS[lead.status] || LEAD_STATUS.new;
              const phone = waNumber(lead.phone);
              return (
                <li key={lead.id}>
                  <div className="adm-lead-main">
                    <div className="adm-lead-top">
                      <strong>{lead.name || "İsimsiz müşteri"}</strong>
                      <span className={`adm-badge adm-badge--${status.tone}`}>{status.label}</span>
                      <small>{formatDate(lead.createdAt)}</small>
                    </div>
                    {lead.vehicle ? <p className="adm-lead-vehicle">{lead.vehicle}</p> : null}
                    <p className="adm-lead-message">{lead.message || "Mesaj yok."}</p>
                    <div className="adm-lead-contact">
                      {lead.phone ? (
                        <>
                          <a href={`tel:+${phone}`}>
                            <AdminIcon name="phone" size={15} /> {lead.phone}
                          </a>
                          <a
                            href={`https://wa.me/${phone}?text=${encodeURIComponent(
                              `Merhaba ${lead.name || ""}, AKC Oto Kılıf'tan teklif talebiniz için yazıyoruz.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <AdminIcon name="message" size={15} /> WhatsApp
                          </a>
                        </>
                      ) : null}
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`}>
                          <AdminIcon name="mail" size={15} /> {lead.email}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="adm-lead-actions">
                    <select
                      className="adm-input adm-input--sm"
                      value={lead.status || "new"}
                      onChange={(event) => updateLeadStatus(lead.id, event.target.value)}
                      aria-label="Talep durumu"
                    >
                      {Object.entries(LEAD_STATUS).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="adm-icon-btn adm-icon-btn--danger"
                      onClick={() => removeLead(lead)}
                      aria-label="Talebi sil"
                      title="Sil"
                    >
                      <AdminIcon name="trash" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
