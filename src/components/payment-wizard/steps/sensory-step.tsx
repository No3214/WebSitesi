"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 3: Duyusal oda atmosferi tercihleri
export function SensoryStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const { scent, setScent, pillow, setPillow, sound, setSound, light, setLight, setStep, copy, options } = wizard;
  const fieldId = (field: string) => `sensory-${wizard.locale}-${field}`;
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: shouldReduce ? 0 : 0.3 }}
      style={{ display: "grid", gap: 24 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={20} style={{ color: "var(--gold)" }} />
        <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", margin: 0 }}>{copy.sensory.title}</h3>
      </div>
      <p className="muted" style={{ marginTop: "-12px", fontSize: "0.95rem" }}>
        {copy.sensory.intro}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {/* Scent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor={fieldId("scent")} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>{copy.sensory.scent}</label>
          <select
            id={fieldId("scent")}
            name="scent"
            value={scent.id}
            onChange={(e) => setScent(options.scents.find(s => s.id === e.target.value) || options.scents[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {options.scents.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{scent.desc}</p>
        </div>

        {/* Pillow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor={fieldId("pillow")} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>{copy.sensory.pillow}</label>
          <select
            id={fieldId("pillow")}
            name="pillow"
            value={pillow.id}
            onChange={(e) => setPillow(options.pillows.find(p => p.id === e.target.value) || options.pillows[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {options.pillows.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{pillow.desc}</p>
        </div>

        {/* Sound */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor={fieldId("sound")} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>{copy.sensory.sound}</label>
          <select
            id={fieldId("sound")}
            name="sound"
            value={sound.id}
            onChange={(e) => setSound(options.sounds.find(s => s.id === e.target.value) || options.sounds[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {options.sounds.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{sound.desc}</p>
        </div>

        {/* Light */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor={fieldId("light")} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>{copy.sensory.light}</label>
          <select
            id={fieldId("light")}
            name="light"
            value={light.id}
            onChange={(e) => setLight(options.lights.find(l => l.id === e.target.value) || options.lights[0])}
            style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
          >
            {options.lights.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: light.color, marginRight: 6 }}></span>
            {light.desc}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => setStep("rooms")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowLeft size={16} /> {copy.sensory.back}
        </button>
        <button onClick={() => setStep("payment")} className="button primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {copy.sensory.next} <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
