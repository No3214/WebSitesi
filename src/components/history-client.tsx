"use client";

import Image from "next/image";

import { TiltCard } from "@/components/animations";
import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { LivingMuseumMap } from "@/components/living-museum-map";
import { HeritageArchive } from "@/components/heritage-archive";
import { HeritageTimeline } from "@/components/heritage-timeline";
import { SmoothScrollProvider } from "@/lib/animation/smooth-scroll";

type Locale = "tr" | "en";

const historyCopy = {
  tr: {
    heroTitle: "Hikayemiz",
    heroSubtitle: "BEŞ ASIRLIK KÖY DOKUSUNUN İÇİNDE",
    sunsetTitle: "Kozbeyli'de Gün Batımı",
    sunsetText: "Konağın terasından Ege'ye doğru, günün en yumuşak ışığında kısa bir an.",
    sunsetCaption: "Terastan Ege'ye, akşamüstü",
    stoneLight: {
      title: "Taş & Işık",
      intro:
        "Konağın malzemesi üç karede: köy dokusundaki taş cephe, Horasan harcıyla örülmüş duvarların dokusu ve avlu ışığında kurulan akşam sofrası.",
      facade: {
        image: "/images/galeri/tas-cephe.jpg",
        alt: "Kozbeyli Konağı'nın taş cephesi",
        caption: "Taş cephe — beş asırlık köy dokusunun içinde",
      },
      wall: {
        image: "/images/odalar/detay/oda-detay-2.jpg",
        alt: "Konağın taş duvar ve ahşap detayı",
        caption: "Taş duvar dokusu — Horasan harcıyla, aslına sadık",
      },
      table: {
        image: "/images/galeri/aksam-sofrasi.jpg",
        alt: "Kozbeyli Konağı avlusunda akşam sofrası",
        caption: "Avlu ışığında akşam sofrası",
      },
    },
    segments: [
      {
        title: "Tarihi Doku",
        content:
          "Kozbeyli Konağı, sadece bir otel değil; Kozbeyli'nin beş asırlık taş dokusu içinde, Horasan harcıyla korunmuş 19. yüzyıl tescilli bir konaktır. Köyün en eski sivil mimari örneklerinden biridir.",
        image: "/images/hero.jpg",
        side: "left" as const,
      },
      {
        title: "Tüccar Mirası",
        content:
          "1870-1891 yılları arasında bölgenin en varlıklı tüccar aileleri için inşa edilen yapı, zemin katındaki devasa şarap ve zeytinyağı mahzenleriyle dönemin ticari gücünü yansıtır.",
        image: "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/3.jpg",
        side: "right" as const,
      },
      {
        title: "Modern Restorasyon",
        content:
          "2012 yılında başlayan restorasyon, Anıtlar Kurulu denetiminde, çimento kullanılmadan orijinal tekniklerle tamamlandı. 'Living Museum' felsefesiyle her taş aslına sadık kalarak korundu.",
        image: "/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg",
        side: "left" as const,
      },
    ],
  },
  en: {
    heroTitle: "Our Story",
    heroSubtitle: "WITHIN KOZBEYLI'S FIVE-CENTURY VILLAGE TEXTURE",
    sunsetTitle: "Sunset in Kozbeyli",
    sunsetText: "A quiet moment from the terrace toward the Aegean in the softest light of the day.",
    sunsetCaption: "From the terrace to the Aegean, late afternoon",
    stoneLight: {
      title: "Stone & Light",
      intro:
        "The mansion's material in three frames: the stone facade within the village texture, walls bound with Horasan mortar, and the evening table set in courtyard light.",
      facade: {
        image: "/images/galeri/tas-cephe.jpg",
        alt: "The stone facade of Kozbeyli Konağı",
        caption: "Stone facade — within the five-century village texture",
      },
      wall: {
        image: "/images/odalar/detay/oda-detay-2.jpg",
        alt: "Stone wall and timber detail of the mansion",
        caption: "Stone wall texture — Horasan mortar, faithfully preserved",
      },
      table: {
        image: "/images/galeri/aksam-sofrasi.jpg",
        alt: "Evening table in the courtyard of Kozbeyli Konağı",
        caption: "The evening table in courtyard light",
      },
    },
    segments: [
      {
        title: "Historic Texture",
        content:
          "Kozbeyli Konağı is more than a hotel. It is a registered stone mansion shaped by Horasan mortar and one of the village's oldest examples of civil architecture.",
        image: "/images/hero.jpg",
        side: "left" as const,
      },
      {
        title: "Merchant Heritage",
        content:
          "Built between 1870 and 1891 for the region's prosperous merchant families, the mansion still carries the memory of wine and olive-oil cellars on its ground floor.",
        image: "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/3.jpg",
        side: "right" as const,
      },
      {
        title: "Modern Restoration",
        content:
          "The restoration that began in 2012 was completed under heritage-board supervision, using original techniques and preserving each stone within a Living Museum philosophy.",
        image: "/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg",
        side: "left" as const,
      },
    ],
  },
};

export function HistoryClient({ locale = "tr" }: { locale?: Locale }) {
  const copy = historyCopy[locale];

  return (
    <SmoothScrollProvider>
      <main className="min-h-screen history-story-page" style={{ background: "var(--ivory)" }}>
      <SiteHeader variant="solid" />

      <div className="relative">
        <StoryHero 
          title={copy.heroTitle}
          subtitle={copy.heroSubtitle}
        />
      </div>

      <section className="py-20 px-6">
        <HeritageTimeline locale={locale} />
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <LivingMuseumMap locale={locale} />
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto story-rail" aria-labelledby="stone-light-title">
        <div className="story-rail-intro">
          <h3
            id="stone-light-title"
            className="text-[var(--olive)] font-serif text-3xl md:text-4xl mb-3"
          >
            {copy.stoneLight.title}
          </h3>
          <p className="text-[var(--muted)] text-sm">{copy.stoneLight.intro}</p>
        </div>
        <div className="story-rail-scenes">
          <figure className="story-rail-scene">
            <div className="story-rail-media story-rail-media--landscape">
              <Image
                src={copy.stoneLight.facade.image}
                alt={copy.stoneLight.facade.alt}
                fill
                sizes="(max-width: 899px) 100vw, 33vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <figcaption>{copy.stoneLight.facade.caption}</figcaption>
          </figure>

          <TiltCard className="story-rail-scene story-rail-artifact" maxTilt={3}>
            <figure className="m-0">
              <div className="story-rail-media story-rail-media--portrait arch-frame">
                <Image
                  src={copy.stoneLight.wall.image}
                  alt={copy.stoneLight.wall.alt}
                  fill
                  sizes="(max-width: 899px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <figcaption>{copy.stoneLight.wall.caption}</figcaption>
            </figure>
          </TiltCard>

          <figure className="story-rail-scene">
            <div className="story-rail-media story-rail-media--landscape">
              <Image
                src={copy.stoneLight.table.image}
                alt={copy.stoneLight.table.alt}
                fill
                sizes="(max-width: 899px) 100vw, 33vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <figcaption>{copy.stoneLight.table.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h3 className="text-[var(--olive)] font-serif text-3xl md:text-4xl mb-3">
            {copy.sunsetTitle}
          </h3>
          <p className="text-[var(--muted)] text-sm max-w-2xl mx-auto">
            {copy.sunsetText}
          </p>
        </div>
        <figure>
          <video
            controls
            preload="none"
            playsInline
            poster="/videos/sunset-poster.jpg"
            data-event="video_play_sunset"
            style={{ width: "100%", maxWidth: 720, borderRadius: 16, display: "block", background: "var(--stone-warm)", margin: "0 auto" }}
          >
            <source src="/videos/sunset.mp4" type="video/mp4" />
          </video>
          <figcaption className="text-[var(--muted)] text-xs text-center mt-4">
            {copy.sunsetCaption}
          </figcaption>
        </figure>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <HeritageArchive locale={locale} />
      </section>

      {copy.segments.map((segment) => (
        <StorySegment
          key={segment.title}
          title={segment.title}
          content={segment.content}
          image={segment.image}
          side={segment.side}
        />
      ))}
      </main>
    </SmoothScrollProvider>
  );
}
