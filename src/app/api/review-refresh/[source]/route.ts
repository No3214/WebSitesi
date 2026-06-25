import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { googleReviewsAdapter } from "@/lib/reviews/adapters";
import { isAuthorizedBearer, upsertReviews } from "@/lib/reviews/store";

// POST /api/review-refresh/google — admin/manuel yenileme (REVIEWS_ADMIN_TOKEN).
// Otomatik senkronu olan tek kaynak Google'dir; digerleri manuel girilir (400).
// Yeni kayitlar status='pending' (moderasyondan gecsin). Fail-closed.

export async function POST(
  request: Request,
  ctx: { params: Promise<{ source: string }> },
) {
  const { source } = await ctx.params;
  if (!isAuthorizedBearer(request.headers.get("authorization"), env.REVIEWS_ADMIN_TOKEN)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (source !== "google") {
    return NextResponse.json(
      { error: "only_google_is_automatic", message: "Diger kaynaklar admin'den manuel girilir." },
      { status: 400 },
    );
  }
  try {
    const normalized = await googleReviewsAdapter();
    const result = await upsertReviews(normalized, "google");
    revalidateTag("reviews");
    logEvent("info", "reviews.refresh.google", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logEvent("warn", "reviews.refresh.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
