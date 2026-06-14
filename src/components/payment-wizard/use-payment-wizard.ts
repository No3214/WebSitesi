"use client";

import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Room } from "@/data/rooms";
import { calculateBookingQuote } from "@/lib/booking-pricing";
import { getWhatsAppHref } from "@/lib/contact";
import { BookingLocale, Step, WIZARD_COPY, WIZARD_OPTIONS } from "./types";

// Sihirbazin tum state'i, turetilmis degerleri ve handler'lari tek hook'ta
export function usePaymentWizard(locale: BookingLocale = "tr") {
  const copy = WIZARD_COPY[locale];
  const options = WIZARD_OPTIONS[locale];
  const [step, setStep] = useState<Step>("dates");

  // State variables
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Sensory customization
  const [scent, setScent] = useState(options.scents[0]);
  const [pillow, setPillow] = useState(options.pillows[0]);
  const [sound, setSound] = useState(options.sounds[0]);
  const [light, setLight] = useState(options.lights[0]);

  // Billing & Payment
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Kart state'i YOK: tahsilat Garanti BBVA Sanal POS 3D Secure sayfasında
  // yapılacak — PAN bu uygulamaya hiç girmez (Audit F13).
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Initialize dates with tomorrow and day after tomorrow
  useEffect(() => {
    setScent(options.scents[0]);
    setPillow(options.pillows[0]);
    setSound(options.sounds[0]);
    setLight(options.lights[0]);
  }, [options.lights, options.pillows, options.scents, options.sounds]);

  // Initialize dates with tomorrow and day after tomorrow
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 3);

    setCheckIn(tomorrow.toISOString().split("T")[0]);
    setCheckOut(dayAfter.toISOString().split("T")[0]);

    // Generate random booking ID
    setBookingId("KK-" + Math.floor(10000 + Math.random() * 90000));
  }, []);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const quote = selectedRoom ? calculateBookingQuote(selectedRoom.slug, checkIn, checkOut) : null;
    if (quote?.ok) return quote.nights;
    return 1;
  }, [checkIn, checkOut, selectedRoom]);

  // Calculate prices
  const totalRawPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    const quote = calculateBookingQuote(selectedRoom.slug, checkIn, checkOut);
    return quote.ok ? quote.totalPrice : 0;
  }, [checkIn, checkOut, selectedRoom]);

  const finalPrice = useMemo(() => {
    return totalRawPrice;
  }, [totalRawPrice]);

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setPaymentError(copy.errors.missingFields);
      return;
    }
    if (!consent) {
      setPaymentError(copy.errors.missingConsent);
      return;
    }

    setIsSubmitting(true);
    setPaymentError("");

    try {
      // API handshake simulation
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          checkIn,
          checkOut,
          nights,
          guests,
          roomSlug: selectedRoom?.slug,
          roomTitle: selectedRoom?.title,
          guestName,
          guestEmail,
          guestPhone,
          scent: scent.label,
          pillow: pillow.label,
          sound: sound.label,
          light: light.label,
          promoCode: "",
          totalPrice: finalPrice,
          consent,
        })
      });

      const result = await res.json();
      if (res.ok && result.ok) {
        setStep("success");
      } else {
        setPaymentError(result.message || copy.errors.paymentFailed);
      }
    } catch {
      setPaymentError(copy.errors.gatewayFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp confirm text
  // Not: ikinci satirdaki ${"    "} orijinal metindeki 4 bosluklu satiri birebir korur
  const getWhatsAppMessage = () => {
    const text = `${copy.whatsapp.hello}
${"    "}
📝 ${copy.whatsapp.bookingNo}: ${bookingId}
🏨 ${copy.whatsapp.room}: ${selectedRoom?.title}
📅 ${copy.whatsapp.checkIn}: ${checkIn}
📅 ${copy.whatsapp.checkOut}: ${checkOut} (${nights} ${copy.payment.nights})
👥 ${copy.whatsapp.guest}: ${guests} ${copy.payment.adults}
🌸 ${copy.whatsapp.scent}: ${scent.label}
🪶 ${copy.whatsapp.pillow}: ${pillow.label}
🔊 ${copy.whatsapp.sound}: ${sound.label}
💡 ${copy.whatsapp.light}: ${light.label}
💰 ${copy.whatsapp.total}: ${finalPrice.toLocaleString("tr-TR")} ₺
👤 ${copy.whatsapp.guestName}: ${guestName} (${guestPhone})

${copy.whatsapp.closing}`;
    return getWhatsAppHref(text);
  };

  // Sihirbazi sifirla (success adimindaki "Yeni Rezervasyon" butonu)
  const resetWizard = () => {
    setStep("dates");
    setSelectedRoom(null);
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setConsent(false);
  };

  return {
    // Adim kontrolu
    step, setStep, locale, copy, options,
    // Tarih & konuk
    checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests,
    // Oda secimi
    selectedRoom, setSelectedRoom,
    // Duyusal tercihler
    scent, setScent, pillow, setPillow, sound, setSound, light, setLight,
    // Misafir & fatura
    guestName, setGuestName, guestEmail, setGuestEmail, guestPhone, setGuestPhone,
    consent, setConsent,
    bookingId, setBookingId,
    // Gonderim durumu
    isSubmitting, setIsSubmitting, paymentError, setPaymentError,
    // Turetilmis degerler
    nights, totalRawPrice, finalPrice,
    // Handler'lar
    handlePaymentSubmit, getWhatsAppMessage, resetWizard,
  };
}
