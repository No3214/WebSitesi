"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import {
  CONSENT_STORAGE_KEY,
  // getDefaultConsent,
  parseConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState<Omit<ConsentState, "updatedAt" | "necessary" | "version">>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const current = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (!current) {
      setIsVisible(true);
      setDraft({ analytics: false, marketing: false });
      return;
    }

    setDraft({ analytics: current.analytics, marketing: current.marketing });
  }, []);

  const summaryText = useMemo(() => {
    if (draft.analytics && draft.marketing) return "Analitik ve pazarlama çerezleri açık.";
    if (draft.analytics) return "Sadece analitik çerezler açık.";
    if (draft.marketing) return "Sadece pazarlama çerezleri açık.";
    return "Yalnızca zorunlu çerezler aktif.";
  }, [draft.analytics, draft.marketing]);

  const apply = (value: { analytics: boolean; marketing: boolean }) => {
    saveConsent(value);
    setDraft(value);
    setIsVisible(false);
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Çerez tercihleri">
      <div className="container">
        <div className="cookie-content" style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Cookie size={20} className="cookie-icon" />
            <div>
              <p>
                Zorunlu olmayan çerezleri yalnızca onayınızla kullanıyoruz. Detaylar için <Link href="/kvkk">Çerez Politikamızı</Link> inceleyebilirsiniz.
              </p>
              <p style={{ marginTop: 8, opacity: 0.8 }}>{summaryText}</p>
            </div>
          </div>

          {isExpanded && (
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Zorunlu çerezler</span>
                <input type="checkbox" checked readOnly disabled />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Analitik çerezler</span>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(e) => setDraft((prev) => ({ ...prev, analytics: e.target.checked }))}
                />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span>Pazarlama çerezleri</span>
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
              Reddet
            </button>
            <button onClick={() => setIsExpanded((prev) => !prev)} className="button secondary sm">
              Tercihler
            </button>
            {isExpanded ? (
              <button onClick={() => apply(draft)} className="button primary sm">
                Tercihleri Kaydet
              </button>
            ) : (
              <button onClick={() => apply({ analytics: true, marketing: true })} className="button primary sm">
                Tümünü Kabul Et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
