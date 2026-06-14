"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { rooms } from "@/data/rooms";
import type { usePaymentWizard } from "../use-payment-wizard";

// Adim 2: Oda secimi ve gecelik fiyat listesi
export function RoomsStep({ wizard }: { wizard: ReturnType<typeof usePaymentWizard> }) {
  const { nights, selectedRoom, setSelectedRoom, setStep, copy } = wizard;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", margin: 0 }}>{copy.rooms.title}</h3>
        <span style={{ fontSize: "0.9rem", color: "var(--gold)", fontWeight: 600 }}>{nights} {copy.rooms.stay}</span>
      </div>

      <div className="rooms-grid" style={{ display: "grid", gap: 18, maxHeight: "400px", overflowY: "auto", paddingRight: 8, marginBottom: 24 }}>
        {rooms.map((room) => {
          let rate = 4500;
          if (room.slug.includes("superior")) rate = 8500;
          else if (room.slug.includes("aile")) rate = 7500;
          else if (room.slug.includes("uc-kisilik")) rate = 6000;

          const isSelected = selectedRoom?.slug === room.slug;
          const total = rate * nights;

          return (
            <div
              key={room.slug}
              onClick={() => setSelectedRoom(room)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
                border: isSelected ? "2px solid var(--gold)" : "1px solid var(--border)",
                borderRadius: 10,
                cursor: "pointer",
                background: isSelected ? "rgba(179, 146, 92, 0.04)" : "transparent",
                transition: "all 0.3s"
              }}
            >
              <div>
                <h4 className="serif" style={{ margin: "0 0 4px", fontSize: "1.2rem", color: "var(--olive)" }}>{room.title}</h4>
                <p className="muted" style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>{room.view} · {room.size} · {room.capacity}</p>
                <span className="eyebrow" style={{ fontSize: "0.7rem", marginBottom: 0 }}>{room.amenities.slice(0, 3).join(" · ")}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--olive)" }}>{total.toLocaleString("tr-TR")} ₺</div>
                <div className="muted" style={{ fontSize: "0.8rem", marginTop: 2 }}>{rate.toLocaleString("tr-TR")} ₺ / {copy.rooms.perNight}</div>
                <button
                  className={`button sm ${isSelected ? "primary" : "secondary"}`}
                  style={{ marginTop: 10, padding: "6px 14px", fontSize: "0.75rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoom(room);
                    setStep("sensory");
                  }}
                >
                  {isSelected ? copy.rooms.selected : copy.rooms.select}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep("dates")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowLeft size={16} /> {copy.rooms.back}
        </button>
        <button
          onClick={() => setStep("sensory")}
          className="button primary"
          disabled={!selectedRoom}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {copy.rooms.next} <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
