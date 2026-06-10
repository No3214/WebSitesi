"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { FadeIn, RevealLines } from "@/components/animations";

type Props = { locale: "tr" | "en"; eyebrow: string };

export function HomeHero({ locale, eyebrow }: Props) {
  return (
    <section className="hero grain">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: "easeOut" }}
        className="hero-media"
      >
        <Image
          src="/images/hero.jpg"
          alt={locale === "tr" ? "Kozbeyli Konağı taş avlusu" : "Kozbeyli Konağı stone courtyard"}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fetchPriority="high"
          quality={82}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
      </motion.div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <FadeIn direction="down">
          <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            {eyebrow}
          </span>
        </FadeIn>

        <RevealLines
          as="h1"
          lines={
            locale === "tr"
              ? ["Taşın Hafızasında", "Zarif Bir Ege Kaçamağı"]
              : ["An Elegant Aegean Escape", "In the Memory of Stone"]
          }
        />

        <FadeIn delay={0.35}>
          <p className="hero-text">
            {locale === "tr"
              ? "500 yıllık tescilli taş mimarinin içinde, Foça'ya 12 dakika; kişiselleştirilmiş hizmet ve rafine bir sükunet."
              : "Within 500-year-old registered stone architecture, 12 minutes from Foça; personalized service and refined serenity."}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} direction="up">
          <div className="hero-actions">
            <Link href="/rezervasyon" className="button gold">
              {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
            </Link>
            <Link href="/organizasyonlar" className="button ghost-light">
              {locale === "tr" ? "Davet & Etkinlik Planla" : "Plan an Event"}
            </Link>
          </div>
          <div className="hero-divider" aria-hidden />
        </FadeIn>
      </div>

      <div className="scroll-cue" aria-hidden>
        <span>{locale === "tr" ? "Keşfet" : "Explore"}</span>
        <span className="line" />
      </div>
    </section>
  );
}
