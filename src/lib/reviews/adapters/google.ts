import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { maskAuthor, normalizeRating } from "@/lib/reviews/normalize";
import { sanitizeReviewBody } from "@/lib/reviews/sanitize";
import type { NormalizedReview } from "@/lib/reviews/types";

// Google Business Profile review adapter — otelin KENDI dogrulanmis isletmesi.
// Davranis (GA4/Meta deseni): OAuth creds eksikse SESSIZCE no-op ([] + log).
// ASLA throw etmez. Canli cekim B1 (kullanici OAuth + API erisimi) ile aktiflenir.

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
// NOT: My Business v4 reviews endpoint'i tarihsel olarak asagidaki gibidir; Google
// Business Profile API'lerinin GUNCEL imzasini resmi dokumandan dogrula (B1). Yanlissa
// istek basarisiz olur ve adapter gracefully [] doner (siteyi kirmaz).
const REVIEWS_ENDPOINT = (account: string, location: string) =>
  `https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews?pageSize=50`;

const STAR: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export function isGoogleReviewsConfigured(): boolean {
  return Boolean(
    env.GOOGLE_BUSINESS_OAUTH_CLIENT_ID &&
      env.GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET &&
      env.GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN &&
      env.GOOGLE_BUSINESS_ACCOUNT_ID &&
      env.GOOGLE_BUSINESS_LOCATION_ID,
  );
}

async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_BUSINESS_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET,
        refresh_token: env.GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token || null;
  } catch {
    return null;
  }
}

type RawGoogleReview = {
  reviewId?: string;
  starRating?: string;
  comment?: string;
  createTime?: string;
  reviewer?: { displayName?: string };
};

/**
 * Google review'larini normalize edip dondurur. Konfigure degilse/hata olursa [].
 */
export async function googleReviewsAdapter(): Promise<NormalizedReview[]> {
  if (!isGoogleReviewsConfigured()) {
    logEvent("info", "reviews.google.skipped_not_configured", {});
    return [];
  }
  const token = await getAccessToken();
  if (!token) {
    logEvent("warn", "reviews.google.token_failed", {});
    return [];
  }
  try {
    const url = REVIEWS_ENDPOINT(
      env.GOOGLE_BUSINESS_ACCOUNT_ID,
      env.GOOGLE_BUSINESS_LOCATION_ID,
    );
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      logEvent("warn", "reviews.google.fetch_rejected", { status: res.status });
      return [];
    }
    const json = (await res.json()) as { reviews?: RawGoogleReview[] };
    const items = (json.reviews || []).map((r): NormalizedReview => ({
      sourceKey: "google",
      externalId: r.reviewId || "",
      rating: normalizeRating(STAR[r.starRating || "FIVE"] ?? 5, 5),
      reviewBody: sanitizeReviewBody(r.comment),
      authorDisplay: maskAuthor(r.reviewer?.displayName),
      datePublished: r.createTime || new Date().toISOString(),
      lang: "tr",
    }));
    logEvent("info", "reviews.google.fetched", { count: items.length });
    return items;
  } catch (error) {
    logEvent("warn", "reviews.google.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return [];
  }
}
