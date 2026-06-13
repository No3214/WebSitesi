"use client";

import { motion } from "framer-motion";
import { Send, RotateCcw } from "lucide-react";
import { FadeIn, StaggerContainer } from "@/components/animations";
import type { ExperienceDesigner } from "./use-experience-designer";

// Adım 4: Üretilen rotanın gün gün zaman çizelgesi olarak gösterimi
export function ItineraryResult({ designer }: { designer: ExperienceDesigner }) {
  const { selectedDuration, selectedInterest, selectedPace, itinerary, handleReset, handleWhatsAppSend } = designer;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      className="itinerary-display"
    >
      <div className="glass-header text-center">
        <span className="eyebrow">✨ KİŞİSELLEŞTİRİLMİŞ ROTANIZ HAZIR</span>
        <h1 className="serif main-title">Kozbeyli Slow Living Deneyimi</h1>
        <p className="muted max-width-p">
          {selectedDuration.label} · {selectedInterest.title} · {selectedPace.label}
        </p>

      </div>

      {/* Gün gün zaman çizelgesi */}
      <StaggerContainer>
        {Object.keys(itinerary).map((dayStr) => {
          const day = parseInt(dayStr);
          return (
            <FadeIn key={day} delay={day * 0.1}>
              <div className="day-section">
                <div className="day-header">
                  <span className="day-number">GÜN {day}</span>
                  <div className="day-line" />
                </div>

                <div className="timeline">
                  {itinerary[day].map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <h4>{item.activity}</h4>
                        <p>{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </StaggerContainer>

      {/* Aksiyon butonları */}
      <div className="itinerary-actions">
        <button className="button secondary flex-align gap-2" onClick={handleReset}>
          <RotateCcw size={16} /> YENİ ROTA TASARLA
        </button>
        <button className="button secondary flex-align gap-2" onClick={handleWhatsAppSend}>
          <Send size={16} /> ROTAYI WHATSAPP İLE GÖNDER
        </button>
        <a href="/rezervasyon" className="button primary flex-align">
          REZERVASYON YAP
        </a>
      </div>

      <style jsx>{`
        .itinerary-display {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 50px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.03);
        }

        .main-title {
          font-size: 2.8rem;
          color: var(--olive);
          margin: 8px 0;
        }

        .max-width-p {
          max-width: 600px;
          margin: 0 auto;
          font-size: 1.1rem;
        }

        .day-section {
          margin-top: 50px;
        }

        .day-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .day-number {
          font-family: var(--serif);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--olive);
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .day-line {
          height: 1px;
          background: var(--border);
          width: 100%;
        }

        .timeline {
          position: relative;
          padding-left: 32px;
          margin-left: 8px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: rgba(61, 74, 59, 0.08);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-time {
          position: absolute;
          left: -110px;
          width: 80px;
          text-align: right;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--gold);
        }

        .timeline-marker {
          position: absolute;
          left: -36px;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--white);
          border: 2px solid var(--gold);
          box-shadow: 0 0 0 4px var(--white);
          transition: all 0.3s;
        }

        .timeline-item:hover .timeline-marker {
          background: var(--gold);
          transform: scale(1.2);
        }

        .timeline-content h4 {
          font-size: 1.15rem;
          margin: 0 0 6px;
          color: var(--olive);
        }

        .timeline-content p {
          font-size: 0.92rem;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        .itinerary-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 60px;
          border-top: 1px solid var(--border);
          padding-top: 40px;
          flex-wrap: wrap;
        }

        .flex-align {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 900px) {
          .timeline {
            padding-left: 20px;
            margin-left: 80px;
          }
          .timeline-time {
            left: -90px;
          }
          .timeline-marker {
            left: -24px;
          }
        }

        @media (max-width: 500px) {
          .itinerary-display {
            padding: 24px;
          }
          .main-title {
            font-size: 2rem;
          }
          .timeline {
            padding-left: 16px;
            margin-left: 0;
            margin-top: 24px;
          }
          .timeline-time {
            position: static;
            text-align: left;
            margin-bottom: 4px;
            display: inline-block;
          }
          .timeline-marker {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
