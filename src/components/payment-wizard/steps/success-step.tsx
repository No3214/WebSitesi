"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 5: Basari ekrani ve WhatsApp bildirimi
export function SuccessStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const {
    guestName, bookingId, selectedRoom, checkIn, checkOut, nights,
    scent, pillow, sound, light, finalPrice,
    getWhatsAppMessage, resetWizard,
    copy,
  } = wizard;
  const t = copy.success;
  const payment = copy.payment;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", display: "grid", gap: 24, padding: "20px 0" }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CheckCircle2 size={64} style={{ color: "var(--olive)" }} />
      </div>

      <h3 className="serif" style={{ fontSize: "2rem", color: "var(--olive)", margin: 0 }}>{t.title}</h3>
      <p className="muted" style={{ maxWidth: 600, margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.6 }}>
        {t.bodyPrefix} <strong>{guestName}</strong>. {t.bodySuffix}
      </p>

      <div style={{ background: "var(--soft)", padding: 24, borderRadius: 10, maxWidth: 500, margin: "0 auto", textAlign: "left", display: "grid", gap: 10, fontSize: "0.95rem" }}>
        <div><strong>{t.bookingNo}</strong> <span style={{ color: "var(--gold)", fontWeight: 700 }}>{bookingId}</span></div>
        <div><strong>{t.roomType}</strong> {selectedRoom?.title}</div>
        <div><strong>{t.dates}</strong> {checkIn} — {checkOut} ({nights} {payment.nights})</div>
        <div><strong>{t.preferences}</strong></div>
        <div style={{ paddingLeft: 16, fontSize: "0.85rem", opacity: 0.85 }}>
          • {payment.scent} {scent.label} <br />
          • {payment.pillow} {pillow.label} <br />
          • {payment.sound} {sound.label} <br />
          • {payment.light} {light.label}
        </div>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>{t.collected}</span>
          <span>{finalPrice.toLocaleString("tr-TR")} ₺</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
        <a
          href={getWhatsAppMessage()}
          target="_blank"
          rel="noreferrer"
          className="button primary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {t.whatsapp}
        </a>
        <button
          onClick={resetWizard}
          className="button secondary"
        >
          {t.reset}
        </button>
      </div>
    </motion.div>
  );
}
