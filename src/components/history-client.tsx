"use client";

import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { LivingMuseumMap } from "@/components/living-museum-map";
import { AudioGuide } from "@/components/audio-guide";
import { HeritageArchive } from "@/components/heritage-archive";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/types";

export function HistoryClient() {
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale as "tr" | "en").then((d) => setDict(d as Dictionary));
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.History;

  return (
    <main className="min-h-screen bg-black">
      <SiteHeader />

      <div className="relative">
        <StoryHero title={t.heroTitle} subtitle={t.heroSubtitle} />
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
        title={t.textureTitle}
        content={t.textureContent}
        image="https://images.unsplash.com/photo-1518173946687-a4c8a483592e?auto=format&fit=crop&w=1920&q=80"
        side="left"
      />

      <StorySegment
        title={t.merchantTitle}
        content={t.merchantContent}
        image="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
        side="right"
      />

      <StorySegment
        title={t.restorationTitle}
        content={t.restorationContent}
        image="https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=800&q=80"
        side="left"
      />
    </main>
  );
}
