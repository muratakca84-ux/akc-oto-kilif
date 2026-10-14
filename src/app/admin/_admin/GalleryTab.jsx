"use client";

/* eslint-disable @next/next/no-img-element */

import AdminIcon from "./AdminIcon";
import { Card, Empty, Field, ImagePicker, PageHead, Toggle } from "./AdminUI";

export default function GalleryTab({
  galleryItems,
  galleryForm,
  setGalleryForm,
  galleryFile,
  setGalleryFile,
  saveGallery,
  saving,
  editingGalleryId,
  resetGalleryForm,
  editGallery,
  updateGallery,
  removeGallery,
}) {
  const update = (key, value) => setGalleryForm((current) => ({ ...current, [key]: value }));
  const activeCount = galleryItems.filter((item) => item.isActive !== false).length;

  return (
    <>
      <PageHead
        title="Galeri"
        description="Ana sayfadaki “Uygulamalar” bölümünde sıralamaya göre ilk 6 yayındaki görsel gösterilir."
      />

      <div className="adm-grid adm-grid--side">
        <Card
          title={editingGalleryId ? "Görseli düzenle" : "Yeni görsel"}
          actions={
            editingGalleryId ? (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={resetGalleryForm}>
                Vazgeç
              </button>
            ) : null
          }
        >
          <form className="adm-form adm-form--single" onSubmit={saveGallery}>
            <ImagePicker
              label="Görsel *"
              url={galleryForm.imageUrl}
              onUrlChange={(value) => update("imageUrl", value)}
              file={galleryFile}
              onFileChange={setGalleryFile}
              hint="Yatay (4:3) fotoğraflar en iyi sonucu verir."
            />
            <Field label="Başlık *" hint="Görselin altında yazar. Örn. “Siyah deri, kırmızı dikiş”">
              <input
                className="adm-input"
                value={galleryForm.title ?? ""}
                onChange={(event) => update("title", event.target.value)}
                required
              />
            </Field>
            <div className="adm-form">
              <Field label="Etiket">
                <input
                  className="adm-input"
                  value={galleryForm.tag ?? ""}
                  onChange={(event) => update("tag", event.target.value)}
                  placeholder="Montaj, Detay, SUV…"
                />
              </Field>
              <Field label="Sıralama">
                <input
                  className="adm-input"
                  type="number"
                  value={galleryForm.sortOrder ?? ""}
                  onChange={(event) => update("sortOrder", event.target.value)}
                />
              </Field>
            </div>
            <Toggle checked={galleryForm.isActive} onChange={(value) => update("isActive", value)} label="Yayında" hint="Ana sayfada görünsün" />
            <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={saving}>
              {saving ? "Kaydediliyor…" : editingGalleryId ? "Değişiklikleri kaydet" : "Galeriye ekle"}
            </button>
          </form>
        </Card>

        <Card title="Görseller" description={`${activeCount} yayında · ${galleryItems.length} toplam`}>
          {galleryItems.length === 0 ? (
            <Empty title="Galeri boş" text="İlk uygulama fotoğrafınızı soldaki formdan ekleyin." />
          ) : (
            <div className="adm-gallery">
              {galleryItems.map((item) => {
                const active = item.isActive !== false;
                return (
                  <article key={item.id} className={`adm-gallery-item ${editingGalleryId === item.id ? "is-editing" : ""}`}>
                    <div className="adm-gallery-media">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <AdminIcon name="image" size={28} />}
                      <span className={`adm-badge adm-badge--${active ? "success" : "neutral"}`}>{active ? "Yayında" : "Pasif"}</span>
                    </div>
                    <div className="adm-gallery-body">
                      <strong title={item.title}>{item.title || "Başlıksız"}</strong>
                      <small>
                        {item.tag || "—"} · Sıra {item.sortOrder ?? "—"}
                      </small>
                    </div>
                    <div className="adm-gallery-actions">
                      <button type="button" className="adm-icon-btn" onClick={() => editGallery(item)} aria-label="Düzenle" title="Düzenle">
                        <AdminIcon name="edit" />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => updateGallery(item.id, { isActive: !active })}
                        aria-label={active ? "Yayından kaldır" : "Yayına al"}
                        title={active ? "Yayından kaldır" : "Yayına al"}
                      >
                        <AdminIcon name={active ? "eyeOff" : "eye"} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn--danger"
                        onClick={() => removeGallery(item)}
                        aria-label="Sil"
                        title="Sil"
                      >
                        <AdminIcon name="trash" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
