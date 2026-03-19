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
  { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80", alt: "Kozbeyli Konağı dış görünüm", category: "konak" },
  { src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80", alt: "Standart oda iç mekan", category: "odalar" },
  { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80", alt: "Deniz manzaralı oda", category: "odalar" },
  { src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80", alt: "Superior süit", category: "odalar" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80", alt: "Restoran akşam yemeği", category: "restoran" },
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", alt: "Organik köy kahvaltısı", category: "restoran" },
  { src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80", alt: "Aile odası", category: "odalar" },
  { src: "https://images.unsplash.com/photo-1518173946687-a4c8a492e7e0?auto=format&fit=crop&w=900&q=80", alt: "Bahçe ve avlu", category: "bahce" },
  { src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80", alt: "Ege denizi manzarası", category: "manzara" },
  { src: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80", alt: "Üç kişilik oda", category: "odalar" },
  { src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80", alt: "Konak giriş", category: "konak" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80", alt: "Kozbeyli köyü panorama", category: "manzara" },
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
