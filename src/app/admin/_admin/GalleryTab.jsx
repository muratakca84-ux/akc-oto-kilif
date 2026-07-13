"use client";

/* eslint-disable @next/next/no-img-element */

function getStatusLabel(isActive) {
  return isActive ? "Yayında" : "Pasif";
}

function getStatusClass(isActive) {
  return isActive ? "is-live" : "is-passive";
}

function getSafeTitle(value) {
  return String(value || "").trim() || "Başlıksız galeri";
}

function GalleryForm({
  galleryForm,
  setGalleryForm,
  galleryFile,
  setGalleryFile,
  saveGallery,
  saving,
  editingGalleryId,
  resetGalleryForm,
}) {
  const hasPreview = Boolean(galleryForm.imageUrl || galleryFile);

  function updateField(key, value) {
    setGalleryForm({ ...galleryForm, [key]: value });
  }

  return (
    <form className="gallery-manager-form" onSubmit={saveGallery}>
      <div className="gallery-form-head">
        <div>
          <span>{editingGalleryId ? "Düzenleme modu" : "Yeni galeri kartı"}</span>
          <h3>{editingGalleryId ? "Galeri kartını güncelle" : "Yeni görsel ekle"}</h3>
          <p>
            Montaj, detay, ürün, araç içi yenileme ve referans görsellerini
            kurumsal galeri formatında yönetin.
          </p>
        </div>

        {editingGalleryId ? (
          <button className="admin-secondary-btn" type="button" onClick={resetGalleryForm}>
            Düzenlemeyi iptal et
          </button>
        ) : null}
      </div>

      <div className="gallery-form-layout">
        <div className="gallery-form-fields">
          <label>
            Başlık
            <input
              placeholder="Örn: Spor dikiş detaylı montaj"
              value={galleryForm.title ?? ""}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </label>

          <label>
            Etiket
            <input
              placeholder="Örn: Montaj, Detay, Premium"
              value={galleryForm.tag ?? ""}
              onChange={(event) => updateField("tag", event.target.value)}
            />
          </label>

          <label>
            Sıralama
            <input
              type="number"
              placeholder="10"
              value={galleryForm.sortOrder ?? ""}
              onChange={(event) => updateField("sortOrder", event.target.value)}
            />
          </label>

          <label className="admin-check gallery-check">
            <input
              type="checkbox"
              checked={Boolean(galleryForm.isActive)}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            Yayında göster
          </label>

          <label className="span-2">
            Görsel URL
            <input
              placeholder="https://..."
              value={galleryForm.imageUrl ?? ""}
              onChange={(event) => updateField("imageUrl", event.target.value)}
            />
          </label>

          <label className="file-input span-2 gallery-file-input">
            <span>Galeri görseli yükle</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setGalleryFile(event.target.files?.[0] || null)}
            />
            <em>{galleryFile?.name || "Dosya seçilmedi"}</em>
          </label>

          <button className="admin-primary-btn span-2" type="submit" disabled={saving}>
            {saving
              ? "Kaydediliyor..."
              : editingGalleryId
                ? "Galeri kartını güncelle"
                : "Galeri kartı ekle"}
          </button>
        </div>

        <div className="gallery-live-preview">
          <span className="gallery-preview-label">Canlı önizleme</span>

          <div className={hasPreview ? "gallery-preview-image has-image" : "gallery-preview-image"}>
            {galleryForm.imageUrl ? (
              <img src={galleryForm.imageUrl} alt="Galeri önizleme" />
            ) : (
              <strong>AKC</strong>
            )}
          </div>

          <div className="gallery-preview-copy">
            <small>{galleryForm.tag || "Montaj"} • Sıra {galleryForm.sortOrder || 10}</small>
            <h4>{getSafeTitle(galleryForm.title)}</h4>
            <span className={`gallery-status-pill ${getStatusClass(galleryForm.isActive)}`}>
              {getStatusLabel(galleryForm.isActive)}
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}

function GalleryCard({ item, editGallery, updateGallery, removeGallery }) {
  const title = getSafeTitle(item.title);
  const tag = item.tag || "Galeri";
  const isActive = item.isActive !== false;

  return (
    <article className={`gallery-admin-card-v2 ${isActive ? "is-active" : "is-passive"}`}>
      <div className="gallery-admin-image-v2">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={title} />
        ) : (
          <div className="gallery-admin-fallback">
            <strong>AKC</strong>
            <span>Görsel yok</span>
          </div>
        )}

        <span className={`gallery-status-pill ${getStatusClass(isActive)}`}>
          {getStatusLabel(isActive)}
        </span>
      </div>

      <div className="gallery-admin-body-v2">
        <small>{tag} • Sıra {item.sortOrder || 0}</small>
        <h3>{title}</h3>

        <div className="gallery-card-meta">
          <span>Vitrin kartı</span>
          <span>{isActive ? "Ana sayfada görünür" : "Ana sayfada gizli"}</span>
        </div>
      </div>

      <div className="gallery-actions-v2">
        <button type="button" onClick={() => editGallery(item)}>
          Düzenle
        </button>

        <button
          type="button"
          onClick={() => updateGallery(item.id, { isActive: !isActive })}
        >
          {isActive ? "Pasife al" : "Yayına al"}
        </button>

        <button className="danger" type="button" onClick={() => removeGallery(item.id)}>
          Sil
        </button>
      </div>
    </article>
  );
}

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
  const activeCount = galleryItems.filter((item) => item.isActive !== false).length;
  const passiveCount = galleryItems.length - activeCount;

  return (
    <section className="admin-panel gallery-manager-panel">
      <div className="panel-head gallery-panel-head">
        <div>
          <p className="eyebrow">Galeri Yönetimi</p>
          <h2>{editingGalleryId ? "Galeri kartını düzenle" : "Kurumsal galeri vitrini"}</h2>
          <p>
            Ana sayfadaki galeri alanını buradan yönet. Görsel yükle, sıralama
            ver, yayına al veya pasife çek.
          </p>
        </div>

        <div className="gallery-stats-mini">
          <div>
            <strong>{galleryItems.length}</strong>
            <span>Toplam</span>
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Yayında</span>
          </div>
          <div>
            <strong>{passiveCount}</strong>
            <span>Pasif</span>
          </div>
        </div>
      </div>

      <GalleryForm
        galleryForm={galleryForm}
        setGalleryForm={setGalleryForm}
        galleryFile={galleryFile}
        setGalleryFile={setGalleryFile}
        saveGallery={saveGallery}
        saving={saving}
        editingGalleryId={editingGalleryId}
        resetGalleryForm={resetGalleryForm}
      />

      <div className="gallery-section-title">
        <div>
          <span>Vitrin listesi</span>
          <h3>Yüklenen galeri kartları</h3>
        </div>
        <p>En düşük sıra numarası önce görünür.</p>
      </div>

      {galleryItems.length === 0 ? (
        <div className="empty-state gallery-empty-state">
          Henüz galeri kartı yok. İlk görseli yukarıdaki alandan ekleyebilirsin.
        </div>
      ) : (
        <div className="gallery-admin-grid-v2">
          {galleryItems.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              editGallery={editGallery}
              updateGallery={updateGallery}
              removeGallery={removeGallery}
            />
          ))}
        </div>
      )}
    </section>
  );
}