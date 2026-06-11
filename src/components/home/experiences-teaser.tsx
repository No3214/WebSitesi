"use client";

import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

type Guide = {
  href: string;
  title: { tr: string; en: string };
  desc: { tr: string; en: string };
};

const guides: Guide[] = [
  {
    href: "/deneyimler/kozbeyli-koyu-rehberi",
    title: { tr: "Kozbeyli Köyü Rehberi", en: "Kozbeyli Village Guide" },
    desc: {
      tr: "500 yıllık taş mimari, Horasan harcı ve 180 yıllık dibek kahvesi ritüeliyle köyde yavaş bir gün.",
      en: "A slow day in the village among 500-year-old stone architecture and the historic dibek coffee ritual.",
    },
  },
  {
    href: "/deneyimler/foca-gezi-rehberi",
    title: { tr: "Foça Gezi Rehberi", en: "Foça Travel Guide" },
    desc: {
      tr: "Konaktan 12 dakika: Eski Foça sahil yürüyüşü, Siren Kayalıkları ve gün batımı noktaları.",
      en: "Twelve minutes from the mansion: the Old Foça seafront walk, the Siren Rocks and sunset spots.",
    },
  },
  {
    href: "/deneyimler/ege-gastronomi-rotasi",
    title: { tr: "Ege Gastronomi Rotası", en: "Aegean Gastronomy Route" },
    desc: {
      tr: "Serpme köy kahvaltısından taş fırın lezzetlerine, Antakya'dan Ege'ye uzanan bir lezzet köprüsü.",
      en: "From a village breakfast spread to stone-oven flavours, a culinary bridge from Antakya to the Aegean.",
    },
  },
];

export function ExperiencesTeaser({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section" id="deneyim-rehberleri">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "KEŞFEDİN" : "DISCOVER"}
            title={locale === "tr" ? "Kozbeyli'yi Deneyimleyin" : "Experience Kozbeyli"}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="feature-box"
                style={{ display: "block", textDecoration: "none" }}
              >
                <h3>{guide.title[locale]}</h3>
                <p>{guide.desc[locale]}</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--olive)",
                  }}
                >
                  {locale === "tr" ? "Rehberi Oku →" : "Read the Guide →"}
                </span>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <Link
              className="button secondary sm"
              href="/deneyimler"
              data-event="experiences_teaser_view_all"
            >
              {locale === "tr" ? "Tüm Deneyimler" : "All Experiences"}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
