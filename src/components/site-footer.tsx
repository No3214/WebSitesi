"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import { getPhoneHref, MAPS_URL, PHONE_DISPLAY } from "@/lib/contact";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { LogoMark } from "./logo-mark";

export function SiteFooter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, []);

  const t = dict?.Footer;

  return (
    <footer className="footer grain">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ color: "var(--gold)", marginBottom: 18 }}>
              <LogoMark size={52} />
            </div>
            <h3 className="brand-serif">Kozbeyli Konağı</h3>
            <p className="brand-tagline">
              {t?.description ||
                "Foça'nın kalbinde, 500 yıllık taş bir hikayenin zarafet ve konforla yeniden yorumlandığı rafine bir durak."}
            </p>
            <div className="social-links">
              <a
                href="https://instagram.com/kozbeylikonagi"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com/kozbeylikonagi"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4>{t?.explore || "Keşfedin"}</h4>
            <ul>
              <li><Link href="/hikayemiz">Hikayemiz</Link></li>
              <li><Link href="/odalar">Odalarımız</Link></li>
              <li><Link href="/gastronomi">Gastronomi</Link></li>
              <li><Link href="/organizasyonlar">Davet & Organizasyon</Link></li>
              <li><Link href="/galeri">Galeri</Link></li>
              <li><Link href="/misafir-rehberi">Misafir Rehberi</Link></li>
              <li><Link href="/sss">Sık Sorulanlar</Link></li>
              <li><Link href="/rezervasyon">Rezervasyon</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t?.legal || "Hukuki"}</h4>
            <ul>
              <li><Link href="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link></li>
              <li><Link href="/cerez-politikasi">Çerez Politikası</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t?.contact || "İletişim"}</h4>
            <div className="contact-item">
              <MapPin size={17} aria-hidden />
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                Kozbeyli Köyü, Foça / İzmir
              </a>
            </div>
            <div className="contact-item">
              <Phone size={17} aria-hidden />
              <a href={getPhoneHref()} data-event="phone_click">
                {PHONE_DISPLAY}
              </a>
            </div>
            <div className="contact-item">
              <Mail size={17} aria-hidden />
              <a href="mailto:info@kozbeylikonagi.com">info@kozbeylikonagi.com</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p style={{ margin: 0 }}>
            © {currentYear} Kozbeyli Konağı Taş Otel & Restaurant. Tüm hakları saklıdır.
          </p>
          <div className="developer-tag">Taş · Zeytin · Sabah Güneşi</div>
        </div>
      </div>
    </footer>
  );
}
