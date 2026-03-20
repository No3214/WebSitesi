"use client";

import Link from "next/link";
import { useDictionary } from "@/hooks/use-dictionary";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";

const exploreLinks = {
  tr: [
    { href: "/odalar", label: "Odalar" },
    { href: "/gastronomi", label: "Restoran" },
    { href: "/deneyimler", label: "Deneyimler" },
    { href: "/etkinlikler", label: "Etkinlikler" },
    { href: "/galeri", label: "Galeri" },
    { href: "/hikayemiz", label: "Hikayemiz" },
    { href: "/dugun-organizasyon", label: "Düğün" },
    { href: "/kurumsal", label: "Kurumsal" },
    { href: "/blog", label: "Blog" },
  ],
  en: [
    { href: "/odalar", label: "Rooms" },
    { href: "/gastronomi", label: "Restaurant" },
    { href: "/deneyimler", label: "Experiences" },
    { href: "/etkinlikler", label: "Events" },
    { href: "/galeri", label: "Gallery" },
    { href: "/hikayemiz", label: "Our Story" },
    { href: "/dugun-organizasyon", label: "Weddings" },
    { href: "/kurumsal", label: "Corporate" },
    { href: "/blog", label: "Blog" },
  ],
} as const;

const legalLinks = {
  tr: [
    { href: "/sss", label: "Sık Sorulan Sorular" },
    { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
    { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
    { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
    { href: "/cerez-politikasi", label: "Çerez Politikası" },
    { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  ],
  en: [
    { href: "/sss", label: "FAQ" },
    { href: "/kvkk", label: "Privacy Notice (KVKK)" },
    { href: "/gizlilik-politikasi", label: "Privacy Policy" },
    { href: "/mesafeli-satis-sozlesmesi", label: "Distance Sales Agreement" },
    { href: "/cerez-politikasi", label: "Cookie Policy" },
    { href: "/kullanim-sartlari", label: "Terms of Use" },
  ],
} as const;

const copyright = {
  tr: "Tüm hakları saklıdır.",
  en: "All rights reserved.",
} as const;

export function SiteFooter() {
  const { dict, locale } = useDictionary();
  const currentYear = new Date().getFullYear();

  if (!dict) return null;
  const t = dict.Footer;

  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <h3 className="brand-serif">Kozbeyli Konağı</h3>
            <p className="brand-tagline">{t.description}</p>
            <div className="social-links">
              <a href="https://instagram.com/kozbeylikonagi" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com/kozbeylikonagi" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">{t.explore}</h4>
            <ul>
              {exploreLinks[locale].map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">{t.legal}</h4>
            <ul>
              {legalLinks[locale].map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4 className="footer-title">{t.contact}</h4>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Kozbeyli Küme Evleri No:188, Foça, İzmir</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+90 (232) 826 11 12</span>
            </div>
            <div className="contact-item">
              <Mail size={18} />
              <span>info@kozbeylikonagi.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {currentYear} Kozbeyli Konağı Luxury Hotel. {copyright[locale]}</p>
          <div className="developer-tag">Designed for Excellence</div>
        </div>
      </div>

      <style jsx>{`
        .footer-premium {
          background: #1a1a1a;
          color: #e5e5e5;
          padding: 100px 0 40px;
          margin-top: 100px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .brand-serif {
          font-family: var(--serif);
          font-size: 2rem;
          color: white;
          margin-bottom: 24px;
        }

        .brand-tagline {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #aaa;
          margin-bottom: 32px;
        }

        .social-links {
          display: flex;
          gap: 20px;
        }

        .social-links a {
          color: #888;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: var(--gold);
        }

        .footer-title {
          font-family: var(--serif);
          font-size: 1.25rem;
          color: white;
          margin-bottom: 32px;
        }

        .footer-links-col ul {
          list-style: none;
          padding: 0;
        }

        .footer-links-col li {
          margin-bottom: 16px;
        }

        .footer-links-col a {
          color: #aaa;
          text-decoration: none;
          transition: all 0.3s;
          font-size: 0.95rem;
        }

        .footer-links-col a:hover {
          color: white;
          padding-left: 5px;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
          color: #aaa;
          font-size: 0.95rem;
        }

        .contact-item span {
          line-height: 1.4;
        }

        .footer-bottom-bar {
          border-top: 1px solid #333;
          padding-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: #666;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-bar {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
