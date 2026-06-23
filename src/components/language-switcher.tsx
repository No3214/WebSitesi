"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import type { MouseEvent } from "react";

// /en altında birebir karşılığı bulunan rota kökleri ("" = ana sayfa).
// Alt detaylar (örn. /odalar/[slug]) kök eşleşmesi üzerinden /en'e taşınır.
const EN_ROUTES = [
  "",
  "/odalar",
  "/menu",
  "/gastronomi",
  "/organizasyonlar",
  "/rezervasyon",
  "/iletisim",
  "/lokasyon",
  "/sss",
  "/galeri",
  "/hikayemiz",
  "/misafir-rehberi",
  "/deneyimler",
  "/teklifler",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  "/mesafeli-satis-sozlesmesi",
];

function isEnPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function getEnglishHref(pathname: string): string {
  if (isEnPath(pathname)) return pathname;
  if (pathname === "/") return "/en";

  const root = `/${pathname.split("/")[1] ?? ""}`;
  return EN_ROUTES.includes(root) ? `/en${pathname}` : "/en";
}

function getTurkishHref(pathname: string): string {
  if (isEnPath(pathname)) return pathname.slice(3) || "/";
  return pathname || "/";
}

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const isEnglish = isEnPath(pathname);
  const trHref = getTurkishHref(pathname);
  const enHref = getEnglishHref(pathname);

  const persistLanguage = (locale: "tr" | "en", event: MouseEvent<HTMLAnchorElement>) => {
    // Çerez yazımı korunur — içerik dili client bileşenlerde bu çerezden çözülür.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

    // /en dışında TR seçimi: mevcut tam sayfa yenileme davranışı korunur,
    // çerez tabanlı içerik dili böylece tazelenir.
    if (locale === "tr" && !isEnPath(pathname)) {
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
