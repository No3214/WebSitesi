import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { logEvent } from "@/lib/logger";
import { getPublishedReviews, summarize } from "@/lib/reviews/store";

// GET /api/review-summary — kaynak bazinda + genel aggregate ozet (yalniz published).
// Ucuncu-taraf metni DONMEZ (yalniz puan/sayi/link); cache 'reviews' tag'i ile.

export const revalidate = 3600;

const getSummary = unstable_cache(
  async () => summarize(await getPublishedReviews(200)),
  ["review-summary"],
  { tags: ["reviews"], revalidate: 3600 },
);

export async function GET() {
  try {
    const summary = await getSummary();
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    logEvent("warn", "reviews.summary.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ overall: { average: 0, count: 0 }, bySource: {} });
  }
}
