"use client";

import { FadeIn } from "@/components/animations";
import { WaveDivider } from "@/components/wave-divider";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { getWhatsAppHref } from "@/lib/contact";
import { publicEnv } from "@/lib/public-env";

export function FinalCta({ locale }: { locale: "tr" | "en" }) {
  const reservationHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);
  const whatsappHref = getWhatsAppHref(
    locale === "tr"
      ? "Merhaba, Kozbeyli Konağı'nda konaklama planlıyorum. Yardımcı olur musunuz?"
      : "Hello, I am planning a stay at Kozbeyli Konağı. Could you assist me?"
  );

  return (
    <section className="cta-banner section-alt grain">
      <WaveDivider fill="var(--ivory)" height={54} />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <FadeIn>
          <span className="eyebrow">{locale === "tr" ? "KOZBEYLİ SİZİ BEKLİYOR" : "KOZBEYLİ AWAITS"}</span>
          <h2>
            {locale === "tr" ? "Geceyi Taşın Hafızasında Geçirin" : "Spend the Night in the Memory of Stone"}
          </h2>
          <p>
            {locale === "tr"
              ? "Tarih, gastronomi ve Ege sükuneti tek bir avluda. Yerinizi bugün ayırtın, hikayenin parçası olun."
              : "History, gastronomy and Aegean serenity in a single courtyard. Reserve today and become part of the story."}
          </p>
          <div className="hero-actions" style={{ marginTop: 0 }}>
            <a
              href={reservationHref}
              className="button gold"
              target="_blank"
              rel="noopener noreferrer"
              data-event="booking_engine_open"
            >
              {locale === "tr" ? "Rezervasyon Yap" : "Book Your Stay"}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
              data-event="whatsapp_click"
            >
              {locale === "tr" ? "WhatsApp Destek" : "WhatsApp Support"}
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
