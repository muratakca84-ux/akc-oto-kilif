"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

function sendToBrowserTrackers(path) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: "akc_page_view",
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const path = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname || "/";
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLocalhost() && !TRACK_LOCALHOST) return;

    const sessionKey = `akc-pageview-${path}`;

    if (sessionStorage.getItem(sessionKey)) {
      sendToBrowserTrackers(path);
      return;
    }

    sessionStorage.setItem(sessionKey, "1");

    sendToBrowserTrackers(path);

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
  }, [path]);

  return null;
}