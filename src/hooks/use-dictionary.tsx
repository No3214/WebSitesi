"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

type DictContextValue = {
  dict: Dictionary | null;
  locale: Locale;
  error: Error | null;
};

const DictContext = createContext<DictContextValue | null>(null);

/**
 * Provider that fetches the dictionary ONCE and shares it with all consumers.
 * Wrap this around your page content in layout.tsx.
 */
export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [locale, setLocale] = useState<Locale>("tr");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const currentLocale = getLocaleFromCookie();
    setLocale(currentLocale);
    getDictionary(currentLocale)
      .then((d) => setDict(d as Dictionary))
      .catch((err) => {
        console.error("[DictionaryProvider] Failed to load dictionary:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        if (currentLocale !== "tr") {
          getDictionary("tr")
            .then((d) => setDict(d as Dictionary))
            .catch(() => {});
        }
      });
  }, []);

  return (
    <DictContext.Provider value={{ dict, locale, error }}>
      {children}
    </DictContext.Provider>
  );
}

/**
 * Hook to access the shared dictionary. Uses context if available (DictionaryProvider),
 * otherwise falls back to standalone fetch (for components outside the provider).
 */
export function useDictionary(): DictContextValue {
  const ctx = useContext(DictContext);

  // If inside provider, use shared context
  if (ctx) return ctx;

  // Fallback: standalone fetch (backwards compatible)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [dict, setDict] = useState<Dictionary | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [locale, setLocale] = useState<Locale>("tr");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [error, setError] = useState<Error | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const currentLocale = getLocaleFromCookie();
    setLocale(currentLocale);
    getDictionary(currentLocale)
      .then((d) => setDict(d as Dictionary))
      .catch((err) => {
        console.error("[useDictionary] Failed to load dictionary:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        if (currentLocale !== "tr") {
          getDictionary("tr")
            .then((d) => setDict(d as Dictionary))
            .catch(() => {});
        }
      });
  }, []);

  return { dict, locale, error };
}
