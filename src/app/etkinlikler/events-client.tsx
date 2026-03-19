"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const upcomingEvents = [
  {
    title: "Canlı Müzik: Ege Akşamı",
    date: "Her Cuma & Cumartesi",
    time: "20:30 – 23:00",
    location: "Avlu",
    description: "Akustik gitar ve Ege şarkıları eşliğinde özel menü. Meze tabağı, ana yemek ve şarap dahil.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    capacity: "Sınırlı kontenjan",
  },
  {
    title: "Şarap & Peynir Akşamı",
    date: "Ayda 2 kez (Cumartesi)",
    time: "19:00 – 21:30",
    location: "Restoran",
    description: "Ege bağlarından seçme şaraplar, yerel peynirler ve somelier rehberliğinde tadım deneyimi.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    capacity: "20 kişi",
  },
  {
    title: "Gastronomi Workshop: Antakya Mutfağı",
    date: "Ayda 1 kez (Pazar)",
    time: "11:00 – 14:00",
    location: "Mutfak",
    description: "İnci Hanım'la birlikte Antakya mutfağının sırlarını öğrenin. Sac kavurma, lahmacun ve ev baklavası.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    capacity: "12 kişi",
  },
  {
    title: "Mevsimsel: Zeytin Hasadı Festivali",
    date: "Kasım – Aralık",
    time: "10:00 – 16:00",
    location: "Bahçe & Zeytin Tarlası",
    description: "Zeytinyağı üretim sürecine katılın, hasat yapın ve kendi zeytinyağınızı eve götürün. Öğle yemeği dahil.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbadb8c5?auto=format&fit=crop&w=800&q=80",
    capacity: "15 kişi",
  },
];

export function EventsClient() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow="ETKİNLİKLER" title="Yaklaşan Etkinlikler" text="Kozbeyli Konağı'nda kültür, gastronomi ve müzik bir arada." />
            </FadeIn>

            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {upcomingEvents.map((event, idx) => (
                <FadeIn key={idx} delay={idx * 0.08}>
                  <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "32px", background: "var(--white)", border: "1px solid var(--border)", overflow: "hidden" }} className="event-card">
                    <div style={{ position: "relative", minHeight: "240px" }}>
                      <Image src={event.image} alt={event.title} fill className="object-cover" sizes="320px" />
                    </div>
                    <div style={{ padding: "32px 32px 32px 0" }}>
                      <h3 className="serif" style={{ fontSize: "1.4rem", marginBottom: "16px", color: "var(--olive)" }}>{event.title}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px", fontSize: "0.85rem", color: "#888" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={14} /> {event.date}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {event.time}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} /> {event.location}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={14} /> {event.capacity}</span>
                      </div>
                      <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "20px" }}>{event.description}</p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <Link href="https://wa.me/905322342686" className="button primary" target="_blank" rel="noreferrer">
                          Rezervasyon Yap
                        </Link>
                        <Link href="tel:+902328261112" className="button secondary">
                          Bilgi Al
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.event-card) {
            grid-template-columns: 1fr !important;
          }
          :global(.event-card > div:last-child) {
            padding: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
