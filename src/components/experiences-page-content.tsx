import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/utils";

type Locale = "tr" | "en";

const experienceCopy = {
  tr: {
    eyebrow: "KEŞFEDİN",
    title: "Kozbeyli'yi Deneyimleyin",
    text: "Konağın taş duvarlarından Ege kıyılarına uzanan köy, sahil ve sofra rotalarını sizin için hazırladığımız rehberlerle keşfedin.",
    read: "Rehberi Oku",
    ctaTitle: "Size özel bir rota mı istersiniz?",
    ctaText:
      "İlgi alanlarınızı paylaşın; konaklamanıza eşlik edecek kişisel rotanızı birlikte kurgulayalım.",
    ctaHref: "/deneyim-tasarimcisi",
    cta: "Deneyim Tasarımcısı'nı Deneyin",
    guides: [
      {
        no: "01",
        title: "Kozbeyli Köyü Rehberi",
        text: "500 yıllık taş mimari, Horasan harcı ve 180 yıllık dibek kahvesi ritüeli. Yeni Foça'ya 12 km mesafedeki Kozbeyli'de yavaş bir günün duraklarını keşfedin.",
        href: "/deneyimler/kozbeyli-koyu-rehberi",
      },
      {
        no: "02",
        title: "Foça Gezi Rehberi",
        text: "Eski Foça sahil yürüyüşü, Siren Kayalıkları, balıkçı koyları ve gün batımı noktaları. Konaktan 12 dakikalık günübirlik bir Foça keşfi için özenle derlenmiş rota.",
        href: "/deneyimler/foca-gezi-rehberi",
      },
      {
        no: "03",
        title: "Ege Gastronomi Rotası",
        text: "Serpme köy kahvaltısından asırlık zeytin ağaçlarına, 500 yıllık taş dibekte dövülen kahveden taş fırın lezzetlerine uzanan bir lezzet yolculuğu.",
        href: "/deneyimler/ege-gastronomi-rotasi",
      },
    ],
  },
  en: {
    eyebrow: "DISCOVER",
    title: "Experience Kozbeyli",
    text: "Explore village, coast and table routes curated from the mansion's stone walls to the Aegean shoreline.",
    read: "Read the Guide",
    ctaTitle: "Would you like a route designed for you?",
    ctaText:
      "Share your interests and we will help curate a personal itinerary to accompany your stay.",
    ctaHref: "/deneyim-tasarimcisi",
    cta: "Plan a Curated Experience",
    guides: [
      {
        no: "01",
        title: "Kozbeyli Village Guide",
        text: "A slow-day route through 500-year-old stone architecture, Horasan mortar and the dibek coffee ritual, just 12 km from Yeni Foça.",
        href: "/deneyimler/kozbeyli-koyu-rehberi",
      },
      {
        no: "02",
        title: "Foça Travel Guide",
        text: "Old Foça waterfront walks, the Siren Rocks, fishing coves and sunset points, curated for an easy day trip from the mansion.",
        href: "/deneyimler/foca-gezi-rehberi",
      },
      {
        no: "03",
        title: "Aegean Gastronomy Route",
        text: "A flavour journey from village breakfast and century-old olive trees to stone-ground coffee and warm stone-oven dishes.",
        href: "/deneyimler/ege-gastronomi-rotasi",
      },
    ],
  },
};

export function ExperiencesPageContent({ locale = "tr" }: { locale?: Locale }) {
  const copy = experienceCopy[locale];
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: copy.guides.map((guide, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: guide.title,
      url: absoluteUrl(guide.href),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <SiteHeader />
      <main>
        <PageHero eyebrow={copy.eyebrow} title={copy.title} text={copy.text} />

        <section className="section">
          <div className="container">
            <div className="feature-grid">
              {copy.guides.map((guide, idx) => (
                <FadeIn key={guide.no} delay={idx * 0.12}>
                  <div className="feature-box">
                    <span className="feature-no" aria-hidden>
                      {guide.no}
                    </span>
                    <h3>{guide.title}</h3>
                    <p>{guide.text}</p>
                    <div style={{ marginTop: 22 }}>
                      <Link className="button gold sm" href={guide.href}>
                        {copy.read}
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
            <FadeIn>
              <h2 style={{ marginBottom: 14 }}>{copy.ctaTitle}</h2>
              <p style={{ marginBottom: 26 }}>{copy.ctaText}</p>
              <Link className="button secondary" href={copy.ctaHref}>
                {copy.cta}
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>
    </>
  );
}
