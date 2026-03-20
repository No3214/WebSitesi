"use client";

import Image from "next/image";
import { useEffect, useCallback, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxProps = {
  images: string[];
  initialIndex: number;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ images, initialIndex, alt, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);
  const touchStartXRef = useRef<number>(0);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  // Keyboard handling + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  // Focus trap: save previous focus, focus close button, restore on unmount
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return;

    const preloadIndices = [
      (index + 1) % images.length,
      (index - 1 + images.length) % images.length,
    ];

    const links: HTMLLinkElement[] = [];
    for (const idx of preloadIndices) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = images[idx];
      document.head.appendChild(link);
      links.push(link);
    }

    return () => {
      for (const link of links) {
        document.head.removeChild(link);
      }
    };
  }, [index, images]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-label="Image gallery"
      aria-modal="true"
    >
      <button ref={closeButtonRef} className="lightbox-close" onClick={onClose} aria-label="Close gallery">
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous image">
            <ChevronLeft size={24} />
          </button>
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next image">
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index]}
          alt={`${alt} ${index + 1}`}
          fill
          className="object-cover"
          style={{ objectFit: "contain" }}
          sizes="90vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="lightbox-counter">{index + 1} / {images.length}</div>
      )}
    </div>
  );
}
