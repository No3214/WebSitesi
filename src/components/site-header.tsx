"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDictionary } from "@/hooks/use-dictionary";
import { LanguageSwitcher } from "./language-switcher";
import { Menu, X } from "lucide-react";
import { CONTACT } from "@/lib/constants";

const navLinks = {
  tr: [
    { href: "/odalar", key: "rooms" },
    { href: "/gastronomi", key: "dining" },
    { href: "/deneyimler", label: "Deneyimler" },
    { href: "/etkinlikler", label: "Etkinlikler" },
    { href: "/galeri", label: "Galeri" },
    { href: "/iletisim", label: "İletişim" },
  ],
  en: [
    { href: "/odalar", key: "rooms" },
    { href: "/gastronomi", key: "dining" },
    { href: "/deneyimler", label: "Experiences" },
    { href: "/etkinlikler", label: "Events" },
    { href: "/galeri", label: "Gallery" },
    { href: "/iletisim", label: "Contact" },
  ],
} as const;

const whatsappLabel = { tr: "WhatsApp ile Ulaşın", en: "Contact via WhatsApp" } as const;

export function SiteHeader() {
  const { dict, locale } = useDictionary();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Escape key closes menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && mobileOpen) {
      setMobileOpen(false);
      toggleRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus first link in menu
      const firstLink = menuRef.current?.querySelector("a, button") as HTMLElement | null;
      firstLink?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, handleKeyDown]);

  if (!dict) return <header className="header premium-header" />;
  const nav = dict.Navigation;

  const links = navLinks[locale].map((link) => ({
    href: link.href,
    label: "key" in link ? (nav[link.key as keyof typeof nav] || link.key) : link.label,
  }));

  return (
    <>
      <header className={`header premium-header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="container header-inner">
          <Link href="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
            <span className="brand-monogram">KK</span>
            <span className="brand-name">KOZBEYLİ KONAĞI</span>
          </Link>

          <nav className="nav-desktop">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <Link className="button primary header-cta" href="/#rezervasyon">
              {nav.booking || "Rezervasyon"}
            </Link>
            <button
              ref={toggleRef}
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
          <nav ref={menuRef} className="mobile-menu" onClick={(e) => e.stopPropagation()} aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" />
            <Link
              href="/#rezervasyon"
              className="button primary mobile-book-btn"
              onClick={() => setMobileOpen(false)}
            >
              {nav.booking || "Rezervasyon"}
            </Link>
            <a href={`tel:${CONTACT.phone}`} className="mobile-menu-link mobile-phone">
              {CONTACT.phoneDisplay}
            </a>
            <a href={CONTACT.whatsappUrl} className="mobile-menu-link mobile-whatsapp" target="_blank" rel="noopener noreferrer">
              {whatsappLabel[locale]}
            </a>
          </nav>
        </div>
      )}

      <style jsx>{`
        .premium-header {
          background: rgba(250, 249, 246, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          height: 80px;
          display: flex;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .header-scrolled {
          height: 68px;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--olive);
        }

        .brand-monogram {
          width: 36px;
          height: 36px;
          border: 1.5px solid var(--olive);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .brand-name {
          font-family: var(--serif);
          font-size: 1.1rem;
          letter-spacing: 0.15em;
          font-weight: 500;
        }

        .nav-desktop {
          display: flex;
          gap: 28px;
        }

        .nav-link {
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text);
          text-decoration: none;
          transition: color 0.3s;
          position: relative;
        }

        .nav-link:hover {
          color: var(--gold);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold);
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-cta {
          font-size: 0.78rem;
          padding: 10px 22px;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--olive);
          cursor: pointer;
          padding: 4px;
        }

        @media (max-width: 1024px) {
          .nav-desktop { display: none; }
          .header-cta { display: none; }
          .mobile-toggle { display: flex; }
        }

        @media (max-width: 480px) {
          .brand-name { display: none; }
        }

        /* Mobile Menu */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          top: 80px;
          background: rgba(0, 0, 0, 0.4);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        .mobile-menu {
          background: var(--ivory);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 0;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .mobile-menu-link {
          display: block;
          padding: 16px 0;
          font-size: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--olive);
          text-decoration: none;
          border-bottom: 1px solid var(--border);
          transition: color 0.2s;
        }

        .mobile-menu-link:hover {
          color: var(--gold);
        }

        .mobile-phone {
          color: var(--text);
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: none;
        }

        .mobile-whatsapp {
          color: #25d366;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0;
          border-bottom: none;
        }

        .mobile-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }

        .mobile-book-btn {
          text-align: center;
          margin: 16px 0;
          width: 100%;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
