"use client";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

const testimonials = [
  {
    quote: {
      tr: "Taş duvarların arasında uyanmak, avluda dibek kahvesi içmek... Şehirden sonra bambaşka bir zaman dilimi.",
      en: "Waking up between stone walls, sipping dibek coffee in the courtyard... a different dimension of time after the city.",
    },
    name: "Elif & Mert",
    meta: { tr: "İSTANBUL — BALAYI", en: "ISTANBUL — HONEYMOON" },
  },
  {
    quote: {
      tr: "Kahvaltı bir öğün değil, bir tören. İnci Hanım'ın mutfağından çıkan her tabakta bir hikaye var.",
      en: "Breakfast is not a meal here, it's a ceremony. Every plate from İnci Hanım's kitchen tells a story.",
    },
    name: "Zeynep K.",
    meta: { tr: "ANKARA — GASTRONOMİ KAÇAMAĞI", en: "ANKARA — GASTRONOMY ESCAPE" },
  },
  {
    quote: {
      tr: "Kızımızın nişanını konağın avlusunda yaptık. Ekip her detayı bizden önce düşündü.",
      en: "We hosted our daughter's engagement in the courtyard. The team thought of every detail before we did.",
    },
    name: "Ayhan Ailesi",
    meta: { tr: "İZMİR — ÖZEL DAVET", en: "IZMIR — PRIVATE EVENT" },
  },
];

export function TestimonialsSection({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-dark grain" id="misafir-sesleri">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MİSAFİR DEFTERİ" : "GUEST BOOK"}
            title={locale === "tr" ? "Konaktan Ayrılanların Sözleri" : "Words From Our Departing Guests"}
          />
        </FadeIn>
        <div className="testimonial-grid">
          {testimonials.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 0.12}>
              <figure className="testimonial" style={{ margin: 0 }}>
                <span className="stars" aria-label="5 yıldız">★★★★★</span>
                <blockquote>“{item.quote[locale]}”</blockquote>
                <figcaption>
                  {item.name} · {item.meta[locale]}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
