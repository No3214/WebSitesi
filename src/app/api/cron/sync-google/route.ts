import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { googleReviewsAdapter } from "@/lib/reviews/adapters";
import { upsertReviews } from "@/lib/reviews/store";

// GET /api/cron/sync-google — Vercel Cron ile gece Google senkronu.
// CRON_SECRET ile korunur (Authorization: Bearer <CRON_SECRET>). Fail-closed.
// Google konfigure degilse adapter no-op → 0 kayit (siteyi etkilemez).
// vercel.json crons: { "path": "/api/cron/sync-google", "schedule": "0 3 * * *" }

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const normalized = await googleReviewsAdapter();
    const result = await upsertReviews(normalized, "google");
    revalidateTag("reviews");
    logEvent("info", "reviews.cron.google", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logEvent("warn", "reviews.cron.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
