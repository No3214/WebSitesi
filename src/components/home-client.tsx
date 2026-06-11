"use client";

import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/dictionary";

import { HomeHero } from "@/components/home/home-hero";
import { MarqueeBand } from "@/components/home/marquee-band";
import { KpiBand } from "@/components/home/kpi-band";
import { RoomsShowcase } from "@/components/home/rooms-showcase";
import { GastronomyEditorial } from "@/components/home/gastronomy-editorial";
import { ExperiencesSection } from "@/components/home/experiences-section";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { ExperiencesTeaser } from "@/components/home/experiences-teaser";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BookingSection } from "@/components/home/booking-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";

/**
 * Ana sayfa orkestratörü (Audit T9/F4).
 * İçerik ve bölüm mantığı components/home/* altındaki modüllerde yaşar;
 * bu dosya yalnızca sözlük/locale durumunu yönetir ve bölümleri sıralar.
 */
type HomeClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialDict?: any;
  initialLocale?: "tr" | "en";
};

export function HomeClient({ initialDict, initialLocale = "tr" }: HomeClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dict, setDict] = useState<any>(initialDict ?? null);
  const [locale, setLocale] = useState<"tr" | "en">(initialLocale);

  useEffect(() => {
    const currentLocale = document.cookie.includes("NEXT_LOCALE=en") ? "en" : "tr";
    if (currentLocale === initialLocale && initialDict) return; // SSR sözlüğü zaten doğru
    setLocale(currentLocale as "tr" | "en");
    getDictionary(currentLocale as "tr" | "en").then(setDict);
  }, [initialDict, initialLocale]);

  if (!dict) return <div className="loading-screen" />;

  const t = dict.Home;
  const nav = dict.Navigation;

  return (
    <>
      <SiteHeader variant="overlay" />

      <main>
        <HomeHero locale={locale} eyebrow={t.eyebrow} />
        <MarqueeBand locale={locale} />
        <KpiBand locale={locale} />
        <RoomsShowcase locale={locale} eyebrow={nav.rooms} />
        <GastronomyEditorial locale={locale} />
        <ExperiencesSection locale={locale} />
        <GalleryStrip locale={locale} />
        <ExperiencesTeaser locale={locale} />
        <TestimonialsSection locale={locale} />
        <BookingSection locale={locale} eyebrow={nav.booking} />
        <FaqSection locale={locale} />
        <FinalCta locale={locale} />
      </main>
    </>
  );
}
