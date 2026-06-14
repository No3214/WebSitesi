"use client";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const experiences = [
  {
    no: "01",
    title: { tr: "Antakya & Ege Gastronomisi", en: "Antakya & Aegean Gastronomy" },
    text: {
      tr: "İnci Hanım'ın özel reçeteleri, sac kavurma ve 500 yıllık taş dibekte dövülen taze kahve.",
      en: "İnci Hanım's special recipes, sac kavurma, and fresh coffee ground in a 500-year-old stone dibek.",
    },
  },
  {
    no: "02",
    title: { tr: "Transfer & Varış Planlama", en: "Transfer & Arrival Planning" },
    text: {
      tr: "İzmir Havalimanı transferi, varış saati ve oda tercihlerinizi misafir ilişkileri ekibimizle planlayın.",
      en: "Coordinate airport transfer, arrival time and room preferences with our concierge team.",
    },
  },
  {
    no: "03",
    title: { tr: "Küratörlü Foça Kaçamağı", en: "Curated Foça Escape" },
    text: {
      tr: "Tekne turu, köy rotası ve gastronomi deneyimi tek pakette.",
      en: "Boat tour, village route, and gastronomy experience in one package.",
    },
  },
];

export function ExperiencesSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section" id="experiences">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MİSAFİR DENEYİMİ" : "CONCIERGE"}
            title={locale === "tr" ? "Premium Deneyim Paketleri" : "Premium Experience Packages"}
            text={
              locale === "tr"
                ? "Sadece konaklama değil; ömür boyu hatırlanacak anılar biriktirmeniz için tasarlanmış özel servisler."
                : "Not just a stay; specially designed services for you to collect memories that last a lifetime."
            }
          />
        </FadeIn>
        <div className="feature-grid">
          {experiences.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 0.12}>
              <div className="feature-box">
                <span className="feature-no" aria-hidden>{item.no}</span>
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
