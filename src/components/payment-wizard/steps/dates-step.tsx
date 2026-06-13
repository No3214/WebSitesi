"use client";

import { motion } from "framer-motion";
import { Calendar, Users, ArrowRight } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 1: Tarih ve konuk secimi
export function DatesStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const { checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests, setStep } = wizard;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "grid", gap: 24 }}
    >
      <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)" }}>Tarih ve Konuk Seçimi</h3>
      <p className="muted" style={{ marginTop: "-12px", fontSize: "0.95rem" }}>
        Kozbeyli&apos;nin eşsiz taş dokusunda sükuneti deneyimlemek istediğiniz tarih aralığını belirleyin.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="pw-checkin" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
            <Calendar size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
            Giriş Tarihi
          </label>
          <input
            id="pw-checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none", color: "var(--text)", background: "var(--white)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="pw-checkout" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
            <Calendar size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
            Çıkış Tarihi
          </label>
          <input
            id="pw-checkout"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none", color: "var(--text)", background: "var(--white)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="pw-guests" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
            <Users size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
            Konuk Sayısı
          </label>
          <select
            id="pw-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none", background: "var(--white)", color: "var(--text)" }}
          >
            <option value={1}>1 Yetişkin</option>
            <option value={2}>2 Yetişkin</option>
            <option value={3}>3 Yetişkin</option>
            <option value={4}>4 Yetişkin / Aile</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button
          onClick={() => setStep("rooms")}
          className="button primary"
          disabled={!checkIn || !checkOut}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          Odaları Listele <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
