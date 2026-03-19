"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { id: "all", label: "Tümü" },
  { id: "konak", label: "Konak" },
  { id: "odalar", label: "Odalar" },
  { id: "restoran", label: "Restoran" },
  { id: "bahce", label: "Bahçe & Avlu" },
  { id: "manzara", label: "Manzara" },
];

const photos = [
  // Standart Oda
  { src: "/images/rooms/standart-1.jpeg", alt: "Standart Oda", category: "odalar" },
  { src: "/images/rooms/standart-2.jpeg", alt: "Standart Oda detay", category: "odalar" },
  { src: "/images/rooms/standart-3.jpeg", alt: "Standart Oda iç mekan", category: "odalar" },
  // Bahçe Manzaralı Oda
  { src: "/images/rooms/bahce-1.jpeg", alt: "Bahçe Manzaralı Oda", category: "odalar" },
  { src: "/images/rooms/bahce-2.jpeg", alt: "Bahçe Manzaralı Oda detay", category: "odalar" },
  // Deniz Manzaralı Oda
  { src: "/images/rooms/deniz-1.jpeg", alt: "Deniz Manzaralı Oda", category: "odalar" },
  { src: "/images/rooms/deniz-2.jpeg", alt: "Deniz Manzaralı Oda detay", category: "odalar" },
  { src: "/images/rooms/deniz-3.jpeg", alt: "Foça Körfezi manzarası", category: "manzara" },
  // Üç Kişilik Oda
  { src: "/images/rooms/uc-kisilik-1.jpeg", alt: "Üç Kişilik Oda", category: "odalar" },
  { src: "/images/rooms/uc-kisilik-2.jpeg", alt: "Üç Kişilik Oda detay", category: "odalar" },
  // Aile Odası
  { src: "/images/rooms/aile-1.jpeg", alt: "Aile Odası", category: "odalar" },
  { src: "/images/rooms/aile-2.jpeg", alt: "Aile Odası detay", category: "odalar" },
  { src: "/images/rooms/aile-3.jpeg", alt: "Aile Odası iç mekan", category: "odalar" },
  // Balkonlu Aile Odası
  { src: "/images/rooms/balkonlu-aile-1.jpeg", alt: "Balkonlu Aile Odası", category: "odalar" },
  { src: "/images/rooms/balkonlu-aile-2.jpeg", alt: "Balkonlu Aile Odası balkon", category: "bahce" },
  // Üç kişilik & Aile ekstra
  { src: "/images/rooms/uc-kisilik-3.jpeg", alt: "Konak iç mekan detay", category: "konak" },
  { src: "/images/rooms/aile-4.jpeg", alt: "Konak taş duvar detay", category: "konak" },
  { src: "/images/rooms/standart-4.jpeg", alt: "Oda banyo detay", category: "odalar" },
];

export function GalleryClient() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  const openLightbox = (idx: number) => {
    setLightbox(idx);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = "";
  };

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    const next = lightbox + dir;
    if (next >= 0 && next < filtered.length) setLightbox(next);
  };

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow="GALERİ" title="Kozbeyli Konağı'ndan Kareler" text="500 yıllık taş mimarinin, Ege mutfağının ve doğanın buluştuğu anlar." />
            </FadeIn>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`button ${filter === cat.id ? "primary" : "secondary"}`}
                  style={{ padding: "8px 20px", fontSize: "0.8rem" }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {filtered.map((photo, idx) => (
                <FadeIn key={photo.src} delay={idx * 0.05}>
                  <div
                    style={{ position: "relative", aspectRatio: "4/3", cursor: "pointer", overflow: "hidden" }}
                    onClick={() => openLightbox(idx)}
                  >
                    <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" style={{ transition: "transform 0.4s ease" }} />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightbox !== null && (
          <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeLightbox}>
            <button onClick={closeLightbox} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "white", cursor: "pointer", zIndex: 10 }}>
              <X size={28} />
            </button>
            {lightbox > 0 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} style={{ position: "absolute", left: "24px", background: "none", border: "none", color: "white", cursor: "pointer", zIndex: 10 }}>
                <ChevronLeft size={36} />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} style={{ position: "absolute", right: "24px", background: "none", border: "none", color: "white", cursor: "pointer", zIndex: 10 }}>
                <ChevronRight size={36} />
              </button>
            )}
            <div style={{ position: "relative", width: "90vw", height: "80vh", maxWidth: "1200px" }} onClick={(e) => e.stopPropagation()}>
              <Image src={filtered[lightbox].src} alt={filtered[lightbox].alt} fill className="object-contain" sizes="90vw" />
            </div>
            <p style={{ position: "absolute", bottom: "24px", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", textAlign: "center" }}>
              {filtered[lightbox].alt} — {lightbox + 1} / {filtered.length}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
