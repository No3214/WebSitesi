/**
 * Review orchestration — ORNEK seed verisi.
 * Calistir: npx tsx scripts/seed-reviews.ts  (DATABASE_URI gerekir)
 *
 * Amac: her kaynak tipinden (api/manual/first-party) BIRER review-source olusturmak
 * ve birkac ORNEK review-item eklemek (status='pending', moderasyondan gecsin).
 * NOT: Buradaki metinler "ornek" niteligindedir; gercek-disi marka iddiasi YOKTUR.
 * Gercek yorumlar ya Google senkronundan ya da admin manuel girisinden gelir.
 */
import { getPayload } from "payload";
import config from "@payload-config";

const SOURCES = [
  { key: "google", name: "Google", type: "api", displayPolicy: "full-text", sourceUrl: "" },
  { key: "booking", name: "Booking.com", type: "manual", displayPolicy: "score-and-link", sourceUrl: "" },
  { key: "etstur", name: "ETS Tur", type: "manual", displayPolicy: "score-and-link", sourceUrl: "" },
  { key: "first-party", name: "Misafir Değerlendirmesi", type: "first-party", displayPolicy: "full-text", sourceUrl: "" },
] as const;

const SAMPLE_ITEMS = [
  { sourceKey: "first-party", rating: 5, body: "Örnek: Taş konağın sükuneti ve kahvaltı çok iyiydi.", author: "Örnek M.", featured: true },
  { sourceKey: "google", rating: 5, body: "Örnek: Tarihi doku ve ilgili ekip.", author: "Örnek A." },
  { sourceKey: "booking", rating: 4.5, body: "", author: "Örnek K." },
];

async function main() {
  const payload = await getPayload({ config });
  const idByKey: Record<string, number> = {};
  for (const s of SOURCES) {
    const existing = await payload.find({ collection: "review-sources", where: { key: { equals: s.key } }, limit: 1 });
    if (existing.docs[0]) {
      idByKey[s.key] = (existing.docs[0] as { id: number }).id;
      continue;
    }
    const created = await payload.create({ collection: "review-sources", data: { ...s, isActive: true } });
    idByKey[s.key] = (created as { id: number }).id;
    console.log(`source: ${s.key}`);
  }
  for (const it of SAMPLE_ITEMS) {
    await payload.create({
      collection: "review-items",
      data: {
        source: idByKey[it.sourceKey],
        externalId: `seed:${it.sourceKey}:${it.author}`,
        rating: it.rating,
        reviewBody: it.body,
        authorDisplay: it.author,
        datePublished: new Date().toISOString(),
        status: "pending",
        isFeatured: Boolean(it.featured),
      },
    });
  }
  console.log("seed tamam (ornek kaynaklar + pending ornek yorumlar).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
