import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { logEvent } from "@/lib/logger";
import { getPublishedReviews } from "@/lib/reviews/store";

// GET /api/review-cards?limit=6 — yayindaki yorum kartlari (yalniz published).
// displayPolicy store katmaninda uygulanir: score-and-link/score-only kaynaklarda
// reviewBody bos doner (ucuncu-taraf metni sizmaz). Cache 'reviews' tag'i ile.

export const revalidate = 3600;

const getCards = unstable_cache(
  async () => getPublishedReviews(200),
  ["review-cards"],
  { tags: ["reviews"], revalidate: 3600 },
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 6));
    const all = await getCards();
    // featured + puan + tarih siralamasi
    const sorted = [...all].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return String(b.datePublished).localeCompare(String(a.datePublished));
    });
    const cards = sorted.slice(0, limit).map((c) => ({
      id: c.id,
      source: c.sourceKey,
      sourceName: c.sourceName,
      sourceUrl: c.sourceUrl,
      rating: c.rating,
      reviewBody: c.reviewBody,
      authorDisplay: c.authorDisplay,
      datePublished: c.datePublished,
    }));
    return NextResponse.json(
      { cards },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    logEvent("warn", "reviews.cards.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ cards: [] });
  }
}
