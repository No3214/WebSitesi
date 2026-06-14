"use client";

import { Volume2, Wind, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Rezervasyon sihirbazi adimlari
export type Step = "dates" | "rooms" | "sensory" | "payment" | "success";
export type BookingLocale = "tr" | "en";
export type WizardOption = { id: string; label: string; desc: string };
export type SoundOption = WizardOption & { icon: LucideIcon };
export type LightOption = WizardOption & { color: string };

// Duyusal atmosfer secenek sabitleri
export const SCENTS: WizardOption[] = [
  { id: "zeytin", label: "Zeytin Çiçeği", desc: "Ege esintili, tazeleyici ve ferahlatıcı hafif çiçek kokusu." },
  { id: "adasayi", label: "Dağ Adaçayı", desc: "Zihni berraklaştıran, rahatlatıcı ve antiseptik yerel dağ kokusu." },
  { id: "sedir", label: "Sedir Ağacı", desc: "Sıcak odunsu notalar, derin toprak kokusu ve uyku kalitesini artıran etki." }
];

export const PILLOWS: WizardOption[] = [
  { id: "kaztuyu", label: "Kaz Tüyü", desc: "Ultra yumuşak ve ergonomik, lüks otel standardı uyku keyfi." },
  { id: "ortopedik", label: "Ortopedik Visco", desc: "Boyun ve sırt desteği sağlayan, vücut ısısına duyarlı özel yastık." },
  { id: "lavanta", label: "Lavanta Dolgulu", desc: "İçerisindeki lavanta tanecikleriyle gevşetici, uykuyu kolaylaştıran doğal yastık." }
];

export const SOUNDS: SoundOption[] = [
  { id: "kus", label: "Avlu Kuş Sesleri", icon: Volume2, desc: "Konak avlusunun dinlendirici sabah kuş melodileri." },
  { id: "poyraz", label: "Ege Poyrazı & Dalgalar", icon: Wind, desc: "Foça kıyılarının serin rüzgarı ve dalga hışırtısı." },
  { id: "sukunet", label: "Derin Sükunet (Muted)", icon: ShieldCheck, desc: "Sıfır ses, kalın taş duvarların sunduğu mutlak izolasyon." }
];

export const LIGHTS: LightOption[] = [
  { id: "mum", label: "Mum Işığı Sıcaklığı", color: "#f59e0b", desc: "2700K ultra sıcak, romantik ve dinlendirici loş ışık." },
  { id: "gunbatimi", label: "Gün Batımı Kızıllığı", color: "#ea580c", desc: "Ege gün batımının kızıl tonlarını odanıza taşıyan sıcaklık." },
  { id: "dogal", label: "Doğal Günışığı", color: "#eab308", desc: "Güne dinç başlamanızı sağlayan berrak günışığı tonu." }
];

export const WIZARD_OPTIONS = {
  tr: {
    scents: SCENTS,
    pillows: PILLOWS,
    sounds: SOUNDS,
    lights: LIGHTS,
  },
  en: {
    scents: [
      { id: "zeytin", label: "Olive Blossom", desc: "A light, refreshing floral note inspired by the Aegean breeze." },
      { id: "adasayi", label: "Mountain Sage", desc: "A calming local mountain aroma with a clear, herbal finish." },
      { id: "sedir", label: "Cedarwood", desc: "Warm woody notes with a grounded, sleep-friendly character." },
    ],
    pillows: [
      { id: "kaztuyu", label: "Goose Down", desc: "Ultra-soft, ergonomic comfort in a luxury hotel standard." },
      { id: "ortopedik", label: "Orthopedic Visco", desc: "A supportive pillow shaped for neck and back comfort." },
      { id: "lavanta", label: "Lavender Filled", desc: "A natural pillow with lavender notes for a calmer sleep ritual." },
    ],
    sounds: [
      { id: "kus", label: "Courtyard Birdsong", icon: Volume2, desc: "Gentle morning birdsong from the mansion courtyard." },
      { id: "poyraz", label: "Aegean Breeze & Waves", icon: Wind, desc: "The cool Foça breeze with a soft coastal wave texture." },
      { id: "sukunet", label: "Deep Quiet (Muted)", icon: ShieldCheck, desc: "Zero sound, shaped by the natural insulation of thick stone walls." },
    ],
    lights: [
      { id: "mum", label: "Candle-Warm Light", color: "#f59e0b", desc: "An ultra-warm 2700K tone for a romantic, restful room." },
      { id: "gunbatimi", label: "Sunset Amber", color: "#ea580c", desc: "Warm amber tones inspired by the Aegean sunset." },
      { id: "dogal", label: "Natural Daylight", color: "#eab308", desc: "A clear daylight tone for a brighter morning start." },
    ],
  },
} satisfies Record<BookingLocale, {
  scents: WizardOption[];
  pillows: WizardOption[];
  sounds: SoundOption[];
  lights: LightOption[];
}>;

export const WIZARD_COPY = {
  tr: {
    steps: ["1. Tarihler", "2. Odalar", "3. Atmosfer", "4. Talep"],
    dates: {
      title: "Tarih ve Konuk Seçimi",
      intro: "Kozbeyli'nin eşsiz taş dokusunda sükuneti deneyimlemek istediğiniz tarih aralığını belirleyin.",
      checkIn: "Giriş Tarihi",
      checkOut: "Çıkış Tarihi",
      guests: "Konuk Sayısı",
      guestOptions: ["1 Yetişkin", "2 Yetişkin", "3 Yetişkin", "4 Yetişkin / Aile"],
      next: "Odaları Listele",
    },
    rooms: {
      title: "Oda Seçimi",
      stay: "Gece Konaklama",
      perNight: "gece",
      selected: "Seçildi",
      select: "Seç",
      back: "Geri",
      next: "Atmosfer Tercihleri",
    },
    sensory: {
      title: "Duyusal Oda Atmosferi",
      intro: "Odanızın fiziksel detaylarını gelmeden önce kişiselleştirin. Bu tercihler siz giriş yapmadan odanıza uygulanacaktır.",
      scent: "Oda Kokusu",
      pillow: "Yastık Menüsü",
      sound: "Ses Teması",
      light: "Aydınlatma Modu",
      back: "Geri",
      next: "Ödeme ve Fatura",
    },
    payment: {
      title: "Misafir & Fatura Bilgileri",
      notice: "Bu adım bir ön-rezervasyon talebidir — kart bilgisi istemiyoruz. Ödemeniz, Garanti BBVA Sanal POS güvenli 3D Secure ödeme sayfası üzerinden alınacaktır; ekibimiz onay ve ödeme adımı için sizinle iletişime geçecek.",
      name: "Ad Soyad",
      phone: "Telefon",
      email: "E-posta Adresi",
      consentBefore: "Ön-rezervasyon talebimin değerlendirilmesi için kişisel verilerimin",
      kvkk: "KVKK aydınlatma metni",
      privacy: "gizlilik politikası",
      consentAfter: "kapsamında işlenmesini onaylıyorum.",
      back: "Geri",
      submitting: "Gönderiliyor...",
      submit: "Rezervasyon Talebini Gönder",
      summary: "Özet",
      selectedRoom: "Seçilen Oda:",
      checkIn: "Giriş:",
      checkOut: "Çıkış:",
      duration: "Süre:",
      guests: "Konuk:",
      adults: "Yetişkin",
      nights: "Gece",
      preferences: "Oda Tercihleriniz:",
      scent: "Koku:",
      pillow: "Yastık:",
      sound: "Ses:",
      light: "Işık:",
      roomTotal: "Toplam Oda Tutarı:",
      due: "Ödenecek Tutar:",
      cardSafety: "Kart bilgileriniz yalnızca Garanti BBVA'nın güvenli ödeme sayfasında işlenir; bu sitede saklanmaz",
    },
    success: {
      title: "Rezervasyon Talebiniz Alındı!",
      bodyPrefix: "Teşekkür ederiz,",
      bodySuffix: "Rezervasyon talebiniz ve atmosfer kişiselleştirme seçimleriniz sisteme kaydedildi. Ödeme bilgisi alınmadı — ekibimiz 24 saat içinde teyit için sizinle iletişime geçecek; tahsilat, Garanti BBVA Sanal POS güvenli ödeme adımıyla tamamlanacak.",
      bookingNo: "Rezervasyon Numarası:",
      roomType: "Oda Tipi:",
      dates: "Giriş / Çıkış:",
      preferences: "Atmosfer Tercihleri:",
      collected: "Tahsil Edilen Tutar:",
      whatsapp: "WhatsApp Resepsiyona Bildir",
      reset: "Yeni Rezervasyon",
    },
    errors: {
      missingFields: "Lütfen ad, telefon ve e-posta alanlarını doldurun.",
      missingConsent: "Rezervasyon talebi için KVKK ve gizlilik onayı zorunludur.",
      paymentFailed: "Ödeme işlemi gerçekleştirilemedi.",
      gatewayFailed: "Ödeme ağ geçidine bağlanılamadı. Lütfen tekrar deneyiniz.",
    },
    whatsapp: {
      hello: "Merhaba Kozbeyli Konağı, web sitenizden interaktif rezervasyon gerçekleştirdim.",
      bookingNo: "Rezervasyon No",
      room: "Oda",
      checkIn: "Giriş",
      checkOut: "Çıkış",
      guest: "Konuk",
      scent: "Oda Kokusu",
      pillow: "Yastık Menüsü",
      sound: "Ses Atmosferi",
      light: "Işık Tercihi",
      total: "Toplam Tutar",
      guestName: "Misafir",
      closing: "Rezervasyonumun onaylanmasını rica ederim.",
    },
  },
  en: {
    steps: ["1. Dates", "2. Rooms", "3. Atmosphere", "4. Request"],
    dates: {
      title: "Dates and Guests",
      intro: "Choose the dates for your stay in the calm historic texture of Kozbeyli Konağı.",
      checkIn: "Check-in Date",
      checkOut: "Check-out Date",
      guests: "Guest Count",
      guestOptions: ["1 Adult", "2 Adults", "3 Adults", "4 Adults / Family"],
      next: "List Rooms",
    },
    rooms: {
      title: "Room Selection",
      stay: "Night Stay",
      perNight: "night",
      selected: "Selected",
      select: "Select",
      back: "Back",
      next: "Atmosphere Preferences",
    },
    sensory: {
      title: "Room Atmosphere",
      intro: "Personalize your room details before arrival. These preferences are prepared before check-in.",
      scent: "Room Scent",
      pillow: "Pillow Menu",
      sound: "Sound Theme",
      light: "Lighting Mode",
      back: "Back",
      next: "Payment and Billing",
    },
    payment: {
      title: "Guest and Billing Details",
      notice: "This step is a pre-reservation request. We do not ask for card details here. Payment is completed through Garanti BBVA's secure 3D Secure virtual POS page; our team will contact you for confirmation and the payment step.",
      name: "Full Name",
      phone: "Phone",
      email: "Email Address",
      consentBefore: "I consent to the processing of my personal data under the",
      kvkk: "KVKK notice",
      privacy: "privacy policy",
      consentAfter: "for evaluation of my pre-reservation request.",
      back: "Back",
      submitting: "Sending...",
      submit: "Send Reservation Request",
      summary: "Summary",
      selectedRoom: "Selected Room:",
      checkIn: "Check-in:",
      checkOut: "Check-out:",
      duration: "Duration:",
      guests: "Guests:",
      adults: "Adults",
      nights: "Nights",
      preferences: "Room Preferences:",
      scent: "Scent:",
      pillow: "Pillow:",
      sound: "Sound:",
      light: "Light:",
      roomTotal: "Total Room Amount:",
      due: "Amount Due:",
      cardSafety: "Card details are processed only on Garanti BBVA's secure payment page; they are not stored on this site",
    },
    success: {
      title: "Your Reservation Request Has Been Received",
      bodyPrefix: "Thank you,",
      bodySuffix: "Your reservation request and atmosphere preferences were recorded. No payment details were collected. Our team will contact you within 24 hours for confirmation; payment is completed through Garanti BBVA's secure virtual POS step.",
      bookingNo: "Reservation Number:",
      roomType: "Room Type:",
      dates: "Check-in / Check-out:",
      preferences: "Atmosphere Preferences:",
      collected: "Amount Collected:",
      whatsapp: "Notify Reception on WhatsApp",
      reset: "New Reservation",
    },
    errors: {
      missingFields: "Please fill in name, phone and email fields.",
      missingConsent: "Privacy and KVKK consent is required for reservation requests.",
      paymentFailed: "The payment request could not be completed.",
      gatewayFailed: "The payment gateway could not be reached. Please try again.",
    },
    whatsapp: {
      hello: "Hello Kozbeyli Konağı, I completed an interactive reservation request on your website.",
      bookingNo: "Reservation No",
      room: "Room",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guest: "Guest",
      scent: "Room Scent",
      pillow: "Pillow Menu",
      sound: "Sound Atmosphere",
      light: "Light Preference",
      total: "Total Amount",
      guestName: "Guest",
      closing: "I kindly ask you to confirm my reservation request.",
    },
  },
} as const;
