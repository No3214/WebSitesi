"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { LeadForm } from "@/components/lead-form";
import { ADDRESS_EN, ADDRESS_TR, getWhatsAppHref, MAPS_URL, PHONE_DISPLAY, PHONE_E164 } from "@/lib/contact";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";
import { getDictionary } from "@/lib/dictionary";

const EMAIL = "info@kozbeylikonagi.com";

// Keys not present in the dictionary Contact section — component-level fallback.
const FALLBACK = {
  tr: {
    whatsapp: "WhatsApp Destek",
    whatsappMessage: "Merhaba, web sitesinden ulaşıyorum.",
    addressLine: ADDRESS_TR,
    addressNote: "Güncel rota ve trafik bilgisi için canlı yol tarifini kullanabilirsiniz.",
    mapTitle: "Kozbeyli Konağı Konum — OpenStreetMap",
    formText:
      "Düğün, organizasyon ve grup konaklama talepleri için formu doldurun; aynı gün dönüş yapalım.",
  },
  en: {
    whatsapp: "WhatsApp Support",
    whatsappMessage: "Hello, I am reaching out from the website.",
    addressLine: ADDRESS_EN,
    addressNote: "Use live directions for current route and traffic information.",
    mapTitle: "Kozbeyli Konağı Location — OpenStreetMap",
    formText:
      "Fill out the form for wedding, event and group stay requests; we will get back to you the same day.",
  },
};

type ContactClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDict?: any;
  initialLocale?: 'tr' | 'en';
};

export function ContactClient({ initialDict, initialLocale = 'tr' }: ContactClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(initialDict ?? null);
  const [locale, setLocale] = useState<'tr' | 'en'>(initialLocale);
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = pathname === "/en" || pathname?.startsWith("/en/")
      ? "en"
      : "tr";
    if (currentLocale === initialLocale && initialDict) return; // SSR sözlüğü zaten doğru
    setLocale(currentLocale as 'tr' | 'en');
    getDictionary(currentLocale as 'tr' | 'en').then(setDict);
  }, [initialDict, initialLocale, pathname]);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Contact;
  const f = FALLBACK[locale];

  const whatsappHref = getWhatsAppHref(f.whatsappMessage);

  const { lat, lng } = KOZBEYLI_COORDS;
  const bbox = `${lng - 0.02},${lat - 0.012},${lng + 0.02},${lat + 0.012}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="container" style={{ maxWidth: 1040 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div className="detail-box" style={{ padding: 24, display: "grid", gap: 16 }}>
            <a
              href={`tel:${PHONE_E164}`}
              data-event="phone_click"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <Phone size={20} aria-hidden />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-event="whatsapp_click"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <MessageCircle size={20} aria-hidden />
              <span>{f.whatsapp}</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              data-event="email_click"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <Mail size={20} aria-hidden />
              <span>{EMAIL}</span>
            </a>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <MapPin size={20} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {f.addressLine}
                <br />
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {f.addressNote}
                </span>
              </span>
            </div>
            <a className="button secondary" href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-event="directions_click">
              {t.directions}
            </a>
          </div>

          <div className="detail-box" style={{ overflow: "hidden", padding: 0 }}>
            <iframe
              src={osmEmbed}
              title={f.mapTitle}
              style={{ width: "100%", height: 300, border: 0, display: "block" }}
              loading="lazy"
            />
          </div>
        </div>

        <div className="detail-box" style={{ padding: 24 }}>
          <h3 className="serif" style={{ marginBottom: 6 }}>
            {t.message}
          </h3>
          <p className="muted" style={{ fontSize: "0.92rem", marginBottom: 18 }}>
            {f.formText}
          </p>
          <LeadForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
