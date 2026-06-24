"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import type { MouseEvent } from "react";
import { getEnglishHref, getTurkishHref, isEnglishPath } from "@/lib/localized-routes";

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const isEnglish = isEnglishPath(pathname);
  const trHref = getTurkishHref(pathname);
  const enHref = getEnglishHref(pathname);

  const persistLanguage = (locale: "tr" | "en", event: MouseEvent<HTMLAnchorElement>) => {
    // Çerez yazımı korunur — içerik dili client bileşenlerde bu çerezden çözülür.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

    // /en dışında TR seçimi: mevcut tam sayfa yenileme davranışı korunur,
    // çerez tabanlı içerik dili böylece tazelenir.
    if (locale === "tr" && !isEnglishPath(pathname)) {
      event.preventDefault();
      window.location.reload();
    }
  };

  const optionStyle = (active: boolean): CSSProperties => ({
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "inherit",
    fontSize: "0.8rem",
    fontWeight: active ? 700 : 500,
    opacity: active ? 1 : 0.65,
    lineHeight: 1,
    textDecoration: "none",
  });

  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label="Dil seçimi"
      style={{
        background: "none",
        border: "1px solid var(--border)",
        padding: "8px 12px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "var(--text)",
        fontSize: "0.8rem",
        fontWeight: 600,
      }}
    >
      <Languages size={16} aria-hidden="true" />
      <Link
        href={trHref}
        onClick={(event) => persistLanguage("tr", event)}
        aria-current={!isEnglish ? "true" : undefined}
        style={optionStyle(!isEnglish)}
      >
        TR
      </Link>
      <span aria-hidden="true">|</span>
      <Link
        href={enHref}
        onClick={(event) => persistLanguage("en", event)}
        aria-current={isEnglish ? "true" : undefined}
        style={optionStyle(isEnglish)}
      >
        EN
      </Link>
    </div>
  );
}
