"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { isEnglishPath, localizedHref } from "@/lib/localized-routes";
import { publicEnv } from "@/lib/public-env";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo-mark";
import { getWhatsAppHref } from "@/lib/contact";

type NavLink = { href: string; label: string };

const DEFAULT_LINKS: NavLink[] = [
  { href: "/hikayemiz", label: "Hikayemiz" },
  { href: "/odalar", label: "Odalar" },
  { href: "/gastronomi", label: "Gastronomi" },
  { href: "/menu", label: "Menü" },
  { href: "/organizasyonlar", label: "Davetler" },
  { href: "/deneyimler", label: "Deneyimler" },
  { href: "/iletisim", label: "İletişim" },
];
const EN_LINKS: NavLink[] = [
  { href: "/hikayemiz", label: "Our Story" },
  { href: "/odalar", label: "Rooms" },
  { href: "/gastronomi", label: "Dining" },
  { href: "/menu", label: "Menu" },
  { href: "/organizasyonlar", label: "Events" },
  { href: "/deneyimler", label: "Experiences" },
  { href: "/iletisim", label: "Contact" },
];

type SiteHeaderProps = {
  /** "overlay": koyu hero üzerinde şeffaf başlar, scroll ile dolar. "solid": her zaman dolu. */
  variant?: "overlay" | "solid";
};

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const pathname = usePathname();
  const englishPath = isEnglishPath(pathname || "/");
  const [links, setLinks] = useState<NavLink[]>(englishPath ? EN_LINKS : DEFAULT_LINKS);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bookingLabel = englishPath ? "Booking" : "Rezervasyon";
  const bookingHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);
  const whatsappHref = getWhatsAppHref(
    englishPath
      ? "Hello! I am visiting your website and have a question."
      : "Merhaba! Web siteniz üzerinden ulaşıyorum, bilgi alabilir miyim?"
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const locale = englishPath ? "en" : "tr";
    if (locale === "tr") {
      setLinks(DEFAULT_LINKS);
      return;
    }
    setLinks(EN_LINKS);
    getDictionary(locale).then((dict) => {
      const nav = (dict?.Navigation ?? {}) as Record<string, string>;
      setLinks([
        { href: "/hikayemiz", label: nav.history || "Our Story" },
        { href: "/odalar", label: nav.rooms || "Rooms" },
        { href: "/gastronomi", label: nav.dining || "Dining" },
        { href: "/menu", label: nav.menu || "Menu" },
        { href: "/organizasyonlar", label: nav.events || "Events" },
        { href: "/deneyimler", label: nav.experiences || "Experiences" },
        { href: "/iletisim", label: "Contact" },
      ]);
    });
  }, [englishPath]);

  useEffect(() => {
    let isScrolled = window.scrollY > 24;
    setScrolled(isScrolled);
    const onScroll = () => {
      const shouldBeScrolled = window.scrollY > 24;
      if (isScrolled !== shouldBeScrolled) {
        isScrolled = shouldBeScrolled;
        setScrolled(shouldBeScrolled);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rota değişince menüyü kapat
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Menü açıkken body scroll kilidi + Escape ile kapat (odağı toggle'a geri taşı).
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const headerClass = [
    "site-header",
    variant,
    scrolled || menuOpen ? "scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass} lang={englishPath ? "en" : "tr"}>
        <div className="container header-inner">
          <Link
            href={localizedHref("/", englishPath)}
            className="brand-logo"
            aria-label={englishPath ? "Kozbeyli Konağı — Home" : "Kozbeyli Konağı — Ana sayfa"}
          >
            <span className="logo-badge">
              <LogoMark size={34} />
            </span>
            <span className="brand-text">KOZBEYLİ KONAĞI</span>
          </Link>

          <nav className="nav" aria-label={englishPath ? "Main menu" : "Ana menü"}>
            {links.map((link) => {
              const href = localizedHref(link.href, englishPath);
              return (
              <Link
                key={link.href}
                href={href}
                className="nav-link"
                aria-current={pathname === href ? "page" : undefined}
              >
                {link.label}
              </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <a
              className="button secondary sm"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                englishPath
                  ? "WhatsApp - Ask us a question"
                  : "WhatsApp - Hemen sorun"
              }
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              <span>{englishPath ? "Ask Us" : "Hemen Sorun"}</span>
            </a>
            <a
              className="button gold sm"
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              data-event="booking_engine_open"
              aria-label={
                englishPath
                  ? "Booking - open official reservation screen"
                  : "Rezervasyon - resmi rezervasyon ekranını aç"
              }
            >
              {bookingLabel}
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className={`menu-toggle ${menuOpen ? "open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={
                englishPath
                  ? menuOpen
                    ? "Close menu"
                    : "Open menu"
                  : menuOpen
                    ? "Menüyü kapat"
                    : "Menüyü aç"
              }
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu" lang={englishPath ? "en" : "tr"}>
          <nav aria-label={englishPath ? "Mobile menu" : "Mobil menü"}>
            {links.map((link, i) => (
              <div key={link.href}>
                <Link href={localizedHref(link.href, englishPath)} onClick={() => setMenuOpen(false)}>
                  {link.label}
                  <span className="idx">0{i + 1}</span>
                </Link>
              </div>
            ))}
            <div className="mobile-menu-cta">
              <a
                href={bookingHref}
                className="button gold"
                target="_blank"
                rel="noopener noreferrer"
                data-event="booking_engine_open"
                style={{ width: "100%", borderBottom: "none", fontSize: "0.85rem" }}
                onClick={() => setMenuOpen(false)}
              >
                {bookingLabel}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
