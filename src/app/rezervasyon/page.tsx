import { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionTitle } from "@/components/section-title";
import { HMSBookingEmbed } from "@/components/hms-booking-embed";
import { WeatherRibbon } from "@/components/weather-ribbon";

export const metadata: Metadata = {
  title: "Rezervasyon | En İyi Fiyat Garantisi",
  description:
    "Kozbeyli Konağı'nda taş oda rezervasyonunuzu direkt yapın: en iyi fiyat garantisi, esnek iptal ve WhatsApp concierge desteği. Canlı müsaitlik için rezervasyon motorumuzu kullanın.",
  keywords: [
    "kozbeyli konağı rezervasyon",
    "foça butik otel rezervasyon",
    "kozbeyli köyü konaklama",
    "taş otel izmir rezervasyon",
  ],
  alternates: { canonical: "/rezervasyon" },
};

const TRUST_ITEMS = [
  {
    icon: BadgeCheck,
    title: "En İyi Fiyat Garantisi",
    text: "Direkt rezervasyonda aracı komisyonu yok; aynı tarihler için en iyi koşullar her zaman burada.",
  },
  {
    icon: CalendarClock,
    title: "Esnek İptal",
    text: "Planlarınız değişirse concierge ekibimiz tarih değişikliği ve iptalde yanınızda.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Concierge",
    text: "Oda seçimi, transfer ve özel istekleriniz için rezervasyon öncesi ve sonrası anında destek.",
  },
];

export default function ReservationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kozbeyli Konağı Rezervasyon",
    description: "Kozbeyli Konağı taş butik otel için canlı müsaitlik ve direkt rezervasyon sayfası.",
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.kozbeylikonagi.com/rezervasyon",
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      object: {
        "@type": "LodgingBusiness",
        name: "Kozbeyli Konağı",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Foça",
          addressRegion: "İzmir",
          streetAddress: "Kozbeyli Köyü",
          addressCountry: "TR",
        },
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <SectionTitle
            eyebrow="Rezervasyon"
            title="Konağınızı Şimdi Ayırtın"
            text="Canlı müsaitlik takvimi üzerinden tarihlerinizi seçin; en iyi fiyat garantisi ve esnek iptal ile direkt rezervasyonun ayrıcalığını yaşayın."
          />

          <WeatherRibbon />

          <HMSBookingEmbed />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
              marginTop: 34,
            }}
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="detail-box" style={{ padding: 22 }}>
                <item.icon size={22} aria-hidden style={{ marginBottom: 10 }} />
                <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
            <Link href="/odalar" className="button secondary">
              Odaları İncele
            </Link>
            <Link href="/misafir-rehberi" className="button secondary">
              Misafir Rehberi
            </Link>
            <Link href="/iletisim" className="button secondary">
              İletişim
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
