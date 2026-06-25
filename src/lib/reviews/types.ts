// Review Orchestration — ortak tipler (kaynak-bağımsız normalize şema).
// Üçüncü-taraf puanları ASLA AggregateRating JSON-LD'ye girmez (self-serving yasağı).

export type ReviewSourceType = "api" | "manual" | "first-party";

/**
 * Public sayfada bir kaynağın NE kadarının gösterileceğini belirler.
 * - full-text: puan + yorum metni + atıf (örn. Google kendi işletmen, first-party)
 * - score-and-link: yalnız puan rozeti + kaynağa link (örn. onaysız Booking)
 * - score-only: yalnız puan (link bile yoksa)
 */
export type ReviewDisplayPolicy = "full-text" | "score-and-link" | "score-only";

export type ReviewStatus = "pending" | "published" | "hidden" | "flagged";

export type NormalizedReview = {
  /** Kaynak slug/id (review-sources ile eşleşir). */
  sourceKey: string;
  /** Kaynaktaki tekil yorum kimliği (dedup anahtarı). */
  externalId: string;
  /** 1-5 ölçeğine normalize edilmiş puan. */
  rating: number;
  /** Sanitize edilmiş düz metin gövde (gizlenebilir). */
  reviewBody: string;
  /** Maskelenmiş yazar adı (örn "Ayşe K."). Tam ad ASLA tutulmaz. */
  authorDisplay: string;
  /** ISO tarih. */
  datePublished: string;
  lang?: string;
};

export type ReviewSourceConfig = {
  key: string;
  name: string;
  type: ReviewSourceType;
  sourceUrl: string;
  displayPolicy: ReviewDisplayPolicy;
  isActive: boolean;
};
