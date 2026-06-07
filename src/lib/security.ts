type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function normalizeIp(ip: string | null) {
  if (!ip || !ip.trim()) return null;
  if (ip.includes(",")) return ip.split(",")[0].trim();
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip.trim();
}

function normalizeHost(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
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
  // Fail-closed: state değiştiren isteklerde Origin yoksa reddet.
  // (Tarayıcı form/fetch POST'ları her zaman Origin gönderir; göndermeyenler
  // curl/script gibi otomasyonlardır ve CSRF korumasını atlamamalıdır.)
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return normalizeHost(originUrl.host) === normalizeHost(host);
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

function base64ToUint8Array(value: string) {
  // Accept both standard base64 and base64url, with or without padding.
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pemToUint8Array(pem: string) {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  return base64ToUint8Array(body);
}

/**
 * Verifies an ES256 signature (ECDSA over the NIST P-256 curve with SHA-256)
 * using WebCrypto (`globalThis.crypto.subtle`), so it works in both the Node
 * and Edge runtimes without extra dependencies.
 *
 * HMS/PSP webhook'ları ECC imzalı geldiğinde kullanılacak: `payload` ham
 * istek gövdesi, `signatureB64` base64/base64url imza (raw r||s formatı),
 * `publicKeyPem` ise SPKI formatında PEM public key olmalıdır.
 *
 * @param payload - The exact raw string that was signed.
 * @param signatureB64 - Signature encoded as base64 or base64url.
 * @param publicKeyPem - SPKI PEM-encoded P-256 public key.
 * @returns `true` only when the signature verifies; `false` on any error
 *   (malformed key, malformed signature, mismatch) — never throws.
 */
export async function verifyEs256Signature(
  payload: string,
  signatureB64: string,
  publicKeyPem: string,
): Promise<boolean> {
  try {
    const publicKey = await globalThis.crypto.subtle.importKey(
      "spki",
      pemToUint8Array(publicKeyPem),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );

    return await globalThis.crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey,
      base64ToUint8Array(signatureB64),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}
