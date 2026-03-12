import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getPayloadClient } from "@/lib/payload";
import { safeText } from "@/lib/security";

type ReservationBody = {
  reservation?: {
    id?: string | number;
    guest_first_name?: string;
    guest_last_name?: string;
    guest_email?: string;
    guest_phone?: string;
    status?: string;
    room_type_name?: string;
    checkin?: string;
    checkout?: string;
    total_price?: string | number;
    currency_code?: string;
    guest_notes?: string;
  };
};

const replayStore = new Map<string, number>();
const REPLAY_TTL_MS = 6 * 60 * 60 * 1000;

function pruneReplayStore() {
  const now = Date.now();
  for (const [key, expiresAt] of replayStore.entries()) {
    if (expiresAt <= now) replayStore.delete(key);
  }
}

function markReplay(messageUid: string) {
  pruneReplayStore();
  replayStore.set(messageUid, Date.now() + REPLAY_TTL_MS);
}

function hasReplay(messageUid: string) {
  pruneReplayStore();
  const expiresAt = replayStore.get(messageUid);
  return Boolean(expiresAt && expiresAt > Date.now());
}

function createDigest(bodyText: string) {
  return crypto.createHmac("sha256", env.HOTELRUNNER_WEBHOOK_SECRET).update(bodyText).digest("hex");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

async function writeAuditLog(data: Record<string, unknown>) {
  const payload = await getPayloadClient();
  await payload.create({
    collection: "webhook-events",
    data,
    overrideAccess: true,
  });
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}

export async function POST(req: Request) {
  const messageUid = req.headers.get("x-message-uid") || "";
  const signature = req.headers.get("x-payload-signature") || "";
  const receivedAt = new Date().toISOString();

  if (!messageUid) {
    return NextResponse.json({ ok: false, error: "Missing x-message-uid" }, { status: 400 });
  }

  if (!signature) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: false,
      errorMessage: "Missing signature",
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 401 });
  }

  if (hasReplay(messageUid)) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "duplicate",
      signatureValid: true,
      receivedAt,
    });

    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  const bodyText = await req.text();
  const expectedSignature = createDigest(bodyText);

  if (!safeCompare(signature, expectedSignature)) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: false,
      errorMessage: "Invalid signature",
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: ReservationBody;
  try {
    body = JSON.parse(bodyText) as ReservationBody;
  } catch {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Invalid JSON",
      payloadJson: { raw: bodyText },
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const reservation = body.reservation;
  if (!reservation?.id) {
    await writeAuditLog({
      provider: "hotelrunner",
      messageUid,
      status: "rejected",
      signatureValid: true,
      errorMessage: "Unsupported payload structure",
      payloadJson: body,
      receivedAt,
    });

    return NextResponse.json({ ok: false, error: "Unsupported payload structure" }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const reservationId = String(reservation.id);

  await payload.create({
    collection: "organization-leads",
    data: {
      name: safeText(`${reservation.guest_first_name || ""} ${reservation.guest_last_name || ""}`.trim() || "HotelRunner Guest", 120),
      normalizedPhone: safeText((reservation.guest_phone || "").replace(/\D+/g, ""), 25),
      phone: safeText(reservation.guest_phone || "", 25) || "Bilinmiyor",
      normalizedEmail: safeText((reservation.guest_email || `booking-${reservationId}@hotelrunner.local`).toLowerCase(), 200),
      email: safeText((reservation.guest_email || `booking-${reservationId}@hotelrunner.local`).toLowerCase(), 200),
      type: "reservation",
      consent: true,
      leadScore: 90,
      leadPriority: "high",
      source: `hotelrunner:${reservationId}`,
      dedupeHash: crypto.createHash("sha256").update(`hotelrunner:${reservationId}`).digest("hex"),
      message: [
        `Rezervasyon ID: ${reservationId}`,
        `Durum: ${safeText(reservation.status || "bilinmiyor", 50)}`,
        `Oda: ${safeText(reservation.room_type_name || "bilinmiyor", 120)}`,
        `Konaklama: ${safeText(reservation.checkin || "-", 30)} / ${safeText(reservation.checkout || "-", 30)}`,
        `Toplam Tutar: ${safeText(String(reservation.total_price || "-"), 30)} ${safeText(reservation.currency_code || "", 10)}`,
        `Notlar: ${safeText(reservation.guest_notes || "Yok", 1000)}`,
      ].join("\n"),
    },
    overrideAccess: true,
  });

  await writeAuditLog({
    provider: "hotelrunner",
    messageUid,
    reservationId,
    status: "processed",
    signatureValid: true,
    payloadJson: body,
    receivedAt,
  });

  markReplay(messageUid);

  const response = NextResponse.json({ ok: true });
  response.headers.set("x-message-delivery", "confirmed");
  return response;
}
