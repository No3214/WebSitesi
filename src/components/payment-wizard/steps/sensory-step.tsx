"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { SCENTS, PILLOWS, SOUNDS, LIGHTS } from "../types";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 3: Duyusal oda atmosferi tercihleri
export function SensoryStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const { scent, setScent, pillow, setPillow, sound, setSound, light, setLight, setStep } = wizard;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "grid", gap: 24 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={20} style={{ color: "var(--gold)" }} />
        <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", margin: 0 }}>Duyusal Oda Atmosferi</h3>
      </div>
      <p className="muted" style={{ marginTop: "-12px", fontSize: "0.95rem" }}>
        Odanızın fiziksel detaylarını gelmeden önce kişiselleştirin. Bu tercihler siz giriş yapmadan odanıza uygulanacaktır.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {/* Scent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="scent" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Oda Kokusu</label>
          <select
            id="scent"
            value={scent.id}
            onChange={(e) => setScent(SCENTS.find(s => s.id === e.target.value) || SCENTS[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {SCENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{scent.desc}</p>
        </div>

        {/* Pillow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="pillow" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Yastık Menüsü</label>
          <select
            id="pillow"
            value={pillow.id}
            onChange={(e) => setPillow(PILLOWS.find(p => p.id === e.target.value) || PILLOWS[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {PILLOWS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{pillow.desc}</p>
        </div>

        {/* Sound */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="sound" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Ses Teması</label>
          <select
            id="sound"
            value={sound.id}
            onChange={(e) => setSound(SOUNDS.find(s => s.id === e.target.value) || SOUNDS[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{sound.desc}</p>
        </div>

        {/* Light */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="light" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Aydınlatma Modu</label>
          <select
            id="light"
            value={light.id}
            onChange={(e) => setLight(LIGHTS.find(l => l.id === e.target.value) || LIGHTS[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {LIGHTS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: light.color, marginRight: 6 }}></span>
            {light.desc}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => setStep("rooms")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <button onClick={() => setStep("payment")} className="button primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Ödeme ve Fatura <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
