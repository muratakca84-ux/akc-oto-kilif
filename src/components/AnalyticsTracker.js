"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAnalyticsConsent, trackEvent } from "@/lib/analytics";

const TRACK_LOCALHOST =
  process.env.NEXT_PUBLIC_TRACK_LOCALHOST === "true";

const ENABLE_FIRESTORE_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_FIRESTORE_ANALYTICS !== "false";

function isLocalhost() {
  if (typeof window === "undefined") return true;

  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(
    window.location.hostname
  );
}

function safeText(value, maxLength = 500) {
  return String(value || "").slice(0, maxLength);
}

function getDeviceType() {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent.toLowerCase();

  if (/mobile|iphone|android/.test(ua)) return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";

  return "desktop";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState("pending");

  useEffect(() => {
    queueMicrotask(() => setConsent(getAnalyticsConsent()));
    const handleConsent = (event) => setConsent(event.detail || getAnalyticsConsent());
    window.addEventListener("akc-consent-updated", handleConsent);
    return () => window.removeEventListener("akc-consent-updated", handleConsent);
  }, []);

  const path = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname || "/";
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (consent !== "granted") return;
    if (isLocalhost() && !TRACK_LOCALHOST) return;

    const sessionKey = `akc-pageview-${path}`;

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    sessionStorage.setItem(sessionKey, "1");

    if (!ENABLE_FIRESTORE_ANALYTICS) return;

    const record = {
      eventType: "pageview",
      path,
      pageTitle: safeText(document.title, 180),
      referrer: safeText(document.referrer, 500),
      userAgent: safeText(navigator.userAgent, 500),
      deviceType: getDeviceType(),
      language: safeText(navigator.language, 40),
      screenWidth: window.screen?.width || null,
      screenHeight: window.screen?.height || null,
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "analyticsEvents"), record).catch(() => undefined);
  }, [path, consent]);

  useEffect(() => {
    function handleClick(event) {
      const link = event.target.closest("a[href]");
      if (!link || getAnalyticsConsent() !== "granted") return;

      const href = link.getAttribute("href") || "";
      const label = safeText(link.textContent, 120).trim();
      let eventName = "select_content";
      let contactMethod = "internal_link";

      if (href.includes("wa.me")) {
        eventName = "generate_lead";
        contactMethod = "whatsapp";
      } else if (href.startsWith("tel:")) {
        eventName = "generate_lead";
        contactMethod = "phone";
      } else if (href.startsWith("mailto:")) {
        eventName = "generate_lead";
        contactMethod = "email";
      } else if (href === "/urunler") {
        eventName = "view_item_list";
        contactMethod = "products";
      }

      trackEvent(eventName, {
        contact_method: contactMethod,
        link_url: href,
        link_text: label,
        page_path: window.location.pathname,
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
