import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { env } from "@/lib/env";
import { logEvent } from "@/lib/logger";
import { getPayloadClient } from "@/lib/payload";
import { isAuthorizedBearer } from "@/lib/reviews/store";

// POST /api/review-moderation/[id] — yorum moderasyonu (REVIEWS_ADMIN_TOKEN).
// body: { action: "publish"|"hide"|"flag"|"unflag", reason? }. Status gunceller +
// review-moderation-events audit kaydi yazar + 'reviews' cache'ini tazeler. Fail-closed.

const ACTION_TO_STATUS: Record<string, "published" | "hidden" | "flagged" | "pending"> = {
  publish: "published",
  hide: "hidden",
  flag: "flagged",
  unflag: "pending",
};

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!isAuthorizedBearer(request.headers.get("authorization"), env.REVIEWS_ADMIN_TOKEN)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { action?: string; reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const action = body.action || "";
  const status = ACTION_TO_STATUS[action];
  if (!status) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  try {
    const payload = await getPayloadClient();
    const numericId = Number(id);
    await payload.update({ collection: "review-items", id: numericId, data: { status } });
    await payload.create({
      collection: "review-moderation-events",
      data: { reviewItem: numericId, action: action as "publish", reason: body.reason || "" },
    });
    revalidateTag("reviews");
    logEvent("info", "reviews.moderation", { id, action });
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    logEvent("warn", "reviews.moderation.failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
