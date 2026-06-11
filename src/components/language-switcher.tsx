"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties } from "react";

// /en altında birebir karşılığı bulunan rota kökleri ("" = ana sayfa).
// Alt detaylar (örn. /odalar/[slug]) kök eşleşmesi üzerinden /en'e taşınır.
const EN_ROUTES = [
  "",
  "/odalar",
  "/gastronomi",
  "/rezervasyon",
  "/iletisim",
  "/sss",
  "/galeri",
  "/hikayemiz",
  "/deneyimler",
];

function isEnPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const isEnglish = isEnPath(pathname);

  const selectLanguage = (locale: "tr" | "en") => {
    // Çerez yazımı korunur — içerik dili client bileşenlerde bu çerezden çözülür.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

    if (locale === "en") {
      let target = "/en";
      if (isEnPath(pathname)) {
        target = pathname;
      } else if (pathname !== "/") {
        const root = `/${pathname.split("/")[1] ?? ""}`;
        target = EN_ROUTES.includes(root) ? `/en${pathname}` : "/en";
      }
      router.push(target);
      return;
    }

    if (isEnPath(pathname)) {
      router.push(pathname.slice(3) || "/");
      return;
    }

    // /en dışında TR seçimi: mevcut tam sayfa yenileme davranışı korunur,
    // çerez tabanlı içerik dili böylece tazelenir.
    window.location.reload();
  };

  const buttonStyle = (active: boolean): CSSProperties => ({
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "inherit",
    fontSize: "0.8rem",
    fontWeight: active ? 700 : 500,
    opacity: active ? 1 : 0.65,
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
      <button
        type="button"
        onClick={() => selectLanguage("tr")}
        aria-pressed={!isEnglish}
        style={buttonStyle(!isEnglish)}
      >
        TR
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => selectLanguage("en")}
        aria-pressed={isEnglish}
        style={buttonStyle(isEnglish)}
      >
        EN
      </button>
    </div>
  );
}
