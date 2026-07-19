"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAnalyticsConsent } from "@/lib/analytics";

const envTracking = {
  trackingEnabled: true,
  trackLocalhost: false,
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || "",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  facebookDomainVerification:
    process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || "",
};

function cleanId(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w.-]/g, "");
}

function validGaId(value) {
  return /^G-[A-Z0-9]{6,14}$/i.test(value);
}

function validGtmId(value) {
  return /^GTM-[A-Z0-9]{4,12}$/i.test(value);
}

function validPixelId(value) {
  return /^\d{8,20}$/.test(value);
}

function isLocalhost() {
  if (typeof window === "undefined") return false;

  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(
    window.location.hostname
  );
}

function upsertMeta(name, content) {
  if (typeof document === "undefined") return;
  if (!content) return;

  let tag = document.head.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

export default function AnalyticsScripts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tracking, setTracking] = useState(envTracking);
  const [consent, setConsent] = useState("pending");
  const trackedInitialPage = useRef(false);

  useEffect(() => {
    const syncConsent = () => setConsent(getAnalyticsConsent());
    queueMicrotask(syncConsent);

    function handleConsent(event) {
      setConsent(event.detail || getAnalyticsConsent());
    }

    window.addEventListener("akc-consent-updated", handleConsent);
    return () => window.removeEventListener("akc-consent-updated", handleConsent);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();

        setTracking({
          ...envTracking,
          trackingEnabled: data.trackingEnabled !== false,
          trackLocalhost: data.trackLocalhost === true,
          googleTagManagerId:
            data.googleTagManagerId || envTracking.googleTagManagerId,
          googleAnalyticsId:
            data.googleAnalyticsId || envTracking.googleAnalyticsId,
          metaPixelId: data.metaPixelId || envTracking.metaPixelId,
          googleSiteVerification:
            data.googleSiteVerification ||
            envTracking.googleSiteVerification,
          facebookDomainVerification:
            data.facebookDomainVerification ||
            envTracking.facebookDomainVerification,
        });
      },
      () => {
        setTracking(envTracking);
      }
    );

    return () => unsub();
  }, []);

  const ids = useMemo(
    () => {
      const gtmId = validGtmId(cleanId(tracking.googleTagManagerId))
        ? cleanId(tracking.googleTagManagerId)
        : "";

      return {
      gtmId,
      gaId: !gtmId && validGaId(cleanId(tracking.googleAnalyticsId))
        ? cleanId(tracking.googleAnalyticsId)
        : "",
      pixelId: validPixelId(cleanId(tracking.metaPixelId))
        ? cleanId(tracking.metaPixelId)
        : "",
      googleVerify: String(tracking.googleSiteVerification || "").trim(),
      facebookVerify: String(tracking.facebookDomainVerification || "").trim(),
    };
    },
    [tracking]
  );

  const pageUrl = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const shouldTrack =
    tracking.trackingEnabled !== false &&
    consent === "granted" &&
    (!isLocalhost() || tracking.trackLocalhost === true);

  useEffect(() => {
    upsertMeta("google-site-verification", ids.googleVerify);
    upsertMeta("facebook-domain-verification", ids.facebookVerify);
  }, [ids.googleVerify, ids.facebookVerify]);

  useEffect(() => {
    if (!shouldTrack) return;
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (
      trackedInitialPage.current &&
      ids.gaId &&
      typeof window.gtag === "function"
    ) {
      window.gtag("event", "page_view", {
        page_path: pageUrl,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    window.dataLayer.push({
      event: "akc_page_view",
      page_path: pageUrl,
      page_location: window.location.href,
      page_title: document.title,
    });

    trackedInitialPage.current = true;
  }, [pageUrl, ids.gaId, shouldTrack]);

  if (!shouldTrack) return null;

  return (
    <>
      {ids.gtmId ? (
        <>
          <Script id="akc-gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${ids.gtmId}');
            `}
          </Script>

          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${ids.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}

      {ids.gaId ? (
        <>
          <Script
            id="akc-ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${ids.gaId}`}
            strategy="afterInteractive"
          />

          <Script id="akc-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${ids.gaId}', {
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {ids.pixelId ? (
        <>
          <Script id="akc-meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${ids.pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>

          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${ids.pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
