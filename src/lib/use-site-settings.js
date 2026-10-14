"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SITE_FALLBACK, mergeSiteSettings } from "@/lib/site-config";

/** settings/site belgesini canlı dinler; hata veya boş belge durumunda varsayılanları döner. */
export function useSiteSettings() {
  const [settings, setSettings] = useState(SITE_FALLBACK);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "site"),
      (snapshot) => setSettings(mergeSiteSettings(snapshot.exists() ? snapshot.data() : {})),
      () => setSettings(SITE_FALLBACK)
    );
  }, []);

  return settings;
}
