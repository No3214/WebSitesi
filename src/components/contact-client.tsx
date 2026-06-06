"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";
import { getDictionary } from "@/lib/dictionary";

const PHONE_DISPLAY = "+90 532 234 26 86";
const PHONE_E164 = "+905322342686";
const EMAIL = "info@kozbeylikonagi.com";

// Keys not present in the dictionary Contact section — component-level fallback.
const FALLBACK = {
  tr: {
    whatsapp: "WhatsApp Concierge",
    whatsappMessage: "Merhaba, web sitesinden ulaşıyorum.",
    addressLine: "Kozbeyli Köyü, Foça / İzmir",
    addressNote: "İzmir Adnan Menderes Havalimanı'na ~55 dk, Foça merkeze 15 dk.",
    mapTitle: "Kozbeyli Konağı Konum — OpenStreetMap",
    formText:
      "Düğün, organizasyon ve grup konaklama talepleri için formu doldurun; aynı gün dönüş yapalım.",
  },
  en: {
    whatsapp: "WhatsApp Concierge",
    whatsappMessage: "Hello, I am reaching out from the website.",
    addressLine: "Kozbeyli Village, Foça / İzmir",
    addressNote: "~55 min to İzmir Adnan Menderes Airport, 15 min to Foça center.",
    mapTitle: "Kozbeyli Konağı Location — OpenStreetMap",
    formText:
      "Fill out the form for wedding, event and group stay requests; we will get back to you the same day.",
  },
};

export function ContactClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(null);
  const [locale, setLocale] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    setLocale(currentLocale as 'tr' | 'en');
    getDictionary(currentLocale as 'tr' | 'en').then(setDict);
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Contact;
  const f = FALLBACK[locale];

  const whatsappHref = `https://wa.me/905322342686?text=${encodeURIComponent(f.whatsappMessage)}`;

  const { lat, lng } = KOZBEYLI_COORDS;
  const bbox = `${lng - 0.02},${lat - 0.012},${lng + 0.02},${lat + 0.012}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat},${lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="container" style={{ maxWidth: 1040 }}>
      <SectionTitle eyebrow={t.eyebrow} title={t.title} text={t.text} />

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
              rel="noreferrer"
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
            <a className="button secondary" href={directions} target="_blank" rel="noreferrer" data-event="directions_click">
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
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
