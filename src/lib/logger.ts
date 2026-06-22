/**
 * Yapılandırılmış log + PII maskeleme — Audit F12/T11.
 *
 * Neden: route'lardaki düz console.log'lar (a) Vercel log'larında aranamaz
 * serbest metin üretiyordu, (b) misafir adı/IP gibi PII sızdırıyordu.
 *
 * Sözleşme: her kayıt tek satır JSON — { ts, level, event, ...fields }.
 * `event` makine-okur bir ad-alanıdır: "checkout.booking_created" gibi.
 * PII alanlarını HAM koyma; maskIp / maskText kullan.
 */

type Level = "info" | "warn" | "error";

/** IPv4 son okteti, IPv6 son grubu maskeler. Bilinmeyen biçim kısaltılır. */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return "unknown";
  const v4 = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.x`;
  if (ip.includes(":")) {
    const parts = ip.split(":");
    parts[parts.length - 1] = "x";
    return parts.join(":");
  }
  return `${ip.slice(0, 6)}…`;
}

/** Ad/e-posta gibi serbest PII metnini "il…" biçiminde kısaltır. */
export function maskText(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (v.length <= 2) return `${v.charAt(0)}…`;
  return `${v.slice(0, 2)}…`;
}

export function logEvent(
  level: Level,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  };

  const line = safeJsonStringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Hata nesnesini log alanına güvenle indirger (stack prod'da kırpılır). */
export function errField(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  try {
    return String(err);
  } catch {
    return "Unknown error";
  }
}

function safeJsonStringify(entry: Record<string, unknown>): string {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(entry, (_key, value) => {
      if (typeof value === "bigint") return value.toString();
      if (value instanceof Error) return errField(value);
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    });
  } catch (err) {
    return JSON.stringify({
      ts: entry.ts,
      level: entry.level,
      event: entry.event,
      log_serialization_error: errField(err),
    });
  }
}
