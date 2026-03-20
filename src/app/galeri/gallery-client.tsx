"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/animations";
import { SectionTitle } from "@/components/section-title";
import { ImageLightbox } from "@/components/image-lightbox";
import { useDictionary } from "@/hooks/use-dictionary";

const categories = {
  tr: [
    { id: "all", label: "Tümü" },
    { id: "konak", label: "Konak" },
    { id: "odalar", label: "Odalar" },
    { id: "restoran", label: "Restoran" },
    { id: "bahce", label: "Bahçe & Avlu" },
    { id: "manzara", label: "Manzara" },
  ],
  en: [
    { id: "all", label: "All" },
    { id: "konak", label: "Mansion" },
    { id: "odalar", label: "Rooms" },
    { id: "restoran", label: "Restaurant" },
    { id: "bahce", label: "Garden & Courtyard" },
    { id: "manzara", label: "Scenery" },
  ],
} as const;

const photos = [
  { src: "/images/rooms/standart-1.jpeg", alt: "Standart Oda", altEn: "Standard Room", category: "odalar" },
  { src: "/images/rooms/standart-2.jpeg", alt: "Standart Oda detay", altEn: "Standard Room detail", category: "odalar" },
  { src: "/images/rooms/standart-3.jpeg", alt: "Standart Oda iç mekan", altEn: "Standard Room interior", category: "odalar" },
  { src: "/images/rooms/bahce-1.jpeg", alt: "Bahçe Manzaralı Oda", altEn: "Garden View Room", category: "odalar" },
  { src: "/images/rooms/bahce-2.jpeg", alt: "Bahçe Manzaralı Oda detay", altEn: "Garden View Room detail", category: "odalar" },
  { src: "/images/rooms/deniz-1.jpeg", alt: "Deniz Manzaralı Oda", altEn: "Sea View Room", category: "odalar" },
  { src: "/images/rooms/deniz-2.jpeg", alt: "Deniz Manzaralı Oda detay", altEn: "Sea View Room detail", category: "odalar" },
  { src: "/images/rooms/deniz-3.jpeg", alt: "Foça Körfezi manzarası", altEn: "Foça Bay panorama", category: "manzara" },
  { src: "/images/rooms/uc-kisilik-1.jpeg", alt: "Üç Kişilik Oda", altEn: "Triple Room", category: "odalar" },
  { src: "/images/rooms/uc-kisilik-2.jpeg", alt: "Üç Kişilik Oda detay", altEn: "Triple Room detail", category: "odalar" },
  { src: "/images/rooms/aile-1.jpeg", alt: "Aile Odası", altEn: "Family Room", category: "odalar" },
  { src: "/images/rooms/aile-2.jpeg", alt: "Aile Odası detay", altEn: "Family Room detail", category: "odalar" },
  { src: "/images/rooms/aile-3.jpeg", alt: "Aile Odası iç mekan", altEn: "Family Room interior", category: "odalar" },
  { src: "/images/rooms/balkonlu-aile-1.jpeg", alt: "Balkonlu Aile Odası", altEn: "Balcony Family Room", category: "odalar" },
  { src: "/images/rooms/balkonlu-aile-2.jpeg", alt: "Balkonlu Aile Odası balkon", altEn: "Balcony Family Room balcony", category: "bahce" },
  { src: "/images/rooms/uc-kisilik-3.jpeg", alt: "Konak iç mekan detay", altEn: "Mansion interior detail", category: "konak" },
  { src: "/images/rooms/aile-4.jpeg", alt: "Konak taş duvar detay", altEn: "Mansion stone wall detail", category: "konak" },
  { src: "/images/rooms/standart-4.jpeg", alt: "Oda banyo detay", altEn: "Room bathroom detail", category: "odalar" },
];

const pageText = {
  tr: {
    eyebrow: "GALERİ",
    title: "Kozbeyli Konağı'ndan Kareler",
    text: "500 yıllık taş mimarinin, Ege mutfağının ve doğanın buluştuğu anlar.",
  },
  en: {
    eyebrow: "GALLERY",
    title: "Moments from Kozbeyli Mansion",
    text: "Where 500-year-old stone architecture, Aegean cuisine, and nature come together.",
  },
} as const;

export function GalleryClient() {
  const { locale } = useDictionary();
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);
  const t = pageText[locale];
  const cats = categories[locale];
  const getAlt = (photo: typeof photos[number]) => locale === "en" ? photo.altEn : photo.alt;

  return (
    <>
      <SiteHeader />
      <main style={{ paddingTop: "80px" }}>
        <section className="section">
          <div className="container">
            <FadeIn>
              <SectionTitle eyebrow={t.eyebrow} title={t.title} text={t.text} />
            </FadeIn>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
              {cats.map((cat) => (
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
                    role="button"
                    tabIndex={0}
                    aria-label={getAlt(photo)}
                    style={{ position: "relative", aspectRatio: "4/3", cursor: "zoom-in", overflow: "hidden" }}
                    onClick={() => setLightbox(idx)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightbox(idx); } }}
                  >
                    <Image src={photo.src} alt={getAlt(photo)} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" style={{ transition: "transform 0.4s ease" }} />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {lightbox !== null && (
          <ImageLightbox
            images={filtered.map((p) => p.src)}
            initialIndex={lightbox}
            alt={getAlt(filtered[lightbox])}
            onClose={() => setLightbox(null)}
          />
        )}
      </main>
    </>
  );
}
