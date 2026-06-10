/**
 * Birleşik rate-limit + replay (idempotency) modülü — Audit F3/F7, Task T4.
 *
 * Sorun: Eski implementasyonlar (lib/security.ts, lib/ai/security.ts ve iki
 * webhook'taki yerel Map'ler) in-memory idi. Vercel/serverless'ta her lambda
 * izole bellek taşıdığından limit ve replay koruması fiilen devre dışıydı.
 *
 * Çözüm: Tek modül, iki backend:
 *  - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN tanımlıysa → Upstash
 *    Redis REST (lambda'lar arası paylaşımlı, atomik INCR/SET NX).
 *  - Değilse → in-memory fallback (dev/tek-instance; eski davranışla birebir).
 *
 * Hata politikası: Redis'e ulaşılamazsa fail-open (istek engellenmez, uyarı
 * loglanır) — misafir dönüşümünü altyapı arızasına kurban etmemek için.
 */

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const hasUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// ---------------------------------------------------------------------------
// Upstash REST yardımcıcısı (pipeline)
// ---------------------------------------------------------------------------

type UpstashReply = { result: unknown; error?: string };

async function upstashPipeline(commands: (string | number)[][]): Promise<UpstashReply[] | null> {
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as UpstashReply[];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback (dev / Upstash yokken)
// ---------------------------------------------------------------------------

type MemEntry = { count: number; resetAt: number };
const memCounters = new Map<string, MemEntry>();
const memSeen = new Map<string, number>();

function pruneMem(now: number) {
  if (memCounters.size > 5000) {
    for (const [k, v] of memCounters) if (v.resetAt <= now) memCounters.delete(k);
  }
  if (memSeen.size > 5000) {
    for (const [k, exp] of memSeen) if (exp <= now) memSeen.delete(k);
  }
}

function memRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  pruneMem(now);
  const current = memCounters.get(key);

  if (!current || current.resetAt <= now) {
    memCounters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSec: 0 };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Kayan-pencere yaklaşımlı sayaç limiti.
 * Upstash: INCR + PEXPIRE NX (pencere ilk istekte kurulur) + PTTL.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!hasUpstash) return memRateLimit(key, limit, windowMs);

  const k = `rl:${key}`;
  const replies = await upstashPipeline([
    ["INCR", k],
    ["PEXPIRE", k, windowMs, "NX"],
    ["PTTL", k],
  ]);

  if (!replies) {
    console.warn("[rate-limit] Upstash erişilemedi — fail-open (in-memory fallback)");
    return memRateLimit(key, limit, windowMs);
  }

  const count = Number(replies[0]?.result ?? 0);
  const pttl = Number(replies[2]?.result ?? windowMs);

  if (count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((pttl > 0 ? pttl : windowMs) / 1000)),
    };
  }

  return { allowed: true, remaining: Math.max(0, limit - count), retryAfterSec: 0 };
}

/**
 * Replay/idempotency: anahtar daha önce işaretlendi mi?
 * (Webhook'lar "önce kontrol, başarıyla işleyince işaretle" akışını korur —
 * başarısız denemeler yeniden denenebilir kalır.)
 */
export async function hasSeen(key: string): Promise<boolean> {
  if (!hasUpstash) {
    const exp = memSeen.get(`seen:${key}`);
    return Boolean(exp && exp > Date.now());
  }

  const replies = await upstashPipeline([["EXISTS", `seen:${key}`]]);
  if (!replies) {
    console.warn("[rate-limit] Upstash erişilemedi — hasSeen fail-open (false)");
    const exp = memSeen.get(`seen:${key}`);
    return Boolean(exp && exp > Date.now());
  }
  return Number(replies[0]?.result ?? 0) > 0;
}

/** Replay anahtarını TTL ile işaretler. */
export async function markSeen(key: string, ttlMs: number): Promise<void> {
  memSeen.set(`seen:${key}`, Date.now() + ttlMs); // her durumda lokal iz

  if (!hasUpstash) return;
  await upstashPipeline([["SET", `seen:${key}`, "1", "PX", ttlMs]]);
}

/** Test/teşhis: aktif backend. */
export function rateLimitBackend(): "upstash" | "memory" {
  return hasUpstash ? "upstash" : "memory";
}
