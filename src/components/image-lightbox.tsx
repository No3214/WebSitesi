"use client";

import Image from "next/image";
import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxProps = {
  images: string[];
  initialIndex: number;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ images, initialIndex, alt, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

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

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-label="Image gallery" aria-modal="true">
      <button className="lightbox-close" onClick={onClose} aria-label="Close gallery">
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
