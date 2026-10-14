"use client";

/* eslint-disable @next/next/no-img-element */

import { useId } from "react";
import AdminIcon from "./AdminIcon";
import { useFilePreview } from "./admin.helpers";

export function PageHead({ title, description, actions }) {
  return (
    <div className="adm-page-head">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="adm-row">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, description, actions, children, className = "", flush = false }) {
  return (
    <section className={`adm-card ${flush ? "adm-card--flush" : ""} ${className}`}>
      {title ? (
        <header className="adm-card-head">
          <div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="adm-row">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Field({ label, hint, wide = false, children }) {
  return (
    <label className={`adm-field ${wide ? "adm-field--wide" : ""}`}>
      <span className="adm-label">{label}</span>
      {children}
      {hint ? <small className="adm-hint">{hint}</small> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span className="adm-toggle-track" aria-hidden="true" />
      <span className="adm-toggle-text">
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

export function Stat({ label, value, note, tone = "" }) {
  return (
    <div className={`adm-stat ${tone ? `adm-stat--${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="adm-empty">
      <strong>{title}</strong>
      {text ? <p>{text}</p> : null}
      {action || null}
    </div>
  );
}

/** Görsel alanı: önizleme + dosya seçimi + isteğe bağlı bağlantı. */
export function ImagePicker({ label, url, onUrlChange, file, onFileChange, hint, aspect = "4 / 3", contain = false }) {
  const inputId = useId();
  const preview = useFilePreview(file, url);

  return (
    <div className="adm-image-picker">
      <span className="adm-label">{label}</span>
      <div className="adm-image-box" style={{ aspectRatio: aspect }}>
        {preview ? (
          <img src={preview} alt="" className={contain ? "is-contain" : ""} />
        ) : (
          <div className="adm-image-empty">
            <AdminIcon name="image" size={28} />
            <span>Görsel seçilmedi</span>
          </div>
        )}
      </div>
      <div className="adm-row adm-row--tight">
        <label className="adm-btn adm-btn--secondary adm-btn--sm" htmlFor={inputId}>
          <AdminIcon name="upload" size={16} /> {preview ? "Değiştir" : "Dosya seç"}
        </label>
        <input
          id={inputId}
          className="adm-visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
        {file ? (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onFileChange(null)}>
            Seçimi kaldır
          </button>
        ) : null}
        {file ? <small className="adm-hint adm-truncate">{file.name}</small> : null}
      </div>
      {onUrlChange ? (
        <input
          className="adm-input adm-input--sm"
          value={url || ""}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="veya görsel bağlantısı yapıştırın (https://…)"
        />
      ) : null}
      {hint ? <small className="adm-hint">{hint}</small> : null}
    </div>
  );
}

export function SaveBar({ dirty, saving, onSave, label = "Değişiklikleri kaydet" }) {
  return (
    <div className={`adm-savebar ${dirty ? "is-dirty" : ""}`}>
      <span>{dirty ? "Kaydedilmemiş değişiklikler var." : "Tüm değişiklikler kaydedildi."}</span>
      <button className="adm-btn adm-btn--primary" type="button" onClick={onSave} disabled={saving || !dirty}>
        {saving ? "Kaydediliyor…" : label}
      </button>
    </div>
  );
}
