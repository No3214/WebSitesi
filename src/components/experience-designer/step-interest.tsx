"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { interests } from "./data";
import type { ExperienceDesigner } from "./use-experience-designer";

// Adım 2: İlgi alanı seçimi
// Not: styled-jsx scoped çalıştığı için ortak adım stilleri her adım dosyasında birebir tekrarlanır.
export function StepInterest({ designer }: { designer: ExperienceDesigner }) {
  const { selectedInterest, setSelectedInterest, handleNext, handleBack } = designer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="step-card"
    >
      <span className="eyebrow">AŞAMA 2 / 3</span>
      <h2 className="serif title-large">İlgi Alanınızı Belirleyin</h2>
      <p className="subtitle">Konaklamanız süresince hangi deneyimlere ağırlık vermek istersiniz?</p>

      <div className="options-grid">
        {interests.map((i) => {
          const Icon = i.icon;
          return (
            <button
              key={i.id}
              aria-pressed={selectedInterest.id === i.id}
              className={`option-btn ${selectedInterest.id === i.id ? "selected" : ""}`}
              onClick={() => setSelectedInterest(i)}
              style={{ position: "relative", overflow: "hidden", minHeight: "240px", justifyContent: "flex-end" }}
            >
              <div className="card-bg-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%), url(${i.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease", zIndex: 1 }} />
              <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                <div className="option-header" style={{ marginBottom: 12 }}>
                  <Icon size={20} style={{ color: "var(--gold)" }} />
                </div>
                <h3 style={{ color: "var(--white)", textShadow: "0 2px 4px rgba(0,0,0,0.3)", margin: "0 0 6px" }}>{i.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{i.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="step-actions">
        <button className="button secondary" onClick={handleBack}>
          GERİ
        </button>
        <button className="button primary flex-align" onClick={handleNext}>
          İLERLE <ChevronRight size={16} />
        </button>
      </div>

      <style jsx>{`
        .step-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.02);
        }

        .title-large {
          font-size: 2.2rem;
          margin: 12px 0 8px;
          color: var(--olive);
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
          margin-bottom: 40px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .options-grid.cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .option-btn {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          outline: none;
        }

        .card-bg-zoom {
          transform: scale(1);
        }

        .option-btn:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(179, 146, 92, 0.06);
        }

        .option-btn:hover .card-bg-zoom {
          transform: scale(1.05);
        }

        .option-btn.selected {
          border-color: var(--gold);
          box-shadow: 0 12px 24px rgba(179, 146, 92, 0.15);
          outline: 2px solid var(--gold);
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 20px;
          align-items: center;
        }

        .icon-gold {
          color: var(--gold);
        }

        .badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(179, 146, 92, 0.1);
          color: var(--gold);
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        .option-btn h3 {
          font-size: 1.15rem;
          margin: 0 0 10px;
          color: var(--text);
        }

        .option-btn p {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flex-align {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 900px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
          .options-grid.cols-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .step-card {
            padding: 24px;
          }
          .title-large {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
