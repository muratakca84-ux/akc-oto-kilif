"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "akc-analytics-consent";

function readChoice() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "pending";
  } catch {
    return "pending";
  }
}

function updateGoogleConsent(value) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
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
  const pathname = usePathname();
  const [choice, setChoice] = useState("loading");

  useEffect(() => {
    queueMicrotask(() => setChoice(readChoice()));
  }, []);

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // depolama kapalıysa tercih yalnızca bu oturum için geçerli olur
    }
    updateGoogleConsent(value);
    window.dispatchEvent(new CustomEvent("akc-consent-updated", { detail: value }));
    setChoice(value);
  }

  if (choice !== "pending" || pathname?.startsWith("/admin")) return null;

  return (
    <aside className="cookie-bar" aria-label="Çerez tercihleri">
      <p>
        Sitenin çalışması için zorunlu çerezler kullanılır. Ziyaret istatistikleri yalnızca izninizle
        toplanır. <Link href="/gizlilik">Ayrıntılar</Link>
      </p>
      <div className="cookie-bar-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => saveChoice("denied")}>
          Yalnızca zorunlu
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => saveChoice("granted")}>
          Kabul et
        </button>
      </div>
    </aside>
  );
}
