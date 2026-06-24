import type { LocalizedText } from "./faqs";

export type GalleryShot = {
  src: string;
  caption: LocalizedText;
};

// Ana sayfa "Konaktan Kareler" şeridi ile /galeri sayfasının ortak veri kaynağı.
// Not (2026-06-11): tas-cephe / aksam-sofrasi / konagin-yuzu / tas-firin-pide
// kareleri Google Drive arşivindeki profesyonel çekimlerden alındı.
export const galleryShots: GalleryShot[] = [
  { src: "/images/galeri/g1.jpg", caption: { tr: "Kuşbakışı Konak", en: "The Mansion from Above" } },
  { src: "/images/galeri/tas-cephe.jpg", caption: { tr: "Taş Cephe", en: "Stone Facade" } },
  { src: "/images/hero.jpg", caption: { tr: "Taş Avlu", en: "Stone Courtyard" } },
  { src: "/images/galeri/aksam-sofrasi.jpg", caption: { tr: "Akşam Sofrası", en: "Evening Table" } },
  { src: "/videos/kahvalti-poster.jpg", caption: { tr: "Serpme Kahvaltı", en: "Village Breakfast" } },
  { src: "/images/odalar/superior-oda-deniz-manzarali/2.jpg", caption: { tr: "Superior Oda", en: "Superior Room" } },
  { src: "/videos/mihlama-poster.jpg", caption: { tr: "Ocak Başı", en: "By the Hearth" } },
  { src: "/images/odalar/standart-deniz-manzarali-oda/3.jpg", caption: { tr: "Ege Manzarası", en: "Aegean View" } },
  { src: "/images/odalar/aile-odasi-4-kisilik/2.jpg", caption: { tr: "Aile Odası", en: "Family Room" } },
  { src: "/images/odalar/balkonlu-aile-odasi-4-kisilik/3.jpg", caption: { tr: "Balkon Detayı", en: "Balcony Detail" } },
  { src: "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/4.jpg", caption: { tr: "Taş Doku", en: "Stone Texture" } },
];

// /galeri tam sayfası: şerit kareleri + oda arşivinden ek seçkiler.
export const galleryExtended: GalleryShot[] = [
  ...galleryShots,
  { src: "/images/galeri/g2.jpg", caption: { tr: "Taş Konağın Cephesi", en: "Stone Mansion Facade" } },
  { src: "/images/galeri/g6.jpg", caption: { tr: "Akşam Şarap Servisi", en: "Evening Wine Service" } },
  { src: "/images/galeri/g4.jpg", caption: { tr: "Ahşap ve El İşçiliği", en: "Timber & Craftsmanship" } },
  { src: "/images/galeri/g3.jpg", caption: { tr: "Bir Kadeh Eşliğinde", en: "Over a Glass" } },
  { src: "/images/galeri/g5.jpg", caption: { tr: "Avluda Sofra", en: "Table in the Courtyard" } },
  { src: "/images/galeri/konagin-yuzu.jpg", caption: { tr: "Konağın Yüzü", en: "Face of the Mansion" } },
  { src: "/images/galeri/tas-firin-pide.jpg", caption: { tr: "Taş Fırından", en: "From the Stone Oven" } },
  { src: "/images/odalar/standart-oda/1.jpg", caption: { tr: "Standart Oda", en: "Standard Room" } },
  { src: "/images/odalar/standart-oda/2.jpg", caption: { tr: "Horasan Duvar", en: "Horasan Wall" } },
  { src: "/images/odalar/standart-bahce-manzarali-oda/3.jpg", caption: { tr: "Bahçe Işığı", en: "Garden Light" } },
  { src: "/images/odalar/standart-bahce-manzarali-oda/4.jpg", caption: { tr: "Sabah Sükuneti", en: "Morning Calm" } },
  { src: "/images/odalar/superior-oda-deniz-manzarali/3.jpg", caption: { tr: "Deniz Işıltısı", en: "Sea Shimmer" } },
  { src: "/images/odalar/aile-odasi-4-kisilik/3.jpg", caption: { tr: "Geniş Yaşam", en: "Generous Living" } },
  { src: "/images/odalar/balkonlu-aile-odasi-4-kisilik/2.jpg", caption: { tr: "Balkonda Akşam", en: "Evening on the Balcony" } },
  { src: "/images/odalar/superior-3-kisilik-oda-deniz-manzarali/3.jpg", caption: { tr: "Taş ve Ahşap", en: "Stone and Timber" } },
];
