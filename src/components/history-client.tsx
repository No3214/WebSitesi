"use client";

import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { LivingMuseumMap } from "@/components/living-museum-map";
import { AudioGuide } from "@/components/audio-guide";
import { HeritageArchive } from "@/components/heritage-archive";

export function HistoryClient() {
  return (
    <main className="min-h-screen bg-black">
      <SiteHeader />
      
      <div className="relative">
        <StoryHero 
          title="Hikayemiz" 
          subtitle="500 YILLIK TAŞLARIN FISILTISI" 
        />
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

      <StorySegment 
        title="Tarihi Doku"
        content="Kozbeyli Konağı, sadece bir otel değil; Horasan harcıyla örülmüş, 500 yıllık tescilli bir Osmanlı mimarisi şaheseridir. Köyün en eski sivil mimari örneklerinden biridir."
        image="/images/hero.jpg"
        side="left"
      />

      <StorySegment 
        title="Tüccar Mirası"
        content="1870-1891 yılları arasında bölgenin en varlıklı tüccar aileleri için inşa edilen yapı, zemin katındaki devasa şarap ve zeytinyağı mahzenleriyle dönemin ticari gücünü yansıtır."
        image="/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/3.jpg"
        side="right"
      />

      <StorySegment 
        title="Modern Restorasyon"
        content="2012 yılında başlayan restorasyon, Anıtlar Kurulu denetiminde, çimento kullanılmadan orijinal tekniklerle tamamlandı. 'Living Museum' felsefesiyle her taş aslına sadık kalarak korundu."
        image="/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg"
        side="left"
      />
    </main>
  );
}
