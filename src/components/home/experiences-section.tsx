"use client";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const experiences = [
  {
    no: "01",
    title: { tr: "Antakya & Ege Gastronomisi", en: "Antakya & Aegean Gastronomy" },
    text: {
      tr: "İnci Hanım'ın aile reçeteleri, Ege ürünleri ve taş dibekte hazırlanan kahve ritüeli.",
      en: "İnci Hanım's family recipes, Aegean produce and the coffee ritual prepared in a stone dibek.",
    },
  },
  {
    no: "02",
    title: { tr: "Varış & Konaklama Planlama", en: "Arrival & Stay Planning" },
    text: {
      tr: "Varış saatinizi, oda tercihlerinizi ve özel ihtiyaçlarınızı misafir ilişkileri ekibimizle paylaşın.",
      en: "Share your arrival time, room preferences and special requirements with our guest relations team.",
    },
  },
  {
    no: "03",
    title: { tr: "Foça Rotası", en: "Foça Route" },
    text: {
      tr: "Köy rotaları, sahil önerileri ve gastronomi durakları için ekibimizden güncel öneriler alın.",
      en: "Ask our team for current recommendations on village routes, coastal stops and local gastronomy.",
    },
  },
];

export function ExperiencesSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section" id="experiences">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MİSAFİR DENEYİMİ" : "GUEST EXPERIENCE"}
            title={locale === "tr" ? "Konağın Deneyimleri" : "Experiences at the Mansion"}
            text={
              locale === "tr"
                ? "Konaklama, gastronomi ve Foça keşfini kendi seyahat ritminize göre planlayın."
                : "Plan your stay, gastronomy and exploration of Foça around your own travel rhythm."
            }
          />
        </FadeIn>
        <div className="feature-grid">
          {experiences.map((item, index) => (
            <FadeIn key={item.no} delay={index * 0.12}>
              <div className="feature-box">
                <span className="feature-no" aria-hidden>
                  {item.no}
                </span>
                <h3>{item.title[locale]}</h3>
                <p>{item.text[locale]}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
