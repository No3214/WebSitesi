import { getPayloadClient } from "@/lib/payload";
import { logEvent } from "@/lib/logger";
import type { NormalizedReview, ReviewDisplayPolicy } from "@/lib/reviews/types";
import { applyDisplayPolicy } from "@/lib/reviews/adapters";

// Review orchestration — sunucu-tarafli veri katmani (Payload Local API).
// Public uclar yalniz published kayitlari ve displayPolicy'ye uygun alanlari doner.

export type ReviewSourceRow = {
  id: number | string;
  key: string;
  name: string;
  sourceUrl?: string | null;
  displayPolicy: ReviewDisplayPolicy;
  type?: string;
  isActive?: boolean | null;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
};

export type PublicReviewCard = {
  id: string | number;
  sourceKey: string;
  sourceName: string;
  sourceUrl?: string | null;
  rating: number;
  reviewBody: string;
  authorDisplay: string;
  datePublished?: string | null;
  displayPolicy: ReviewDisplayPolicy;
  featured: boolean;
};

function resolveSource(src: unknown): ReviewSourceRow | null {
  if (src && typeof src === "object" && "key" in src) {
    return src as ReviewSourceRow;
  }
  return null;
}

/** Bearer token dogrulama (fail-closed: secret bos ise reddet). */
export function isAuthorizedBearer(authHeader: string | null, secret: string): boolean {
  if (!secret) return false;
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  // sabit zaman karsilastirma yerine basit esitlik (secret yuksek entropili olmali)
  return token.length > 0 && token === secret;
}

/** Yayinda olan yorumlari (source populated) getirir. */
export async function getPublishedReviews(limit = 60): Promise<PublicReviewCard[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "review-items",
    where: { status: { equals: "published" } },
    depth: 1,
    limit,
    sort: "-datePublished",
  });
  const cards: PublicReviewCard[] = [];
  for (const doc of res.docs as unknown as Array<Record<string, unknown>>) {
    const source = resolveSource(doc.source);
    if (!source || source.isActive === false) continue;
    const policy = source.displayPolicy;
    const normalized: NormalizedReview = {
      sourceKey: source.key,
      externalId: String(doc.externalId ?? ""),
      rating: Number(doc.rating ?? 0),
      reviewBody: String(doc.reviewBody ?? ""),
      authorDisplay: String(doc.authorDisplay ?? "Misafir"),
      datePublished: String(doc.datePublished ?? ""),
    };
    const shaped = applyDisplayPolicy(normalized, policy);
    cards.push({
      id: doc.id as string | number,
      sourceKey: source.key,
      sourceName: source.name,
      sourceUrl: source.sourceUrl ?? null,
      rating: shaped.rating,
      reviewBody: shaped.reviewBody,
      authorDisplay: shaped.authorDisplay,
      datePublished: normalized.datePublished || null,
      displayPolicy: policy,
      featured: Boolean(doc.isFeatured),
    });
  }
  return cards;
}

/** Kaynak bazinda + genel aggregate ozet. */
export function summarize(cards: PublicReviewCard[]) {
  const bySource: Record<
    string,
    { name: string; sourceUrl?: string | null; average: number; count: number; displayPolicy: ReviewDisplayPolicy }
  > = {};
  let total = 0;
  let sum = 0;
  for (const c of cards) {
    total += 1;
    sum += c.rating;
    const b = bySource[c.sourceKey] || {
      name: c.sourceName,
      sourceUrl: c.sourceUrl,
      average: 0,
      count: 0,
      displayPolicy: c.displayPolicy,
    };
    b.average = (b.average * b.count + c.rating) / (b.count + 1);
    b.count += 1;
    b.average = Math.round(b.average * 10) / 10;
    bySource[c.sourceKey] = b;
  }
  return {
    overall: { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total },
    bySource,
  };
}

/**
 * Normalize edilmis yorumlari review-items'a upsert eder (externalId ile dedupe).
 * Yeni kayitlar status='pending' (moderasyondan gecsin; otomatik yayin YOK).
 * sourceKey ile review-sources dokumanini bulur, relationship'i baglar.
 */
export async function upsertReviews(
  normalized: NormalizedReview[],
  sourceKey: string,
): Promise<{ created: number; updated: number }> {
  const payload = await getPayloadClient();
  const srcRes = await payload.find({
    collection: "review-sources",
    where: { key: { equals: sourceKey } },
    limit: 1,
  });
  const source = srcRes.docs[0] as { id: number } | undefined;
  if (!source) {
    logEvent("warn", "reviews.upsert.source_missing", { sourceKey });
    return { created: 0, updated: 0 };
  }
  let created = 0;
  let updated = 0;
  for (const n of normalized) {
    if (!n.externalId) continue;
    const existing = await payload.find({
      collection: "review-items",
      where: { externalId: { equals: n.externalId }, source: { equals: source.id } },
      limit: 1,
    });
    const data = {
      source: source.id,
      externalId: n.externalId,
      rating: n.rating,
      reviewBody: n.reviewBody,
      authorDisplay: n.authorDisplay,
      datePublished: n.datePublished,
      lang: n.lang || "tr",
      pulledAt: new Date().toISOString(),
    };
    if (existing.docs[0]) {
      await payload.update({
        collection: "review-items",
        id: (existing.docs[0] as { id: number }).id,
        data,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "review-items",
        data: { ...data, status: "pending" },
      });
      created += 1;
    }
  }
  // kaynak sync durumunu guncelle
  await payload.update({
    collection: "review-sources",
    id: source.id,
    data: {
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: `ok: +${created} yeni, ${updated} guncel`,
    },
  });
  return { created, updated };
}
