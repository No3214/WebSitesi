"use client";

import { useState } from "react";
import { getWhatsAppHref } from "@/lib/contact";
import {
  durations,
  interests,
  paces,
  itineraryDb,
  day2Activities,
  day3Activities,
  type ItineraryItem,
} from "./data";

// Tüm state, türetilmiş rota ve handler'lar tek hook'ta
export function useExperienceDesigner() {
  const [step, setStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(durations[1]); // Varsayılan: 2 gün
  const [selectedInterest, setSelectedInterest] = useState(interests[0]); // Varsayılan: gastronomi
  const [selectedPace, setSelectedPace] = useState(paces[1]); // Varsayılan: dengeli

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleReset = () => {
    setStep(1);
    setSelectedDuration(durations[1]);
    setSelectedInterest(interests[0]);
    setSelectedPace(paces[1]);
  };

  // Gün sayısına göre rotayı dinamik üretir
  const generateItinerary = () => {
    const baseList = itineraryDb[selectedInterest.id]?.[selectedPace.id] || [];
    const days = selectedDuration.days;
    const finalItinerary: Record<number, ItineraryItem[]> = {};

    for (let d = 1; d <= days; d++) {
      // Sonraki günlerde program alternatif aktivitelerle çeşitlenir
      finalItinerary[d] = baseList.map((item, index) => {
        if (d === 1) return item;
        if (d === 2) {
          return day2Activities[selectedInterest.id]?.[index] || item;
        }
        return day3Activities[selectedInterest.id]?.[index] || item;
      });
    }

    return finalItinerary;
  };

  const itinerary = generateItinerary();

  // Rotayı rezervasyon talebi olarak WhatsApp mesajına çevirir
  const handleWhatsAppSend = () => {
    let message = `Merhaba Kozbeyli Konağı! Web sitenizdeki *Yavaş Yaşam Rota Tasarımcısı* ile harika bir tatil planladım:\n\n`;
    message += `📅 *Süre:* ${selectedDuration.label}\n`;
    message += `🌿 *Konsept:* ${selectedInterest.title}\n`;
    message += `⚡ *Tempo:* ${selectedPace.label}\n\n`;
    message += `Bu rotaya uygun oda müsaitliği ve kişiselleştirilmiş teklif için yardımcı olabilir misiniz?`;

    const href = getWhatsAppHref(message);
    window.open(href, "_blank");
  };

  return {
    step,
    selectedDuration,
    setSelectedDuration,
    selectedInterest,
    setSelectedInterest,
    selectedPace,
    setSelectedPace,
    handleNext,
    handleBack,
    handleReset,
    itinerary,
    handleWhatsAppSend,
  };
}

// Alt bileşenlere tek prop olarak geçen kontrolcü tipi
export type ExperienceDesigner = ReturnType<typeof useExperienceDesigner>;
