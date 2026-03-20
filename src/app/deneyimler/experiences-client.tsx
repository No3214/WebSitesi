"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { Wine, Leaf, Utensils, Compass, Coffee, Music } from "lucide-react";
import { useDictionary } from "@/hooks/use-dictionary";

const experiences = [
  {
    icon: Wine,
    title: { tr: "Ege Şarap Tadımı", en: "Aegean Wine Tasting" },
    text: {
      tr: "Foça ve çevresindeki butik bağlardan seçilmiş Ege şarapları, peynir eşleştirmesi ve somelier rehberliğinde tadım akşamı.",
      en: "An evening of curated Aegean wines from boutique vineyards around Foça, paired with cheese and guided by a sommelier.",
    },
    duration: { tr: "2 saat", en: "2 hours" },
    capacity: { tr: "8-20 kişi", en: "8-20 guests" },
    image: "/images/rooms/aile-5.jpeg",
  },
  {
    icon: Utensils,
    title: { tr: "Gastronomi Atölyesi", en: "Gastronomy Workshop" },
    text: {
      tr: "İnci Hanım'ın eşliğinde Antakya & Ege mutfağından seçme tarifleri bizzat pişirin. Sac kavurma, zeytinyağlılar ve taş fırın ekmek.",
      en: "Cook authentic Antakya & Aegean recipes hands-on with İnci Hanım. Sac kavurma, olive oil dishes and stone-oven bread.",
    },
    duration: { tr: "3 saat", en: "3 hours" },
    capacity: { tr: "6-12 kişi", en: "6-12 guests" },
    image: "/images/rooms/standart-4.jpeg",
  },
  {
    icon: Leaf,
    title: { tr: "Zeytinyağı Hasadı", en: "Olive Oil Harvest" },
    text: {
      tr: "Mevsiminde zeytinyağı hasadına katılın. Bahçeden sofraya yolculuğu deneyimleyin ve organik zeytinyağı ile eve dönün.",
      en: "Join the seasonal olive oil harvest. Experience the journey from grove to table and take home organic olive oil.",
    },
    duration: { tr: "Yarım gün", en: "Half day" },
    capacity: { tr: "4-15 kişi", en: "4-15 guests" },
    image: "/images/rooms/bahce-2.jpeg",
  },
  {
    icon: Compass,
    title: { tr: "Küratörlü Foça Kaçamağı", en: "Curated Foça Getaway" },
    text: {
      tr: "Tekne turu, köy rotası, tarihi Foça sokakları ve gastronomi deneyimi tek pakette. Rehber eşliğinde Ege'yi keşfedin.",
      en: "Boat tour, village route, historic Foça streets and gastronomy experience in one package. Discover the Aegean with a guide.",
    },
    duration: { tr: "Tam gün", en: "Full day" },
    capacity: { tr: "2-10 kişi", en: "2-10 guests" },
    image: "/images/rooms/deniz-3.jpeg",
  },
  {
    icon: Coffee,
    title: { tr: "Taş Dibek Kahve Ritüeli", en: "Stone Mortar Coffee Ritual" },
    text: {
      tr: "180 yıllık taş dibekte Türk kahvesi hazırlama deneyimi. Kahvenin hikayesini öğrenin, kendi kahvenizi dövün.",
      en: "Experience preparing Turkish coffee in a 180-year-old stone mortar. Learn the story of coffee and grind your own.",
    },
    duration: { tr: "45 dakika", en: "45 minutes" },
    capacity: { tr: "2-8 kişi", en: "2-8 guests" },
    image: "/images/rooms/uc-kisilik-1.jpeg",
  },
  {
    icon: Music,
    title: { tr: "Canlı Müzik Akşamları", en: "Live Music Evenings" },
    text: {
      tr: "Seçili akşamlarda avluda canlı müzik eşliğinde özel menü. Ege'nin yıldızları altında romantik bir gece.",
      en: "Special menu accompanied by live music in the courtyard on select evenings. A romantic night under the Aegean stars.",
    },
    duration: { tr: "Akşam", en: "Evening" },
    capacity: { tr: "Açık", en: "Open" },
    image: "/images/rooms/balkonlu-aile-2.jpeg",
  },
];

const t = {
  tr: {
    eyebrow: "DENEYİMLER",
    title: "Sadece Konaklama Değil",
    text: "Kozbeyli Konağı'nda gastronomi, kültür ve doğa ile bütünleşen premium deneyimler.",
    cta: "Bilgi Al & Rezervasyon",
  },
  en: {
    eyebrow: "EXPERIENCES",
    title: "More Than Just a Stay",
    text: "Premium experiences at Kozbeyli Konağı blending gastronomy, culture and nature.",
    cta: "Get Info & Reserve",
  },
};

export function ExperiencesClient() {
  const { locale } = useDictionary();

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={t[locale].eyebrow} title={t[locale].title} text={t[locale].text} />
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
                          <Image src={exp.image} alt={exp.title[locale]} fill className="object-cover" sizes="50vw" />
                        </div>
                      </div>
                      <div style={{ order: isReversed ? 1 : 2 }}>
                        <Icon size={28} style={{ color: "var(--gold)", marginBottom: "12px" }} />
                        <h3 className="serif" style={{ fontSize: "1.6rem", marginBottom: "12px", color: "var(--olive)" }}>{exp.title[locale]}</h3>
                        <p style={{ color: "#555", lineHeight: 1.8, marginBottom: "20px" }}>{exp.text[locale]}</p>
                        <div style={{ display: "flex", gap: "16px", fontSize: "0.82rem", color: "#999", marginBottom: "24px" }}>
                          <span>⏱ {exp.duration[locale]}</span>
                          <span>👥 {exp.capacity[locale]}</span>
                        </div>
                        <Link href="https://wa.me/905322342686" className="button primary" target="_blank" rel="noreferrer">
                          {t[locale].cta}
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
