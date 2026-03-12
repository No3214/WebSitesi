"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "cookie_consent";

function persistConsent(value: "accepted" | "rejected") {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event("cookie-consent-updated"));
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    setIsVisible(!consent);
  }, []);

  const acceptAll = () => {
    persistConsent("accepted");
    setIsVisible(false);
  };

  const rejectOptional = () => {
    persistConsent("rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="container flex-between" style={{ gap: "16px", flexWrap: "wrap" }}>
        <div className="cookie-content">
          <Cookie size={20} className="cookie-icon" />
          <p>
            Sadece zorunlu çerezler varsayılan olarak aktiftir. Analitik ve pazarlama çerezleri yalnızca onayınızla
            etkinleşir. Detaylar için <Link href="/kvkk">Çerez Politikamızı</Link> inceleyebilirsiniz.
          </p>
        </div>
        <div className="cookie-actions" style={{ display: "flex", gap: "8px" }}>
          <button onClick={rejectOptional} className="button secondary sm" type="button">
            REDDET
          </button>
          <button onClick={acceptAll} className="button primary sm" type="button">
            KABUL ET
          </button>
        </div>
      </div>
    </div>
  );
}
