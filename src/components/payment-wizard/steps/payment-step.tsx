"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";
import { getLegalHref } from "@/lib/legal-routes";

// Adim 4: Misafir bilgileri + ozet. Kart alanlari KASITLI olarak yok:
// tahsilat Garanti BBVA Sanal POS'un guvenli 3D Secure sayfasinda yapilacak
// (PAN bu siteye hic ugramaz — PCI kapsami disi, Audit F13).
export function PaymentStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const {
    handlePaymentSubmit,
    guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
    consent, setConsent,
    paymentError,
    setStep, isSubmitting,
    selectedRoom, checkIn, checkOut, nights, guests,
    scent, pillow, sound, light,
    copy,
  } = wizard;
  const t = copy.payment;
  const kvkkHref = getLegalHref("kvkk", wizard.locale);
  const privacyHref = getLegalHref("privacy", wizard.locale);
  const fieldId = (field: string) => `payment-${wizard.locale}-${field}`;
  const errorId = fieldId("error");
  const amountPending = wizard.locale === "tr" ? "HMS / ekip teyidi" : "HMS / team confirmation";
  const shouldReduce = useReducedMotion();
  const invalid = paymentError ? true : undefined;
  const describedBy = paymentError ? errorId : undefined;

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: shouldReduce ? 0 : 0.3 }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}
    >
      {/* Form Side */}
      <form onSubmit={handlePaymentSubmit} style={{ display: "grid", gap: 18 }}>
        <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", marginBottom: 0 }}>{t.title}</h3>

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
          <span>{t.notice}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="sr-only" htmlFor={fieldId("guest-name")}>{t.name}</label>
          <input
            id={fieldId("guest-name")}
            name="guestName"
            placeholder={t.name}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            autoComplete="name"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
          <label className="sr-only" htmlFor={fieldId("guest-phone")}>{t.phone}</label>
          <input
            id={fieldId("guest-phone")}
            name="guestPhone"
            placeholder={t.phone}
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            required
            autoComplete="tel"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
          />
        </div>
        <label className="sr-only" htmlFor={fieldId("guest-email")}>{t.email}</label>
        <input
          id={fieldId("guest-email")}
          name="guestEmail"
          placeholder={t.email}
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
          autoComplete="email"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
        />

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "12px 14px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: "0.82rem",
            lineHeight: 1.5,
            color: "var(--muted)",
          }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            style={{ marginTop: 3, flex: "none" }}
          />
          <span>
            {t.consentBefore}{" "}
            <a href={kvkkHref} style={{ color: "var(--olive)", fontWeight: 700 }}>
              {t.kvkk}
            </a>{" "}
            {wizard.locale === "tr" ? "ve" : "and"}{" "}
            <a href={privacyHref} style={{ color: "var(--olive)", fontWeight: 700 }}>
              {t.privacy}
            </a>{" "}
            {t.consentAfter}
          </span>
        </label>

        {paymentError && (
          <p id={errorId} role="alert" style={{ color: "#c2410c", fontSize: "0.85rem", margin: 0 }}>
            {paymentError}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <button type="button" onClick={() => setStep("sensory")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} /> {t.back}
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={isSubmitting || !consent}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </div>
      </form>

      {/* Receipt Summary Side */}
      <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <h4 className="serif" style={{ fontSize: "1.35rem", color: "var(--olive)", margin: 0 }}>{t.summary}</h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem" }}>
          <div><strong>{t.selectedRoom}</strong> {selectedRoom?.title}</div>
          <div><strong>{t.checkIn}</strong> {checkIn}</div>
          <div><strong>{t.checkOut}</strong> {checkOut}</div>
          <div><strong>{t.duration}</strong> {nights} {t.nights}</div>
          <div><strong>{t.guests}</strong> {guests} {t.adults}</div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 700, color: "var(--gold)" }}>{t.preferences}</span>
          <div><span aria-hidden="true">🌸</span> {t.scent} {scent.label}</div>
          <div><span aria-hidden="true">🪶</span> {t.pillow} {pillow.label}</div>
          <div><span aria-hidden="true">🔊</span> {t.sound} {sound.label}</div>
          <div><span aria-hidden="true">💡</span> {t.light} {light.label}</div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
            <span>{t.roomTotal}</span>
            <span>{amountPending}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.2rem", color: "var(--olive)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <span>{t.due}</span>
            <span>{amountPending}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(61, 74, 59, 0.05)", padding: 12, borderRadius: 8, fontSize: "0.78rem", color: "var(--olive)", marginTop: 12 }}>
          <ShieldCheck size={16} aria-hidden />
          <span>{t.cardSafety}</span>
        </div>
      </div>
    </motion.div>
  );
}
