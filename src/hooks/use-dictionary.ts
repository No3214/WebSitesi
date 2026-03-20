"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";

export type Locale = "tr" | "en";

export type Dictionary = {
  Home: { title: string; eyebrow: string; cta: string; story: string };
  Navigation: { history: string; rooms: string; dining: string; events: string; booking: string };
  Rooms: { title: string; eyebrow: string; text: string; detail: string };
  Footer: { description: string; explore: string; legal: string; contact: string };
};

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "tr";
  return document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
}

/**
 * Shared hook for locale detection + dictionary loading.
 * Eliminates duplicate code across 5+ components.
 */
export function useDictionary() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [locale, setLocale] = useState<Locale>("tr");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const currentLocale = getLocaleFromCookie();
    setLocale(currentLocale);
    getDictionary(currentLocale)
      .then((d) => setDict(d as Dictionary))
      .catch((err) => {
        console.error("[useDictionary] Failed to load dictionary:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fallback: try Turkish
        if (currentLocale !== "tr") {
          getDictionary("tr")
            .then((d) => setDict(d as Dictionary))
            .catch(() => {});
        }
      });
  }, []);

  return { dict, locale, error };
}
