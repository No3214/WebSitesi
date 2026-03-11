"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="container flex-between">
        <div className="cookie-content">
          <Cookie size={20} className="cookie-icon" />
          <p>
            Size daha iyi bir deneyim sunabilmek için çerezleri kullanıyoruz. 
            Detaylı bilgi için <Link href="/kvkk">Çerez Politikamızı</Link> inceleyebilirsiniz.
          </p>
        </div>
        <div className="cookie-actions">
          <button onClick={acceptAll} className="button primary sm">KABUL ET</button>
        </div>
      </div>
    </div>
  );
}
