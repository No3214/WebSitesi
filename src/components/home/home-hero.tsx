"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = { locale: "tr" | "en"; eyebrow: string };

const HERO_VIDEO_SRC = "/videos/hero.mp4";

/**
 * Hero arka plan videosu:
 * - LCP elemanı her zaman poster görselidir (priority + preload), fakat video
 *   da ilk HTML'de yer alır. Böylece hydration gecikmesi veya event kaçması
 *   kullanıcıya "video yok" hissi vermez.
 * - Data Saver'da oynatma zorlanmaz; normal cihazlarda sessiz/playsInline
 *   arka plan reel'i tekrar tekrar başlatılmaya çalışılır.
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let cancelled = false;
    const timers: number[] = [];

    const start = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;

      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        /* autoplay engellendiyse poster görseliyle devam */
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void start();
    };

    void start();
    timers.push(
      window.setTimeout(start, 300),
      window.setTimeout(start, 900),
      window.setTimeout(start, 2200),
    );
    window.addEventListener("focus", start);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pointerdown", start, { once: true });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("focus", start);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointerdown", start);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/images/hero-video-poster-1280.webp"
      aria-hidden
      tabIndex={-1}
      disablePictureInPicture
      onLoadedData={() => void videoRef.current?.play().catch(() => {})}
      onCanPlay={() => void videoRef.current?.play().catch(() => {})}
    >
      <source src={HERO_VIDEO_SRC} type="video/mp4" />
    </video>
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  const heroLines =
    locale === "tr"
      ? ["Tarihin Kalbinde", "Zarif Bir Ege Kaçamağı"]
      : ["In the Heart of History", "An Elegant Aegean Escape"];
  const reservationHref = locale === "en" ? "/en/rezervasyon" : "/rezervasyon";
  const eventsHref = locale === "en" ? "/en/organizasyonlar" : "/organizasyonlar";

  return (
    <section className="hero grain">
      <div className="hero-media">
        <picture>
          <source
            type="image/webp"
            srcSet="/images/hero-video-poster-640.webp 640w, /images/hero-video-poster-960.webp 960w, /images/hero-video-poster-1280.webp 1280w, /images/hero-video-poster-1440.webp 1440w"
            sizes="100vw"
          />
          <img
            src="/images/hero-video-poster-1280.webp"
            srcSet="/images/hero-video-poster-640.webp 640w, /images/hero-video-poster-960.webp 960w, /images/hero-video-poster-1280.webp 1280w, /images/hero-video-poster-1440.webp 1440w"
            sizes="100vw"
            width={1440}
            height={2560}
            className="hero-poster object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            alt={locale === "tr" ? "Kozbeyli Konağı taş cephesi ve Ege manzarası" : "Kozbeyli Konağı stone facade and Aegean view"}
          />
        </picture>
        <HeroVideo />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
          {eyebrow}
        </span>

        <h1 aria-label={heroLines.join(" ")}>
          {heroLines.map((line) => (
            <span key={line} aria-hidden="true" style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </h1>

        <p className="hero-text">
          {locale === "tr"
            ? "Beş asırlık Kozbeyli köy dokusu içinde, Foça'ya 12 dakika; 19. yüzyıl tescilli taş konakta rafine bir sükunet."
            : "Within Kozbeyli's five-century village texture, 12 minutes from Foça; refined serenity in a 19th-century registered stone mansion."}
        </p>

        <div className="hero-actions">
          <Link href={reservationHref} className="button gold">
            {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
          </Link>
          <Link href={eventsHref} className="button ghost-light">
            {locale === "tr" ? "Davet & Etkinlik Planla" : "Plan an Event"}
          </Link>
        </div>
        <div className="hero-divider" aria-hidden />
      </div>

      <div className="scroll-cue" aria-hidden>
        <span>{locale === "tr" ? "Keşfet" : "Explore"}</span>
        <span className="line" />
      </div>
    </section>
  );
}
