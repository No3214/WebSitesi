"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MagneticLink } from "@/components/animations";
import { getConfiguredBookingEngineHref } from "@/lib/booking-engine-url";
import { publicEnv } from "@/lib/public-env";

type Props = { locale: "tr" | "en"; eyebrow: string };

const HERO_VIDEO_SRC = "/videos/hero.mp4";
const HERO_MOBILE_VIDEO_SRC = "/videos/hero-mobile.mp4";

/**
 * Hero arka plan videosu:
 * - LCP elemanı her zaman poster görselidir (priority + preload), fakat video
 *   da ilk HTML'de yer alır. Böylece hydration gecikmesi veya event kaçması
 *   kullanıcıya "video yok" hissi vermez.
 * - Data Saver'da oynatma zorlanmaz; normal cihazlarda sessiz/playsInline
 *   arka plan reel'i tekrar tekrar başlatılmaya çalışılır.
 */
function HeroVideo({ locale }: Pick<Props, "locale">) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [activeSource, setActiveSource] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  const start = useCallback(async (force = false) => {
    const video = videoRef.current;
    if (!video) return;
    if (userPausedRef.current && !force) return;

    try {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setIsPlaying(!video.paused);
      setPlaybackBlocked(false);
    } catch {
      setIsPlaying(false);
      setPlaybackBlocked(true);
    }
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const chooseSource = () => {
      setActiveSource(mobileQuery.matches ? HERO_MOBILE_VIDEO_SRC : HERO_VIDEO_SRC);
    };

    chooseSource();
    mobileQuery.addEventListener("change", chooseSource);

    return () => {
      mobileQuery.removeEventListener("change", chooseSource);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      userPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
      return;
    }

    userPausedRef.current = false;
    void start(true);
  };

  useEffect(() => {
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let cancelled = false;
    const timers: number[] = [];

    const tryStart = () => {
      if (!cancelled) void start();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void start();
    };

    if (activeSource) void start();
    timers.push(
      window.setTimeout(tryStart, 300),
      window.setTimeout(tryStart, 900),
      window.setTimeout(tryStart, 2200),
    );
    window.addEventListener("focus", tryStart);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pointerdown", tryStart, { once: true });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("focus", tryStart);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointerdown", tryStart);
    };
  }, [activeSource, start]);

  const controlLabel =
    locale === "tr"
      ? isPlaying
        ? "Açılış videosunu duraklat"
        : "Açılış videosunu oynat"
      : isPlaying
        ? "Pause opening video"
        : "Play opening video";

  return (
    <>
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={activeSource || undefined}
        data-desktop-src={HERO_VIDEO_SRC}
        data-mobile-src={HERO_MOBILE_VIDEO_SRC}
        poster="/images/hero-video-poster-1280.webp"
        aria-hidden
        tabIndex={-1}
        disablePictureInPicture
        onLoadedData={() => void start()}
        onCanPlay={() => void start()}
        onPlaying={() => {
          setIsPlaying(true);
          setPlaybackBlocked(false);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setPlaybackBlocked(true);
        }}
      >
      </video>
      <button
        type="button"
        className="hero-video-control"
        aria-label={controlLabel}
        title={controlLabel}
        data-testid="hero-video-toggle"
        data-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause aria-hidden size={18} strokeWidth={2.2} /> : <Play aria-hidden size={18} strokeWidth={2.2} />}
      </button>
    </>
  );
}

export function HomeHero({ locale, eyebrow }: Props) {
  const heroTitle = locale === "tr" ? "Tarihin Kalbinde" : "In the Heart of History";
  const heroAccent = locale === "tr" ? "Zarif Bir Ege Kaçamağı" : "An Elegant Aegean Escape";
  const reservationHref = getConfiguredBookingEngineHref(publicEnv.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL);
  const eventsHref = locale === "en" ? "/en/events" : "/organizasyonlar";

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
        <HeroVideo locale={locale} />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "140px 0 120px" }}>
        <span className="eyebrow hero-eyebrow">
          {eyebrow}
        </span>
        <span className="hero-signature" aria-hidden="true">
          FOÇA · TAŞ · ZEYTİN
        </span>

        <h1 aria-label={`${heroTitle} ${heroAccent}`}>
          <span aria-hidden="true" className="hero-title-line">
            {heroTitle}
          </span>
          <span aria-hidden="true" className="hero-title-line hero-title-accent">
            {heroAccent}
          </span>
        </h1>

        <p className="hero-text">
          {locale === "tr"
            ? "Beş asırlık Kozbeyli köy dokusu içinde, Foça kıyı rotalarına yakın; 19. yüzyıl tescilli taş konakta rafine bir sükunet."
            : "Within Kozbeyli's five-century village texture, close to Foça's coastal routes; refined serenity in a 19th-century registered stone mansion."}
        </p>

        <div className="hero-actions">
          <MagneticLink
            href={reservationHref}
            className="button gold magnetic-cta"
            target="_blank"
            rel="noopener noreferrer"
            data-event="booking_engine_open"
          >
            {locale === "tr" ? "Hemen Rezervasyon" : "Book Now"}
          </MagneticLink>
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
