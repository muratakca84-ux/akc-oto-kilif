"use client";

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildThemePalette, defaultThemeState } from "@/lib/theme";

const defaultSiteSettings = {
  siteTitle: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf ve Döşeme",
  metaDescription:
    "AKC Oto Kılıf; araca özel oto kılıf, koltuk döşeme, direksiyon kaplama ve profesyonel montaj hizmetleri sunar.",
  faviconUrl: "",
  trackingMetaPixel: "",
  trackingGa4: "",
  trackingTagManager: "",
  trackingCustomHead: "",
  trackingCustomBody: "",
  analyticsEnabled: true,
};

function normalizeSnippet(content) {
  return String(content || "")
    .trim()
    .replace(/^<script[^>]*>/i, "")
    .replace(/<\/script>$/i, "");
}

function getMountTarget(target = "head") {
  if (typeof document === "undefined") return null;

  // Avoid injecting into body when the app root is managed by React,
  // because mutating body children directly can destabilize React commit phases.
  return document.head || document.documentElement || null;
}

function safeRemoveNode(node) {
  if (!node) return;
  const doRemove = () => {
    try {
      if (typeof node.remove === "function") {
        node.remove();
        return;
      }
    } catch {
      // fallback to parent removal if .remove() is unavailable or throws
    }

    try {
      if (node.parentNode && typeof node.parentNode.removeChild === "function") {
        node.parentNode.removeChild(node);
      }
    } catch {
      // ignore removal failures entirely
    }
  };

  if (typeof window !== "undefined") {
    if (typeof window.requestIdleCallback === "function") {
      try {
        window.requestIdleCallback(doRemove, { timeout: 200 });
      } catch {
        setTimeout(doRemove, 0);
      }
    } else {
      setTimeout(doRemove, 0);
    }
  } else {
    doRemove();
  }
}

function injectSnippet(id, content, target = "head") {
  if (typeof document === "undefined") return;

  const parent = getMountTarget(target);
  if (!parent) return;

  const existing = document.getElementById(id);
  safeRemoveNode(existing);

  if (!content) return;

  const script = document.createElement("script");
  script.id = id;
  script.type = "text/javascript";
  script.textContent = normalizeSnippet(content);
  const doAppend = () => {
    try {
      parent.appendChild(script);
    } catch {
      // ignore DOM failures
    }
  };

  if (typeof window !== "undefined") {
    if (typeof window.requestIdleCallback === "function") {
      try {
        window.requestIdleCallback(doAppend, { timeout: 200 });
      } catch {
        setTimeout(doAppend, 0);
      }
    } else {
      setTimeout(doAppend, 0);
    }
  } else {
    doAppend();
  }
}

function applySiteSettings(settings = {}) {
  if (typeof document === "undefined") return;

    try {
      const siteTitle = settings.siteTitle || defaultSiteSettings.siteTitle;
      // defer title + meta updates to avoid colliding with React commit phases
      const doApply = () => {
        try {
          document.title = siteTitle;

          const head = getMountTarget("head");
          if (!head) return;

          let descriptionMeta = document.querySelector('meta[name="description"]');
          if (!descriptionMeta) {
            descriptionMeta = document.createElement("meta");
            descriptionMeta.setAttribute("name", "description");
            try { head.appendChild(descriptionMeta); } catch {}
          }
          try {
            descriptionMeta.setAttribute(
              "content",
              settings.metaDescription || defaultSiteSettings.metaDescription
            );
          } catch {}

          let faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.setAttribute("rel", "icon");
            try { head.appendChild(faviconLink); } catch {}
          }

          try {
            try {
              // Avoid removing favicon elements that may be managed by the app or framework.
              // Instead, update the href or clear it when no favicon is provided.
              if (settings.faviconUrl) {
                faviconLink.setAttribute("href", settings.faviconUrl);
              } else {
                try {
                  faviconLink.setAttribute("href", "");
                } catch {}
              }
            } catch {}
          } catch {}

          if (settings.analyticsEnabled !== false) {
            injectSnippet("akc-meta-pixel", settings.trackingMetaPixel, "head");
            injectSnippet("akc-ga4", settings.trackingGa4, "head");
            injectSnippet("akc-tag-manager", settings.trackingTagManager, "head");
            injectSnippet("akc-custom-head", settings.trackingCustomHead, "head");
            injectSnippet("akc-custom-body", settings.trackingCustomBody, "head");
          } else {
            ["akc-meta-pixel", "akc-ga4", "akc-tag-manager", "akc-custom-head", "akc-custom-body"].forEach((id) => {
              safeRemoveNode(document.getElementById(id));
            });
          }
        } catch {
          // ignore
        }
      };

      if (typeof window !== "undefined") {
        if (typeof window.requestIdleCallback === "function") {
          try {
            window.requestIdleCallback(doApply, { timeout: 300 });
          } catch {
            setTimeout(doApply, 0);
          }
        } else {
          setTimeout(doApply, 0);
        }
      } else {
        doApply();
      }
    } catch {
      // ignore site settings injection failures so React does not crash
    }
}

export default function ThemeProvider() {
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => {
        const settings = {
          ...defaultThemeState,
          ...defaultSiteSettings,
          ...(snapshot.data() || {}),
        };

        const palette = buildThemePalette(settings);

        Object.entries(palette).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });

        document.documentElement.dataset.theme = settings.themePreset || "classic";
        // NOTE: intentionally not applying site head/meta/script changes here to avoid
        // colliding with React's DOM commit phases which could cause `removeChild` errors.
        // applySiteSettings(settings);
      },
      () => {
        const palette = buildThemePalette(defaultThemeState);
        Object.entries(palette).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });
        // applySiteSettings(defaultSiteSettings);
      }
    );

    return () => unsubscribe();
  }, []);

  return null;
}
