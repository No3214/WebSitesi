"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { getPhoneHref, MAPS_URL, PHONE_DISPLAY } from "@/lib/contact";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { LogoMark } from "./logo-mark";

function isEnPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function localizedHref(href: string, english: boolean): string {
  if (!english) return href;
  return href === "/" ? "/en" : `/en${href}`;
}

export function SiteFooter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const pathname = usePathname();
  const englishPath = isEnPath(pathname || "/");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const locale = englishPath || document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale).then(setDict);
  }, [englishPath]);

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
                (englishPath
                  ? "A refined stop at the heart of Foça, where a 500-year-old story is reinterpreted with luxury and comfort."
                  : "Foça'nın kalbinde, 500 yıllık taş bir hikayenin zarafet ve konforla yeniden yorumlandığı rafine bir durak.")}
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
            <h4>{t?.explore || (englishPath ? "Explore" : "Keşfedin")}</h4>
            <ul>
              <li><Link href={localizedHref("/hikayemiz", englishPath)}>{englishPath ? "Our Story" : "Hikayemiz"}</Link></li>
              <li><Link href={localizedHref("/odalar", englishPath)}>{englishPath ? "Rooms" : "Odalarımız"}</Link></li>
              <li><Link href={localizedHref("/gastronomi", englishPath)}>{englishPath ? "Dining" : "Gastronomi"}</Link></li>
              <li><Link href={localizedHref("/organizasyonlar", englishPath)}>{englishPath ? "Events" : "Davet & Organizasyon"}</Link></li>
              <li><Link href={localizedHref("/galeri", englishPath)}>{englishPath ? "Gallery" : "Galeri"}</Link></li>
              <li><Link href={localizedHref("/misafir-rehberi", englishPath)}>{englishPath ? "Guest Guide" : "Misafir Rehberi"}</Link></li>
              <li><Link href={localizedHref("/deneyimler", englishPath)}>{englishPath ? "Experiences" : "Deneyimler"}</Link></li>
              <li><Link href={localizedHref("/teklifler", englishPath)}>{englishPath ? "Offers" : "Teklifler"}</Link></li>
              <li><Link href={localizedHref("/sss", englishPath)}>{englishPath ? "FAQ" : "Sık Sorulanlar"}</Link></li>
              <li><Link href={localizedHref("/rezervasyon", englishPath)}>{englishPath ? "Booking" : "Rezervasyon"}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t?.legal || (englishPath ? "Legal" : "Hukuki")}</h4>
            <ul>
              <li><Link href="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link></li>
              <li><Link href="/cerez-politikasi">Çerez Politikası</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t?.contact || (englishPath ? "Contact" : "İletişim")}</h4>
            <div className="contact-item">
              <MapPin size={17} aria-hidden />
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                Kozbeyli Köyü Küme Evler No:188, Foça / İzmir
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
