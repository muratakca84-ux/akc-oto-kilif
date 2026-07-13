"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    () => ({
      gtmId: cleanId(tracking.googleTagManagerId),
      gaId: cleanId(tracking.googleAnalyticsId),
      pixelId: cleanId(tracking.metaPixelId),
      googleVerify: String(tracking.googleSiteVerification || "").trim(),
      facebookVerify: String(tracking.facebookDomainVerification || "").trim(),
    }),
    [tracking]
  );

  const pageUrl = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const shouldTrack =
    tracking.trackingEnabled !== false &&
    (!isLocalhost() || tracking.trackLocalhost === true);

  useEffect(() => {
    upsertMeta("google-site-verification", ids.googleVerify);
    upsertMeta("facebook-domain-verification", ids.facebookVerify);
  }, [ids.googleVerify, ids.facebookVerify]);

  useEffect(() => {
    if (!shouldTrack) return;
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: "virtual_page_view",
      page_path: pageUrl,
      page_location: window.location.href,
      page_title: document.title,
    });

    if (ids.gaId && typeof window.gtag === "function") {
      window.gtag("config", ids.gaId, {
        page_path: pageUrl,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    if (ids.pixelId && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pageUrl, ids.gaId, ids.pixelId, shouldTrack]);

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
                send_page_view: false
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