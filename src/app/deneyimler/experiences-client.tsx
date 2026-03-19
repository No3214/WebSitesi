"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Wine, Leaf, Utensils, Compass, Coffee, Music } from "lucide-react";

const experiences = [
  {
    icon: Wine,
    title: "Ege Şarap Tadımı",
    text: "Foça ve çevresindeki butik bağlardan seçilmiş Ege şarapları, peynir eşleştirmesi ve somelier rehberliğinde tadım akşamı.",
    duration: "2 saat",
    capacity: "8-20 kişi",
    image: "/images/rooms/aile-5.jpeg",
  },
  {
    icon: Utensils,
    title: "Gastronomi Atölyesi",
    text: "İnci Hanım'ın eşliğinde Antakya & Ege mutfağından seçme tarifleri bizzat pişirin. Sac kavurma, zeytinyağlılar ve taş fırın ekmek.",
    duration: "3 saat",
    capacity: "6-12 kişi",
    image: "/images/rooms/standart-4.jpeg",
  },
  {
    icon: Leaf,
    title: "Zeytinyağı Hasadı",
    text: "Mevsiminde zeytinyağı hasadına katılın. Bahçeden sofraya yolculuğu deneyimleyin ve organik zeytinyağı ile eve dönün.",
    duration: "Yarım gün",
    capacity: "4-15 kişi",
    image: "/images/rooms/bahce-2.jpeg",
  },
  {
    icon: Compass,
    title: "Küratörlü Foça Kaçamağı",
    text: "Tekne turu, köy rotası, tarihi Foça sokakları ve gastronomi deneyimi tek pakette. Rehber eşliğinde Ege'yi keşfedin.",
    duration: "Tam gün",
    capacity: "2-10 kişi",
    image: "/images/rooms/deniz-3.jpeg",
  },
  {
    icon: Coffee,
    title: "Taş Dibek Kahve Ritüeli",
    text: "180 yıllık taş dibekte Türk kahvesi hazırlama deneyimi. Kahvenin hikayesini öğrenin, kendi kahvenizi dövün.",
    duration: "45 dakika",
    capacity: "2-8 kişi",
    image: "/images/rooms/uc-kisilik-1.jpeg",
  },
  {
    icon: Music,
    title: "Canlı Müzik Akşamları",
    text: "Seçili akşamlarda avluda canlı müzik eşliğinde özel menü. Ege'nin yıldızları altında romantik bir gece.",
    duration: "Akşam",
    capacity: "Açık",
    image: "/images/rooms/balkonlu-aile-2.jpeg",
  },
];

export function ExperiencesClient() {
  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow="DENEYİMLER" title="Sadece Konaklama Değil" text="Kozbeyli Konağı'nda gastronomi, kültür ve doğa ile bütünleşen premium deneyimler." />
            </FadeIn>

            <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
              {experiences.map((exp, idx) => {
                const Icon = exp.icon;
                const isReversed = idx % 2 === 1;
                return (
                  <FadeIn key={idx}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }} className="exp-grid">
                      <div style={{ order: isReversed ? 2 : 1 }}>
                        <div style={{ position: "relative", height: "360px" }}>
                          <Image src={exp.image} alt={exp.title} fill className="object-cover" sizes="50vw" />
                        </div>
                      </div>
                      <div style={{ order: isReversed ? 1 : 2 }}>
                        <Icon size={28} style={{ color: "var(--gold)", marginBottom: "12px" }} />
                        <h3 className="serif" style={{ fontSize: "1.6rem", marginBottom: "12px", color: "var(--olive)" }}>{exp.title}</h3>
                        <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "20px" }}>{exp.text}</p>
                        <div style={{ display: "flex", gap: "16px", fontSize: "0.82rem", color: "#999", marginBottom: "24px" }}>
                          <span>⏱ {exp.duration}</span>
                          <span>👥 {exp.capacity}</span>
                        </div>
                        <Link href="https://wa.me/905322342686" className="button primary" target="_blank" rel="noreferrer">
                          Bilgi Al & Rezervasyon
                        </Link>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.exp-grid) {
            grid-template-columns: 1fr !important;
          }
          :global(.exp-grid > div) {
            order: unset !important;
          }
        }
      `}</style>
    </>
  );
}
