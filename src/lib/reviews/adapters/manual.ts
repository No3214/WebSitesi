import { maskAuthor, normalizeRating } from "@/lib/reviews/normalize";
import { sanitizeReviewBody } from "@/lib/reviews/sanitize";
import type { NormalizedReview } from "@/lib/reviews/types";

// Manuel/admin girisli kaynaklar (ETS Tur, Jolly, Tatilbudur, HotelsCombined,
// onaysiz Booking). Public review API'leri yok → admin elle girer; bu adapter
// girdiyi ortak semaya normalize + sanitize eder.

export type ManualReviewInput = {
  sourceKey: string;
  externalId?: string;
  rating: number;
  /** Girdi olcegi (orn Booking 10). Varsayilan 5. */
  scaleMax?: number;
  reviewBody?: string;
  authorName?: string;
  datePublished?: string;
  lang?: string;
};

export function manualAdapter(input: ManualReviewInput): NormalizedReview {
  return {
    sourceKey: input.sourceKey,
    externalId: input.externalId || `${input.sourceKey}:${input.authorName || "anon"}:${input.datePublished || ""}`,
    rating: normalizeRating(input.rating, input.scaleMax ?? 5),
    reviewBody: sanitizeReviewBody(input.reviewBody),
    authorDisplay: maskAuthor(input.authorName),
    datePublished: input.datePublished || new Date().toISOString(),
    lang: input.lang || "tr",
  };
}
