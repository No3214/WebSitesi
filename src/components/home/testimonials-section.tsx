"use client";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const guestMoments = [
  {
    title: {
      tr: "Romantik Kaçamak",
      en: "Romantic Escape",
    },
    text: {
      tr: "Taş duvarların sakinliği, avluda kahve ritüeli ve Foça rotalarına yakın konum çiftler için rafine bir hafta sonu akışı kurar.",
      en: "Stone-wall calm, a courtyard coffee ritual and proximity to Foça routes create a refined weekend rhythm for couples.",
    },
  },
  {
    title: {
      tr: "Gastronomi Molası",
      en: "Gastronomy Break",
    },
    text: {
      tr: "Antakya aile reçeteleri, Ege ürünleri ve taş fırın lezzetleri aynı sofrada buluşur.",
      en: "Antakya family recipes, Aegean produce and stone-oven flavours meet at the same table.",
    },
  },
  {
    title: {
      tr: "Özel Davet",
      en: "Private Event",
    },
    text: {
      tr: "Bahçe, avlu ve taş doku; düğün, nişan ve butik davetlerde kişiye özel kurgu için güçlü bir zemin sunar.",
      en: "The garden, courtyard and stone texture provide a strong setting for curated weddings, engagements and intimate events.",
    },
  },
];

export function TestimonialsSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt grain" id="misafir-sesleri">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MİSAFİR DEFTERİ" : "GUEST BOOK"}
            title={locale === "tr" ? "Konakta Yaşanan Anlar" : "Moments Shaped at the Mansion"}
          />
        </FadeIn>
        <div className="testimonial-grid">
          {guestMoments.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 0.12}>
              <figure className="testimonial" style={{ margin: 0 }}>
                <h3>{item.title[locale]}</h3>
                <blockquote>{item.text[locale]}</blockquote>
                <figcaption>
                  {locale === "tr" ? "Kozbeyli Konağı deneyim kurgusu" : "Kozbeyli Konağı experience cue"}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
