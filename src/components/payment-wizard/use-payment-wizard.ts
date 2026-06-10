"use client";

import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Room } from "@/data/rooms";
import { getWhatsAppHref } from "@/lib/contact";
import { Step, SCENTS, PILLOWS, SOUNDS, LIGHTS } from "./types";

// Sihirbazin tum state'i, turetilmis degerleri ve handler'lari tek hook'ta
export function usePaymentWizard() {
  const [step, setStep] = useState<Step>("dates");

  // State variables
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Sensory customization
  const [scent, setScent] = useState(SCENTS[0]);
  const [pillow, setPillow] = useState(PILLOWS[0]);
  const [sound, setSound] = useState(SOUNDS[0]);
  const [light, setLight] = useState(LIGHTS[0]);

  // Billing & Payment
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Mock CC State
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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
    const diffTime = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Calculate prices
  const totalRawPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    // Extract numeric estimation from room base price or use static multiplier
    let rate = 4500;
    if (selectedRoom.slug.includes("superior")) rate = 8500;
    else if (selectedRoom.slug.includes("aile")) rate = 7500;
    else if (selectedRoom.slug.includes("uc-kisilik")) rate = 6000;
    return rate * nights;
  }, [selectedRoom, nights]);

  const discountAmount = useMemo(() => {
    return isPromoApplied ? totalRawPrice * 0.15 : 0;
  }, [totalRawPrice, isPromoApplied]);

  const finalPrice = useMemo(() => {
    return totalRawPrice - discountAmount;
  }, [totalRawPrice, discountAmount]);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SLOWROTA15") {
      setIsPromoApplied(true);
      setPaymentError("");
    } else {
      setPaymentError("Geçersiz indirim kodu.");
    }
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setPaymentError("Lütfen tüm alanları doldurun.");
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
          promoCode: isPromoApplied ? "SLOWROTA15" : "",
          totalPrice: finalPrice,
          cardNumber: cardNumber.replace(/\s+/g, ""), // sanitized
        })
      });

      const result = await res.json();
      if (res.ok && result.ok) {
        setStep("success");
      } else {
        setPaymentError(result.message || "Ödeme işlemi gerçekleştirilemedi.");
      }
    } catch {
      setPaymentError("Ödeme ağ geçidine bağlanılamadı. Lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp confirm text
  // Not: ikinci satirdaki ${"    "} orijinal metindeki 4 bosluklu satiri birebir korur
  const getWhatsAppMessage = () => {
    const text = `Merhaba Kozbeyli Konağı, web sitenizden interaktif rezervasyon gerçekleştirdim.
${"    "}
📝 Rezervasyon No: ${bookingId}
🏨 Oda: ${selectedRoom?.title}
📅 Giriş: ${checkIn}
📅 Çıkış: ${checkOut} (${nights} Gece)
👥 Konuk: ${guests} Yetişkin
🌸 Oda Kokusu: ${scent.label}
🪶 Yastık Menüsü: ${pillow.label}
🔊 Ses Atmosferi: ${sound.label}
💡 Işık Tercihi: ${light.label}
💰 Toplam Tutar: ${finalPrice.toLocaleString("tr-TR")} ₺
👤 Misafir: ${guestName} (${guestPhone})

Rezervasyonumun onaylanmasını rica ederim.`;
    return getWhatsAppHref(text);
  };

  // Sihirbazi sifirla (success adimindaki "Yeni Rezervasyon" butonu)
  const resetWizard = () => {
    setStep("dates");
    setSelectedRoom(null);
    setIsPromoApplied(false);
    setPromoCode("");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setCardNumber("");
    setCardHolder("");
    setCardExpiry("");
    setCardCvv("");
  };

  return {
    // Adim kontrolu
    step, setStep,
    // Tarih & konuk
    checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests,
    // Oda secimi
    selectedRoom, setSelectedRoom,
    // Duyusal tercihler
    scent, setScent, pillow, setPillow, sound, setSound, light, setLight,
    // Misafir & fatura
    guestName, setGuestName, guestEmail, setGuestEmail, guestPhone, setGuestPhone,
    promoCode, setPromoCode, isPromoApplied, setIsPromoApplied, bookingId, setBookingId,
    // Kart (mock)
    cardNumber, setCardNumber, cardHolder, setCardHolder,
    cardExpiry, setCardExpiry, cardCvv, setCardCvv,
    // Gonderim durumu
    isSubmitting, setIsSubmitting, paymentError, setPaymentError,
    // Turetilmis degerler
    nights, totalRawPrice, discountAmount, finalPrice,
    // Handler'lar
    applyPromo, handlePaymentSubmit, getWhatsAppMessage, resetWizard,
  };
}
