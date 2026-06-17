// Kozbeyli Konağı — Onaylı Medya Manifestosu (Media Curation Manifest)
//
// Amac: her urun-yuzu (hero/kart/detay/galeri/OG) gorseli icin tek kaynak-i
// gercek metadata tutmak. tests/media-curation-contract.spec.ts bu manifesti
// kod referanslariyla birebir karsilastirir; boylece ileride sessizce
// eski/generic bir asset geri donemez.
//
// Kural ozeti (bkz docs/media-placement-audit.md):
//  - Stok/generic/uretilmis gorsel YOK.
//  - Misafir/cift yuzu ana urun veya OG gorseli olamaz (izin riski).
//  - Hero loop premium uzunlukta olmali: 15.78s montaj hero.mp4 onaylidir;
//    2.75s hero-property.mp4 klibi superseded (sadece tarihsel/turev).

export type MediaRole =
  | "hero-video"
  | "hero-poster"
  | "card"
  | "detail"
  | "gallery"
  | "og"
  | "gastronomy";

export type MediaAsset = {
  /** public/ altindaki servis yolu */
  path: string;
  /** asseti kullanan rota */
  page: string;
  /** konu basligi */
  topic: string;
  /** kullanim rolu */
  role: MediaRole;
  /** kaynak / koken (provenance) */
  source: string;
  /** onayli urun-yuzu asseti mi */
  approved: boolean;
  /** butunluk dogrulamasi (opsiyonel; video ve kritik gorseller icin) */
  sha256?: string;
};

export const mediaManifest: MediaAsset[] = [
  // — Ana sayfa hero —
  {
    path: "/videos/hero.mp4",
    page: "/",
    topic: "Tas konak montaji (dis cephe + atmosfer)",
    role: "hero-video",
    source: "Kozbeyli cekim montaji (2026-06-16)",
    approved: true,
    sha256:
      "bec54fd97185b0722bd9984382fa5c5efb6fabfe423932fe4ee7dffe1acfbf67",
  },
  {
    path: "/images/hero-video-poster-1280.webp",
    page: "/",
    topic: "Hero LCP posteri (dis cephe karesi)",
    role: "hero-poster",
    source: "hero.mp4 dis cephe karesinden tureme",
    approved: true,
  },

  // — Organizasyonlar —
  {
    path: "/images/organizasyonlar/butik-dugun.jpg",
    page: "/organizasyonlar",
    topic: "Teras dugun masasi ve manzara",
    role: "card",
    source: "Kozbeyli Dugun/Nisan Sunum PDF",
    approved: true,
    sha256:
      "5b7294e32076eca11014009732e8f39793dff8b7a26820b3bd16f9e61f94956f",
  },
  {
    path: "/images/organizasyonlar/butik-dugun.jpg",
    page: "/organizasyonlar",
    topic: "Sosyal paylasim karti (OG/Twitter)",
    role: "og",
    source: "Kozbeyli Dugun/Nisan Sunum PDF",
    approved: true,
    sha256:
      "5b7294e32076eca11014009732e8f39793dff8b7a26820b3bd16f9e61f94956f",
  },
  {
    path: "/images/organizasyonlar/teras-davet.jpg",
    page: "/organizasyonlar",
    topic: "Teras davet kurulumu (dugun detay)",
    role: "detail",
    source: "Kozbeyli Dugun/Nisan Sunum PDF",
    approved: true,
    sha256:
      "424df7d6cf546409ae5803fe62ba8a10f1e2ecf9a2114bbb76acf292e42bff0e",
  },
  {
    path: "/images/organizasyonlar/kurumsal-offsite.jpg",
    page: "/organizasyonlar",
    topic: "Kurumsal off-site toplanti kurulumu",
    role: "card",
    source: "Kozbeyli Toplanti/Konaklama PDF",
    approved: true,
    sha256:
      "f7912e7a2b20be1a5201fb701a5ca85dff57cbe4ed18142416249fa1403986cc",
  },
  {
    path: "/videos/kahvalti-poster.jpg",
    page: "/organizasyonlar",
    topic: "Gurme kutlama / serpme kahvalti",
    role: "gastronomy",
    source: "Mevcut gastronomi video posteri",
    approved: true,
    sha256:
      "03f042de671b94203f4ca3888afc5a866675657933784905945bb40f81673ad7",
  },

  // — Galeri (Google Drive profesyonel cekim arsivi) —
  {
    path: "/images/galeri/tas-cephe.jpg",
    page: "/galeri",
    topic: "Tas cephe",
    role: "gallery",
    source: "Google Drive profesyonel cekim arsivi",
    approved: true,
  },
  {
    path: "/images/galeri/aksam-sofrasi.jpg",
    page: "/galeri",
    topic: "Aksam sofrasi",
    role: "gallery",
    source: "Google Drive profesyonel cekim arsivi",
    approved: true,
  },
  {
    path: "/images/galeri/konagin-yuzu.jpg",
    page: "/galeri",
    topic: "Konagin yuzu",
    role: "gallery",
    source: "Google Drive profesyonel cekim arsivi",
    approved: true,
  },
  {
    path: "/images/galeri/tas-firin-pide.jpg",
    page: "/galeri",
    topic: "Tas firindan",
    role: "gallery",
    source: "Google Drive profesyonel cekim arsivi",
    approved: true,
  },
];

/** Belirli bir rol icin onayli asset yolunu dondurur. */
export function approvedAssetFor(role: MediaRole): MediaAsset | undefined {
  return mediaManifest.find((a) => a.role === role && a.approved);
}
