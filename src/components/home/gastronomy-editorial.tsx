"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { FadeIn, Parallax } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";

type LazyEditorialVideoProps = {
  src: string;
  poster: string;
  label: string;
  playLabel: string;
};

function waitForMediaData(video: HTMLVideoElement, timeoutMs = 15000) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const readyEvents = ["loadeddata", "canplay"];
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timer);
      readyEvents.forEach((event) => video.removeEventListener(event, settleReady));
      video.removeEventListener("error", settleBlocked);
    };

    const settleReady = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const settleBlocked = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("video-data-unavailable"));
    };

    const timer = window.setTimeout(() => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        settleReady();
        return;
      }
      settleBlocked();
    }, timeoutMs);

    readyEvents.forEach((event) => video.addEventListener(event, settleReady));
    video.addEventListener("error", settleBlocked);
  });
}

function waitForPlaybackAdvance(video: HTMLVideoElement, timeoutMs = 10000) {
  if (!video.paused && video.currentTime > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener("timeupdate", settleIfAdvanced);
      video.removeEventListener("playing", settleIfAdvanced);
      video.removeEventListener("error", settleBlocked);
      video.removeEventListener("pause", settleBlocked);
    };

    const settleIfAdvanced = () => {
      if (settled || video.paused || video.currentTime <= 0) return;
      settled = true;
      cleanup();
      resolve();
    };

    const settleBlocked = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("video-playback-unavailable"));
    };

    const timer = window.setTimeout(() => {
      settleIfAdvanced();
      if (!settled) {
        settleBlocked();
      }
    }, timeoutMs);

    video.addEventListener("timeupdate", settleIfAdvanced);
    video.addEventListener("playing", settleIfAdvanced);
    video.addEventListener("error", settleBlocked);
    video.addEventListener("pause", settleBlocked);
  });
}

function LazyEditorialVideo({ src, poster, label, playLabel }: LazyEditorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const markPlaybackState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(
      !video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
    );
  }, []);

  const start = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setShouldLoad(true);
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      if (
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        (!video.currentSrc && video.networkState === HTMLMediaElement.NETWORK_EMPTY)
      ) {
        video.load();
      }
      // Start playback before awaiting data so the browser keeps the tap/click user activation.
      let playError: unknown;
      const playPromise = video.play().catch((error) => {
        playError = error;
      });
      setPlaybackBlocked(false);
      setIsPlaying(true);
      await waitForMediaData(video);
      if (playError) throw playError;
      await playPromise;
      if (playError) throw playError;
      await waitForPlaybackAdvance(video).catch(() => undefined);
      markPlaybackState();
    } catch {
      setIsPlaying(false);
      setPlaybackBlocked(true);
    }
  }, [markPlaybackState]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    setShouldLoad(true);
    void start();
  }, [isPlaying, start]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const controlText = playLabel.toLowerCase().startsWith("play")
    ? isPlaying
      ? "Pause"
      : "Play"
    : isPlaying
      ? "Duraklat"
      : "Oynat";

  return (
    <>
      <video
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        controls={playbackBlocked}
        preload={shouldLoad ? "metadata" : "none"}
        aria-label={label}
        data-video-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
        onClick={togglePlayback}
        onPlaying={() => {
          markPlaybackState();
          setPlaybackBlocked(false);
        }}
        onLoadedData={markPlaybackState}
        onTimeUpdate={markPlaybackState}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setPlaybackBlocked(true);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="editorial-video-control"
        data-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
        data-ready={isHydrated ? "true" : "false"}
        data-testid={`editorial-video-${src.includes("mihlama") ? "mihlama" : "kahvalti"}`}
        disabled={!isHydrated}
        aria-label={isPlaying ? label : playLabel}
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause aria-hidden size={22} strokeWidth={2.2} /> : <Play aria-hidden size={22} strokeWidth={2.2} />}
        <span className="video-control-label">{controlText}</span>
      </button>
    </>
  );
}

export function GastronomyEditorial({ locale }: { locale: "tr" | "en" }) {
  return (
    <section className="section section-alt gastronomy-editorial-section" id="gastronomi">
      <div className="container">
        <FadeIn>
          <SectionTitle
            eyebrow={locale === "tr" ? "MUTFAĞIN RİTMİ" : "RHYTHM OF THE KITCHEN"}
            title={locale === "tr" ? "Sofrada Yaşayan Miras" : "A Living Heritage at the Table"}
            text={
              locale === "tr"
                ? "Antakya'dan Ege'ye uzanan bir lezzet köprüsü; taş fırından serpme kahvaltıya her an bir tören."
                : "A bridge of flavor from Antakya to the Aegean; every moment a ceremony, from stone oven to breakfast spread."
            }
          />
        </FadeIn>

        <div style={{ display: "grid", gap: "clamp(48px, 7vw, 96px)" }}>
          <FadeIn>
            <div className="editorial">
              <Parallax className="editorial-media" distance={10}>
                <LazyEditorialVideo
                  src="/videos/kahvalti.mp4"
                  poster="/videos/kahvalti-poster.jpg"
                  label={locale === "tr" ? "Serpme köy kahvaltısı videosu" : "Village breakfast video"}
                  playLabel={locale === "tr" ? "Kahvaltı videosunu oynat" : "Play breakfast video"}
                />
                <span className="media-frame" aria-hidden />
              </Parallax>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "SABAH GÜNEŞİ" : "MORNING SUN"}</span>
                <h3>{locale === "tr" ? "Köy Kahvaltısı Töreni" : "The Village Breakfast Ceremony"}</h3>
                <p>
                  {locale === "tr"
                    ? "Avlunun taş gölgesinde kurulan sofra; köy tereyağı, kahvaltılıklar ve taş fırından yeni çıkmış sıcak ekmekle başlar."
                    : "A table set in the stone shade of the courtyard; it begins with village butter, local delicacies, and warm bread fresh from the stone oven."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Yöreden toplanan mevsim ürünleri" : "Seasonal produce from the village"}</li>
                  <li>{locale === "tr" ? "Taş dibekte dövülen kahve ritüeli" : "Coffee ritual in the stone dibek"}</li>
                  <li>{locale === "tr" ? "Konak misafirlerine özel sofra düzeni" : "A table reserved for mansion guests"}</li>
                </ul>
                <Link href={locale === "en" ? "/en/dining" : "/gastronomi"} className="button secondary">
                  {locale === "tr" ? "Gastronomi Hikayesi" : "Gastronomy Story"}
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="editorial reverse">
              <Parallax className="editorial-media" distance={12}>
                <LazyEditorialVideo
                  src="/videos/mihlama.mp4"
                  poster="/videos/mihlama-poster.jpg"
                  label={locale === "tr" ? "Ocakta hazırlanan yöresel lezzet videosu" : "Regional dish on the stove video"}
                  playLabel={locale === "tr" ? "Mıhlama videosunu oynat" : "Play mıhlama video"}
                />
                <span className="media-frame" aria-hidden />
              </Parallax>
              <div className="editorial-copy">
                <span className="eyebrow">{locale === "tr" ? "OCAK BAŞI" : "BY THE HEARTH"}</span>
                <h3>{locale === "tr" ? "İnci Hanım'ın Mutfağı" : "İnci Hanım's Kitchen"}</h3>
                <p>
                  {locale === "tr"
                    ? "Antakya kökenli aile reçeteleri, Ege otlarıyla buluşur. Ocakta ağır ağır pişen her tencere, konağın hafızasından bir sayfadır."
                    : "Family recipes rooted in Antakya meet Aegean herbs. Every pot simmering on the stove is a page from the mansion's memory."}
                </p>
                <ul className="editorial-list">
                  <li>{locale === "tr" ? "Antakya & Ege füzyon menüsü" : "Antakya & Aegean fusion menu"}</li>
                  <li>{locale === "tr" ? "Taş fırında pişen yöresel tarifler" : "Regional recipes from the stone oven"}</li>
                  <li>{locale === "tr" ? "Akşam yemeğinde şef sofrası deneyimi" : "Chef's table experience at dinner"}</li>
                </ul>
                <Link href={locale === "en" ? "/en/menu" : "/menu"} className="button secondary">
                  {locale === "tr" ? "Menüyü Keşfet" : "Explore the Menu"}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
