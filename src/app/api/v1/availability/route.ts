import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyEccSignature, extractPayloadFromRequest } from "@/lib/ecc-auth";
import { hasSeen, markSeen, rateLimit } from "@/lib/rate-limit";
import { extractClientIp, safeText } from "@/lib/security";
import { errField, logEvent } from "@/lib/logger";
import { getRoomNightlyRate } from "@/lib/booking-pricing";

// Audit F6/T5: partner public key artık env'den gelir; tanımlı değilse
// endpoint kapalıdır (404). Hardcoded MOCK key kaldırıldı — sahte imza
// kabul riski sıfırlandı. Gerçek partner onboard olduğunda SPKI PEM'i
// B2B_PARTNER_PUBLIC_KEY olarak ekleyin.
const PARTNER_PUBLIC_KEY = process.env.B2B_PARTNER_PUBLIC_KEY || "";
const ALLOW_STATIC_AVAILABILITY =
  process.env.B2B_ALLOW_STATIC_AVAILABILITY === "true" &&
  process.env.NODE_ENV !== "production";

const MAX_PAYLOAD_BYTES = 10_000;
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;
const REPLAY_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 30,
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Expected a valid calendar date");

const availabilitySchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().positive().max(8),
  })
  .strict()
  .refine((value) => new Date(value.checkOut).getTime() > new Date(value.checkIn).getTime(), {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  })
  .refine(
    (value) => {
      const nights =
        (new Date(value.checkOut).getTime() - new Date(value.checkIn).getTime()) /
        86_400_000;
      return nights <= 30;
    },
    {
      message: "Availability window cannot exceed 30 nights",
      path: ["checkOut"],
    },
  );

function parseRequestTimestamp(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return timestamp;
}

function replayDigest(partnerId: string, timestamp: string, payload: string) {
  return crypto
    .createHash("sha256")
    .update(`${partnerId}.${timestamp}.${payload}`)
    .digest("hex");
}

export async function POST(req: Request) {
  if (!PARTNER_PUBLIC_KEY.trim()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const signature = req.headers.get("x-b2b-signature");
    const partnerId = safeText(req.headers.get("x-partner-id") || "", 80);
    const timestampHeader = req.headers.get("x-request-timestamp");
    const timestamp = parseRequestTimestamp(timestampHeader);

    if (!signature || !partnerId || !timestampHeader) {
      return NextResponse.json(
        { error: "Missing ECC signature, partner ID, or request timestamp headers." },
        { status: 401 },
      );
    }

    if (!timestamp || Math.abs(Date.now() - timestamp) > TIMESTAMP_TOLERANCE_MS) {
      return NextResponse.json({ error: "Expired or invalid request timestamp." }, { status: 401 });
    }

    const ipAddress = extractClientIp(req.headers);
    const limit = await rateLimit(
      `availability:${partnerId}:${ipAddress}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many availability requests." },
        { status: 429, headers: { "Retry-After": limit.retryAfterSec.toString() } },
      );
    }

    const payloadString = await extractPayloadFromRequest(req);
    if (new TextEncoder().encode(payloadString).byteLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    const replayKey = `availability:${replayDigest(partnerId, timestampHeader, payloadString)}`;
    if (await hasSeen(replayKey)) {
      return NextResponse.json({ error: "Duplicate request." }, { status: 409 });
    }

    const isValid = verifyEccSignature({
      payload: `${timestampHeader}.${payloadString}`,
      signature,
      publicKeyPem: PARTNER_PUBLIC_KEY,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid ECC signature." }, { status: 403 });
    }

    let body: unknown;
    try {
      body = JSON.parse(payloadString);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid availability payload.", details: parsed.error.flatten() }, { status: 400 });
    }

    if (!ALLOW_STATIC_AVAILABILITY) {
      return NextResponse.json(
        {
          error: "Live availability source is not configured.",
          status: "manual_required",
        },
        { status: 503 },
      );
    }

    await markSeen(replayKey, REPLAY_TTL_MS);

    const { checkIn, checkOut, guests } = parsed.data;
    
    return NextResponse.json({
      status: "success",
      data: {
        rooms: [
          {
            slug: "standart-deniz-manzarali-oda",
            name: "Standart Deniz Manzaralı Oda",
            available: true,
            price: getRoomNightlyRate("standart-deniz-manzarali-oda"),
            currency: "TRY",
          },
          {
            slug: "4-kisilik-aile-odasi",
            name: "Aile Odası",
            available: true,
            price: getRoomNightlyRate("4-kisilik-aile-odasi"),
            currency: "TRY",
          }
        ],
        requestedDates: { checkIn, checkOut },
        guests
      }
    });

  } catch (error) {
    logEvent("error", "availability.unhandled_error", {
      err: errField(error),
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
