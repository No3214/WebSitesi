"use client";

import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  // const router = useRouter();
  // Simplified toggle logic for TR/EN
  const toggleLanguage = () => {
    // In a production next-intl setup, this would use locale routing.
    // For now, we simulate with a query param or cookie if full routing is not yet established.
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    const nextLocale = currentLocale === "en" ? "tr" : "en";
    
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="lang-switcher"
      aria-label="Toggle Language"
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text)',
        fontSize: '0.8rem',
        fontWeight: 600
      }}
    >
      <Languages size={16} />
      <span>TR | EN</span>
    </button>
  );
}
