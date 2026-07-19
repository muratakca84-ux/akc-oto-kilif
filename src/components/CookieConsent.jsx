"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "akc-analytics-consent";

function updateGoogleConsent(value) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "update", {
    analytics_storage: value === "granted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export default function CookieConsent() {
  const [choice, setChoice] = useState("loading");

  useEffect(() => {
    queueMicrotask(() => {
      setChoice(window.localStorage.getItem(STORAGE_KEY) || "pending");
    });
  }, []);

  function saveChoice(value) {
    window.localStorage.setItem(STORAGE_KEY, value);
    updateGoogleConsent(value);
    window.dispatchEvent(
      new CustomEvent("akc-consent-updated", { detail: value })
    );
    setChoice(value);
  }

  if (choice !== "pending") return null;

  return (
    <aside className="cookie-consent" aria-label="Çerez tercihleri">
      <div>
        <strong>Gizliliğiniz bizim için önemli.</strong>
        <p>
          Zorunlu çerezler sitenin çalışmasını sağlar. Analitik çerezleri yalnızca
          izninizle, siteyi geliştirmek için anonim kullanım verisi toplar.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => saveChoice("denied")}>
          Yalnızca zorunlu
        </button>
        <button
          className="cookie-consent-accept"
          type="button"
          onClick={() => saveChoice("granted")}
        >
          Analitiğe izin ver
        </button>
      </div>
    </aside>
  );
}
