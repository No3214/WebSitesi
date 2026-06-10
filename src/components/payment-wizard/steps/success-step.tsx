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
  } = wizard;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", display: "grid", gap: 24, padding: "20px 0" }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CheckCircle2 size={64} style={{ color: "var(--olive)" }} />
      </div>

      <h3 className="serif" style={{ fontSize: "2rem", color: "var(--olive)", margin: 0 }}>Rezervasyon Talebiniz Alındı!</h3>
      <p className="muted" style={{ maxWidth: 600, margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.6 }}>
        Teşekkür ederiz, <strong>{guestName}</strong>. Rezervasyon talebiniz ve atmosfer
        kişiselleştirme seçimleriniz sisteme kaydedildi. Ödeme bilgisi alınmadı —
        ekibimiz 24 saat içinde teyit için sizinle iletişime geçecek; tahsilat,
        Garanti BBVA Sanal POS güvenli ödeme adımıyla tamamlanacak.
      </p>

      <div style={{ background: "var(--soft)", padding: 24, borderRadius: 10, maxWidth: 500, margin: "0 auto", textAlign: "left", display: "grid", gap: 10, fontSize: "0.95rem" }}>
        <div><strong>Rezervasyon Numarası:</strong> <span style={{ color: "var(--gold)", fontWeight: 700 }}>{bookingId}</span></div>
        <div><strong>Oda Tipi:</strong> {selectedRoom?.title}</div>
        <div><strong>Giriş / Çıkış:</strong> {checkIn} — {checkOut} ({nights} Gece)</div>
        <div><strong>Atmosfer Tercihleri:</strong></div>
        <div style={{ paddingLeft: 16, fontSize: "0.85rem", opacity: 0.85 }}>
          • Koku: {scent.label} <br />
          • Yastık: {pillow.label} <br />
          • Ses: {sound.label} <br />
          • Işık: {light.label}
        </div>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Tahsil Edilen Tutar:</span>
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
          WhatsApp Resepsiyona Bildir
        </a>
        <button
          onClick={resetWizard}
          className="button secondary"
        >
          Yeni Rezervasyon
        </button>
      </div>
    </motion.div>
  );
}
