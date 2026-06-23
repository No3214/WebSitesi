"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";

import {
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  getDefaultConsent,
  parseConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/consent";
import { getLegalHref } from "@/lib/legal-routes";

type ConsentLocale = "tr" | "en";

const consentCopy = {
  tr: {
    ariaLabel: "Çerez tercihleri",
    description: "Zorunlu olmayan çerezleri yalnızca onayınızla kullanıyoruz. Detaylar için",
    policy: "Çerez Politikamızı",
    suffix: " inceleyebilirsiniz.",
    summaries: {
      all: "Analitik ve pazarlama çerezleri açık.",
      analytics: "Sadece analitik çerezler açık.",
      marketing: "Sadece pazarlama çerezleri açık.",
      necessary: "Yalnızca zorunlu çerezler aktif.",
    },
    necessary: "Zorunlu çerezler",
    analytics: "Analitik çerezler",
    marketing: "Pazarlama çerezleri",
    reject: "Reddet",
    preferences: "Tercihler",
    save: "Tercihleri Kaydet",
    acceptAll: "Tümünü Kabul Et",
  },
  en: {
    ariaLabel: "Cookie preferences",
    description: "We use optional cookies only with your consent. For details, review our",
    policy: "Cookie Policy",
    suffix: ".",
    summaries: {
      all: "Analytics and marketing cookies are enabled.",
      analytics: "Only analytics cookies are enabled.",
      marketing: "Only marketing cookies are enabled.",
      necessary: "Only necessary cookies are active.",
    },
    necessary: "Necessary cookies",
    analytics: "Analytics cookies",
    marketing: "Marketing cookies",
    reject: "Reject",
    preferences: "Preferences",
    save: "Save Preferences",
    acceptAll: "Accept All",
  },
} satisfies Record<ConsentLocale, {
  ariaLabel: string;
  description: string;
  policy: string;
  suffix: string;
  summaries: Record<"all" | "analytics" | "marketing" | "necessary", string>;
  necessary: string;
  analytics: string;
  marketing: string;
  reject: string;
  preferences: string;
  save: string;
  acceptAll: string;
}>;

function isEnglishPath(pathname: string | null): boolean {
  return pathname === "/en" || Boolean(pathname?.startsWith("/en/"));
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState<Omit<ConsentState, "updatedAt" | "necessary" | "version">>({
    analytics: false,
    marketing: false,
  });
  const pathname = usePathname();
  const [locale, setLocale] = useState<ConsentLocale>(isEnglishPath(pathname) ? "en" : "tr");

  useEffect(() => {
    setLocale(isEnglishPath(pathname) ? "en" : "tr");
  }, [pathname]);

  const copy = consentCopy[locale];
  const policyHref = getLegalHref("cookies", locale);

  useEffect(() => {
    const current = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (!current) {
      setIsVisible(true);
      setDraft({ analytics: false, marketing: false });
      return;
    }

    setDraft({ analytics: current.analytics, marketing: current.marketing });
  }, []);

  useEffect(() => {
    const openPreferences = () => {
      const current = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)) || getDefaultConsent();
      setDraft({ analytics: current.analytics, marketing: current.marketing });
      setIsExpanded(true);
      setIsVisible(true);
    };

    window.addEventListener(CONSENT_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openPreferences);
  }, []);

  const summaryText = useMemo(() => {
    if (draft.analytics && draft.marketing) return copy.summaries.all;
    if (draft.analytics) return copy.summaries.analytics;
    if (draft.marketing) return copy.summaries.marketing;
    return copy.summaries.necessary;
  }, [copy, draft.analytics, draft.marketing]);

  const apply = (value: { analytics: boolean; marketing: boolean }) => {
    saveConsent(value);
    setDraft(value);
    setIsVisible(false);
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={copy.ariaLabel}>
      <div className="container">
        <div className="cookie-content" style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Cookie size={20} className="cookie-icon" />
            <div>
              <p>
                {copy.description} <Link href={policyHref}>{copy.policy}</Link>
                {copy.suffix}
              </p>
              <p style={{ marginTop: 8 }}>{summaryText}</p>
            </div>
          </div>

          {isExpanded && (
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>{copy.necessary}</span>
                <input type="checkbox" checked readOnly disabled />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>{copy.analytics}</span>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(e) => setDraft((prev) => ({ ...prev, analytics: e.target.checked }))}
                />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>{copy.marketing}</span>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(e) => setDraft((prev) => ({ ...prev, marketing: e.target.checked }))}
                />
              </label>
            </div>
          )}

          <div className="cookie-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => apply({ analytics: false, marketing: false })} className="button secondary sm">
              {copy.reject}
            </button>
            <button onClick={() => setIsExpanded((prev) => !prev)} className="button secondary sm">
              {copy.preferences}
            </button>
            {isExpanded ? (
              <button onClick={() => apply(draft)} className="button primary sm">
                {copy.save}
              </button>
            ) : (
              <button onClick={() => apply({ analytics: true, marketing: true })} className="button primary sm">
                {copy.acceptAll}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
