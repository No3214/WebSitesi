"use client";

const WHATSAPP_MESSAGE = "Merhaba, web sitesinden geldim. Müsaitlik öğrenmek istiyorum.";

function withBookingUtm(url: string) {
  if (url.includes("?")) return url;
  return `${url}?utm_source=website&utm_medium=booking_engine`;
}

export function HMSBookingEmbed() {
  const bookingUrl = process.env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL || "";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/905322342686";
  const whatsappHref = `${whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  if (!bookingUrl) {
    return (
      <div className="embed-box">
        <p className="muted" style={{ marginTop: "16px" }}>
          Canlı rezervasyon motoru hazırlanıyor. Müsaitlik ve en iyi fiyat için
          WhatsApp üzerinden anında yanıt alabilirsiniz.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
          <a
            className="button primary"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            data-event="whatsapp_click"
          >
            WhatsApp&apos;tan Müsaitlik Al
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-box">
      <iframe
        src={withBookingUtm(bookingUrl)}
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
