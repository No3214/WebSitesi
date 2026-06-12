"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 4: Misafir bilgileri + ozet. Kart alanlari KASITLI olarak yok:
// tahsilat Garanti BBVA Sanal POS'un guvenli 3D Secure sayfasinda yapilacak
// (PAN bu siteye hic ugramaz — PCI kapsami disi, Audit F13).
export function PaymentStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const {
    handlePaymentSubmit,
    guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
    promoCode, setPromoCode, applyPromo, paymentError,
    setStep, isSubmitting, finalPrice,
    selectedRoom, checkIn, checkOut, nights, guests,
    scent, pillow, sound, light,
    totalRawPrice, isPromoApplied, discountAmount,
  } = wizard;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}
    >
      {/* Form Side */}
      <form onSubmit={handlePaymentSubmit} style={{ display: "grid", gap: 18 }}>
        <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", marginBottom: 0 }}>Misafir & Fatura Bilgileri</h3>

        {/* Ödeme bilgilendirmesi — kart bilgisi bu sitede İSTENMEZ (F1/F13) */}
        <div
          role="status"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "12px 14px",
            background: "rgba(61, 74, 59, 0.06)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: "0.85rem",
            lineHeight: 1.55,
            color: "var(--olive)",
          }}
        >
          <ShieldCheck size={18} aria-hidden style={{ flex: "none", marginTop: 2 }} />
          <span>
            Bu adım bir <strong>ön-rezervasyon talebidir</strong> — kart bilgisi istemiyoruz.
            Ödemeniz, <strong>Garanti BBVA Sanal POS</strong> güvenli 3D Secure ödeme sayfası
            üzerinden alınacaktır; ekibimiz onay ve ödeme adımı için sizinle iletişime geçecek.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor="guestName" style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--olive)" }}>Ad Soyad <span style={{ color: "#c2410c" }}>*</span></label>
            <input
              id="guestName"
              placeholder="Ad Soyad"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor="guestPhone" style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--olive)" }}>Telefon <span style={{ color: "#c2410c" }}>*</span></label>
            <input
              id="guestPhone"
              placeholder="Telefon"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              required
              style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label htmlFor="guestEmail" style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--olive)" }}>E-posta Adresi <span style={{ color: "#c2410c" }}>*</span></label>
          <input
            id="guestEmail"
            placeholder="E-posta Adresi"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
          <label htmlFor="promoCode" style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--olive)" }}>İndirim Kodu</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="promoCode"
              placeholder="İndirim Kodu"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}
            />
            <button
              type="button"
              onClick={applyPromo}
              className="button secondary sm"
              style={{ padding: "10px 18px" }}
            >
              Uygula
            </button>
          </div>
        </div>

        {paymentError && <p style={{ color: "#c2410c", fontSize: "0.85rem", margin: 0 }}>{paymentError}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <button type="button" onClick={() => setStep("sensory")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} /> Geri
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={isSubmitting}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {isSubmitting
              ? "Gönderiliyor..."
              : `Rezervasyon Talebini Gönder (${finalPrice.toLocaleString("tr-TR")} ₺)`}
          </button>
        </div>
      </form>

      {/* Receipt Summary Side */}
      <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <h4 className="serif" style={{ fontSize: "1.35rem", color: "var(--olive)", margin: 0 }}>Özet</h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem" }}>
          <div><strong>Seçilen Oda:</strong> {selectedRoom?.title}</div>
          <div><strong>Giriş:</strong> {checkIn}</div>
          <div><strong>Çıkış:</strong> {checkOut}</div>
          <div><strong>Süre:</strong> {nights} Gece</div>
          <div><strong>Konuk:</strong> {guests} Yetişkin</div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 700, color: "var(--gold)" }}>Oda Tercihleriniz:</span>
          <div>🌸 Koku: {scent.label}</div>
          <div>🪶 Yastık: {pillow.label}</div>
          <div>🔊 Ses: {sound.label}</div>
          <div>💡 Işık: {light.label}</div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
            <span>Toplam Oda Tutarı:</span>
            <span>{totalRawPrice.toLocaleString("tr-TR")} ₺</span>
          </div>
          {isPromoApplied && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#c5a059", fontSize: "0.9rem" }}>
              <span>%15 Slow Living İndirimi:</span>
              <span>-{discountAmount.toLocaleString("tr-TR")} ₺</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.2rem", color: "var(--olive)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span>Ödenecek Tutar:</span>
            <span>{finalPrice.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(61, 74, 59, 0.05)", padding: 12, borderRadius: 8, fontSize: "0.78rem", color: "var(--olive)", marginTop: 12 }}>
          <ShieldCheck size={16} />
          <span>Kart bilgileriniz yalnızca Garanti BBVA&apos;nın güvenli ödeme sayfasında işlenir; bu sitede saklanmaz</span>
        </div>
      </div>
    </motion.div>
  );
}
