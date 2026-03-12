"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";

export function SiteFooter() {
  const [dict, setDict] = useState<any>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, []);

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
              <a href="https://instagram.com/kozbeylikonagi" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com/kozbeylikonagi" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">{t.explore}</h4>
            <ul>
              <li><Link href="/odalar">Odalarımız</Link></li>
              <li><Link href="/menu">Gastronomi</Link></li>
              <li><Link href="/organizasyonlar">Organizasyonlar</Link></li>
              <li><Link href="/#rezervasyon">Rezervasyon</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">{t.legal}</h4>
            <ul>
              <li><Link href="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4 className="footer-title">{t.contact}</h4>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Kozbeyli Köyü, Foça, İzmir</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+90 (232) 826 12 34</span>
            </div>
            <div className="contact-item">
              <Mail size={18} />
              <span>info@kozbeylikonagi.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {currentYear} Kozbeyli Konağı Luxury Hotel. Tüm hakları saklıdır.</p>
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
