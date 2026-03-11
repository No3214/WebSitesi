import Link from "next/link";

const links = [
  { href: "/odalar", label: "Odalar" },
  { href: "/menu", label: "Gurme Menü" },
  { href: "/organizasyonlar", label: "Etkinlikler" }
];

export function SiteHeader() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          KOZBEYLİ KONAĞI
        </Link>

        <nav className="nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <a className="button secondary" href="tel:+90232" style={{ border: 'none', padding: '10px' }}>
                İLETİŞİM
            </a>
            <Link className="button primary" href="/#rezervasyon">
                REZERVASYON
            </Link>
        </div>
      </div>
    </header>
  );
}
