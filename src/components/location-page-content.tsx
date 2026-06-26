import { sanitizeJsonLd } from "@/lib/security";
import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import {
  ADDRESS_EN,
  ADDRESS_TR,
  getPhoneHref,
  getWhatsAppHref,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_E164,
} from "@/lib/contact";
import { KOZBEYLI_COORDS, googleMapsEmbedUrl } from "@/lib/free-apis";
import { absoluteUrl } from "@/lib/utils";

type LocationLocale = "tr" | "en";

const EMAIL = "info@kozbeylikonagi.com";

const copy = {
  tr: {
    path: "/lokasyon",
    eyebrow: "LOKASYON",
    title: "Kozbeyli'nin Merkezinde",
    text: "Konağımızın doğrulanmış adresi, canlı yol tarifi ve transfer planlama bağlantıları.",
    addressLabel: "Adres",
    address: ADDRESS_TR,
    routeLabel: "Canlı yol tarifi",
    routeText: "Rota süresi trafik, mevsim ve çıkış noktasına göre değişir. En güncel bilgi için Google Maps yol tarifini açın.",
    directions: "Google Maps'te Aç",
    whatsapp: "Transfer Planlama",
    whatsappMessage: "Merhaba, Kozbeyli Konağı için ulaşım ve transfer bilgisi almak istiyorum.",
    phone: "Telefon",
    mapTitle: "Kozbeyli Konağı konumu - Google Haritalar",
    breadcrumbs: ["Ana Sayfa", "Lokasyon"],
  },
  en: {
    path: "/en/location",
    eyebrow: "LOCATION",
    title: "At the Heart of Kozbeyli",
    text: "Verified address, live directions and transfer planning links for Kozbeyli Konağı.",
    addressLabel: "Address",
    address: ADDRESS_EN,
    routeLabel: "Live directions",
    routeText: "Route duration changes with traffic, season and departure point. Open Google Maps for current directions.",
    directions: "Open in Google Maps",
    whatsapp: "Transfer Planning",
    whatsappMessage: "Hello, I would like route and transfer information for Kozbeyli Konağı.",
    phone: "Phone",
    mapTitle: "Kozbeyli Konağı location - Google Maps",
    breadcrumbs: ["Home", "Location"],
  },
} as const;

export function LocationPageContent({ locale }: { locale: LocationLocale }) {
  const t = copy[locale];
  const { lat, lng } = KOZBEYLI_COORDS;
  const mapEmbed = googleMapsEmbedUrl(locale === "en" ? "en" : "tr");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: "Kozbeyli Konağı Taş Otel & Restaurant",
      telephone: PHONE_E164,
      email: EMAIL,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kozbeyli Köyü Küme Evler No:188",
        addressLocality: "Foça",
        addressRegion: "İzmir",
        addressCountry: "TR",
      },
      geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
      hasMap: MAPS_URL,
      url: absoluteUrl(t.path),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t.breadcrumbs[0],
          item: absoluteUrl(locale === "en" ? "/en" : "/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t.breadcrumbs[1],
          item: absoluteUrl(t.path),
        },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
      <SiteHeader variant="solid" />
      <PageHero eyebrow={t.eyebrow} title={t.title} text={t.text} />
      <main className="section location-page" id="icerik-lokasyon" style={{ paddingTop: 56 }}>
        <div className="container" style={{ maxWidth: 1120 }}>
          <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            <div className="detail-box p-8 grid gap-6">
              <div className="flex gap-4 items-start">
                <MapPin className="text-gold shrink-0 mt-1" size={22} aria-hidden />
                <div>
                  <p className="eyebrow" style={{ marginBottom: 8 }}>
                    {t.addressLabel}
                  </p>
                  <h2 className="serif text-3xl mb-3" style={{ color: "var(--olive)" }}>
                    {t.address}
                  </h2>
                  <p className="muted leading-relaxed">{t.routeText}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <a className="button gold" href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-event="directions_click">
                  <Navigation size={17} aria-hidden />
                  {t.directions}
                </a>
                <a
                  className="button secondary"
                  href={getWhatsAppHref(t.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="whatsapp_click"
                >
                  <MessageCircle size={17} aria-hidden />
                  {t.whatsapp}
                </a>
                <a className="button secondary" href={getPhoneHref()} data-event="phone_click">
                  <Phone size={17} aria-hidden />
                  {t.phone}: {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <div className="detail-box overflow-hidden p-0">
              <iframe
                src={mapEmbed}
                title={t.mapTitle}
                style={{ width: "100%", height: 520, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
