/* eslint-disable @next/next/no-img-element -- Galeri/lightbox onayli public asset'leri dogrudan servis eder (gallery-page-content ile ayni gerekce). */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent } from "react";

type Shot = { src: string; caption: { tr: string; en: string } };
type Locale = "tr" | "en";

const COPY = {
  tr: { open: "Büyüt", close: "Kapat", prev: "Önceki", next: "Sonraki", region: "Galeri ışık kutusu" },
  en: { open: "Enlarge", close: "Close", prev: "Previous", next: "Next", region: "Gallery lightbox" },
} as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

/**
 * Erişilebilir galeri ışık kutusu (lightbox):
 *  - Grid kareleri buton; tıkla/Enter ile tam ekran açılır.
 *  - Ok tuşları + kaydırma (swipe) ile gezinme, Esc ile kapanış.
 *  - Açıkken odak kapatma butonuna taşınır, kapanınca tetikleyen kareye döner.
 *  - prefers-reduced-motion'da geçiş animasyonu kapalı.
 *  - body scroll kilidi; aria-modal + aria-live.
 */
export function GalleryLightbox({
  shots,
  locale,
  eager,
}: {
  shots: Shot[];
  locale: Locale;
  eager?: Set<string>;
}) {
  const t = COPY[locale];
  const reduced = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = shots.length;
  const open = active !== null;

  const goNext = useCallback(() => setActive((p) => (p === null ? p : (p + 1) % count)), [count]);
  const goPrev = useCallback(
    () => setActive((p) => (p === null ? p : (p - 1 + count) % count)),
    [count],
  );
  const close = useCallback(() => setActive(null), []);

  // body scroll kilidi + acilinca kapatma butonuna odak
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // kapaninca tetikleyen kareye odagi geri ver
  const lastTrigger = useRef<number | null>(null);
  useEffect(() => {
    if (open) return;
    if (lastTrigger.current !== null) {
      triggerRefs.current[lastTrigger.current]?.focus();
      lastTrigger.current = null;
    }
  }, [open]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    touchX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? goNext : goPrev)();
    touchX.current = null;
  };

  return (
    <>
      <div className="gallery-grid">
        {shots.map((shot, i) => (
          <figure key={shot.src} className="gallery-grid-item" style={{ margin: 0 }}>
            <button
              type="button"
              className="gallery-grid-trigger"
              aria-label={`${shot.caption[locale]} — ${t.open}`}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              onClick={() => {
                lastTrigger.current = i;
                setActive(i);
              }}
            >
              <img
                src={shot.src}
                alt={shot.caption[locale]}
                className="object-cover"
                loading={i < 4 || eager?.has(shot.src) ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i < 4 || eager?.has(shot.src) ? "high" : "auto"}
              />
            </button>
            <figcaption>{shot.caption[locale]}</figcaption>
          </figure>
        ))}
      </div>

      {open ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t.region}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="gallery-lightbox-backdrop"
            aria-label={t.close}
            tabIndex={-1}
            onClick={close}
          />
          <button
            type="button"
            className="gallery-lightbox-close"
            aria-label={t.close}
            ref={closeRef}
            onClick={close}
          >
            ✕
          </button>
          {count > 1 ? (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-prev"
              aria-label={t.prev}
              onClick={goPrev}
            >
              ‹
            </button>
          ) : null}
          <figure
            className="gallery-lightbox-figure"
            style={{ transition: reduced ? "none" : undefined }}
          >
            <img src={shots[active].src} alt={shots[active].caption[locale]} />
            <figcaption aria-live="polite">
              {shots[active].caption[locale]}
              <span className="gallery-lightbox-count">
                {" "}
                {active + 1} / {count}
              </span>
            </figcaption>
          </figure>
          {count > 1 ? (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-next"
              aria-label={t.next}
              onClick={goNext}
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default GalleryLightbox;
