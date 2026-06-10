"use client";

import { Volume2, Wind, ShieldCheck } from "lucide-react";

// Rezervasyon sihirbazi adimlari
export type Step = "dates" | "rooms" | "sensory" | "payment" | "success";

// Duyusal atmosfer secenek sabitleri
export const SCENTS = [
  { id: "zeytin", label: "Zeytin Çiçeği", desc: "Ege esintili, tazeleyici ve ferahlatıcı hafif çiçek kokusu." },
  { id: "adasayi", label: "Dağ Adaçayı", desc: "Zihni berraklaştıran, rahatlatıcı ve antiseptik yerel dağ kokusu." },
  { id: "sedir", label: "Sedir Ağacı", desc: "Sıcak odunsu notalar, derin toprak kokusu ve uyku kalitesini artıran etki." }
];

export const PILLOWS = [
  { id: "kaztuyu", label: "Kaz Tüyü", desc: "Ultra yumuşak ve ergonomik, lüks otel standardı uyku keyfi." },
  { id: "ortopedik", label: "Ortopedik Visco", desc: "Boyun ve sırt desteği sağlayan, vücut ısısına duyarlı özel yastık." },
  { id: "lavanta", label: "Lavanta Dolgulu", desc: "İçerisindeki lavanta tanecikleriyle gevşetici, uykuyu kolaylaştıran doğal yastık." }
];

export const SOUNDS = [
  { id: "kus", label: "Avlu Kuş Sesleri", icon: Volume2, desc: "Konak avlusunun dinlendirici sabah kuş melodileri." },
  { id: "poyraz", label: "Ege Poyrazı & Dalgalar", icon: Wind, desc: "Foça kıyılarının serin rüzgarı ve dalga hışırtısı." },
  { id: "sukunet", label: "Derin Sükunet (Muted)", icon: ShieldCheck, desc: "Sıfır ses, kalın taş duvarların sunduğu mutlak izolasyon." }
];

export const LIGHTS = [
  { id: "mum", label: "Mum Işığı Sıcaklığı", color: "#f59e0b", desc: "2700K ultra sıcak, romantik ve dinlendirici loş ışık." },
  { id: "gunbatimi", label: "Gün Batımı Kızıllığı", color: "#ea580c", desc: "Ege gün batımının kızıl tonlarını odanıza taşıyan sıcaklık." },
  { id: "dogal", label: "Doğal Günışığı", color: "#eab308", desc: "Güne dinç başlamanızı sağlayan berrak günışığı tonu." }
];
