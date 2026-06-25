import type { NormalizedReview, ReviewDisplayPolicy } from "@/lib/reviews/types";

export { googleReviewsAdapter, isGoogleReviewsConfigured } from "./google";
export { manualAdapter, type ManualReviewInput } from "./manual";
export { firstPartyAdapter, type FirstPartyReviewInput } from "./first-party";

/**
 * Kaynagin displayPolicy'sine gore public cikti uygular:
 *  - full-text: oldugu gibi (puan + metin)
 *  - score-and-link / score-only: reviewBody DUSURULUR (yasal/lisans kisiti).
 * Bu, public API/render katmaninin ucuncu-taraf metnini sizdirmamasini garantiler.
 */
export function applyDisplayPolicy(
  review: NormalizedReview,
  policy: ReviewDisplayPolicy,
): NormalizedReview {
  if (policy === "full-text") return review;
  return { ...review, reviewBody: "" };
}
