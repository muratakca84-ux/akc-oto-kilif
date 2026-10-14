"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Icon from "@/components/Icon";
import { trackEvent } from "@/lib/analytics";
import { getProductPricing } from "@/lib/pricing";
import { getContact } from "@/lib/site-config";
import { useSiteSettings } from "@/lib/use-site-settings";

const FALLBACK_IMAGES = [
  "/images/hero-premium-seat-covers.jpg",
  "/images/seat-stitch-detail.jpg",
  "/images/suv-seat-cover-installation.jpg",
];

const FALLBACK_PRODUCTS = [
  {
    title: "Deri Görünümlü Araca Özel Kılıf",
    category: "Binek Araç",
    material: "Deri görünümlü",
    description: "Model uyumlu kesim, kolay temizlenen yüzey ve kontrast dikiş seçenekleriyle günlük kullanıma uygun kılıf.",
  },
  {
    title: "Kumaş + Deri Kombin Döşeme",
    category: "SUV",
    material: "Kumaş + deri",
    description: "Nefes alan kumaş orta bölge ve dayanıklı deri yanaklarla konforlu, uzun ömürlü döşeme.",
  },
  {
    title: "Filo Tipi Dayanıklı Kılıf",
    category: "Filo Araçları",
    material: "Dayanıklı kumaş",
    description: "Taksi, servis ve ticari araçlarda yoğun kullanıma dayanıklı, kolay bakımlı çözüm.",
  },
];

export default function ProductCatalog() {
  const contact = getContact(useSiteSettings());
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");

  useEffect(() => {
    const productQuery = query(collection(db, "products"), orderBy("sortOrder", "asc"), limit(100));
    return onSnapshot(
      productQuery,
      (snapshot) =>
        setProducts(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.isActive !== false)
        ),
      () => setProducts([])
    );
  }, []);

  const list = useMemo(() => (products && products.length ? products : FALLBACK_PRODUCTS), [products]);

  const categories = useMemo(
    () => ["Tümü", ...Array.from(new Set(list.map((item) => item.category).filter(Boolean)))],
    [list]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    return list.filter((product) => {
      if (category !== "Tümü" && product.category !== category) return false;
      if (!q) return true;
      return [product.title, product.description, product.material, product.category]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(q);
    });
  }, [list, search, category]);

  function whatsappFor(product) {
    const price = getProductPricing(product);
    const lines = [
      `Merhaba, "${product.title || "ürün"}" hakkında bilgi ve teklif almak istiyorum.`,
      product.category ? `Kategori: ${product.category}` : "",
      product.material ? `Malzeme: ${product.material}` : "",
      price.hasRealPrice ? `Listelenen fiyat: ${price.finalText}` : "",
      "Aracım: ",
    ];
    return contact.whatsappHref(lines.filter(Boolean).join("\n"));
  }

  return (
    <div className="catalog">
      <div className="catalog-toolbar">
        <div className="chips" role="tablist" aria-label="Kategori">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={`chip ${category === item ? "is-active" : ""}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">Ürün ara</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ürün, malzeme veya kategori ara"
          />
        </label>
      </div>

      {products === null ? (
        <p className="catalog-empty">Ürünler yükleniyor…</p>
      ) : filtered.length === 0 ? (
        <p className="catalog-empty">Aramanıza uygun ürün bulunamadı.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((product, index) => {
            const price = getProductPricing(product);
            return (
              <article className="product-card" key={product.id || product.title}>
                <div className="product-media">
                  <img
                    src={product.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                    alt={product.title || "Ürün görseli"}
                    loading="lazy"
                  />
                  {product.isFeatured ? <span className="product-flag">Öne çıkan</span> : null}
                </div>
                <div className="product-body">
                  <span className="product-category">{product.category || "Özel üretim"}</span>
                  <h3>{product.title}</h3>
                  {product.description ? <p>{product.description}</p> : null}
                  {product.material ? (
                    <dl className="product-spec">
                      <dt>Malzeme</dt>
                      <dd>{product.material}</dd>
                    </dl>
                  ) : null}
                  <div className="product-footer">
                    <div className="product-price">
                      {price.oldText ? <del>{price.oldText}</del> : null}
                      <strong>{price.finalText}</strong>
                      {price.note ? <small>{price.note}</small> : null}
                    </div>
                    <a
                      className="btn btn-primary btn-sm"
                      href={whatsappFor(product)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent("product_inquiry", { product_title: product.title || "" })}
                    >
                      <Icon name="whatsapp" size={16} /> Bilgi al
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
