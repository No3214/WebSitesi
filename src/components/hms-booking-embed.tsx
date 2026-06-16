"use client";

import { useEffect } from "react";

import { PaymentWizard } from "./payment-wizard";
import { HMSFullScriptEmbed } from "./hms-full-script-embed";

import { getWhatsAppHref } from "@/lib/contact";
import { trackBeginCheckout } from "@/lib/gtm";
import { publicEnv } from "@/lib/public-env";

const WHATSAPP_MESSAGE = {
  tr: "Merhaba, web sitesinden geldim. Müsaitlik öğrenmek istiyorum.",
  en: "Hello, I came from the website and would like to check availability.",
} as const;

function withBookingUtm(url: string) {
  if (url.includes("?")) return url;
  return `${url}?utm_source=website&utm_medium=booking_engine`;
}

function withRoomParam(url: string, roomSlug?: string) {
  if (!roomSlug) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}room=${encodeURIComponent(roomSlug)}`;
}

type HMSBookingEmbedProps = {
  locale?: "tr" | "en";
  roomSlug?: string;
  roomLabel?: string;
};

export function HMSBookingEmbed({ locale = "tr", roomSlug, roomLabel }: HMSBookingEmbedProps) {
  const bookingUrl = publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL;
  const scriptUrl = publicEnv.NEXT_PUBLIC_HMS_SCRIPT_URL;

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

  // Oncelik: HMS script (iFrame TAM) > iframe URL > talep sihirbazi fallback
  if (scriptUrl) {
    return <HMSFullScriptEmbed locale={locale} />;
  }

  if (!bookingUrl) {
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
    <div className="embed-box">
      <iframe
        src={withRoomParam(withBookingUtm(bookingUrl), roomSlug)}
        title={locale === "tr" ? "Kozbeyli Konağı Rezervasyon" : "Kozbeyli Konağı Booking"}
        style={{ width: "100%", minHeight: 720, border: 0 }}
        data-event="booking_engine_open"
      />
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
        <a
          className="button secondary"
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          data-event="whatsapp_click"
        >
          {locale === "tr" ? "WhatsApp Destek" : "WhatsApp Support"}
        </a>
      </div>
    </div>
  );
}
