"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const fallbackSettings = {
  businessName: "AKC Oto Kılıf",
  phone: "+90 501 586 42 84",
  whatsapp: "905015864284",
  email: "info@akcotokilif.com",
};

const fallbackProductImages = [
  "/images/hero-premium-seat-covers.jpg",
  "/images/seat-stitch-detail.jpg",
  "/images/suv-seat-cover-installation.jpg",
];

const fallbackProducts = [
  {
    title: "Premium Deri Kılıf",
    category: "Binek Araç",
    material: "Deri Görünümlü",
    priceText: "Teklif alınız",
    description:
      "Araç modeliyle uyumlu, premium görünüm sunan özel dikim kılıf çözümü.",
    imageUrl: "",
  },
  {
    title: "Spor Dikişli Koltuk Döşeme",
    category: "SUV",
    material: "Kumaş + Deri",
    priceText: "Teklif alınız",
    description:
      "İç mekâna karakter katan, detay odaklı ve dayanıklı döşeme seçeneği.",
    imageUrl: "",
  },
  {
    title: "Filo Araçları İçin Dayanıklı Çözüm",
    category: "Filo",
    material: "Dayanıklı Kumaş",
    priceText: "Teklif alınız",
    description:
      "Yoğun kullanıma uygun, kolay temizlenebilir ve uzun ömürlü üretim.",
    imageUrl: "",
  },
];

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPrice(value, currency = "TRY") {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
}

function getProductPricing(product) {
  const currency = product?.currency || "TRY";
  const note = String(product?.priceText || "").trim();

  if (product?.showPrice === false) {
    return {
      oldText: "",
      finalText: note || "Teklif alınız",
      note: "",
    };
  }

  const normalPrice = formatPrice(product?.priceAmount, currency);
  const discountPrice = formatPrice(product?.discountPriceAmount, currency);

  if (discountPrice) {
    return {
      oldText: normalPrice,
      finalText: discountPrice,
      note: note && note !== "Teklif alınız" ? note : "",
    };
  }

  if (normalPrice) {
    return {
      oldText: "",
      finalText: normalPrice,
      note: note && note !== "Teklif alınız" ? note : "",
    };
  }

  return {
    oldText: "",
    finalText: note || "Teklif alınız",
    note: "",
  };
}

export default function ProductCatalog({
  title = "Premium ürünler",
  description = "Araç tipinize uygun özel üretim kılıf ve döşeme çözümlerini keşfedin.",
}) {
  const [settings, setSettings] = useState(fallbackSettings);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...fallbackSettings, ...snapshot.data() });
      }
    });

    const productQuery = query(
      collection(db, "products"),
      orderBy("sortOrder", "asc"),
      limit(100)
    );

    const unsubProducts = onSnapshot(productQuery, (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.isActive !== false);

      setProducts(data);
    });

    return () => {
      unsubSettings();
      unsubProducts();
    };
  }, []);

  const displayProducts = useMemo(
    () => (products.length ? products : fallbackProducts),
    [products]
  );

  const categories = useMemo(() => {
    const values = displayProducts
      .map((product) => product.category)
      .filter(Boolean);

    return ["Tümü", ...Array.from(new Set(values))];
  }, [displayProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return displayProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "Tümü" || product.category === selectedCategory;
      const haystack = [
        product.title,
        product.description,
        product.text,
        product.material,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [displayProducts, searchTerm, selectedCategory]);

  const handleOrder = (product) => {
    const whatsappNumber = onlyDigits(settings.whatsapp || settings.phone);
    const price = getProductPricing(product);
    const message = [
      `Merhaba, ${product.title || "ürün"} ürününü sipariş etmek istiyorum.`,
      product.category ? `Kategori: ${product.category}` : "",
      product.material ? `Malzeme: ${product.material}` : "",
      price.finalText ? `Fiyat: ${price.finalText}` : "",
      "Lütfen bana dönüş yapın.",
    ]
      .filter(Boolean)
      .join("\n");

    const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="products-panel">
      <div className="section-head section-head--centered">
        <p className="eyebrow">Ürünler</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span>Ürün ara</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Başlık, malzeme veya kategori"
          />
        </label>

        <label className="catalog-filter">
          <span>Kategori</span>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product, index) => {
          const price = getProductPricing(product);
          const productImage =
            product.imageUrl || fallbackProductImages[index % fallbackProductImages.length];

          return (
            <article
              className="product-card product-card--image"
              key={product.id || product.title}
            >
              <div className="product-card__image">
                <img src={productImage} alt={product.title} loading="lazy" />
              </div>

              <div className="product-card__body">
                <span className="product-badge">
                  {product.category || "Özel Üretim"}
                </span>

                <h3>{product.title}</h3>
                <p>{product.description || product.text}</p>

                <div className="product-meta">
                  <span>{product.material || "Özel ölçü"}</span>
                  <span>{product.variant || "Premium kalite"}</span>
                </div>

                <div className="product-price-box">
                  <span className="product-price-label">Fiyat</span>
                  <strong className="product-price">{price.finalText}</strong>
                  {price.note ? <small>{price.note}</small> : null}
                </div>

                <button type="button" className="order-btn" onClick={() => handleOrder(product)}>
                  Hemen Sipariş Ver
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
