"use client";

import { AnimatePresence } from "framer-motion";
import { useExperienceDesigner } from "./use-experience-designer";
import { DesignerProgressBar } from "./progress-bar";
import { StepDuration } from "./step-duration";
import { StepInterest } from "./step-interest";
import { StepPace } from "./step-pace";
import { ItineraryResult } from "./itinerary-result";

// Orkestratör: adım akışını ve genel yerleşimi yönetir
export function ExperienceDesignerClient() {
  const designer = useExperienceDesigner();
  const { step } = designer;

  return (
    <div className="experience-designer">
      <div className="container" style={{ maxWidth: 880 }}>
        {/* İlerleme çubuğu */}
        {step < 4 && <DesignerProgressBar designer={designer} />}

        <AnimatePresence mode="wait">
          {/* ADIM 1: Süre seçimi */}
          {step === 1 && <StepDuration key="step1" designer={designer} />}

          {/* ADIM 2: İlgi alanı seçimi */}
          {step === 2 && <StepInterest key="step2" designer={designer} />}

          {/* ADIM 3: Tempo seçimi */}
          {step === 3 && <StepPace key="step3" designer={designer} />}

          {/* ADIM 4: Üretilen rota */}
          {step === 4 && <ItineraryResult key="step4" designer={designer} />}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .experience-designer {
          padding: 60px 0 100px;
          min-height: calc(100vh - 90px);
          background: var(--ivory);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
