"use client";

import { StoryHero, StorySegment } from "@/components/storytelling";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/types";

export function GastronomyClient() {
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    const locale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    getDictionary(locale as "tr" | "en").then((d) => setDict(d as Dictionary));
  }, []);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Gastronomy;

  return (
    <main className="min-h-screen bg-black">
      <SiteHeader />

      <StoryHero title={t.heroTitle} subtitle={t.heroSubtitle} />

      <StorySegment title={t.inciTitle} content={t.inciContent} side="left" />

      <StorySegment title={t.dibekTitle} content={t.dibekContent} side="right" />

      <StorySegment title={t.breakfastTitle} content={t.breakfastContent} side="left" />
    </main>
  );
}
