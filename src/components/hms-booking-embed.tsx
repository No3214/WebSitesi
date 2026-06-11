"use client";

import { useEffect } from "react";

const WHATSAPP_MESSAGE = "Merhaba, web sitesinden geldim. Müsaitlik öğrenmek istiyorum.";

import { PaymentWizard } from "./payment-wizard";

import { getWhatsAppHref } from "@/lib/contact";
import { trackBeginCheckout } from "@/lib/gtm";

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
  roomSlug?: string;
  roomLabel?: string;
};

export function HMSBookingEmbed({ roomSlug, roomLabel }: HMSBookingEmbedProps) {
  const bookingUrl = process.env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL || "";

  // GA4 begin_checkout: rezervasyon arayüzü (engine veya talep sihirbazı)
  // misafirin önüne geldiği anda huni başlangıcı sayılır.
  useEffect(() => {
    trackBeginCheckout(roomSlug);
  }, [roomSlug]);
  const whatsappMessage = roomLabel
    ? `Merhaba, ${roomLabel} için müsaitlik öğrenmek istiyorum.`
    : WHATSAPP_MESSAGE;
  const whatsappHref = getWhatsAppHref(whatsappMessage);

  if (!bookingUrl) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <PaymentWizard />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            className="button secondary"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp_click"
          >
            Hızlı Destek & Teyit için WhatsApp Concierge
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-box">
      <iframe
        src={withRoomParam(withBookingUtm(bookingUrl), roomSlug)}
        title="Kozbeyli Konağı Rezervasyon"
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
          WhatsApp Concierge
        </a>
      </div>
    </div>
  );
}
