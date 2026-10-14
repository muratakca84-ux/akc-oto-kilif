"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import AdminIcon from "./AdminIcon";
import { Card, Empty, Field, ImagePicker, PageHead, Toggle } from "./AdminUI";
import { PRODUCT_CATEGORIES, PRODUCT_MATERIALS } from "./admin.constants";
import { getProductPricing } from "./admin.helpers";

const FILTERS = [
  ["all", "Tümü"],
  ["active", "Yayında"],
  ["passive", "Pasif"],
  ["featured", "Öne çıkan"],
];

function withCurrent(options, value) {
  return value && !options.includes(value) ? [value, ...options] : options;
}

export default function ProductsTab({
  products,
  productForm,
  setProductForm,
  productFile,
  setProductFile,
  saveProduct,
  saving,
  editingProductId,
  resetProductForm,
  editProduct,
  updateProduct,
  removeProduct,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const savingRef = useRef(saving);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    return products.filter((product) => {
      const active = product.isActive !== false;
      if (filter === "active" && !active) return false;
      if (filter === "passive" && active) return false;
      if (filter === "featured" && !product.isFeatured) return false;
      if (!q) return true;
      return [product.title, product.category, product.material, product.description]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(q);
    });
  }, [products, search, filter]);

  const preview = getProductPricing(productForm);

  function update(key, value) {
    setProductForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    resetProductForm();
    setOpen(true);
  }

  function openEdit(product) {
    editProduct(product);
    setOpen(true);
  }

  function close() {
    if (savingRef.current) return;
    setOpen(false);
    resetProductForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (await saveProduct()) setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("input")?.focus();

    const onKey = (event) => {
      if (event.key === "Escape" && !savingRef.current) {
        setOpen(false);
        resetProductForm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
    // resetProductForm her render'da yeni referans; yalnızca açılış/kapanışa bağlı
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <PageHead
        title="Ürünler"
        description="Sitedeki ürün kataloğunu yönetin. Yalnızca “Yayında” olan ürünler müşterilere görünür."
        actions={
          <>
            <a className="adm-btn adm-btn--secondary" href="/urunler" target="_blank" rel="noreferrer">
              Kataloğu gör
            </a>
            <button className="adm-btn adm-btn--primary" type="button" onClick={openCreate}>
              <AdminIcon name="plus" size={16} /> Yeni ürün
            </button>
          </>
        }
      />

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
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ürün ara" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Empty
            title={products.length ? "Sonuç bulunamadı" : "Henüz ürün yok"}
            text={products.length ? "Arama veya filtreyi değiştirin." : "İlk ürününüzü ekleyerek kataloğu oluşturun."}
            action={
              products.length ? null : (
                <button className="adm-btn adm-btn--primary" type="button" onClick={openCreate}>
                  <AdminIcon name="plus" size={16} /> Ürün ekle
                </button>
              )
            }
          />
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th className="adm-hide-sm">Kategori</th>
                <th>Fiyat</th>
                <th className="adm-hide-sm">Sıra</th>
                <th>Durum</th>
                <th aria-label="İşlemler" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const price = getProductPricing(product);
                const active = product.isActive !== false;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="adm-product-cell">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" />
                        ) : (
                          <span className="adm-thumb-empty">
                            <AdminIcon name="image" size={18} />
                          </span>
                        )}
                        <div>
                          <strong>
                            {product.title || "Adsız ürün"}
                            {product.isFeatured ? (
                              <span className="adm-star" title="Öne çıkan">
                                <AdminIcon name="star" size={14} />
                              </span>
                            ) : null}
                          </strong>
                          <small>{product.material || "—"}</small>
                        </div>
                      </div>
                    </td>
                    <td className="adm-hide-sm">{product.category || "—"}</td>
                    <td className="adm-nowrap">
                      {price.oldText ? <del className="adm-muted">{price.oldText}</del> : null}
                      <strong className="adm-block">{price.finalText}</strong>
                    </td>
                    <td className="adm-hide-sm">{product.sortOrder ?? "—"}</td>
                    <td>
                      <button
                        type="button"
                        className={`adm-badge adm-badge--${active ? "success" : "neutral"} adm-badge--btn`}
                        onClick={() =>
                          updateProduct(product.id, { isActive: !active }, active ? "Ürün yayından kaldırıldı." : "Ürün yayına alındı.")
                        }
                        title={active ? "Yayından kaldır" : "Yayına al"}
                      >
                        {active ? "Yayında" : "Pasif"}
                      </button>
                    </td>
                    <td>
                      <div className="adm-row adm-row--end adm-row--tight">
                        <button
                          type="button"
                          className="adm-icon-btn"
                          onClick={() =>
                            updateProduct(
                              product.id,
                              { isFeatured: !product.isFeatured },
                              product.isFeatured ? "Öne çıkarma kaldırıldı." : "Ürün öne çıkarıldı."
                            )
                          }
                          aria-label={product.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                          title={product.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                        >
                          <AdminIcon name="star" />
                        </button>
                        <button type="button" className="adm-icon-btn" onClick={() => openEdit(product)} aria-label="Düzenle" title="Düzenle">
                          <AdminIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn adm-icon-btn--danger"
                          onClick={() => removeProduct(product)}
                          aria-label="Sil"
                          title="Sil"
                        >
                          <AdminIcon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {open ? (
        <div
          className="adm-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <form
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            ref={dialogRef}
            onSubmit={handleSubmit}
          >
            <header className="adm-modal-head">
              <h3 id="product-dialog-title">{editingProductId ? "Ürünü düzenle" : "Yeni ürün"}</h3>
              <button type="button" className="adm-icon-btn" onClick={close} aria-label="Kapat" disabled={saving}>
                <AdminIcon name="close" />
              </button>
            </header>

            <div className="adm-modal-body">
              <div className="adm-modal-grid">
                <div className="adm-form">
                  <Field label="Ürün adı *" wide>
                    <input
                      className="adm-input"
                      value={productForm.title ?? ""}
                      onChange={(event) => update("title", event.target.value)}
                      placeholder="Örn. Deri görünümlü araca özel kılıf"
                      required
                    />
                  </Field>
                  <Field label="Kategori">
                    <select className="adm-input" value={productForm.category ?? ""} onChange={(event) => update("category", event.target.value)}>
                      {withCurrent(PRODUCT_CATEGORIES, productForm.category).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Malzeme">
                    <select className="adm-input" value={productForm.material ?? ""} onChange={(event) => update("material", event.target.value)}>
                      {withCurrent(PRODUCT_MATERIALS, productForm.material).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Açıklama" wide>
                    <textarea
                      className="adm-input"
                      rows={4}
                      value={productForm.description ?? ""}
                      onChange={(event) => update("description", event.target.value)}
                      placeholder="Ürünün özellikleri, kullanım alanı ve malzeme detayı"
                    />
                  </Field>

                  <div className="adm-divider adm-field--wide">Fiyat</div>

                  <Field label="Fiyat (₺)">
                    <input
                      className="adm-input"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={productForm.priceAmount ?? ""}
                      onChange={(event) => update("priceAmount", event.target.value)}
                    />
                  </Field>
                  <Field label="İndirimli fiyat (₺)" hint="Boş bırakılırsa indirim gösterilmez.">
                    <input
                      className="adm-input"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={productForm.discountPriceAmount ?? ""}
                      onChange={(event) => update("discountPriceAmount", event.target.value)}
                    />
                  </Field>
                  <Field label="Fiyat notu" hint="Fiyat yoksa veya gizliyse bu metin görünür.">
                    <input
                      className="adm-input"
                      value={productForm.priceText ?? ""}
                      onChange={(event) => update("priceText", event.target.value)}
                      placeholder="Teklif alınız"
                    />
                  </Field>
                  <Field label="Para birimi">
                    <select className="adm-input" value={productForm.currency ?? "TRY"} onChange={(event) => update("currency", event.target.value)}>
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </Field>

                  <div className="adm-divider adm-field--wide">Yayın</div>

                  <div className="adm-field--wide adm-toggles">
                    <Toggle checked={productForm.isActive} onChange={(value) => update("isActive", value)} label="Yayında" hint="Sitede görünsün" />
                    <Toggle checked={productForm.showPrice} onChange={(value) => update("showPrice", value)} label="Fiyatı göster" />
                    <Toggle checked={productForm.isFeatured} onChange={(value) => update("isFeatured", value)} label="Öne çıkar" />
                  </div>
                  <Field label="Sıralama" hint="Küçük sayı önce görünür.">
                    <input
                      className="adm-input"
                      type="number"
                      value={productForm.sortOrder ?? ""}
                      onChange={(event) => update("sortOrder", event.target.value)}
                    />
                  </Field>
                </div>

                <aside className="adm-modal-side">
                  <ImagePicker
                    label="Ürün görseli"
                    url={productForm.imageUrl}
                    onUrlChange={(value) => update("imageUrl", value)}
                    file={productFile}
                    onFileChange={setProductFile}
                    hint="JPG, PNG veya WebP · yüklenirken otomatik küçültülür"
                  />
                  <div className="adm-price-preview">
                    <span>Sitede görünecek fiyat</span>
                    {preview.oldText ? <del>{preview.oldText}</del> : null}
                    <strong>{preview.finalText}</strong>
                  </div>
                </aside>
              </div>
            </div>

            <footer className="adm-modal-foot">
              <button type="button" className="adm-btn adm-btn--secondary" onClick={close} disabled={saving}>
                Vazgeç
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                {saving ? "Kaydediliyor…" : editingProductId ? "Değişiklikleri kaydet" : "Ürünü ekle"}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </>
  );
}
