"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo-mark";

type NavLink = { href: string; label: string };

const DEFAULT_LINKS: NavLink[] = [
  { href: "/hikayemiz", label: "Hikayemiz" },
  { href: "/odalar", label: "Odalar" },
  { href: "/gastronomi", label: "Gastronomi" },
  { href: "/organizasyonlar", label: "Davetler" },
  { href: "/deneyimler", label: "Deneyimler" },
  { href: "/iletisim", label: "İletişim" },
];
const EN_LINKS: NavLink[] = [
  { href: "/hikayemiz", label: "Our Story" },
  { href: "/odalar", label: "Rooms" },
  { href: "/gastronomi", label: "Dining" },
  { href: "/organizasyonlar", label: "Events" },
  { href: "/deneyimler", label: "Experiences" },
  { href: "/iletisim", label: "Contact" },
];

function isEnPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function localizedHref(href: string, english: boolean): string {
  if (!english) return href;
  return href === "/" ? "/en" : `/en${href}`;
}

type SiteHeaderProps = {
  /** "overlay": koyu hero üzerinde şeffaf başlar, scroll ile dolar. "solid": her zaman dolu. */
  variant?: "overlay" | "solid";
};

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const pathname = usePathname();
  const englishPath = isEnPath(pathname || "/");
  const [links, setLinks] = useState<NavLink[]>(englishPath ? EN_LINKS : DEFAULT_LINKS);
  const [bookingLabel, setBookingLabel] = useState(englishPath ? "Booking" : "Rezervasyon");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const locale = englishPath ? "en" : "tr";
    if (locale === "tr") {
      setLinks(DEFAULT_LINKS);
      setBookingLabel("Rezervasyon");
      return;
    }
    setLinks(EN_LINKS);
    setBookingLabel("Booking");
    getDictionary(locale).then((dict) => {
      const nav = (dict?.Navigation ?? {}) as Record<string, string>;
      setLinks([
        { href: "/hikayemiz", label: nav.history || "Our Story" },
        { href: "/odalar", label: nav.rooms || "Rooms" },
        { href: "/gastronomi", label: nav.dining || "Dining" },
        { href: "/organizasyonlar", label: nav.events || "Events" },
        { href: "/deneyimler", label: nav.experiences || "Experiences" },
        { href: "/iletisim", label: "Contact" },
      ]);
      setBookingLabel(nav.booking || "Book Now");
    });
  }, [englishPath]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rota değişince menüyü kapat
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Menü açıkken body scroll kilidi
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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
            <Link className="button gold sm" href={localizedHref("/rezervasyon", englishPath)}>
              {bookingLabel}
            </Link>
            <button
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
              <Link
                href={localizedHref("/rezervasyon", englishPath)}
                className="button gold"
                style={{ width: "100%", borderBottom: "none", fontSize: "0.85rem" }}
                onClick={() => setMenuOpen(false)}
              >
                {bookingLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
