type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
const MAX_STORE_SIZE = 10_000;
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000; // 1 minute

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL && rateLimitStore.size < MAX_STORE_SIZE) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  // Emergency cleanup if store is still too large (DoS protection)
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const toDelete = rateLimitStore.size - MAX_STORE_SIZE;
    let deleted = 0;
    for (const key of rateLimitStore.keys()) {
      if (deleted >= toDelete) break;
      rateLimitStore.delete(key);
      deleted++;
    }
  }
}

function normalizeIp(ip: string | null) {
  if (!ip || !ip.trim()) return null;
  // Only take first IP from comma-separated list (closest proxy)
  const first = ip.includes(",") ? ip.split(",")[0].trim() : ip.trim();
  // Remove IPv6-mapped IPv4 prefix
  if (first.startsWith("::ffff:")) return first.replace("::ffff:", "");
  // Basic IP validation
  if (first.length > 45) return null; // Max IPv6 length
  return first;
}

function normalizeHost(value: string) {
  return value.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export function extractClientIp(headers: Headers) {
  // Prefer cf-connecting-ip (Cloudflare) as it's harder to spoof
  return (
    normalizeIp(headers.get("cf-connecting-ip")) ||
    normalizeIp(headers.get("x-real-ip")) ||
    normalizeIp(headers.get("x-forwarded-for")) ||
    "unknown"
  );
}

/**
 * Sanitize user text input.
 * Strips HTML tags, script-related patterns, control characters.
 */
export function safeText(value: string, maxLength: number) {
  return value
    // Strip HTML tags entirely
    .replace(/<[^>]*>/g, "")
    // Remove javascript: and data: URI schemes
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, "")
    // Remove control characters
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028\u2029]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate same-origin request.
 * IMPORTANT: Returns false (reject) when origin is missing in production.
 */
export function validateSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // In production, require origin header to prevent CSRF
  if (!origin) {
    // Allow requests without origin in development (curl, postman)
    if (process.env.NODE_ENV === "development") return true;
    // For production, still allow if it's a same-site navigation (Sec-Fetch-Site)
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite === "same-origin" || fetchSite === "same-site") return true;
    return false;
  }

  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return normalizeHost(originUrl.host) === normalizeHost(host);
  } catch {
    return false;
  }
}

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  cleanupExpired();

  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
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
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSec: 0,
  };
}
