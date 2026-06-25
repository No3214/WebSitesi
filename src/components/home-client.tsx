"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/dictionary";

import { HomeHero } from "@/components/home/home-hero";

const MarqueeBand = dynamic(() =>
  import("@/components/home/marquee-band").then((module) => module.MarqueeBand),
);
const KpiBand = dynamic(() =>
  import("@/components/home/kpi-band").then((module) => module.KpiBand),
);
const RoomsShowcase = dynamic(() =>
  import("@/components/home/rooms-showcase").then((module) => module.RoomsShowcase),
);
const GastronomyEditorial = dynamic(() =>
  import("@/components/home/gastronomy-editorial").then((module) => module.GastronomyEditorial),
);
const ExperiencesSection = dynamic(() =>
  import("@/components/home/experiences-section").then((module) => module.ExperiencesSection),
);
const GalleryStrip = dynamic(() =>
  import("@/components/home/gallery-strip").then((module) => module.GalleryStrip),
);
const ExperiencesTeaser = dynamic(() =>
  import("@/components/home/experiences-teaser").then((module) => module.ExperiencesTeaser),
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/testimonials-section").then((module) => module.TestimonialsSection),
);
const ReviewsSection = dynamic(() =>
  import("@/components/home/reviews-section").then((module) => module.ReviewsSection),
);
const BookingSection = dynamic(() =>
  import("@/components/home/booking-section").then((module) => module.BookingSection),
);
const FaqSection = dynamic(() =>
  import("@/components/home/faq-section").then((module) => module.FaqSection),
);
const FinalCta = dynamic(() =>
  import("@/components/home/final-cta").then((module) => module.FinalCta),
);

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
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = pathname === "/en" || pathname?.startsWith("/en/")
      ? "en"
      : "tr";
    if (currentLocale === initialLocale && initialDict) return; // SSR sözlüğü zaten doğru
    setLocale(currentLocale as "tr" | "en");
    getDictionary(currentLocale as "tr" | "en").then(setDict);
  }, [initialDict, initialLocale, pathname]);

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
        <ReviewsSection />
        <BookingSection locale={locale} eyebrow={nav.booking} />
        <FaqSection locale={locale} />
        <FinalCta locale={locale} />
      </main>
    </>
  );
}
