import { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionTitle } from "@/components/section-title";
import { LeadForm } from "@/components/lead-form";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";

export const metadata: Metadata = {
  title: "İletişim & Ulaşım",
  description:
    "Kozbeyli Konağı'na ulaşın: Kozbeyli Köyü, Foça / İzmir. Telefon, WhatsApp concierge, e-posta ve yol tarifi. İzmir Adnan Menderes Havalimanı'na 55 dakika.",
  keywords: ["kozbeyli konağı iletişim", "kozbeyli köyü ulaşım", "foça otel telefon", "kozbeyli yol tarifi"],
  alternates: { canonical: "/iletisim" },
};

const PHONE_DISPLAY = "+90 532 234 26 86";
const PHONE_E164 = "+905322342686";
const EMAIL = "info@kozbeylikonagi.com";
const WHATSAPP_HREF = `https://wa.me/905322342686?text=${encodeURIComponent(
  "Merhaba, web sitesinden ulaşıyorum.",
)}`;

export default function ContactPage() {
  const { lat, lng } = KOZBEYLI_COORDS;
  const bbox = `${lng - 0.02},${lat - 0.012},${lng + 0.02},${lat + 0.012}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat},${lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Kozbeyli Konağı",
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: "https://www.kozbeylikonagi.com/iletisim",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: 1040 }}>
          <SectionTitle
            eyebrow="İletişim"
            title="Size Nasıl Yardımcı Olabiliriz?"
            text="Rezervasyon, organizasyon ve restoran sorularınız için concierge ekibimiz her gün 09.00 – 22.00 arasında yanınızda."
          />

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
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer"
                  data-event="whatsapp_click"
                  style={{ display: "flex", gap: 12, alignItems: "center" }}
                >
                  <MessageCircle size={20} aria-hidden />
                  <span>WhatsApp Concierge</span>
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
                    Kozbeyli Köyü, Foça / İzmir
                    <br />
                    <span className="muted" style={{ fontSize: "0.9rem" }}>
                      İzmir Adnan Menderes Havalimanı&apos;na ~55 dk, Foça merkeze 15 dk.
                    </span>
                  </span>
                </div>
                <a className="button secondary" href={directions} target="_blank" rel="noreferrer" data-event="directions_click">
                  Yol Tarifi Al
                </a>
              </div>

              <div className="detail-box" style={{ overflow: "hidden", padding: 0 }}>
                <iframe
                  src={osmEmbed}
                  title="Kozbeyli Konağı Konum — OpenStreetMap"
                  style={{ width: "100%", height: 300, border: 0, display: "block" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="detail-box" style={{ padding: 24 }}>
              <h3 className="serif" style={{ marginBottom: 6 }}>
                Mesaj Bırakın
              </h3>
              <p className="muted" style={{ fontSize: "0.92rem", marginBottom: 18 }}>
                Düğün, organizasyon ve grup konaklama talepleri için formu doldurun; aynı gün dönüş yapalım.
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
