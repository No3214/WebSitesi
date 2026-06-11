import type { LocalizedText } from "./faqs";

export type GalleryShot = {
  src: string;
  caption: LocalizedText;
};

// Ana sayfa "Konaktan Kareler" şeridi ile /galeri sayfasının ortak veri kaynağı.
export const galleryShots: GalleryShot[] = [
  { src: "/images/hero.jpg", caption: { tr: "Taş Avlu", en: "Stone Courtyard" } },
  { src: "/videos/kahvalti-poster.jpg", caption: { tr: "Serpme Kahvaltı", en: "Village Breakfast" } },
  { src: "/images/odalar/superrior-oda-deniz-manzarali/2.jpg", caption: { tr: "Superior Oda", en: "Superior Room" } },
  { src: "/videos/mihlama-poster.jpg", caption: { tr: "Ocak Başı", en: "By the Hearth" } },
  { src: "/images/odalar/standart-deniz-manzarali-oda/3.jpg", caption: { tr: "Ege Manzarası", en: "Aegean View" } },
  { src: "/images/odalar/aile-odasi-4-kisilik/2.jpg", caption: { tr: "Aile Odası", en: "Family Room" } },
  { src: "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg", caption: { tr: "Balkon Detayı", en: "Balcony Detail" } },
  { src: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/4.jpg", caption: { tr: "Taş Doku", en: "Stone Texture" } },
];

// /galeri tam sayfası: şerit kareleri + oda arşivinden ek seçkiler.
export const galleryExtended: GalleryShot[] = [
  ...galleryShots,
  { src: "/images/odalar/standart-oda/1.jpg", caption: { tr: "Standart Oda", en: "Standard Room" } },
  { src: "/images/odalar/standart-oda/2.jpg", caption: { tr: "Horasan Duvar", en: "Horasan Wall" } },
  { src: "/images/odalar/standart-bahce-manzarali-oda/3.jpg", caption: { tr: "Bahçe Işığı", en: "Garden Light" } },
  { src: "/images/odalar/standart-bahce-manzarali-oda/4.jpg", caption: { tr: "Sabah Sükuneti", en: "Morning Calm" } },
  { src: "/images/odalar/superrior-oda-deniz-manzarali/3.jpg", caption: { tr: "Deniz Işıltısı", en: "Sea Shimmer" } },
  { src: "/images/odalar/aile-odasi-4-kisilik/3.jpg", caption: { tr: "Geniş Yaşam", en: "Generous Living" } },
  { src: "/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg", caption: { tr: "Balkonda Akşam", en: "Evening on the Balcony" } },
  { src: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/3.jpg", caption: { tr: "Taş ve Ahşap", en: "Stone and Timber" } },
];
