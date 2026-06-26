"use client";

import { Check } from "lucide-react";
import type { ExperienceDesigner } from "./use-experience-designer";

// Adım ilerleme çubuğu (aşama 1-3 görünür)
export function DesignerProgressBar({ designer }: { designer: ExperienceDesigner }) {
  const { step } = designer;

  return (
    <div
      className="progress-container"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={step}
      aria-label="Deneyim tasarımı ilerlemesi"
    >
      <div className="progress-bar" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      <div className="steps-indicators">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`step-dot ${step >= s ? "active" : ""}`}>
            {step > s ? <Check size={12} aria-hidden /> : s}
          </div>
        ))}
      </div>

      <style jsx>{`
        .progress-container {
          position: relative;
          height: 4px;
          background: rgba(61, 74, 59, 0.08);
          margin-bottom: 60px;
          border-radius: 2px;
        }

        .progress-bar {
          position: absolute;
          height: 100%;
          background: var(--gold);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .steps-indicators {
          display: flex;
          justify-content: space-between;
          position: absolute;
          width: 100%;
          top: -10px;
        }

        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--white);
          border: 2px solid rgba(61, 74, 59, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #999;
          transition: all 0.3s;
        }

        .step-dot.active {
          border-color: var(--gold);
          color: var(--gold);
          box-shadow: 0 0 12px rgba(179, 146, 92, 0.2);
        }
      `}</style>
    </div>
  );
}
