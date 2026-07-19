export function trackEvent(eventName, parameters = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    ...parameters,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

export function getAnalyticsConsent() {
  if (typeof window === "undefined") return "pending";
  return window.localStorage.getItem("akc-analytics-consent") || "pending";
}
