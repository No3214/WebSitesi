"use client";

import Link from "next/link";
import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { LivingMuseumMap } from "@/components/living-museum-map";
import { AudioGuide } from "@/components/audio-guide";
import { HeritageArchive } from "@/components/heritage-archive";
import { useDictionary } from "@/hooks/use-dictionary";

const segments = {
  tr: [
    {
      title: "Tarihi Doku",
      content: "Kozbeyli Konağı, sadece bir otel değil; Horasan harcıyla örülmüş, 500 yıllık tescilli bir Osmanlı mimarisi şaheseridir. Kozbeyli Köyü'nün en eski sivil mimari örneklerinden biri olan yapı, andezit taş ve Horasan harcının eşsiz birleşimiyle zamanın ötesinde bir dayanıklılık sergiler.",
      image: "/images/rooms/bahce-3.jpeg",
      side: "left" as const,
    },
    {
      title: "Tüccar Mirası",
      content: "1870-1891 yılları arasında bölgenin en varlıklı tüccar aileleri için inşa edilen yapı, zemin katındaki devasa şarap ve zeytinyağı mahzenleriyle dönemin ticari gücünü yansıtır. L-Tipi Sofa plan düzeni, Osmanlı konut mimarisinin Ege yorumunu temsil eder.",
      image: "/images/rooms/aile-4.jpeg",
      side: "right" as const,
    },
    {
      title: "Living Museum Felsefesi",
      content: "2012 yılında başlayan restorasyon, Anıtlar Kurulu denetiminde, çimento kullanılmadan orijinal tekniklerle tamamlandı. Her taş tek tek belgelendi, orijinal Horasan harcı formülasyonuna uygun malzemelerle yeniden bağlandı. Bu bir 'yıkıp yapma' değil, 'yaşayan müze' anlayışıdır.",
      image: "/images/rooms/uc-kisilik-3.jpeg",
      side: "left" as const,
    },
    {
      title: "İnci Hanım'ın Mirası",
      content: "Antakya'dan Ege'ye uzanan bir gastronomi yolculuğunun mimarı İnci Hanım, konağın mutfağını Hatay'ın derin baharat kültürü ile Ege'nin taze lezzetlerini buluşturan bir laboratuvara dönüştürdü. 180 yıllık taş dibekte dövülen kahve, bu mirasın en otantik sembolüdür.",
      image: "/images/rooms/standart-4.jpeg",
      side: "right" as const,
    },
  ],
  en: [
    {
      title: "Historic Texture",
      content: "Kozbeyli Mansion is not just a hotel; it is a masterpiece of 500-year-old registered Ottoman architecture, built with Horasan mortar. One of the oldest examples of civil architecture in Kozbeyli Village, the structure showcases a timeless durability through the unique combination of andesite stone and Horasan mortar.",
      image: "/images/rooms/bahce-3.jpeg",
      side: "left" as const,
    },
    {
      title: "Merchant Heritage",
      content: "Built between 1870 and 1891 for the region's wealthiest merchant families, the building reflects the commercial power of the era with its massive wine and olive oil cellars on the ground floor. The L-Type Sofa plan layout represents the Aegean interpretation of Ottoman residential architecture.",
      image: "/images/rooms/aile-4.jpeg",
      side: "right" as const,
    },
    {
      title: "Living Museum Philosophy",
      content: "The restoration, which began in 2012, was completed under the supervision of the Monuments Board using original techniques without cement. Each stone was individually documented and reconnected with materials matching the original Horasan mortar formulation. This is not a 'demolish and rebuild' approach, but a 'living museum' philosophy.",
      image: "/images/rooms/uc-kisilik-3.jpeg",
      side: "left" as const,
    },
    {
      title: "İnci Hanım's Legacy",
      content: "İnci Hanım, the architect of a gastronomic journey from Antakya to the Aegean, has transformed the mansion's kitchen into a laboratory that unites Hatay's deep spice culture with the fresh flavors of the Aegean. Coffee pounded in a 180-year-old stone mortar is the most authentic symbol of this heritage.",
      image: "/images/rooms/standart-4.jpeg",
      side: "right" as const,
    },
  ],
};

const heroText = {
  tr: { title: "Hikayemiz", subtitle: "500 YILLIK TAŞLARIN FISILTISI" },
  en: { title: "Our Story", subtitle: "WHISPERS OF 500-YEAR-OLD STONES" },
};

export function HistoryClient() {
  const { locale } = useDictionary();
  const hero = heroText[locale];
  const stories = segments[locale];

  return (
    <main className="min-h-screen bg-black">
      <SiteHeader />

      <div className="relative">
        <StoryHero title={hero.title} subtitle={hero.subtitle} />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <AudioGuide />
        </div>
      </div>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <LivingMuseumMap />
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <HeritageArchive />
      </section>

      {stories.map((seg, idx) => (
        <StorySegment
          key={idx}
          title={seg.title}
          content={seg.content}
          image={seg.image}
          side={seg.side}
        />
      ))}

      <section className="py-16 px-6 max-w-7xl mx-auto" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/galeri" className="button secondary">{locale === "en" ? "Photo Gallery" : "Fotoğraf Galerisi"}</Link>
        <Link href="/odalar" className="button secondary">{locale === "en" ? "Our Rooms" : "Odalarımız"}</Link>
        <Link href="/gastronomi" className="button secondary">{locale === "en" ? "Gastronomy" : "Gastronomi"}</Link>
        <Link href="/#rezervasyon" className="button primary">{locale === "en" ? "Book Now" : "Hemen Rezervasyon"}</Link>
      </section>
    </main>
  );
}
