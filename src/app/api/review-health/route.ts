import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { getPayloadClient } from "@/lib/payload";
import { isGoogleReviewsConfigured } from "@/lib/reviews/adapters";
import { isAuthorizedBearer } from "@/lib/reviews/store";

// GET /api/review-health — kaynak sync durumu + Google konfig durumu (admin).
// REVIEWS_ADMIN_TOKEN korumalı; fail-closed.

export async function GET(request: Request) {
  if (!isAuthorizedBearer(request.headers.get("authorization"), env.REVIEWS_ADMIN_TOKEN)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const payload = await getPayloadClient();
    const sources = await payload.find({ collection: "review-sources", limit: 50 });
    const items = await payload.find({ collection: "review-items", limit: 0 });
    return NextResponse.json({
      googleConfigured: isGoogleReviewsConfigured(),
      cronConfigured: Boolean(env.CRON_SECRET),
      totalReviews: items.totalDocs,
      sources: (sources.docs as unknown as Array<Record<string, unknown>>).map((s) => ({
        key: s.key,
        name: s.name,
        type: s.type,
        isActive: s.isActive,
        lastSyncAt: s.lastSyncAt ?? null,
        lastSyncStatus: s.lastSyncStatus ?? null,
      })),
    });
  } catch (error) {
    logEvent("warn", "reviews.health.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
