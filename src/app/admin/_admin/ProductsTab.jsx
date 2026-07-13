"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { getProductPricing } from "./admin.helpers";

const quickCategories = [
  "Binek Araç",
  "SUV",
  "Hafif Ticari",
  "Taksi",
  "Servis Aracı",
  "Filo Araçları",
];

const materialOptions = [
  "Deri görünümlü",
  "Kumaş + deri kombin",
  "Premium deri",
  "Spor dikiş",
  "Kolay temizlenebilir",
  "Filo tipi dayanıklı",
];

function safeText(value) {
  return String(value || "").trim();
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
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const formPrice = getProductPricing(productForm);

  const productStats = useMemo(() => {
    const total = products.length;
    const active = products.filter((item) => item.isActive !== false).length;
    const passive = total - active;
    const featured = products.filter((item) => item.isFeatured).length;
    const priced = products.filter(
      (item) => Number(item.priceAmount) > 0 || Number(item.discountPriceAmount) > 0
    ).length;

    return { total, active, passive, featured, priced };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const searchable = [
        product.title,
        product.category,
        product.material,
        product.description,
        product.priceText,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchable.includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive !== false) ||
        (statusFilter === "passive" && product.isActive === false) ||
        (statusFilter === "featured" && product.isFeatured) ||
        (statusFilter === "priced" &&
          (Number(product.priceAmount) > 0 ||
            Number(product.discountPriceAmount) > 0));

      return matchesSearch && matchesStatus;
    });
  }, [products, searchText, statusFilter]);

  function updateForm(key, value) {
    setProductForm({ ...productForm, [key]: value });
  }

  return (
    <section className="admin-panel products-admin-panel">
      <div className="product-admin-hero">
        <div>
          <p className="eyebrow">Ürün yönetimi</p>

          <h2>{editingProductId ? "Ürünü düzenle" : "Ürün / Hizmet Kartları"}</h2>

          <p>
            Ürün başlığı, kategori, malzeme, fiyat, indirim, görsel ve yayın
            durumunu tek merkezden yönetin. Müşteri tarafındaki katalog bu
            alandan beslenir.
          </p>
        </div>

        <div className="product-admin-hero-actions">
          {editingProductId ? (
            <button
              className="admin-secondary-btn"
              type="button"
              onClick={resetProductForm}
            >
              Düzenlemeyi İptal Et
            </button>
          ) : null}

          <a className="admin-secondary-btn" href="/urunler" target="_blank">
            Kataloğu Gör
          </a>
        </div>
      </div>

      <div className="product-admin-stat-grid">
        <article>
          <span>Toplam</span>
          <strong>{productStats.total}</strong>
          <p>Ürün / hizmet kartı</p>
        </article>

        <article>
          <span>Yayında</span>
          <strong>{productStats.active}</strong>
          <p>Müşteriye görünen kart</p>
        </article>

        <article>
          <span>Öne çıkan</span>
          <strong>{productStats.featured}</strong>
          <p>Vitrin öncelikli kart</p>
        </article>

        <article>
          <span>Fiyatlı</span>
          <strong>{productStats.priced}</strong>
          <p>Net fiyat girilen ürün</p>
        </article>
      </div>

      <form className="product-form-shell" onSubmit={saveProduct}>
        <div className="product-form-section">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <strong>Ürün bilgisi</strong>
              <p>Başlık, kategori, malzeme ve açıklama alanlarını doldurun.</p>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--premium">
            <label className="field-label">
              <span>Ürün başlığı</span>
              <input
                placeholder="Örn: Premium Deri Görünümlü Oto Kılıf"
                value={productForm.title ?? ""}
                onChange={(event) => updateForm("title", event.target.value)}
                required
              />
            </label>

            <label className="field-label">
              <span>Kategori</span>
              <input
                placeholder="Binek Araç"
                value={productForm.category ?? ""}
                onChange={(event) => updateForm("category", event.target.value)}
              />
            </label>

            <label className="field-label">
              <span>Malzeme</span>
              <input
                placeholder="Deri görünümlü"
                value={productForm.material ?? ""}
                onChange={(event) => updateForm("material", event.target.value)}
              />
            </label>

            <label className="field-label">
              <span>Sıralama</span>
              <input
                type="number"
                placeholder="10"
                value={productForm.sortOrder ?? ""}
                onChange={(event) => updateForm("sortOrder", event.target.value)}
              />
            </label>

            <label className="field-label span-2">
              <span>Açıklama</span>
              <textarea
                placeholder="Ürünün avantajlarını, kullanım alanını ve malzeme detayını yazın."
                value={productForm.description ?? ""}
                onChange={(event) => updateForm("description", event.target.value)}
                required
              />
            </label>
          </div>

          <div className="quick-chip-row">
            <strong>Hızlı kategori:</strong>
            {quickCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => updateForm("category", category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="quick-chip-row">
            <strong>Hızlı malzeme:</strong>
            {materialOptions.map((material) => (
              <button
                key={material}
                type="button"
                onClick={() => updateForm("material", material)}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        <div className="product-form-section">
          <div className="form-section-title">
            <span>02</span>
            <div>
              <strong>Fiyat ve görünürlük</strong>
              <p>Normal fiyat, indirimli fiyat ve teklif metnini yönetin.</p>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--premium">
            <label className="field-label">
              <span>Fiyat</span>
              <input
                type="number"
                min="0"
                placeholder="Fiyat ₺"
                value={productForm.priceAmount ?? ""}
                onChange={(event) => updateForm("priceAmount", event.target.value)}
              />
            </label>

            <label className="field-label">
              <span>İndirimli fiyat</span>
              <input
                type="number"
                min="0"
                placeholder="İndirimli fiyat ₺"
                value={productForm.discountPriceAmount ?? ""}
                onChange={(event) =>
                  updateForm("discountPriceAmount", event.target.value)
                }
              />
            </label>

            <label className="field-label">
              <span>Para birimi</span>
              <select
                value={productForm.currency ?? "TRY"}
                onChange={(event) => updateForm("currency", event.target.value)}
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <label className="field-label">
              <span>Fiyat metni</span>
              <input
                placeholder="Teklif alınız"
                value={productForm.priceText ?? ""}
                onChange={(event) => updateForm("priceText", event.target.value)}
              />
            </label>
          </div>

          <div className="product-switch-row">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(productForm.isActive)}
                onChange={(event) => updateForm("isActive", event.target.checked)}
              />
              Yayında
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(productForm.showPrice)}
                onChange={(event) => updateForm("showPrice", event.target.checked)}
              />
              Fiyatı göster
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(productForm.isFeatured)}
                onChange={(event) => updateForm("isFeatured", event.target.checked)}
              />
              Öne çıkar
            </label>
          </div>

          <div className="product-price-live-preview">
            <span>Canlı fiyat önizleme</span>
            {formPrice.oldText ? <del>{formPrice.oldText}</del> : null}
            <strong>{formPrice.finalText}</strong>
            {formPrice.note ? <small>{formPrice.note}</small> : null}
          </div>
        </div>

        <div className="product-form-section">
          <div className="form-section-title">
            <span>03</span>
            <div>
              <strong>Görsel</strong>
              <p>Ürün görselini URL olarak ekleyin veya dosya yükleyin.</p>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--premium">
            <label className="field-label span-2">
              <span>Görsel URL</span>
              <input
                placeholder="https://..."
                value={productForm.imageUrl ?? ""}
                onChange={(event) => updateForm("imageUrl", event.target.value)}
              />
            </label>

            <label className="file-input span-2 product-file-input">
              <span>Ürün görseli yükle</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setProductFile(event.target.files?.[0] || null)
                }
              />
              <em>{productFile?.name || "Dosya seçilmedi"}</em>
            </label>
          </div>

          <div className="product-image-preview">
            {productForm.imageUrl ? (
              <img src={productForm.imageUrl} alt={productForm.title || "Ürün"} />
            ) : (
              <div>
                <span>AKC</span>
                <p>Görsel eklenince burada önizleme görünür.</p>
              </div>
            )}
          </div>
        </div>

        <div className="product-form-actions">
          <button className="admin-primary-btn" type="submit" disabled={saving}>
            {saving
              ? "Kaydediliyor..."
              : editingProductId
                ? "Ürünü Güncelle"
                : "Ürün Ekle"}
          </button>

          <button
            className="admin-secondary-btn"
            type="button"
            onClick={resetProductForm}
          >
            Formu Temizle
          </button>
        </div>
      </form>

      <div className="admin-product-toolbar">
        <div>
          <p className="eyebrow">Ürün listesi</p>
          <h3>Katalog kartları</h3>
        </div>

        <div className="admin-product-filters">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Ürün, kategori veya malzeme ara..."
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="active">Yayında</option>
            <option value="passive">Pasif</option>
            <option value="featured">Öne çıkan</option>
            <option value="priced">Fiyatlı</option>
          </select>
        </div>
      </div>

      <div className="admin-list product-admin-list">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            Ürün bulunamadı. Arama filtresini temizleyebilir veya yeni ürün
            ekleyebilirsin.
          </div>
        ) : null}

        {filteredProducts.map((product) => {
          const price = getProductPricing(product);
          const isActive = product.isActive !== false;

          return (
            <article
              className={`admin-list-item admin-list-item--premium ${
                isActive ? "is-live" : "is-passive"
              }`}
              key={product.id}
            >
              <div className="item-main">
                <div className="product-admin-thumb">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title || "Ürün"} />
                  ) : (
                    <span>AKC</span>
                  )}
                </div>

                <div>
                  <small>
                    {safeText(product.category) || "Kategori yok"} •{" "}
                    {safeText(product.material) || "Malzeme yok"} • Sıra{" "}
                    {product.sortOrder || 0}
                  </small>

                  <h3>{product.title || "Başlıksız ürün"}</h3>

                  <p>
                    {product.description ||
                      "Bu ürün için açıklama eklenmemiş. Müşteri tarafında daha güçlü görünmesi için açıklama yazın."}
                  </p>

                  <div className="price-preview">
                    {price.oldText ? <del>{price.oldText}</del> : null}
                    <strong>{price.finalText}</strong>
                    {price.note ? <small>{price.note}</small> : null}
                  </div>

                  <div className="mini-badges">
                    <span>{isActive ? "Yayında" : "Pasif"}</span>
                    {product.isFeatured ? <span>Öne çıkan</span> : null}
                    {Number(product.discountPriceAmount) > 0 ? (
                      <span>İndirimli</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="item-actions item-actions--stacked">
                <button type="button" onClick={() => editProduct(product)}>
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateProduct(product.id, { isActive: !isActive })
                  }
                >
                  {isActive ? "Yayından Al" : "Yayına Al"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateProduct(product.id, {
                      isFeatured: !product.isFeatured,
                    })
                  }
                >
                  {product.isFeatured ? "Öne Çıkarma" : "Öne Çıkar"}
                </button>

                <button
                  className="danger-action"
                  type="button"
                  onClick={() => removeProduct(product.id)}
                >
                  Sil
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}