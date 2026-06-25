import { maskAuthor, normalizeRating } from "@/lib/reviews/normalize";
import { sanitizeReviewBody } from "@/lib/reviews/sanitize";
import type { NormalizedReview } from "@/lib/reviews/types";

// First-party (konaklama-dogrulamali) kaynak: otelin KENDI formuyla, konaklama
// sonrasi topladigi dogrulanmis yorumlar. Kendi icerigimiz → tam kontrol; KVKK
// geregi yine yazar adi maskelenir, govde sanitize edilir.

export type FirstPartyReviewInput = {
  externalId: string;
  rating: number;
  scaleMax?: number;
  reviewBody?: string;
  authorName?: string;
  datePublished?: string;
  lang?: string;
};

export function firstPartyAdapter(input: FirstPartyReviewInput): NormalizedReview {
  return {
    sourceKey: "first-party",
    externalId: input.externalId,
    rating: normalizeRating(input.rating, input.scaleMax ?? 5),
    reviewBody: sanitizeReviewBody(input.reviewBody),
    authorDisplay: maskAuthor(input.authorName),
    datePublished: input.datePublished || new Date().toISOString(),
    lang: input.lang || "tr",
  };
}
