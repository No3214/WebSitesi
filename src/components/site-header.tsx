"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, []);

  if (!dict) return <header className="header premium-header" />;
  const t = dict.Navigation;

  const links = [
    { href: "/odalar", label: t.rooms },
    { href: "/menu", label: t.dining },
    { href: "/organizasyonlar", label: t.events },
    { href: "/#faq", label: "SSS" }
  ];

  return (
    <header className="header premium-header">
      <div className="container header-inner">
        <Link href="/" className="brand-logo serif">
          KOZBEYLİ KONAĞI
        </Link>

        <nav className="nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
            <LanguageSwitcher />
            <Link className="button primary" href="/#rezervasyon">
                {t.booking}
            </Link>
        </div>
      </div>

      <style jsx>{`
        .premium-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          height: 90px;
          display: flex;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-logo {
          font-size: 1.5rem;
          color: var(--olive);
          text-decoration: none;
          letter-spacing: 0.1em;
        }

        .nav {
          display: flex;
          gap: 32px;
        }

        .nav-link {
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text);
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: var(--gold);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .nav { display: none; }
        }
      `}</style>
    </header>
  );
}
