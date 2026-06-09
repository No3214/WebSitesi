"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Users, Sparkles, CreditCard, CheckCircle2, 
  Wind, Volume2, ShieldCheck, ArrowRight, ArrowLeft 
} from "lucide-react";
import { rooms, Room } from "@/data/rooms";
import { getWhatsAppHref } from "@/lib/contact";

type Step = "dates" | "rooms" | "sensory" | "payment" | "success";

const SCENTS = [
  { id: "zeytin", label: "Zeytin Çiçeği", desc: "Ege esintili, tazeleyici ve ferahlatıcı hafif çiçek kokusu." },
  { id: "adasayi", label: "Dağ Adaçayı", desc: "Zihni berraklaştıran, rahatlatıcı ve antiseptik yerel dağ kokusu." },
  { id: "sedir", label: "Sedir Ağacı", desc: "Sıcak odunsu notalar, derin toprak kokusu ve uyku kalitesini artıran etki." }
];

const PILLOWS = [
  { id: "kaztuyu", label: "Kaz Tüyü", desc: "Ultra yumuşak ve ergonomik, lüks otel standardı uyku keyfi." },
  { id: "ortopedik", label: "Ortopedik Visco", desc: "Boyun ve sırt desteği sağlayan, vücut ısısına duyarlı özel yastık." },
  { id: "lavanta", label: "Lavanta Dolgulu", desc: "İçerisindeki lavanta tanecikleriyle gevşetici, uykuyu kolaylaştıran doğal yastık." }
];

const SOUNDS = [
  { id: "kus", label: "Avlu Kuş Sesleri", icon: Volume2, desc: "Konak avlusunun dinlendirici sabah kuş melodileri." },
  { id: "poyraz", label: "Ege Poyrazı & Dalgalar", icon: Wind, desc: "Foça kıyılarının serin rüzgarı ve dalga hışırtısı." },
  { id: "sukunet", label: "Derin Sükunet (Muted)", icon: ShieldCheck, desc: "Sıfır ses, kalın taş duvarların sunduğu mutlak izolasyon." }
];

const LIGHTS = [
  { id: "mum", label: "Mum Işığı Sıcaklığı", color: "#f59e0b", desc: "2700K ultra sıcak, romantik ve dinlendirici loş ışık." },
  { id: "gunbatimi", label: "Gün Batımı Kızıllığı", color: "#ea580c", desc: "Ege gün batımının kızıl tonlarını odanıza taşıyan sıcaklık." },
  { id: "dogal", label: "Doğal Günışığı", color: "#eab308", desc: "Güne dinç başlamanızı sağlayan berrak günışığı tonu." }
];

export function PaymentWizard() {
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
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
  const getWhatsAppMessage = () => {
    const text = `Merhaba Kozbeyli Konağı, web sitenizden interaktif rezervasyon gerçekleştirdim.
    
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

  return (
    <div className="payment-wizard-container" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px", minHeight: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
      {/* Step Indicators */}
      {step !== "success" && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: "18px" }}>
          <span style={{ color: step === "dates" ? "var(--gold)" : "var(--olive)" }}>1. Tarihler</span>
          <span style={{ color: step === "rooms" ? "var(--gold)" : selectedRoom ? "var(--olive)" : "#ccc" }}>2. Odalar</span>
          <span style={{ color: step === "sensory" ? "var(--gold)" : step === "payment" ? "var(--olive)" : "#ccc" }}>3. Atmosfer</span>
          <span style={{ color: step === "payment" ? "var(--gold)" : "#ccc" }}>4. Ödeme</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "dates" && (
          <motion.div
            key="step-dates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: "grid", gap: 24 }}
          >
            <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)" }}>Tarih ve Konuk Seçimi</h3>
            <p className="muted" style={{ marginTop: "-12px", fontSize: "0.95rem" }}>
              Kozbeyli&apos;nin eşsiz taş dokusunda sükuneti deneyimlemek istediğiniz tarih aralığını belirleyin.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
                  <Calendar size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
                  Giriş Tarihi
                </label>
                <input 
                  type="date" 
                  value={checkIn} 
                  onChange={(e) => setCheckIn(e.target.value)} 
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
                  <Calendar size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
                  Çıkış Tarihi
                </label>
                <input 
                  type="date" 
                  value={checkOut} 
                  onChange={(e) => setCheckOut(e.target.value)} 
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--olive)" }}>
                  <Users size={14} style={{ inlineSize: 14, verticalAlign: "middle", marginRight: 6 }} />
                  Konuk Sayısı
                </label>
                <select 
                  value={guests} 
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 6, fontSize: "1rem", outline: "none", background: "transparent" }}
                >
                  <option value={1}>1 Yetişkin</option>
                  <option value={2}>2 Yetişkin</option>
                  <option value={3}>3 Yetişkin</option>
                  <option value={4}>4 Yetişkin / Aile</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button 
                onClick={() => setStep("rooms")} 
                className="button primary"
                disabled={!checkIn || !checkOut}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                Odaları Listele <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === "rooms" && (
          <motion.div
            key="step-rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", margin: 0 }}>Oda Seçimi</h3>
              <span style={{ fontSize: "0.9rem", color: "var(--gold)", fontWeight: 600 }}>{nights} Gece Konaklama</span>
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
                      <div className="muted" style={{ fontSize: "0.8rem", marginTop: 2 }}>{rate.toLocaleString("tr-TR")} ₺ / gece</div>
                      <button 
                        className={`button sm ${isSelected ? "primary" : "secondary"}`}
                        style={{ marginTop: 10, padding: "6px 14px", fontSize: "0.75rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          setStep("sensory");
                        }}
                      >
                        {isSelected ? "Seçildi" : "Seç"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep("dates")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowLeft size={16} /> Geri
              </button>
              <button 
                onClick={() => setStep("sensory")} 
                className="button primary"
                disabled={!selectedRoom}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                Atmosfer Tercihleri <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === "sensory" && (
          <motion.div
            key="step-sensory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: "grid", gap: 24 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={20} style={{ color: "var(--gold)" }} />
              <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", margin: 0 }}>Duyusal Oda Atmosferi</h3>
            </div>
            <p className="muted" style={{ marginTop: "-12px", fontSize: "0.95rem" }}>
              Odanızın fiziksel detaylarını gelmeden önce kişiselleştirin. Bu tercihler siz giriş yapmadan odanıza uygulanacaktır.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              {/* Scent */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Oda Kokusu</span>
                <select 
                  value={scent.id} 
                  onChange={(e) => setScent(SCENTS.find(s => s.id === e.target.value) || SCENTS[0])}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
                >
                  {SCENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{scent.desc}</p>
              </div>

              {/* Pillow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Yastık Menüsü</span>
                <select 
                  value={pillow.id} 
                  onChange={(e) => setPillow(PILLOWS.find(p => p.id === e.target.value) || PILLOWS[0])}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
                >
                  {PILLOWS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{pillow.desc}</p>
              </div>

              {/* Sound */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Ses Teması</span>
                <select 
                  value={sound.id} 
                  onChange={(e) => setSound(SOUNDS.find(s => s.id === e.target.value) || SOUNDS[0])}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
                >
                  {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{sound.desc}</p>
              </div>

              {/* Light */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--olive)" }}>Aydınlatma Modu</span>
                <select 
                  value={light.id} 
                  onChange={(e) => setLight(LIGHTS.find(l => l.id === e.target.value) || LIGHTS[0])}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "transparent" }}
                >
                  {LIGHTS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
                <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: light.color, marginRight: 6 }}></span>
                  {light.desc}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("rooms")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowLeft size={16} /> Geri
              </button>
              <button onClick={() => setStep("payment")} className="button primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Ödeme ve Fatura <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="step-payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}
          >
            {/* Form Side */}
            <form onSubmit={handlePaymentSubmit} style={{ display: "grid", gap: 18 }}>
              <h3 className="serif" style={{ fontSize: "1.7rem", color: "var(--olive)", marginBottom: 0 }}>Misafir & Fatura Bilgileri</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input 
                  placeholder="Ad Soyad" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
                />
                <input 
                  placeholder="Telefon" 
                  value={guestPhone} 
                  onChange={(e) => setGuestPhone(e.target.value)} 
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
                />
              </div>
              <input 
                placeholder="E-posta Adresi" 
                type="email" 
                value={guestEmail} 
                onChange={(e) => setGuestEmail(e.target.value)} 
                required
                style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <CreditCard size={18} style={{ color: "var(--olive)" }} />
                <h4 className="serif" style={{ margin: 0, fontSize: "1.15rem" }}>Kart Bilgileri</h4>
              </div>

              <input 
                placeholder="Kart Numarası (16 Hane)" 
                maxLength={19}
                value={cardNumber} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                  setCardNumber(val);
                }} 
                required
                style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                <input 
                  placeholder="Kart Üzerindeki İsim" 
                  value={cardHolder} 
                  onChange={(e) => setCardHolder(e.target.value)} 
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6 }}
                />
                <input 
                  placeholder="AA/YY" 
                  maxLength={5}
                  value={cardExpiry} 
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    setCardExpiry(val);
                  }} 
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, textAlign: "center" }}
                />
                <input 
                  placeholder="CVV" 
                  maxLength={3}
                  value={cardCvv} 
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))} 
                  required
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 6, textAlign: "center" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input 
                  placeholder="İndirim Kodu" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value)} 
                  style={{ flex: 1, padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}
                />
                <button 
                  type="button" 
                  onClick={applyPromo} 
                  className="button secondary sm"
                  style={{ padding: "10px 18px" }}
                >
                  Uygula
                </button>
              </div>

              {paymentError && <p style={{ color: "#c2410c", fontSize: "0.85rem", margin: 0 }}>{paymentError}</p>}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <button type="button" onClick={() => setStep("sensory")} className="button secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ArrowLeft size={16} /> Geri
                </button>
                <button 
                  type="submit" 
                  className="button primary" 
                  disabled={isSubmitting}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  {isSubmitting ? "Ödeniyor..." : `Ödeme Yap (${finalPrice.toLocaleString("tr-TR")} ₺)`}
                </button>
              </div>
            </form>

            {/* Receipt Summary Side */}
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              <h4 className="serif" style={{ fontSize: "1.35rem", color: "var(--olive)", margin: 0 }}>Özet</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem" }}>
                <div><strong>Seçilen Oda:</strong> {selectedRoom?.title}</div>
                <div><strong>Giriş:</strong> {checkIn}</div>
                <div><strong>Çıkış:</strong> {checkOut}</div>
                <div><strong>Süre:</strong> {nights} Gece</div>
                <div><strong>Konuk:</strong> {guests} Yetişkin</div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 700, color: "var(--gold)" }}>Oda Tercihleriniz:</span>
                <div>🌸 Koku: {scent.label}</div>
                <div>🪶 Yastık: {pillow.label}</div>
                <div>🔊 Ses: {sound.label}</div>
                <div>💡 Işık: {light.label}</div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span>Toplam Oda Tutarı:</span>
                  <span>{totalRawPrice.toLocaleString("tr-TR")} ₺</span>
                </div>
                {isPromoApplied && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#c5a059", fontSize: "0.9rem" }}>
                    <span>%15 Slow Living İndirimi:</span>
                    <span>-{discountAmount.toLocaleString("tr-TR")} ₺</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.2rem", color: "var(--olive)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <span>Ödenecek Tutar:</span>
                  <span>{finalPrice.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(61, 74, 59, 0.05)", padding: 12, borderRadius: 8, fontSize: "0.78rem", color: "var(--olive)", marginTop: 12 }}>
                <ShieldCheck size={16} />
                <span>256-bit SSL Güvenli Altyapı (iyzico Ödeme Geçidi)</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", display: "grid", gap: 24, padding: "20px 0" }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CheckCircle2 size={64} style={{ color: "var(--olive)" }} />
            </div>
            
            <h3 className="serif" style={{ fontSize: "2rem", color: "var(--olive)", margin: 0 }}>Rezervasyon Talebiniz Alındı!</h3>
            <p className="muted" style={{ maxWidth: 600, margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.6 }}>
              Teşekkür ederiz, <strong>{guestName}</strong>. Ödemeniz başarıyla doğrulanmıştır. Rezervasyon detaylarınız ve atmosfer kişiselleştirme seçimleriniz sisteme kaydedildi.
            </p>

            <div style={{ background: "var(--soft)", padding: 24, borderRadius: 10, maxWidth: 500, margin: "0 auto", textAlign: "left", display: "grid", gap: 10, fontSize: "0.95rem" }}>
              <div><strong>Rezervasyon Numarası:</strong> <span style={{ color: "var(--gold)", fontWeight: 700 }}>{bookingId}</span></div>
              <div><strong>Oda Tipi:</strong> {selectedRoom?.title}</div>
              <div><strong>Giriş / Çıkış:</strong> {checkIn} — {checkOut} ({nights} Gece)</div>
              <div><strong>Atmosfer Tercihleri:</strong></div>
              <div style={{ paddingLeft: 16, fontSize: "0.85rem", opacity: 0.85 }}>
                • Koku: {scent.label} <br />
                • Yastık: {pillow.label} <br />
                • Ses: {sound.label} <br />
                • Işık: {light.label}
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Tahsil Edilen Tutar:</span>
                <span>{finalPrice.toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
              <a 
                href={getWhatsAppMessage()} 
                target="_blank" 
                rel="noreferrer" 
                className="button primary"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                WhatsApp Resepsiyona Bildir
              </a>
              <button 
                onClick={() => {
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
                }} 
                className="button secondary"
              >
                Yeni Rezervasyon
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
