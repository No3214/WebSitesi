type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function normalizeIp(ip: string | null) {
  if (!ip) return "unknown";
  if (ip.includes(",")) return ip.split(",")[0].trim();
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip.trim();
}

export function extractClientIp(headers: Headers) {
  return (
    normalizeIp(headers.get("x-real-ip")) ||
    normalizeIp(headers.get("x-forwarded-for")) ||
    "unknown"
  );
}

export function safeText(value: string, maxLength: number) {
  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validateSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
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
