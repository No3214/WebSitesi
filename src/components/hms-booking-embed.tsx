"use client";

import { useEffect } from "react";

import { PaymentWizard } from "./payment-wizard";
import { HMSFullScriptEmbed } from "./hms-full-script-embed";

import { getBookingEngineHref } from "@/lib/booking-engine-url";
import { getWhatsAppHref } from "@/lib/contact";
import { trackBeginCheckout } from "@/lib/gtm";
import { publicEnv } from "@/lib/public-env";

const WHATSAPP_MESSAGE = {
  tr: "Merhaba, web sitesinden geldim. Müsaitlik öğrenmek istiyorum.",
  en: "Hello, I came from the website and would like to check availability.",
} as const;

type HMSBookingEmbedProps = {
  locale?: "tr" | "en";
  roomSlug?: string;
  roomLabel?: string;
};

export function HMSBookingEmbed({ locale = "tr", roomSlug, roomLabel }: HMSBookingEmbedProps) {
  const bookingUrl = publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL;
  const scriptUrl = publicEnv.NEXT_PUBLIC_HMS_SCRIPT_URL;
  const bookingHref = getBookingEngineHref(bookingUrl, { roomSlug });

  // GA4 begin_checkout: rezervasyon arayüzü (engine veya talep sihirbazı)
  // misafirin önüne geldiği anda huni başlangıcı sayılır.
  useEffect(() => {
    trackBeginCheckout(roomSlug);
  }, [roomSlug]);
  const whatsappMessage = roomLabel
    ? locale === "tr"
      ? `Merhaba, ${roomLabel} için müsaitlik öğrenmek istiyorum.`
      : `Hello, I would like to check availability for ${roomLabel}.`
    : WHATSAPP_MESSAGE[locale];
  const whatsappHref = getWhatsAppHref(whatsappMessage);

  // Oncelik: resmi booking engine yeni sekme > HMS script fallback > talep sihirbazi.
  // Iframe kullanmiyoruz; mobilde ve dar ekranlarda tarih/oda secimi sikisiyor.
  if (!bookingHref && scriptUrl) {
    return <HMSFullScriptEmbed locale={locale} />;
  }

  if (!bookingHref) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <PaymentWizard locale={locale} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            className="button secondary"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp_click"
          >
            {locale === "tr"
              ? "Hızlı Destek & Teyit için WhatsApp Destek"
              : "WhatsApp Support for Fast Confirmation"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-box booking-engine-handoff">
      <div>
        <p className="eyebrow">
          {locale === "tr" ? "RESMİ REZERVASYON" : "OFFICIAL BOOKING"}
        </p>
        <h3 className="serif" style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", marginBottom: 12 }}>
          {locale === "tr" ? "Rezervasyon Ekranı Ayrı Sekmede" : "Booking Opens in a New Tab"}
        </h3>
        <p className="muted" style={{ maxWidth: 620, lineHeight: 1.7 }}>
          {locale === "tr"
            ? "Canlı müsaitlik, tarih ve oda seçimi resmi rezervasyon ekranında tamamlanır. Bu sayfa oda detayları ve hızlı destek için açık kalır."
            : "Live availability, dates and room selection are completed on the official booking screen while this page remains available for room details and support."}
        </p>
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
        <a
          className="button gold"
          href={bookingHref}
          target="_blank"
          rel="noopener noreferrer"
          data-event="booking_engine_open"
        >
          {locale === "tr" ? "Rezervasyonu Ayrı Sekmede Aç" : "Open Booking in New Tab"}
        </a>
        <a
          className="button secondary"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-event="whatsapp_click"
        >
          {locale === "tr" ? "WhatsApp Destek" : "WhatsApp Support"}
        </a>
      </div>
    </div>
  );
}
