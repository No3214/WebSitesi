"use client";

import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 4: Misafir bilgileri, mock kart formu ve ozet
export function PaymentStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const {
    handlePaymentSubmit,
    guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
    cardNumber, setCardNumber, cardHolder, setCardHolder,
    cardExpiry, setCardExpiry, cardCvv, setCardCvv,
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

        {/* DEMO uyarısı — gerçek tahsilat yapılmaz (F1) */}
        <div
          role="status"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "12px 14px",
            background: "#fff6e5",
            border: "1px solid #f3d08b",
            borderRadius: 8,
            fontSize: "0.85rem",
            lineHeight: 1.55,
            color: "#92400e",
          }}
        >
          <span aria-hidden style={{ fontWeight: 700 }}>DEMO</span>
          <span>
            Bu adım bir <strong>ön-rezervasyon talebidir</strong>; kartınızdan şu an{" "}
            <strong>hiçbir tahsilat yapılmaz</strong>. Ödeme, ekibimiz sizinle iletişime
            geçtikten sonra güvenli bağlantı üzerinden alınır. Denemek için 4111 1111 1111 1111
            test kartını kullanabilirsiniz.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            placeholder="Ad Soyad"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
          <input
            placeholder="Telefon"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
        </div>
        <input
          placeholder="E-posta Adresi"
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <CreditCard size={18} style={{ color: "var(--olive)" }} />
          <h4 className="serif" style={{ margin: 0, fontSize: "1.15rem" }}>Kart Bilgileri</h4>
        </div>

        <input
          placeholder="Kart Numarası (16 Hane)"
          maxLength={19}
          value={cardNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
            setCardNumber(val);
          }}
          required
          style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <input
            placeholder="Kart Üzerindeki İsim"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
          <input
            placeholder="AA/YY"
            maxLength={5}
            value={cardExpiry}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");
              if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
              setCardExpiry(val);
            }}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, textAlign: "center" }}
          />
          <input
            placeholder="CVV"
            maxLength={3}
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
            required
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, textAlign: "center" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
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
          <span>256-bit SSL — bilgileriniz şifreli iletilir; bu adımda tahsilat yapılmaz</span>
        </div>
      </div>
    </motion.div>
  );
}
