"use client";

import { AnimatePresence } from "framer-motion";
import { usePaymentWizard } from "./use-payment-wizard";
import { DatesStep } from "./steps/dates-step";
import { RoomsStep } from "./steps/rooms-step";
import { SensoryStep } from "./steps/sensory-step";
import { PaymentStep } from "./steps/payment-step";
import { SuccessStep } from "./steps/success-step";

// 5 adimli rezervasyon sihirbazi: ilerleme basligi + adim gecisleri
export function PaymentWizard() {
  const wizard = usePaymentWizard();
  const { step, selectedRoom } = wizard;
  const activeStepColor = "var(--gold-text)";
  const completedStepColor = "var(--olive)";
  const upcomingStepColor = "var(--muted)";

  return (
    <div className="payment-wizard-container" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px", minHeight: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
      {/* Step Indicators */}
      {step !== "success" && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: "18px" }}>
          <span style={{ color: step === "dates" ? activeStepColor : completedStepColor }}>1. Tarihler</span>
          <span style={{ color: step === "rooms" ? activeStepColor : selectedRoom ? completedStepColor : upcomingStepColor }}>2. Odalar</span>
          <span style={{ color: step === "sensory" ? activeStepColor : step === "payment" ? completedStepColor : upcomingStepColor }}>3. Atmosfer</span>
          <span style={{ color: step === "payment" ? activeStepColor : upcomingStepColor }}>4. Ödeme</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "dates" && <DatesStep key="step-dates" wizard={wizard} />}
        {step === "rooms" && <RoomsStep key="step-rooms" wizard={wizard} />}
        {step === "sensory" && <SensoryStep key="step-sensory" wizard={wizard} />}
        {step === "payment" && <PaymentStep key="step-payment" wizard={wizard} />}
        {step === "success" && <SuccessStep key="step-success" wizard={wizard} />}
      </AnimatePresence>
    </div>
  );
}
